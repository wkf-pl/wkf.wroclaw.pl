# Deployment workflows

- `ci.yml` runs for pull requests and manual dispatches. It checks formatting and generated Payload
  artifacts; runs lint, type checking, unit tests, and integration tests; builds one standalone
  production runtime for four isolated Playwright shards; and validates the production container
  image with a shared BuildKit cache without pushing it.
- `deploy-staging.yml` is manually dispatched from `master` when staging qualification is required.
  A merge to `master` does not start or wake the normally suspended staging environment. The
  workflow compares the active revision's commit with the target commit. It requests
  full provisioning for changes under `infra/azure`, maintenance and migrations for changes under
  `migrations`, and a new image for application changes. A manual dispatch can override the
  provisioning and migration decisions.
- `deploy-production.yml` promotes the image digest and source SHA reported by staging after the
  `prod` environment is approved. It applies the same change classification and does not rebuild
  the image.
- `manage-staging-data.yml` is manually dispatched to create or restore a consistent checkpoint of
  the staging PostgreSQL database and Media container. It shares the staging operation lock with
  deployments.
- `backup-production-data.yml` is a daily 02:30 UTC or manually dispatched off-site backup using the
  dedicated `prod-backup` environment. It temporarily quiesces the production revision, connects to
  PostgreSQL as the read-only `wkf_backup` role, runs an ephemeral Container Apps job, encrypts the
  database dump and each Media blob separately, and uploads them through explicit FTPS. A
  `.complete` marker is uploaded last, and the MyDevil archiver moves only marked directories outside
  the upload account's reach. It shares the `production-operations` lock with deploys and imports.
  `prod-backup` must not require a reviewer because scheduled runs cannot be approved reliably.
- `restore-production-offsite.yml` is a manual, destructive production restore serialized by
  `production-operations`. It requires the approval-protected `prod-restore` environment, a
  disposable re-encrypted export exposed through a dedicated restricted FTPS root, a successful
  isolated drill verified procedurally by the reviewer, and the exact `RESTORE` confirmation. A
  signed descriptor chooses the immutable operations image automatically. Any restore, migration,
  grant, or smoke-test failure leaves production inactive.

Azure workflows authenticate through OIDC federation. The roles, variables, secrets, deployment
behavior, and recovery procedures are documented in the [Azure infrastructure guide](../../infra/azure/README.md).
