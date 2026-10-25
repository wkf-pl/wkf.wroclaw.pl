# Operational scripts

This directory contains the repository entry points for local development, test preparation,
deployment, staging data operations, and smoke verification. Prefer the documented `pnpm` command
or GitHub Actions workflow when one exists: those callers provide the expected environment.

## pnpm command reference

These are all scripts exposed by `package.json`. Commands marked as supporting commands are normally
called by another script, a container, or CI, but remain useful for focused diagnostics.

### Development, validation, and operations

| Command                                          | Purpose                                                                                                                                                                                                    |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm backup:prepare-restore <backup-directory>` | Re-encrypts and signs a validated production backup for the approval-gated production restore workflow.                                                                                                    |
| `pnpm build`                                     | Creates the production Next.js build in `.next-host`. The directory remains available after the command.                                                                                                   |
| `pnpm dev`                                       | Starts the host development server through `run-development-server.sh`; requires `WKF_ALLOW_NEXT_DEV=1`.                                                                                                   |
| `pnpm entra:sign-in [on\|off]`                   | Shows or temporarily changes whether the production Container App requires Microsoft Entra sign-in.                                                                                                        |
| `pnpm format`                                    | Formats the repository with Prettier.                                                                                                                                                                      |
| `pnpm format:check`                              | Checks formatting without changing files.                                                                                                                                                                  |
| `pnpm generate:importmap`                        | Regenerates the Payload admin import map.                                                                                                                                                                  |
| `pnpm generate:types`                            | Regenerates Payload TypeScript types.                                                                                                                                                                      |
| `pnpm lint`                                      | Runs ESLint for the repository.                                                                                                                                                                            |
| `pnpm migrate`                                   | Applies pending Payload migrations to the configured database.                                                                                                                                             |
| `pnpm migrate:create`                            | Creates a Payload migration from the current schema difference. Review and commit both generated migration artifacts and the index registration.                                                           |
| `pnpm pre-push`                                  | Runs formatting check, lint, typecheck, unit tests, integration tests, a production build, and production-mode E2E tests.                                                                                  |
| `pnpm preview:temporary -- <port>`               | Starts a foreground-only development preview on a port from 3100 to 3199 and removes its runtime on exit.                                                                                                  |
| `pnpm production:pull <backup-name> [IMPORT]`    | Imports a validated production off-site backup into the local Docker Compose database and Azurite.                                                                                                         |
| `pnpm seed`                                      | Adds idempotent demonstration content to the configured database.                                                                                                                                          |
| `pnpm staging:pull <checkpoint-name> [IMPORT]`   | Imports a named staging checkpoint into the local Docker Compose database and Azurite.                                                                                                                     |
| `pnpm start`                                     | Starts the production build from `.next-host`; it does not build first.                                                                                                                                    |
| `pnpm test`                                      | Runs unit tests and then integration tests. It does not run browser tests.                                                                                                                                 |
| `pnpm test:e2e`                                  | Runs Playwright against `PLAYWRIGHT_BASE_URL`, or the development server at port 3000 by default. It does not recreate or seed the test database.                                                          |
| `pnpm test:e2e:ci`                               | Recreates and seeds `wkf_test`, then runs Chromium against a previously prepared production runtime. It does not run `pnpm build`. See [diagnosing E2E failures](#diagnosing-e2e-failures-after-pre-push). |
| `pnpm test:integration`                          | Recreates the isolated `wkf_test` database from migrations and runs integration tests with one worker.                                                                                                     |
| `pnpm test:unit`                                 | Runs the unit test suite.                                                                                                                                                                                  |
| `pnpm typecheck`                                 | Runs TypeScript without emitting files.                                                                                                                                                                    |
| `pnpm verify:compose`                            | Smoke-tests the running local Compose application, storage, administrator bootstrap, and email delivery.                                                                                                   |

### Supporting commands

| Command                    | Caller and purpose                                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build:container`     | Builds Next.js inside the production container without the host-specific `.next-host` directory.                                                               |
| `pnpm dev:container`       | Starts the development server with the container-specific `.next-container` distribution directory.                                                            |
| `pnpm package:e2e-runtime` | Packages `.next-host/standalone`, `.next-host/static`, and `public/` as `tmp/wkf-next-runtime.tar.gz`. It does not build or extract the archive.               |
| `pnpm payload`             | Runs the Payload CLI with the repository configuration.                                                                                                        |
| `pnpm postinstall`         | Applies the version-guarded Payload UI patch after dependency installation; package managers call it automatically.                                            |
| `pnpm prepare:e2e`         | Runs integration preparation and then seeds browser-test content. Called by `test:e2e:ci`.                                                                     |
| `pnpm prepare:integration` | Starts test dependencies, recreates `wkf_test`, applies all committed migrations, and verifies migration history. Called by integration and CI-like E2E tests. |

### Diagnosing E2E failures after `pre-push`

`pnpm pre-push` intentionally prints a compact list of failing browser test names. Its production
build remains in `.next-host`. Before Playwright starts, the runner also packages that build and
publishes the complete runtime to `tmp/wkf-next-runtime`, including `public/` and
`.next-host/static`. This directory is ignored by Git and is not removed when `pre-push` finishes or
the browser tests fail.

Run the following command immediately after an E2E failure to recreate the isolated database and
rerun the complete browser suite with the same production runtime:

```bash
CI=1 pnpm test:e2e:ci
```

To focus on one failure, pass a Playwright title pattern:

```bash
CI=1 pnpm test:e2e:ci --grep "part of the failing test title"
```

`test:e2e:ci` deliberately consumes an existing runtime instead of building one. CI builds and
packages the application once, then gives the same immutable artifact to all four Playwright
shards. Locally, `pre-push` refreshes `tmp/wkf-next-runtime` from the build it just created. If source
code changes after that run, execute `pnpm pre-push` again before treating a later E2E result as
evidence for the current source.

## Deployment and Azure operations

### `classify-deployment.sh`

Compares a deployed Git commit with a target commit and emits three Boolean values:
`build_image`, `provision_infrastructure`, and `run_migrations`. Application changes request a new
image, changes under `infra/azure/` request infrastructure reconciliation, and changes under
`migrations/` request migrations. Markdown-only, workflow-only, and deployment-script-only changes
do not request an application image. If the deployed commit is missing or unavailable locally, the
script conservatively enables all three actions.

The staging and production deployment workflows call this script while building their deployment
plans. It can also be run manually when diagnosing a plan:

```bash
bash scripts/classify-deployment.sh <deployed-sha-or-empty> <target-sha> [output-file]
```

Without `output-file`, the values are written to standard output. With a file, they are appended in
GitHub Actions output-file syntax.

### `deploy-azure.sh`

Rolls an immutable image out to either Azure environment. The staging and production deployment
workflows invoke it after resolving the target image and deployment plan:

```bash
bash scripts/deploy-azure.sh <staging|prod> <image-reference> [--maintenance] [--provision]
```

- `--provision` reconciles the environment-specific Bicep deployment before the rollout.
- `--maintenance` records the current revision, creates an on-demand PostgreSQL backup when the
  server tier supports it, deactivates the application, and runs the Payload migration job.
- With neither option, the script updates the existing Container App without planned downtime.

After the update it verifies readiness, liveness, the public root, and the Payload admin route. For
staging it also confirms that `robots.txt` blocks indexing. If a later step fails after a successful
migration, the error trap runs `migrate:down` before restoring the previous revision; it will not
reactivate old code when the database rollback fails.

The workflows set `SOURCE_SHA`, `AZURE_LOCATION`, `AZURE_RESOURCE_PREFIX`, and the optional
`CUSTOM_DOMAIN_CERTIFICATE_ID`. `DEPLOYMENT_HEALTH_TIMEOUT_SECONDS` changes the default 600-second
verification deadline.

### `manage-entra-sign-in.sh`

Inspects or temporarily changes whether the production Container App requires Microsoft Entra
authentication. Run it through the package command with an Azure CLI session that can manage
`wkf-prod` in `rg-wkf-prod`:

```bash
pnpm entra:sign-in
pnpm entra:sign-in on
pnpm entra:sign-in off
```

With no state argument, the command shows the current authentication state. `on` rejects
unauthenticated requests with HTTP 401 while keeping `/api/health` and `/api/health/live` available
to platform probes. `off` keeps Container App authentication enabled but allows anonymous access.
Both changes print the resulting state.

This command changes only the current Azure runtime configuration. It does not edit Bicep or
`infra/azure/environments/prod.bicepparam`; a later infrastructure deployment restores the
declarative setting, which currently allows anonymous access.

### `manage-staging-data.sh`

Creates or restores a consistent checkpoint containing the staging PostgreSQL database and every
blob in the `media` container. It is called only by the manually dispatched **Manage staging data**
workflow, which serializes this operation with staging deployments.

```bash
bash scripts/manage-staging-data.sh <backup|restore> <checkpoint-name> [RESTORE]
```

Both operations deactivate the current staging revision and temporarily allow the runner's public
IP through the database firewall. A backup validates the custom-format database dump, records its
SHA-256 checksum, copies all media, and uploads a manifest without overwriting an existing named
checkpoint. A restore first validates the checkpoint and creates a rescue checkpoint, then replaces
the database and media, applies and checks current Payload migrations, reactivates the recorded
revision, and smoke-tests the application. If destructive restoration fails, staging deliberately
remains in maintenance mode.

The workflow supplies `POSTGRES_ADMIN_PASSWORD`. Optional controls are
`STAGING_DATABASE_ADMINISTRATOR` and `STAGING_DATA_HEALTH_TIMEOUT_SECONDS`.

### `pull-staging-data.sh`

Imports a named staging checkpoint into the local Docker Compose PostgreSQL and Azurite services.
It is a developer-operated, destructive local command exposed as:

```bash
pnpm staging:pull <checkpoint-name> [IMPORT]
```

The script downloads and validates the manifest, database checksum, database archive, blob names,
and media count before changing local data. It normally requires the checkpoint's deployed commit
to be an ancestor of local `HEAD`; `STAGING_PULL_ALLOW_CODE_MISMATCH=true` bypasses that guard only
after the schema risk has been reviewed. It warns about uncommitted schema-related files.

Before replacement, it stops a running Compose application, refuses to continue while other local
database clients remain connected, and writes a recoverable database-and-media backup under
`tmp/staging-pulls/local-before-*`. It then imports the checkpoint, runs current migrations, clears
sessions and login-reset state, and restarts the application only if it was running before. On a
failed destructive import, cleanup attempts to restore the local rescue copy.

The command requires an authenticated Azure CLI plus Docker, Git, `jq`, `sed`, and `sha256sum`.
Resource names and health checks can be adjusted with `STAGING_RESOURCE_GROUP_NAME`,
`STAGING_CHECKPOINT_CONTAINER_NAME`, `STAGING_STORAGE_ACCOUNT_NAME`, `LOCAL_AZURITE_CONNECTION_STRING`,
`LOCAL_APP_URL`, and `STAGING_PULL_HEALTH_TIMEOUT_SECONDS`.

### `pull-production-data.sh`

Imports an authenticated production off-site backup into the local Docker Compose PostgreSQL and
Azurite services without reading from Azure or changing MyDevil. It is exposed as:

```bash
export PRODUCTION_BACKUP_AGE_IDENTITY_FILE='/absolute/path/to/wkf-backup.agekey'
pnpm production:pull production-YYYYMMDDTHHMMSSZ [IMPORT]
```

By default the script downloads the selected recovery point over the operator's main MyDevil SSH
identity from protected `repository-v3/snapshots`. `PRODUCTION_BACKUP_LOCAL_DIRECTORY` selects an already
downloaded copy instead. The long-lived `age` identity remains a read-only local mount and is never
copied into the project, a container image, GitHub, Azure, or MyDevil.

The script rebuilds and then validates and extracts the backup with `wkf-operations:local`, then
reuses the same local replacement and rollback engine as `staging:pull`. Set
`PRODUCTION_PULL_REBUILD_OPERATIONS_IMAGE=false` only to reuse an existing image. It requires the
backup source commit to be an ancestor of local `HEAD`, creates a rescue point under
`tmp/production-pulls/local-before-*`, runs
current migrations, and clears authentication and document-lock state. Only an explicitly reviewed
`PRODUCTION_PULL_ALLOW_CODE_MISMATCH=true` bypasses the source-SHA guard.

### Off-site production backup and restore

The **Back up production data off-site** workflow creates a consistent copy of the production
PostgreSQL database and the complete `media` container. It runs daily at 02:30 UTC or by manual
dispatch and shares the `production-operations` lock with production deploys and imports. Scheduled
runs resolve the immutable `wkf-operations` image built for the workflow commit; manual runs may
instead receive an explicit digest reported by staging. The workflow deactivates the production
revision only after the ephemeral backup job has been provisioned, waits until its replicas have
stopped, and always tries to reactivate it during cleanup. It uses the dedicated `prod-backup`
environment without a required reviewer so scheduled runs can start unattended.

Configure these `prod-backup` environment variables before the first run:

- `OFFSITE_BACKUP_AGE_RECIPIENT` — the public `age` recipient; never store the private identity in
  GitHub or Azure;
- `OFFSITE_BACKUP_FTPS_HOST`, `OFFSITE_BACKUP_FTPS_PORT`, and `OFFSITE_BACKUP_FTPS_USER`;
- `OFFSITE_BACKUP_FTPS_REMOTE_ROOT` — `/` for the dedicated MyDevil account restricted to
  `backups/wkf/incoming`;
- `OFFSITE_BACKUP_QUOTA_GB` — currently `10`; this documents and validates the destination quota but
  does not enforce retention from Azure.

Configure these `prod-backup` environment secrets:

- `OFFSITE_BACKUP_FTPS_PASSWORD` — the unique password for the restricted MyDevil FTPS account;
- `OFFSITE_BACKUP_SIGNING_PRIVATE_KEY` — the unencrypted OpenSSH private key used only to sign
  manifests;
- `POSTGRES_BACKUP_PASSWORD` — the password for the dedicated `wkf_backup` role; use the same value
  for the one-time role bootstrap in `prod`.

The backup job deliberately receives no administrator, migrator, or runtime database credential.
`wkf_backup` can read current and future application tables and sequences for `pg_dump`, but cannot
write rows, create schema objects, manage roles, or install extensions. Run the production
`bootstrap` phase once after introducing this secret so the role exists before the first backup.

`backup-offsite.sh` creates `production-YYYYMMDDTHHMMSSZ` below the remote root. It streams one blob
at a time through local ephemeral storage, addresses media by plaintext SHA-256, and uploads only one
encrypted object for identical content within a run. It encrypts the database, media objects, and
logical manifest with `age`, then uploads them over explicit FTPS with passive mode and certificate
validation. The job uploads `.complete` last; a directory without this marker is an incomplete
transfer and is never a recovery point. FTPS credentials are stored in a mode-0600 temporary curl
configuration rather than passed on the command line.

The job signs the encrypted manifest with a dedicated Ed25519 signing key under the
`wkf-production-backup` namespace. The matching public key and `allowed_signers` entry are embedded
in the operations image. These are data-signing keys, not SSH login credentials: do not move them
to `~/.ssh` merely because OpenSSH supplies the signing format. Keep the private key in the password
manager and the GitHub environment secret; keep the `age` private identity separately and offline.
The signature prevents a compromised backup destination from replacing the manifest and artifacts
with a newly encrypted forgery.

The encrypted format-v3 manifest records the source SHA, exact application and operations image
digests, Payload migration rows, database size and SHA-256, and every blob name, size, SHA-256, and
content-addressed archive path. A second public manifest exposes only the physical transfer
inventory and is signed under `wkf-production-backup-storage`; it lets MyDevil authenticate a
complete upload without the decryption identity. See the
[storage format decision](../docs/OffsiteBackupStorageDecision.md) for the trust boundary and
on-disk layout. To verify a downloaded backup locally, build or pull the matching operations image
and use the local validation wrapper:

```bash
docker build --file Dockerfile.operations --tag wkf-operations:local .
bash scripts/operations/validate-offsite-backup-local.sh \
  /absolute/path/to/production-YYYYMMDDTHHMMSSZ \
  /absolute/path/to/age-identity.txt \
  wkf-operations:local
```

The validator decrypts and authenticates every artifact, checks manifest structure, sizes and
SHA-256 values, and verifies the custom PostgreSQL archive with `pg_restore --list` without changing
Azure. The wrapper runs the container without networking, with a read-only root filesystem and
read-only backup and identity mounts. It deliberately uses the image's root identity with only
`DAC_READ_SEARCH` retained because a mode-0600 host identity cannot be read by the image's
`operations` user, while an arbitrary host UID may not exist in the image's NSS database.

`restore-offsite-backup.sh <downloaded-backup-directory> RESTORE` is the destructive low-level
restore command: it validates the entire backup before removing any destination blob, restores the
database with `pg_restore --exit-on-error`, restores the blobs, and clears sessions and document
locks. It must run from the private target network while the target application is stopped,
followed by current migrations, runtime-grant reconciliation, and application smoke checks.

Do not give the main backup `age` private identity to GitHub or Azure. A production restore uses a
separate, persistent restore-only `age` key pair and a separate, persistent Ed25519 signing pair.
GitHub receives the restore `age` identity and public signing material; the signing private key
remains only on trusted local storage, in the password manager, and on the NAS.

Copy `.env.restore.example` to the ignored `.env.restore` and configure absolute paths:

```dotenv
BACKUP_AGE_IDENTITY_FILE=/absolute/path/to/wkf-backup.agekey
RESTORE_AGE_RECIPIENT_FILE=/absolute/path/to/wkf-restore.agepub
RESTORE_SIGNING_PRIVATE_KEY_FILE=/absolute/path/to/wkf-restore-manifest-signing
RESTORE_OUTPUT_ROOT=/absolute/path/to/wkf-restore-ready
```

The file contains paths and public values, never private-key contents. Prepare an export with:

```bash
pnpm backup:prepare-restore /absolute/path/to/production-YYYYMMDDTHHMMSSZ
```

`--config /absolute/path/to/recovery.env` selects another dotenv file. CLI path options override the
selected file, which overrides `.env.restore`; the output defaults to `tmp/restore-ready` only when
`RESTORE_OUTPUT_ROOT` is absent. The wrapper parses dotenv data without shell evaluation, rebuilds
`wkf-operations:local`, and runs the re-encryption helper in a networkless, read-only container.
The available overrides are `--backup-age-identity-file`, `--restore-age-recipient-file`,
`--restore-signing-private-key-file`, and `--output-root`.

The helper reads the immutable `operationsImageReference` from the authenticated source manifest.
It writes that value, the backup name, and manifest checksums to a signed public
`restore-descriptor.json`. The workflow verifies this descriptor before selecting and pulling the
operations image, then requires the encrypted manifest to agree. There is no operator-supplied
image digest or fallback. Upload the resulting directory but publish `.complete` last.

`download-restore-descriptor-ftps.sh` first fetches only `.complete`, the public descriptor, and its
signature. `download-offsite-backup-ftps.sh` then fetches the signed encrypted manifest, decrypts
only that manifest to discover the finite artifact list, downloads each unique object once, and runs
the full validator. Neither script recurses through the FTPS account or accesses the protected
repository.

`infra/azure/offsite-restore-job.bicep` creates the ephemeral live-production restore job. The job
downloads and validates the disposable export again inside the production environment before
calling `restore-offsite-backup.sh`. The approval-gated workflow deletes the job and deployment
after the execution; it deliberately leaves the application inactive on any restore, migration,
grant, or smoke-test failure.

### Isolated Azure restore drill

`infra/azure/offsite-restore-drill.bicep` provisions an ephemeral restore target in a dedicated
resource group. It creates a private PostgreSQL B1ms server, separate source and restored-media Blob
containers, a restore job, and—only when enabled—an application with internal-only ingress. It uses
the existing operations and registry identities but grants data access only on the temporary
Storage account.

Use the following sequence:

1. Run an ARM `what-if`, then deploy with `restoredApplicationEnabled=false` and
   `storageAllowPublicUpload=true`.
2. Upload only the prepared restore-export directory to `restore-source` using Entra authentication.
3. Restrict the temporary Storage account to the Container Apps subnet.
4. Check `shared_preload_libraries` on the temporary PostgreSQL server. A new server reports
   `isConfigPendingRestart=true` after enabling `pgaudit`; restart that temporary server and confirm
   the flag is false before starting the restore job.
5. Start the restore job and require its `RESTORE_DRILL_RESULT` to report the expected blob and
   migration counts with zero sessions.
6. Redeploy with `restoredApplicationEnabled=true` and `storageAllowPublicUpload=false`, then verify
   health, the public page, admin, and representative range requests from inside the container.
7. Delete the entire restore-drill resource group and every local decrypted or prepared working
   copy. Keep the dedicated restore keys and persistent GitHub secrets.

The first deployment temporarily permits authenticated public-network upload to the dedicated
Storage account. Shared Key and anonymous Blob access remain disabled. Close the network before
starting the restore job. Never point the drill at the production database or production media
container.

On MyDevil, install `archive-offsite-backups.sh` outside the FTPS-visible directory, for example as
`/usr/home/forseti/bin/wkf-archive-offsite-backups.sh`, and keep these directories owned by the main
account:

```text
/usr/home/forseti/remote-backups/wkf/incoming
/usr/home/forseti/remote-backups/wkf/repository-v3/snapshots
/usr/home/forseti/remote-backups/wkf/repository-v3/objects/sha256
/usr/home/forseti/remote-backups/wkf/quarantine
/usr/home/forseti/remote-backups/wkf/restore-export
```

Run the archiver every 15 minutes from the main account's crontab:

```cron
*/15 * * * * /usr/home/forseti/bin/wkf-archive-offsite-backups.sh >> /usr/home/forseti/remote-backups/wkf/archive-cron.log 2>&1
```

The script serializes itself with `/usr/bin/lockf`, accepts only authenticated format-v3 transfers,
stores two physical copies of each unique encrypted media object, and creates atomic snapshot
directories whose media files are hard links into the object pool. It moves incomplete transfers
older than 24 hours to `quarantine`. Run the repository checker without mutation first:

```bash
/usr/home/forseti/bin/wkf-check-offsite-backup-repository.sh
```

Use `--repair` only after reviewing a reported single-replica or snapshot-link failure. The checker
never repairs an object when both replicas are invalid. Snapshot retention and object garbage
collection are separate operations: removing a snapshot must not remove a shared object. The
restore-export preparation helper and isolated restore drill are implemented; see the
[production operations runbook](../docs/Operations.md) for the end-to-end operator procedures and
the boundary before a destructive live-production restore.

## Builds, tests, and verification

### `pre-push.ts`

Runs the complete local validation pipeline in four phases and renders a compact terminal dashboard.
Formatting, lint, and typecheck run concurrently, followed by concurrent unit and integration tests,
then the production build and production-mode Playwright tests. Invoke it through:

```bash
pnpm pre-push
```

Static-check failures do not stop later phases. Unit or integration failures skip the build and
browser tests, while a build failure skips browser tests. Error details are printed only after the
pipeline finishes or stops: static checks list affected files, test phases list failing test names,
and the build prints its captured error output.

The browser stage packages the production build in a unique system temporary directory and
publishes the extracted runtime to `tmp/wkf-next-runtime` before starting Playwright. The temporary
packaging directory is removed on completion, while the published runtime remains available for a
detailed `test:e2e:ci` rerun. Set `WKF_PRE_PUSH_STATIC=1` to disable dynamic terminal redraw.

### `package-e2e-runtime.sh`

Packages the standalone Next.js server, its static build output, and `public/` assets into one
archive. `pnpm package:e2e-runtime` invokes it in CI after `pnpm build`; the resulting artifact is
downloaded by every Playwright shard so E2E tests exercise the same production build.

```bash
pnpm package:e2e-runtime
bash scripts/package-e2e-runtime.sh [archive-path]
```

The default input distribution is `NEXT_DIST_DIR=.next-host`, and the default output is
`tmp/wkf-next-runtime.tar.gz`. The script refuses to package an incomplete standalone build and
always removes its temporary staging directory.

### `prepare-test-environment.ts`

Starts the `postgres-test` and `azurite` Compose services, recreates the isolated test database from
committed Payload migrations, and verifies that the migration table contains exactly the migration
files present in the repository. It does not seed CMS content.

`pnpm prepare:integration` calls it directly. `pnpm test:integration` and `pnpm test:e2e:ci` call it
indirectly before running tests. The test environment is loaded from `test.env`; the database
recreation is intentionally destructive only to that dedicated test database.

### `verify-compose.ts`

Performs an end-to-end smoke check of a running local Compose stack. `pnpm verify:compose` invokes
it manually after `docker compose up`.

The verifier checks readiness and liveness plus `/` and `/admin`, creates the first user and confirms
the administrator bootstrap role, uploads a media file through the configured Blob adapter, and
requests a password-reset email through Mailpit. It removes the user, media record, and test message
afterward. Because it verifies first-user bootstrap, the users collection must be empty.

`COMPOSE_APP_URL` and `COMPOSE_MAILPIT_URL` override the default local endpoints.

## Local development

### `run-development-server.sh`

Starts `next dev` with the repository's development environment, configured distribution directory,
and Node warning settings. The `dev` and `dev:container` package scripts call it.

The script refuses to run unless `WKF_ALLOW_NEXT_DEV=1` is set. Docker Compose supplies that opt-in
for the application service. `NEXT_DIST_DIR` selects the cache directory and defaults to
`.next-host`; any remaining arguments are passed to `next dev`.

### `run-temporary-preview.sh`

Runs a foreground-only, time-limited development preview in its own process group. It allocates an
isolated Next.js cache and temporary TypeScript configuration, then removes both, terminates the
entire process group, and verifies that the port has closed on every exit path.

`pnpm preview:temporary -- <port>` invokes it for local browser inspection. The port must be in the
`3100-3199` range and defaults to `3101`; `WKF_PREVIEW_MAX_SECONDS` changes the default 15-minute
lifetime. Like the regular development server, it requires `WKF_ALLOW_NEXT_DEV=1`. Arguments after
the port replace the default preview command.

### `prepare-development-migrations.ts`

Handles one narrowly defined legacy Payload development-schema state. If it finds migration records
with batch `-1`, it removes them only when the pending committed migrations match the known,
reconcilable migration set. Any other schema drift fails closed and requires manual review.

`start-development-container.sh` invokes it automatically before normal migrations whenever the
Compose application container starts. Developers should not use it as a general migration repair
tool.

### `start-development-container.sh`

Is the Docker Compose application service entry point. On every container start it runs
`prepare-development-migrations.ts`, applies committed Payload migrations, and then replaces itself
with `pnpm dev:container`. It is invoked by the `command` configured for the `app` service in
`compose.yml`, not normally from a host shell.

## Demonstration content

### `seed.ts`

Creates idempotent demonstration content used by local development and E2E preparation: an editor
when no user exists, sample media and posts, the About and Blog pages, navigation defaults, a
homepage group, site settings, and footer content. Existing posts and pages with matching identities
are preserved, and populated navigation or homepage groups are not overwritten.

`pnpm seed` runs it manually. `pnpm prepare:e2e` also runs it after rebuilding the isolated test
schema. Set `SEED_REFRESH_MEDIA=true` to rewrite existing sample media files through the configured
Azurite or Azure Blob Storage adapter. Seeded content is demonstrative and must not be presented as
evidence of actual WKF activities or achievements.
