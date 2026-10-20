# WKF production operations

This runbook covers routine off-site backups, disaster recovery, exceptional recovery tasks, Azure
cost suspension, and Microsoft Entra access control for WKF Online. Run commands from the repository
root with Bash unless a step explicitly says otherwise.

The procedures distinguish three different recovery mechanisms:

- **production off-site backup** — an encrypted and signed PostgreSQL plus Blob Storage recovery
  point stored on MyDevil;
- **staging checkpoint** — an Azure-hosted checkpoint understood only by the staging workflow;
- **isolated restore drill** — a temporary private Azure target used to prove an off-site backup
  before any production data is changed.

An off-site backup is not a staging checkpoint. Do not pass a MyDevil backup name to the **Manage
staging data** workflow.

## Safety rules

1. Never put the long-lived `age` private identity in GitHub, Azure, MyDevil, a command-line
   argument, or a repository file.
2. Never restore an off-site backup directly over production before it has passed local validation
   and an isolated Azure restore.
3. Treat `.complete` as necessary but not sufficient. A backup must also pass manifest-signature,
   checksum, PostgreSQL archive, and blob-count validation.
4. Stop the target application before replacing its database or Blob container.
5. Do not run a deploy, import, backup, or restore concurrently. Production workflows serialize on
   `production-operations`; staging workflows serialize on `staging-operations`. Manual Azure work
   must observe the same rule operationally.
6. Record the selected recovery point, source commit, application image digest, operations image
   digest, operator, start time, and every verification result in the incident record.
7. Keep decrypted artifacts only in a temporary directory on an encrypted local disk. Delete the
   directory when the operation finishes.

## 1. Run a manual production off-site backup

The workflow is [Back up production data off-site](../.github/workflows/backup-production-data.yml).
It briefly deactivates the production revision, waits for all replicas to stop, runs `pg_dump`,
copies and encrypts every blob, publishes `.complete` last over explicit FTPS, and reactivates the
same revision during cleanup.

### Preconditions

1. Confirm that production is healthy:

   ```bash
   curl --fail --silent --show-error https://wkf.wroclaw.pl/api/health
   curl --fail --silent --show-error https://wkf.wroclaw.pl/api/health/live
   ```

2. Open **GitHub → Actions** and confirm that no production deploy, import, backup, or restore is
   running or waiting for approval.
3. Confirm that the latest successful staging deployment summary contains an immutable
   `wkf-operations` digest if the manual run will override the default image resolution.
4. Confirm that the MyDevil quota and protected archive are not near their limits:

   ```bash
   ssh forseti@s47.mydevil.net \
     'du -sh /usr/home/forseti/remote-backups/wkf/archive /usr/home/forseti/remote-backups/wkf/incoming'
   ```

### GitHub procedure

1. Open **Actions → Back up production data off-site → Run workflow**.
2. Select the `master` branch.
3. Normally leave `operations_image_digest` empty. The workflow resolves the operations image built
   for the workflow's source commit. Supply an explicit `sha256:...` digest only when recovering
   from a missing tag or when the digest reported by the accepted staging deployment must be
   pinned deliberately.
4. Select **Run workflow**.
5. Approve the `prod` environment deployment when GitHub presents **Review deployments**.
6. Watch the **Quiesce production and create encrypted backup** step. A normal run temporarily makes
   the public site unavailable while it captures a coherent database-and-media state.
7. Require the final summary to contain a backup name in this form:

   ```text
   production-YYYYMMDDTHHMMSSZ
   ```

8. Require the post-backup checks to report:

   ```text
   health=200 live=200 root=401 admin=401
   ```

   The `401` results are expected while production requires Entra sign-in. If Entra protection is
   intentionally disabled, verify `/` and `/admin` manually instead.

### MyDevil publication check

The restricted FTPS account can see only `incoming`. A MyDevil cron runs every 15 minutes and moves
a complete directory into the protected archive. After one cron interval, run:

```bash
export BACKUP_NAME='production-YYYYMMDDTHHMMSSZ'
ssh forseti@s47.mydevil.net \
  "test -f /usr/home/forseti/remote-backups/wkf/archive/${BACKUP_NAME}/.complete"
ssh forseti@s47.mydevil.net \
  "du -sh /usr/home/forseti/remote-backups/wkf/archive/${BACKUP_NAME}"
```

If the directory remains in `incoming`, inspect:

```bash
ssh forseti@s47.mydevil.net \
  'tail -n 100 /usr/home/forseti/remote-backups/wkf/archive-cron.log'
```

Do not move an incomplete directory into `archive` manually. Diagnose the missing or invalid
`.complete` marker first.

### Failure recovery

The workflow attempts to delete its ephemeral job and reactivate the recorded production revision
on every exit path. If the workflow fails:

1. Resolve the latest production revision and inspect its state:

   ```bash
   resource_group='rg-wkf-prod'
   application_name='wkf-prod'
   revision_name="$(az containerapp show \
     --resource-group "$resource_group" \
     --name "$application_name" \
     --query properties.latestRevisionName \
     --output tsv)"
   az containerapp revision show \
     --resource-group "$resource_group" \
     --name "$application_name" \
     --revision "$revision_name" \
     --query '{name:name,active:properties.active,runningState:properties.runningState}' \
     --output yaml
   ```

2. If the revision is inactive and no destructive restore or migration is in progress, reactivate
   it idempotently:

   ```bash
   bash scripts/ensure-containerapp-revision-active.sh \
     "$resource_group" "$application_name" "$revision_name"
   ```

3. Re-run the health checks. Do not claim that a failed transfer is a backup, even if some files
   appeared in `incoming`.

## 2. Recover a working production site from an off-site backup

### Current automation boundary

The repository contains and has exercised a complete low-level restore engine and an isolated Azure
restore target. It does **not** currently contain an approval-gated workflow that overwrites the
live production database and media container from a MyDevil backup. The isolated template is
deliberately unable to target production resources.

Therefore a full incident recovery has two parts:

1. the repeatable, tested validation and isolated-restore procedure below;
2. a reviewed incident change that wires the already tested
   [`restore-offsite-backup.sh`](../scripts/operations/restore-offsite-backup.sh) engine to the live
   production target.

Do not bypass the second review by running the low-level script from an arbitrary workstation. The
production PostgreSQL endpoint and Storage account are private, and the restore deletes the complete
target Blob container before repopulating it.

### Phase A — contain the incident

1. Declare a production incident and nominate one operator and one reviewer.
2. Stop content editing and deployments. Do not approve queued `prod` environment runs.
3. If production can still produce a coherent backup, run a new manual off-site backup and mark it
   explicitly as the pre-recovery safety copy. Do not replace the chosen known-good recovery point
   with this copy.
4. Record the latest revision and deactivate all active production revisions as described in
   [Suspend an environment](#suspend-an-environment).
5. Do not stop or replace PostgreSQL until the selected backup has passed Phase B and Phase C.

### Phase B — download, authenticate, and prepare the recovery point

1. Follow [Download, validate, and decrypt a MyDevil backup](#download-validate-and-decrypt-a-mydevil-backup).
2. Build the operations image from the recovery code or pull the exact digest recorded in the
   authenticated manifest.
3. Run the local validator and require success for the database archive and every blob.
4. Create a one-time restore bundle:

   ```bash
   export BACKUP_DIRECTORY='/secure/work/production-YYYYMMDDTHHMMSSZ'
   export AGE_IDENTITY_FILE='/secure/offline/wkf-backup.agekey'
   export RESTORE_OUTPUT_PARENT='/secure/work/one-time-restore'

   mkdir --parents "$RESTORE_OUTPUT_PARENT"
   docker run --rm --network none --read-only --user 0:0 \
     --tmpfs /tmp:rw,nosuid,nodev,noexec,size=1g \
     --env RESTORE_BUNDLE_OUTPUT_UID="$(id -u)" \
     --env RESTORE_BUNDLE_OUTPUT_GID="$(id -g)" \
     --volume "$BACKUP_DIRECTORY:/source:ro" \
     --volume "$AGE_IDENTITY_FILE:/run/age/source-identity.txt:ro" \
     --volume "$RESTORE_OUTPUT_PARENT:/output" \
     wkf-operations:local \
     -lc '/opt/wkf/prepare-offsite-restore-bundle.sh /source /run/age/source-identity.txt /output/bundle'
   ```

5. Keep `bundle/secrets` local. Upload only `bundle/<backup-name>` to Azure.

### Phase C — prove the recovery point in isolation

1. Use [`offsite-restore-drill.bicep`](../infra/azure/offsite-restore-drill.bicep) in a new dedicated
   resource group. Never deploy it into `rg-wkf-prod` or `rg-wkf-staging`.
2. Run `az deployment group what-if` and require only creations in the drill resource group.
3. Deploy first with `restoredApplicationEnabled=false` and
   `storageAllowPublicUpload=true`.
4. Upload only the one-time encrypted bundle through Entra authentication to the generated
   `restore-source` container.
5. Redeploy or update the drill Storage account so that public upload is closed and only the
   Container Apps subnet is allowed.
6. Inspect `shared_preload_libraries` on the temporary PostgreSQL server. If
   `isConfigPendingRestart` is `true`, restart that temporary server and require the flag to become
   `false` before starting the restore job.
7. Start the restore job and require a result of this form:

   ```text
   RESTORE_DRILL_RESULT backup=<name> blobs=<expected> migrations=<expected> public_tables=<nonzero> sessions=0
   ```

8. Redeploy with `restoredApplicationEnabled=true` and
   `storageAllowPublicUpload=false`.
9. From inside the private application container, require `200` from `/`, `/admin`,
   `/api/health`, and `/api/health/live`. Test representative media, document, and profile-image
   range requests and require `206`.
10. Keep the drill environment until Phase D is complete. It is the authenticated reference copy
    for comparison and selective recovery.

The lower-level command sequence and security properties are also documented in
[the operational scripts reference](../scripts/README.md#isolated-azure-restore-drill).

### Phase D — restore the live target under change control

The incident change must create an ephemeral manual Container Apps job in the production Container
Apps Environment with all of these properties:

- exact `wkf-operations@sha256:...` image from the authenticated manifest;
- `production-operations` coordination and `prod` approval;
- the existing `wkf-prod-operations` and `wkf-prod-registry` identities only;
- a temporary private restore-source container accessible only from the production Container Apps
  subnet;
- the one-time `age` identity and one-time manifest trust files as ephemeral secrets;
- `POSTGRES_MIGRATOR_URL` for `wkf_migrator`, never the runtime account;
- the production media-container URL;
- `RESTORE` as the explicit destructive confirmation;
- no public ingress and no scheduled trigger.

After the reviewer accepts its `what-if`, execute the recovery in this order:

1. Confirm all production application revisions are inactive and have zero replicas.
2. Confirm the restore job targets the production database and media container, while its source
   container is temporary and separate.
3. Start one job execution. The engine validates the complete backup before deleting target blobs,
   uses `pg_restore --exit-on-error`, restores every blob, and clears `users_sessions` and
   `payload_locked_documents`.
4. If the job fails after destructive work starts, keep production inactive. Do not retry blindly;
   preserve logs and determine whether the database, Blob container, or both were changed.
5. Start `wkf-prod-migrate` with the application version selected for the recovery.
6. Run `scripts/run-production-database-operation.sh reconcile-grants` with the exact operations
   image so `wkf_runtime` receives access to newly restored objects without receiving DDL rights.
7. Compare the restored record counts, migrations, and blob count with the authenticated manifest
   and isolated reference environment.
8. Delete the ephemeral restore job, its deployment, restore-source container, one-time Azure
   secrets, and temporary role assignments.
9. Reactivate the selected production revision with
   `scripts/ensure-containerapp-revision-active.sh`.
10. Require `200` from both health routes. Verify Entra behavior on `/` and `/admin`, log in, inspect
    representative content, download representative files, and perform an authorized read-only
    admin check.
11. Monitor PostgreSQL connections, failed connections, CPU credits, Storage failures, application
    logs, and HTTP errors for at least one normal traffic cycle.
12. Delete the isolated drill resource group and every local one-time key and decrypted artifact.
    Preserve only the original encrypted MyDevil backup and incident evidence.

Phase D is intentionally a reviewed change rather than a reusable copy-and-paste command until the
live restore workflow is implemented and exercised. This prevents a documentation command from
becoming an unreviewed production-wipe interface.

## 3. Exceptional recovery tasks

### Download, validate, and decrypt a MyDevil backup

The restricted FTPS writer cannot read `archive`. Download an archived recovery point locally with
the main MyDevil SSH identity; never put that identity in GitHub.

1. Create a private local working directory and select the recovery point:

   ```bash
   umask 077
   export BACKUP_NAME='production-YYYYMMDDTHHMMSSZ'
   export RECOVERY_ROOT="$(mktemp --directory)"
   export BACKUP_DIRECTORY="$RECOVERY_ROOT/$BACKUP_NAME"
   export AGE_IDENTITY_FILE='/secure/offline/wkf-backup.agekey'
   mkdir --parents "$BACKUP_DIRECTORY"
   ```

2. Download the complete directory:

   ```bash
   rsync --archive --protect-args \
     "forseti@s47.mydevil.net:/usr/home/forseti/remote-backups/wkf/archive/${BACKUP_NAME}/" \
     "$BACKUP_DIRECTORY/"
   test -f "$BACKUP_DIRECTORY/.complete"
   ```

3. Build the local operations image and validate without network access:

   ```bash
   docker build --file Dockerfile.operations --tag wkf-operations:local .
   bash scripts/operations/validate-offsite-backup-local.sh \
     "$BACKUP_DIRECTORY" \
     "$AGE_IDENTITY_FILE" \
     wkf-operations:local
   ```

4. Only after validation succeeds, decrypt the manifest for inspection:

   ```bash
   age --decrypt \
     --identity "$AGE_IDENTITY_FILE" \
     --output "$RECOVERY_ROOT/manifest.json" \
     "$BACKUP_DIRECTORY/manifest.json.age"
   jq '{backupName,createdAt,deployedSourceSha,imageReference,operationsImageReference,blobCount,migrationState}' \
     "$RECOVERY_ROOT/manifest.json"
   ```

5. Decrypt the database only when a local comparison or forensic query requires it:

   ```bash
   database_archive="$(jq --raw-output '.database.archiveFile' "$RECOVERY_ROOT/manifest.json")"
   age --decrypt \
     --identity "$AGE_IDENTITY_FILE" \
     --output "$RECOVERY_ROOT/database.dump" \
     "$BACKUP_DIRECTORY/$database_archive"
   printf '%s  %s\n' \
     "$(jq --raw-output '.database.sha256' "$RECOVERY_ROOT/manifest.json")" \
     "$RECOVERY_ROOT/database.dump" | sha256sum --check
   pg_restore --list "$RECOVERY_ROOT/database.dump" >/dev/null
   ```

6. Do not decrypt every blob by default. Locate the required blob entry in the manifest, decrypt
   only that archive, and verify both its size and SHA-256.
7. When finished, remove the temporary directory. On copy-on-write filesystems and SSDs, deletion
   is not guaranteed physical erasure; rely on full-disk encryption and do not put the directory in
   a synchronized folder.

### Restore an off-site backup to staging

Prefer an isolated restore drill when the purpose is inspection, acceptance testing, or data
recovery. Overwriting shared staging is justified only when staging itself must reproduce the exact
historic production state.

The existing **Manage staging data** workflow cannot consume off-site backups. It understands only
the staging-checkpoint format. There is currently no reusable off-site-to-staging workflow.

Use this controlled procedure:

1. Announce staging maintenance and wait for all `staging-operations` runs to finish.
2. Run **Manage staging data** with `operation=backup` and a unique name such as
   `before-offsite-restore-YYYYMMDD`. This is the staging rollback point.
3. Validate the off-site backup locally and in an isolated Azure restore as described above.
4. Prepare a one-time restore bundle; never give staging the long-lived `age` identity.
5. Create a reviewed, ephemeral staging restore job based on
   `restore-offsite-backup.sh`. It must target the staging PostgreSQL database and staging `media`
   container, use the matching immutable operations image, receive the exact `RESTORE`
   confirmation, and be serialized operationally with `staging-operations`.
6. Deactivate the staging revision and wait for zero replicas before starting the job.
7. Run the restore once. On failure after destructive work starts, leave staging inactive.
8. Run the current staging migration job, then verify migration status, record counts, blob count,
   and representative files.
9. Reactivate the recorded staging revision and run health, root, admin, and `robots.txt` checks.
10. Delete the one-time job, source container, secrets, permissions, and local cleartext artifacts.
11. If validation fails, use **Manage staging data** with `operation=restore`, the pre-restore
    checkpoint name, and confirmation `RESTORE`.

Because the staging restore job is not yet committed as reusable infrastructure, it must be treated
as an incident change and reviewed before execution. Do not adapt the production drill template by
pointing its parameters at staging; the template is designed to create and own isolated targets.

### Compare a backup database with current production

Never compare by connecting a desktop directly to private production PostgreSQL. Capture a fresh
off-site backup of current production, validate both backups, and compare two local restores.

1. Run a manual off-site backup and wait until it reaches the protected MyDevil archive.
2. Download and validate the historic and current recovery points.
3. Decrypt each `database.dump` as described above into a private temporary directory.
4. Start one disposable PostgreSQL 17 container:

   ```bash
   export COMPARE_CONTAINER='wkf-backup-compare-postgres'
   export COMPARE_PASSWORD="$(openssl rand -base64 36 | tr -d '\n')"
   docker run --detach --name "$COMPARE_CONTAINER" \
     --env POSTGRES_PASSWORD="$COMPARE_PASSWORD" \
     postgres:17.10-alpine3.23
   until docker exec "$COMPARE_CONTAINER" pg_isready --username postgres >/dev/null 2>&1; do
     sleep 1
   done
   docker exec "$COMPARE_CONTAINER" createdb --username postgres backup_historic
   docker exec "$COMPARE_CONTAINER" createdb --username postgres backup_current
   ```

5. Copy and restore the dumps:

   ```bash
   docker cp /secure/work/historic.dump "$COMPARE_CONTAINER:/tmp/historic.dump"
   docker cp /secure/work/current.dump "$COMPARE_CONTAINER:/tmp/current.dump"
   docker exec "$COMPARE_CONTAINER" pg_restore --exit-on-error --no-owner --no-privileges \
     --username postgres --dbname backup_historic /tmp/historic.dump
   docker exec "$COMPARE_CONTAINER" pg_restore --exit-on-error --no-owner --no-privileges \
     --username postgres --dbname backup_current /tmp/current.dump
   ```

6. Compare schema definitions:

   ```bash
   docker exec "$COMPARE_CONTAINER" pg_dump --schema-only --no-owner --no-privileges \
     --username postgres backup_historic > /tmp/wkf-historic-schema.sql
   docker exec "$COMPARE_CONTAINER" pg_dump --schema-only --no-owner --no-privileges \
     --username postgres backup_current > /tmp/wkf-current-schema.sql
   diff --unified /tmp/wkf-historic-schema.sql /tmp/wkf-current-schema.sql
   ```

7. Compare table counts in each database:

   ```bash
   for database_name in backup_historic backup_current; do
     docker exec "$COMPARE_CONTAINER" psql --username postgres --dbname "$database_name" \
       --tuples-only --no-align \
       --command "SELECT relname || '=' || n_live_tup FROM pg_stat_user_tables ORDER BY relname;" \
       > "/tmp/${database_name}-counts.txt"
   done
   diff --unified /tmp/backup_historic-counts.txt /tmp/backup_current-counts.txt
   ```

8. Use explicit, reviewed queries for the affected collections. Compare stable IDs, slugs,
   `created_at`, `updated_at`, publication state, relationship columns, and corresponding version
   tables. Row counts alone do not prove equality.
9. Remove the container and all cleartext outputs:

   ```bash
   docker rm --force "$COMPARE_CONTAINER"
   unset COMPARE_PASSWORD
   ```

### Selectively move recovered data into production

Selective recovery is safer through Payload than through raw SQL because Payload applies field
shape, relationships, hooks, access rules, and file metadata consistently.

1. Restore the backup to the isolated drill environment and keep production unchanged.
2. Identify the exact records to recover and their dependency closure:
   related pages, authors, taxonomies, uploads, versions, and referenced files.
3. For a small number of records, copy the content manually from the isolated admin UI into the
   production admin UI. Download each recovered file from the drill and upload it normally to
   production. This creates valid production-side metadata and audit timestamps.
4. For a larger set, implement a one-time reviewed TypeScript importer using the Payload Local API.
   Export a neutral JSON representation from the isolated database, map relationships by stable
   identifiers such as slug rather than source numeric IDs, upload binaries through the collection
   API, and run the importer in dry-run mode first.
5. Take a fresh production off-site backup immediately before executing the importer.
6. Stop editing of the affected collections, but do not stop the whole site unless the importer
   requires a transaction spanning multiple records.
7. Apply records in dependency order, verify each relationship, and fail on an ambiguous slug or a
   missing file. Never silently skip dependencies.
8. Verify the public page, admin record, version history, downloads, and permissions. Record the
   source backup and every resulting production ID.

Do not use a generic `INSERT`, `COPY`, or `pg_restore --table` against production. Payload tables
have relationships, localized fields, versions, locks, search/index projections, and file metadata;
a syntactically successful SQL import can still create inconsistent content. A raw-SQL repair is an
exceptional database-engineering change requiring a reviewed transaction, explicit foreign-key and
sequence handling, and a tested rollback.

## 4. Suspend and resume Azure environments to reduce cost

Suspension removes application and PostgreSQL **compute** charges. It does not make the whole
resource group free. Storage capacity and operations, retained PostgreSQL storage and backups, Log
Analytics ingestion/retention, Container Registry, and any billable networking features can still
generate charges.

WKF uses the Container Apps Consumption profile. Inactive revisions have no replica consumption
charges. PostgreSQL compute billing stops when the Flexible Server is stopped, but Azure
automatically starts a stopped server after seven days. A long suspension therefore needs a
calendar reminder and another stop operation, or a separately planned deletion-and-recovery
procedure.

Do not delete a resource group as a routine off switch. Deletion is the only way to approach zero
ongoing resource cost, but it is destructive, production Storage and PostgreSQL have deletion
locks, and recovery must first be proven from an off-site backup.

### Suspend an environment

1. Select exactly one environment:

   ```bash
   export WKF_ENVIRONMENT='staging' # or: prod
   export RESOURCE_GROUP="rg-wkf-${WKF_ENVIRONMENT}"
   export APPLICATION_NAME="wkf-${WKF_ENVIRONMENT}"
   ```

2. Confirm that no workflow for the environment is running, queued, or waiting for approval. Wait
   for backup, restore, import, migration, and deploy operations to finish.
3. Prevent automation from bringing the environment back:
   - for staging, disable **Deploy staging on master** before merging or pushing to `master`;
   - for production, disable the scheduled **Back up production data off-site** workflow for a
     suspension longer than one day;
   - record both changes in the operations log.

   With GitHub CLI:

   ```bash
   gh workflow disable deploy-staging-on-master.yml    # staging only
   gh workflow disable backup-production-data.yml      # production only
   ```

4. Record the latest revision:

   ```bash
   revision_name="$(az containerapp show \
     --resource-group "$RESOURCE_GROUP" \
     --name "$APPLICATION_NAME" \
     --query properties.latestRevisionName \
     --output tsv)"
   printf 'Revision to resume: %s\n' "$revision_name"
   ```

5. Deactivate every active revision:

   ```bash
   while IFS= read -r active_revision; do
     [[ -n "$active_revision" ]] || continue
     az containerapp revision deactivate \
       --resource-group "$RESOURCE_GROUP" \
       --revision "$active_revision" \
       --output none
   done < <(az containerapp revision list \
     --resource-group "$RESOURCE_GROUP" \
     --name "$APPLICATION_NAME" \
     --query '[?properties.active].name' \
     --output tsv)
   ```

6. Require no active revisions and no replicas before stopping the database:

   ```bash
   az containerapp revision list \
     --resource-group "$RESOURCE_GROUP" \
     --name "$APPLICATION_NAME" \
     --query '[?properties.active].{name:name,state:properties.runningState}' \
     --output table
   ```

7. Resolve and stop PostgreSQL:

   ```bash
   postgres_server_name="$(az postgres flexible-server list \
     --resource-group "$RESOURCE_GROUP" \
     --query '[0].name' \
     --output tsv)"
   az postgres flexible-server stop \
     --resource-group "$RESOURCE_GROUP" \
     --name "$postgres_server_name" \
     --output none
   az postgres flexible-server show \
     --resource-group "$RESOURCE_GROUP" \
     --name "$postgres_server_name" \
     --query '{name:name,state:state}' \
     --output yaml
   ```

8. Require `state: Stopped`. Confirm that the application no longer serves requests. Set a reminder
   before the seven-day automatic PostgreSQL restart.

Staging already has `minReplicas: 0`, so it can scale to zero while idle, but deactivation prevents
external probes or human visits from waking it. Production has `minReplicas: 1`, so deactivation is
required to stop its Container Apps replica cost.

### Resume an environment

1. Restore the environment variables from the suspension procedure and resolve PostgreSQL.
2. Start PostgreSQL and wait for `Ready`:

   ```bash
   postgres_server_name="$(az postgres flexible-server list \
     --resource-group "$RESOURCE_GROUP" \
     --query '[0].name' \
     --output tsv)"
   az postgres flexible-server start \
     --resource-group "$RESOURCE_GROUP" \
     --name "$postgres_server_name" \
     --output none
   until [[ "$(az postgres flexible-server show \
     --resource-group "$RESOURCE_GROUP" \
     --name "$postgres_server_name" \
     --query state --output tsv)" == 'Ready' ]]; do
     sleep 15
   done
   ```

3. Resolve the latest revision and activate it idempotently:

   ```bash
   revision_name="$(az containerapp show \
     --resource-group "$RESOURCE_GROUP" \
     --name "$APPLICATION_NAME" \
     --query properties.latestRevisionName \
     --output tsv)"
   bash scripts/ensure-containerapp-revision-active.sh \
     "$RESOURCE_GROUP" "$APPLICATION_NAME" "$revision_name"
   ```

4. Resolve the technical address and run smoke checks:

   ```bash
   application_fqdn="$(az containerapp show \
     --resource-group "$RESOURCE_GROUP" \
     --name "$APPLICATION_NAME" \
     --query properties.configuration.ingress.fqdn \
     --output tsv)"
   curl --fail --silent --show-error "https://${application_fqdn}/api/health"
   curl --fail --silent --show-error "https://${application_fqdn}/api/health/live"
   curl --silent --output /dev/null --write-out '/ %{http_code}\n' "https://${application_fqdn}/"
   curl --silent --output /dev/null --write-out '/admin %{http_code}\n' "https://${application_fqdn}/admin"
   ```

5. Log in through Entra when it is required and verify representative database-backed content and
   file downloads.
6. Re-enable the automation disabled during suspension:

   ```bash
   gh workflow enable deploy-staging-on-master.yml    # staging only
   gh workflow enable backup-production-data.yml      # production only
   ```

7. Confirm that there is no stale queued run from before the suspension. Run a fresh manual backup
   after a long production suspension.

## 5. Require or relax Microsoft Entra sign-in

Entra Easy Auth is separate from Payload authentication. Relaxing Entra allows anonymous traffic to
reach the public site and `/admin`; Payload still requires its own login for the administration
panel.

The committed desired state is:

| Environment | Bicep setting                     | Anonymous `/` and `/admin` |
| ----------- | --------------------------------- | -------------------------- |
| staging     | `enableEntraAuthentication=false` | allowed                    |
| prod        | `enableEntraAuthentication=true`  | `401` except health routes |

A later infrastructure deployment reconciles the runtime configuration back to this table.

### Inspect the current state

```bash
export WKF_ENVIRONMENT='prod' # or: staging
export RESOURCE_GROUP="rg-wkf-${WKF_ENVIRONMENT}"
export APPLICATION_NAME="wkf-${WKF_ENVIRONMENT}"

az containerapp auth show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APPLICATION_NAME" \
  --query '{enabled:platform.enabled,action:globalValidation.unauthenticatedClientAction,excludedPaths:globalValidation.excludedPaths,microsoft:identityProviders.azureActiveDirectory.enabled}' \
  --output yaml
```

### Temporarily allow anonymous access while keeping Microsoft sign-in available

Use this when the Microsoft provider is already configured, which is true for production:

```bash
az containerapp auth update \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APPLICATION_NAME" \
  --enabled true \
  --unauthenticated-client-action AllowAnonymous \
  --yes \
  --output none
```

Verify from a logged-out browser and with `curl`. Confirm that Payload still protects admin actions.

### Require Entra sign-in again

```bash
az containerapp auth update \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APPLICATION_NAME" \
  --enabled true \
  --unauthenticated-client-action Return401 \
  --excluded-paths /api/health /api/health/live \
  --yes \
  --output none
```

Then require:

```bash
application_fqdn="$(az containerapp show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$APPLICATION_NAME" \
  --query properties.configuration.ingress.fqdn \
  --output tsv)"
curl --silent --output /dev/null --write-out '/api/health %{http_code}\n' \
  "https://${application_fqdn}/api/health"
curl --silent --output /dev/null --write-out '/ %{http_code}\n' \
  "https://${application_fqdn}/"
curl --silent --output /dev/null --write-out '/admin %{http_code}\n' \
  "https://${application_fqdn}/admin"
```

Expected results are `200`, `401`, and `401`. Finally, open:

```text
https://<application-fqdn>/.auth/login/aad
```

and confirm that a member of the configured Entra group can sign in while an account outside the
group cannot.

Do not use `--enabled false` merely to make the site public; `AllowAnonymous` preserves the
configured provider and optional Microsoft sign-in. Staging's committed configuration contains no
Microsoft provider while Easy Auth is disabled. Enabling Entra on staging persistently therefore
requires a reviewed infrastructure change that supplies its tenant ID, client ID, client secret,
allowed group, and callback URI. Do not put the client secret in a CLI argument or shell history.

## External service behavior

- [Azure Container Apps billing](https://learn.microsoft.com/azure/container-apps/billing): an
  inactive or zero-replica Consumption revision has no resource-consumption charge, while other
  Azure resources can still be billed.
- [Stop PostgreSQL Flexible Server compute](https://learn.microsoft.com/azure/postgresql/configure-maintain/how-to-stop-server):
  compute billing stops when the server is stopped, but Azure starts it automatically after seven
  days.
- [`az containerapp auth`](https://learn.microsoft.com/cli/azure/containerapp/auth): runtime Easy
  Auth inspection and updates.
