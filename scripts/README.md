# Operational scripts

This directory contains the repository entry points for local development, test preparation,
deployment, staging data operations, and smoke verification. Prefer the documented `pnpm` command
or GitHub Actions workflow when one exists: those callers provide the expected environment.

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

## Builds, tests, and verification

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

### `clear-e2e-cache.ts`

Recursively removes `.next-e2e-ci` so a CI-style development-server E2E run cannot reuse an older
Next.js cache. It is the first step in `pnpm prepare:e2e`, which is called by both CI E2E commands.
It is not intended as a general cache-cleaning command.

### `prepare-test-environment.ts`

Starts the `postgres-test` and `azurite` Compose services, recreates the isolated test database from
committed Payload migrations, and verifies that the migration table contains exactly the migration
files present in the repository. It does not seed CMS content.

`pnpm prepare:integration` calls it directly. `pnpm test:integration` and both CI E2E commands call
it indirectly before running tests. The test environment is loaded from `test.env`; the database
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
and Node warning settings. The `dev` and `dev:container` package scripts call it; the legacy
development-server CI E2E command also uses it.

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
