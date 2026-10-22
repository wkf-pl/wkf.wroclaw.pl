# Azure infrastructure

The project maintains two isolated Azure environments and one local Compose environment:

| Environment | Resource group   | Address                                   |
| ----------- | ---------------- | ----------------------------------------- |
| local       | not applicable   | `http://127.0.0.1:3000`                   |
| staging     | `rg-wkf-staging` | technical `azurecontainerapps.io` address |
| prod        | `rg-wkf-prod`    | `https://wkf.wroclaw.pl`                  |

Resource groups are created in advance, outside the workflows. `shared.bicep` deploys the shared
Azure Container Registry to `rg-wkf-shared`. `main.bicep` deploys environment-specific resources to
the selected group through modules in `modules/`: a Container Apps Environment, the application, a
manually triggered migration job, PostgreSQL Flexible Server, Blob Storage, and Log Analytics. All
resources default to the `Poland Central` (`polandcentral`) region.

The `environments/staging.bicepparam` and `environments/prod.bicepparam` files contain only
non-secret environment differences. Secrets are supplied through environment variables while
parameters are compiled.

Staging scales the application from zero to one replica. Production keeps exactly one replica
running. The single-replica maximum exists because the local Next Data Cache is not shared between
replicas. [ADR 0001](../../docs/ADR/0001-content-listing-index-and-public-data-cache.md) explains the
constraint and the path to later scaling. The [operations runbook](../../docs/Operations.md) explains
how to suspend application and PostgreSQL compute deliberately.

## GitHub environments

Create `staging`, `prod`, `prod-backup`, and `prod-restore` GitHub environments. The `prod` and
`prod-restore` environments should require manual approval. `prod-restore` must be limited to
`master`, require the production reviewer, and disallow administrator bypass. `prod-backup` should
be limited to `master`, should not allow administrators
to bypass its protection rules, and must not require a reviewer because the daily schedule is
unattended. Use a separate GitHub OIDC application whose federated subject is
`repo:wkf-pl@291146656/wkf.wroclaw.pl@1343632045:environment:prod-backup` and grant it only the
production and shared ACR permissions required by the backup workflow. The organization and
repository IDs are part of WKF's customized GitHub OIDC subject format.

Add another federated credential to the production deployment application for the customized
subject ending in `environment:prod-restore`. The restore identity keeps the existing resource-group
`Contributor`, shared-registry `Reader`, and `AcrPull` scope; it must not receive subscription-wide
permissions or role-assignment management.

Configure these variables in every environment:

- `AZURE_CLIENT_ID` — client ID of the application used by GitHub OIDC
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_TENANT_ID`

The staging OIDC identity receives the `Contributor` role only in `rg-wkf-staging` and
`rg-wkf-shared`. Because GitHub builds the image once and pushes it directly to ACR, the identity
also needs the `AcrPush` data-plane role on the registry in `rg-wkf-shared`. It needs neither a
subscription-wide role nor permission to manage roles. An administrator grants `AcrPush` once,
outside the workflow; the workflow cannot extend its own privileges.

For the current registry using classic RBAC, a subscription owner or RBAC administrator can create
the assignment with:

```bash
registry_id="$(az acr show --name <registry-name> --query id --output tsv)"
az role assignment create --assignee <github-oidc-client-id> --role AcrPush --scope "$registry_id"
```

The `wkf-staging-registry` managed identity is created before the first deployment and receives a
one-time `AcrPull` assignment in `rg-wkf-shared`. The workflow cannot change that assignment itself.

Production can additionally define `CUSTOM_DOMAIN_CERTIFICATE_ID` with the complete resource ID of
the certificate assigned to the Container Apps Environment.

Configure these secrets in `staging` and `prod`:

- `PAYLOAD_SECRET`
- `POSTGRES_ADMIN_PASSWORD`

Production additionally requires the `SMTP_HOST` variable and these secrets:

- `SMTP_USER`
- `SMTP_PASSWORD`
- `POSTGRES_MIGRATOR_PASSWORD`
- `POSTGRES_RUNTIME_PASSWORD`
- `POSTGRES_BACKUP_PASSWORD` — used only by the role bootstrap; use the same value in `prod-backup`

The `prod-backup` environment additionally requires these variables:

- `OFFSITE_BACKUP_AGE_RECIPIENT`
- `OFFSITE_BACKUP_FTPS_HOST`
- `OFFSITE_BACKUP_FTPS_PORT`
- `OFFSITE_BACKUP_FTPS_REMOTE_ROOT`
- `OFFSITE_BACKUP_FTPS_USER`
- `OFFSITE_BACKUP_QUOTA_GB`

Configure only these backup-specific secrets in `prod-backup`:

- `OFFSITE_BACKUP_FTPS_PASSWORD`
- `OFFSITE_BACKUP_SIGNING_PRIVATE_KEY`
- `POSTGRES_BACKUP_PASSWORD` — identical to the `prod` bootstrap value

The `prod-restore` environment additionally requires these variables for a dedicated MyDevil FTPS
account rooted at `/usr/home/forseti/remote-backups/wkf/restore-export`:

- `OFFSITE_RESTORE_FTPS_HOST`
- `OFFSITE_RESTORE_FTPS_PORT`
- `OFFSITE_RESTORE_FTPS_REMOTE_ROOT` — normally `/` for the restricted account
- `OFFSITE_RESTORE_FTPS_USER`

Configure these persistent secrets in `prod-restore`:

- `OFFSITE_RESTORE_FTPS_PASSWORD`
- `POSTGRES_MIGRATOR_PASSWORD` — identical to the `prod` migrator value
- `OFFSITE_RESTORE_AGE_IDENTITY` — the dedicated restore-only `age` private identity
- `OFFSITE_RESTORE_ALLOWED_SIGNERS` — an allowed-signers line for identity
  `wkf-production-restore` and the dedicated restore signing public key
- `OFFSITE_RESTORE_MANIFEST_SIGNING_PUBLIC_KEY` — the same dedicated restore signing public key

These are stable recovery credentials, not per-incident values. Back up the restore `age` private
identity and signing private key in the password manager and on the NAS. The signing private key
must never be stored in GitHub, Azure, or MyDevil. The main production-backup `age` identity and
backup manifest-signing private key must never be substituted for the dedicated restore keys.

Generate the dedicated pairs once on a trusted workstation:

```bash
umask 077
age-keygen --output /secure/offline/wkf-restore.agekey
age-keygen -y /secure/offline/wkf-restore.agekey \
  > /secure/offline/wkf-restore.agepub
ssh-keygen -q -t ed25519 -N '' \
  -f /secure/offline/wkf-restore-manifest-signing
ssh-keygen -y -P '' \
  -f /secure/offline/wkf-restore-manifest-signing \
  > /secure/offline/wkf-restore-manifest-signing.pub
printf 'wkf-production-restore %s\n' \
  "$(cat /secure/offline/wkf-restore-manifest-signing.pub)" \
  > /secure/offline/wkf-restore-allowed-signers
```

Store the contents of `wkf-restore.agekey`, `wkf-restore-allowed-signers`, and
`wkf-restore-manifest-signing.pub` in the corresponding three GitHub secrets. Store only the public
`wkf-restore.agepub` and paths to the local private files in `.env.restore`. Never store the restore
signing private key in GitHub.

Do not copy the PostgreSQL administrator, migrator, or runtime passwords into `prod-backup`. After
adding `POSTGRES_BACKUP_PASSWORD` to `prod` and `prod-backup`, run the `bootstrap` phase of
`deploy-production.yml` once with the current immutable operations-image digest. The ephemeral job
creates or hardens `wkf_backup`, grants only database/schema access and read access to current and
future tables and sequences, and then removes itself. Later migration grant reconciliation keeps the
role read-only.

SMTP is initially disabled on staging. This does not block the website or admin panel, but email
features remain unavailable until an SMTP server is configured.

Production uses Microsoft Entra Easy Auth to require membership in an approved group before a
request reaches the site or Payload login. Its configuration requires these variables:

- `ENTRA_TENANT_ID`
- `ENTRA_CLIENT_ID`
- `ENTRA_ALLOWED_GROUP_ID` — the group containing board members and technical staff

It also requires the `ENTRA_CLIENT_SECRET` secret.

The production app registration must emit group identifiers in the token. Health routes remain
anonymous; `/` and `/admin` return `401` to unauthenticated requests. Payload authentication remains
a separate second layer for the administration panel. Staging has Easy Auth disabled in its
committed parameters and allows anonymous access, but still serves a `robots.txt` that blocks the
entire site from indexing.

Add this redirect URI to the Entra app registration for every protected application address:

```text
https://<application-address>/.auth/login/aad/callback
```

Enable the ID tokens required by the Easy Auth sign-in flow:

```bash
az ad app update --id "$ENTRA_CLIENT_ID" --enable-id-token-issuance true
```

## Deployments

Pull requests run CI, including a production Next.js build used by the Playwright shards and a
cache-aware container image validation, but they do not deploy. A merge or push to `master` also
does not deploy staging. Run `deploy-staging.yml` manually from `master` only when a selected commit
needs Azure qualification or a production-promotion digest. This allows staging application and
PostgreSQL compute to remain suspended during normal local development.

Every deployed revision records `DEPLOYED_SOURCE_SHA`. The workflow compares that commit with the
target and determines automatically whether it needs a new image, full provisioning, and
migrations. If the active revision does not yet have SHA metadata, the workflow safely enables all
three actions. A manual run can force or skip provisioning and migrations.

The manually dispatched staging workflow:

1. Rejects dispatch from any branch other than `master`.
2. Classifies changes against the active revision.
3. Reconciles shared resources and complete environment infrastructure only when required.
4. Builds and pushes one immutable image, or reuses the active digest.
5. Records the actual active revision and its image as the rollback point before changing anything.
6. For migration changes, creates a PostgreSQL backup, enters maintenance, and runs the migration
   job.
7. Switches the application to the new image; without migrations, Container Apps single-revision
   mode handles a zero-downtime transition.
8. For up to ten minutes, checks readiness at `/api/health`, liveness at `/api/health/live`, HTTP
   responses for `/` and `/admin`, and the staging indexing block in `/robots.txt`.
9. Writes the image digest to the workflow summary.

Staging deployment and data-checkpoint operations share the `staging-operations` concurrency group.
GitHub runs them sequentially and does not cancel an operation already in progress when a newer one
starts.

If a migration or HTTP check fails, the script runs `migrate:down` only after `migrate` completed,
deactivates other revisions, and restores the recorded rollback point. It does not attempt to
reactivate a revision that is already active. If the database rollback fails, the old revision
deliberately remains inactive rather than running old code against an incompatible schema.

## Staging data checkpoints

The **Manage staging data** workflow is available only through the manual **Run workflow** action in
GitHub Actions. It supports two operations:

- `backup` creates a named checkpoint of the complete PostgreSQL database and all current blobs in
  the `media` container.
- `restore` restores the selected checkpoint and requires the exact `RESTORE` confirmation value.

A checkpoint name must contain 3–63 lowercase letters, digits, or hyphens, for example
`beta-start`. An existing checkpoint is never overwritten. Before either operation, the application
enters maintenance mode so the database and Media represent the same state. The database archive is
verified with `pg_restore --list` and a SHA-256 checksum; the manifest records the time, image,
deployed source SHA, and Media blob count.

Before the actual restore, the workflow creates a `rescue-<timestamp>` checkpoint. It then restores
the database and Media, runs the current `payload migrate` job and `migrate:status`, activates the
recorded revision, and checks `/api/health`, `/api/health/live`, `/`, `/admin`, and `/robots.txt`.
If an error occurs after destructive restoration begins, staging remains in maintenance mode; the
application is not started against partially restored or incompatible data. Retrying `restore` can
recover the latest revision even when no revision is active. The temporary PostgreSQL firewall rule
that allows only the runner IP is also removed after a failure.

The staging Storage account enables blob versioning and 14-day soft deletion for blobs and
containers. Rescue checkpoints are deleted automatically after 14 days; named checkpoints remain
until manually deleted. These controls protect Media files, which are not included in a PostgreSQL
backup.

`deploy-production.yml` is manually dispatched. It accepts the approved image digest and full
source SHA reported by staging, confirms that the image exists in ACR, classifies changes
automatically, and switches the application. It never rebuilds the image. The operator can
explicitly force or skip full provisioning and migrations.

## Production domain

Production parameters set `SERVER_URL=https://wkf.wroclaw.pl`. Binding the domain and certificate
requires DNS to point to Container Apps first. After creating the certificate, pass its resource ID
as `customDomainCertificateId`; while the parameter is empty, the application remains available at
its technical Azure address.

## Network security

Production PostgreSQL has public networking disabled and uses a delegated private subnet plus a
private DNS zone. Production Blob Storage accepts data traffic only from the Container Apps subnet,
disables Shared Key authorization, and is accessed through managed identities. Staging retains its
public PostgreSQL firewall workflow and Shared Key Storage configuration for staging checkpoints.
All PostgreSQL application connections require TLS through `sslmode=require`.

Operational backup, restore, suspension, and Easy Auth procedures are documented in the
[production operations runbook](../../docs/Operations.md).
