# Operational scripts

This directory contains the repository entry points for local development, test preparation,
deployment, staging data operations, and smoke verification. Prefer the documented `pnpm` command
or GitHub Actions workflow when one exists: those callers provide the expected environment.

## pnpm command reference

These are all scripts exposed by `package.json`. Commands marked as supporting commands are normally
called by another script, a container, or CI, but remain useful for focused diagnostics.

### Development, validation, and operations

| Command                                        | Purpose                                                                                                                                                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                     | Starts the host development server through `run-development-server.sh`; requires `WKF_ALLOW_NEXT_DEV=1`.                                                                                                   |
| `pnpm preview:temporary -- <port>`             | Starts a foreground-only development preview on a port from 3100 to 3199 and removes its runtime on exit.                                                                                                  |
| `pnpm build`                                   | Creates the production Next.js build in `.next-host`. The directory remains available after the command.                                                                                                   |
| `pnpm start`                                   | Starts the production build from `.next-host`; it does not build first.                                                                                                                                    |
| `pnpm format`                                  | Formats the repository with Prettier.                                                                                                                                                                      |
| `pnpm format:check`                            | Checks formatting without changing files.                                                                                                                                                                  |
| `pnpm lint`                                    | Runs ESLint for the repository.                                                                                                                                                                            |
| `pnpm typecheck`                               | Runs TypeScript without emitting files.                                                                                                                                                                    |
| `pnpm test`                                    | Runs unit tests and then integration tests. It does not run browser tests.                                                                                                                                 |
| `pnpm test:unit`                               | Runs the unit test suite.                                                                                                                                                                                  |
| `pnpm test:integration`                        | Recreates the isolated `wkf_test` database from migrations and runs integration tests with one worker.                                                                                                     |
| `pnpm test:e2e`                                | Runs Playwright against `PLAYWRIGHT_BASE_URL`, or the development server at port 3000 by default. It does not recreate or seed the test database.                                                          |
| `pnpm test:e2e:ci`                             | Recreates and seeds `wkf_test`, then runs Chromium against a previously prepared production runtime. It does not run `pnpm build`. See [diagnosing E2E failures](#diagnosing-e2e-failures-after-pre-push). |
| `pnpm pre-push`                                | Runs formatting check, lint, typecheck, unit tests, integration tests, a production build, and production-mode E2E tests.                                                                                  |
| `pnpm generate:types`                          | Regenerates Payload TypeScript types.                                                                                                                                                                      |
| `pnpm generate:importmap`                      | Regenerates the Payload admin import map.                                                                                                                                                                  |
| `pnpm migrate:create`                          | Creates a Payload migration from the current schema difference. Review and commit both generated migration artifacts and the index registration.                                                           |
| `pnpm migrate`                                 | Applies pending Payload migrations to the configured database.                                                                                                                                             |
| `pnpm seed`                                    | Adds idempotent demonstration content to the configured database.                                                                                                                                          |
| `pnpm staging:pull <checkpoint-name> [IMPORT]` | Imports a named staging checkpoint into the local Docker Compose database and Azurite.                                                                                                                     |
| `pnpm verify:compose`                          | Smoke-tests the running local Compose application, storage, administrator bootstrap, and email delivery.                                                                                                   |

### Supporting commands

| Command                    | Caller and purpose                                                                                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build:container`     | Builds Next.js inside the production container without the host-specific `.next-host` directory.                                                               |
| `pnpm dev:container`       | Starts the development server with the container-specific `.next-container` distribution directory.                                                            |
| `pnpm prepare:integration` | Starts test dependencies, recreates `wkf_test`, applies all committed migrations, and verifies migration history. Called by integration and CI-like E2E tests. |
| `pnpm prepare:e2e`         | Runs integration preparation and then seeds browser-test content. Called by `test:e2e:ci`.                                                                     |
| `pnpm package:e2e-runtime` | Packages `.next-host/standalone`, `.next-host/static`, and `public/` as `tmp/wkf-next-runtime.tar.gz`. It does not build or extract the archive.               |
| `pnpm payload`             | Runs the Payload CLI with the repository configuration.                                                                                                        |
| `pnpm postinstall`         | Applies the version-guarded Payload UI patch after dependency installation; package managers call it automatically.                                            |

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

### Off-site production backup and restore

The **Back up production data off-site** workflow creates a consistent copy of the production
PostgreSQL database and the complete `media` container. It runs daily at 02:30 UTC or by manual
dispatch and shares the `production-operations` lock with production deploys and imports. Scheduled
runs resolve the immutable `wkf-operations` image built for the workflow commit; manual runs may
instead receive an explicit digest reported by staging. The workflow deactivates the production
revision only after the ephemeral backup job has been provisioned, waits until its replicas have
stopped, and always tries to reactivate it during cleanup. The `prod` environment approval still
applies to scheduled runs, so a scheduled run waits for its required reviewer until that protection
policy is deliberately changed.

Configure these `prod` environment variables before the first run:

- `OFFSITE_BACKUP_AGE_RECIPIENT` — the public `age` recipient; never store the private identity in
  GitHub or Azure;
- `OFFSITE_BACKUP_FTPS_HOST`, `OFFSITE_BACKUP_FTPS_PORT`, and `OFFSITE_BACKUP_FTPS_USER`;
- `OFFSITE_BACKUP_FTPS_REMOTE_ROOT` — `/` for the dedicated MyDevil account restricted to
  `backups/wkf/incoming`;
- `OFFSITE_BACKUP_QUOTA_GB` — currently `10`; this documents and validates the destination quota but
  does not enforce retention from Azure.

Configure these `prod` environment secrets:

- `OFFSITE_BACKUP_FTPS_PASSWORD` — the unique password for the restricted MyDevil FTPS account;
- `OFFSITE_BACKUP_SIGNING_PRIVATE_KEY` — the unencrypted OpenSSH private key used only to sign
  manifests;
- `POSTGRES_RUNTIME_PASSWORD` — already used by production; the backup job deliberately does not
  receive migrator or administrator credentials.

`backup-offsite.sh` creates `production-YYYYMMDDTHHMMSSZ` below the remote root. It streams one blob
at a time through local ephemeral storage, encrypts the database, every blob, and the manifest with
`age`, and uploads them over explicit FTPS with passive mode and certificate validation. The job
uploads `.complete` last; a directory without this marker is an incomplete transfer and is never a
recovery point. FTPS credentials are stored in a mode-0600 temporary curl configuration rather than
passed on the command line.

The job signs the encrypted manifest with a dedicated Ed25519 signing key under the
`wkf-production-backup` namespace. The matching public key and `allowed_signers` entry are embedded
in the operations image. These are data-signing keys, not SSH login credentials: do not move them
to `~/.ssh` merely because OpenSSH supplies the signing format. Keep the private key in the password
manager and the GitHub environment secret; keep the `age` private identity separately and offline.
The signature prevents a compromised backup destination from replacing the manifest and artifacts
with a newly encrypted forgery.

The manifest format records the source SHA, exact application and operations image digests, Payload
migration rows, database size and SHA-256, and every blob name, size, SHA-256, and encrypted archive
path. To verify a downloaded backup locally, build or pull the matching operations image and use
the local validation wrapper:

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

Do not give the long-lived `age` private identity to GitHub or Azure. A production restore will use
a locally validated copy re-encrypted to a one-time restore recipient; the ephemeral restore job and
its one-time identity must be deleted after use.

Prepare such a copy locally with the matching operations image:

```bash
docker run --rm --network none --read-only --user 0:0 \
  --tmpfs /tmp:rw,nosuid,nodev,noexec,size=1g \
  --env RESTORE_BUNDLE_OUTPUT_UID="$(id -u)" \
  --env RESTORE_BUNDLE_OUTPUT_GID="$(id -g)" \
  --volume "/absolute/path/to/production-YYYYMMDDTHHMMSSZ:/source:ro" \
  --volume "/absolute/path/to/age-identity.txt:/run/age/source-identity.txt:ro" \
  --volume "/absolute/path/to/output-parent:/output" \
  wkf-operations:local \
  -lc '/opt/wkf/prepare-offsite-restore-bundle.sh /source /run/age/source-identity.txt /output/restore-bundle'
```

The output contains the re-encrypted backup and a separate `secrets` directory with the one-time
`age` identity and one-time manifest trust files. Upload only the backup directory. Never upload the
`secrets` directory.

### Isolated Azure restore drill

`infra/azure/offsite-restore-drill.bicep` provisions an ephemeral restore target in a dedicated
resource group. It creates a private PostgreSQL B1ms server, separate source and restored-media Blob
containers, a restore job, and—only when enabled—an application with internal-only ingress. It uses
the existing operations and registry identities but grants data access only on the temporary
Storage account.

Use the following sequence:

1. Run an ARM `what-if`, then deploy with `restoredApplicationEnabled=false` and
   `storageAllowPublicUpload=true`.
2. Upload only the one-time backup directory to `restore-source` using Entra authentication.
3. Restrict the temporary Storage account to the Container Apps subnet.
4. Check `shared_preload_libraries` on the temporary PostgreSQL server. A new server reports
   `isConfigPendingRestart=true` after enabling `pgaudit`; restart that temporary server and confirm
   the flag is false before starting the restore job.
5. Start the restore job and require its `RESTORE_DRILL_RESULT` to report the expected blob and
   migration counts with zero sessions.
6. Redeploy with `restoredApplicationEnabled=true` and `storageAllowPublicUpload=false`, then verify
   health, the public page, admin, and representative range requests from inside the container.
7. Delete the entire restore-drill resource group and every local one-time secret and decrypted or
   re-encrypted working copy.

The first deployment temporarily permits authenticated public-network upload to the dedicated
Storage account. Shared Key and anonymous Blob access remain disabled. Close the network before
starting the restore job. Never point the drill at the production database or production media
container.

On MyDevil, install `archive-offsite-backups.sh` outside the FTPS-visible directory, for example as
`/usr/home/forseti/bin/wkf-archive-offsite-backups.sh`, and keep these directories owned by the main
account:

```text
/usr/home/forseti/remote-backups/wkf/incoming
/usr/home/forseti/remote-backups/wkf/archive
/usr/home/forseti/remote-backups/wkf/quarantine
```

Run the archiver every 15 minutes from the main account's crontab:

```cron
*/15 * * * * /usr/home/forseti/bin/wkf-archive-offsite-backups.sh >> /usr/home/forseti/remote-backups/wkf/archive-cron.log 2>&1
```

The script serializes itself with `/usr/bin/lockf`, moves only directories whose `.complete` marker
matches the directory name, and moves incomplete transfers older than 24 hours to `quarantine`.
It never deletes an archived backup. Retention remains deliberately disabled until the first full
backup has measured the actual database and media footprint against the 10 GB quota. The current
format stores a logically complete encrypted copy of every media blob in every backup; it does not
yet deduplicate unchanged blobs. The one-time re-encryption helper and full restore rehearsal remain
follow-up work after the first backup is archived.

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
