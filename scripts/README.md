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
