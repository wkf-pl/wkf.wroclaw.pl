# Deployment workflows

- `ci.yml` runs for pull requests and manual dispatches. It checks formatting and generated Payload
  artifacts; runs lint, type checking, unit tests, and integration tests; builds one standalone
  production runtime for four isolated Playwright shards; and validates the production container
  image with a shared BuildKit cache without pushing it.
- `deploy-staging-on-master.yml` calls the reusable staging workflow after a push to `master`.
- `deploy-staging.yml` compares the active revision's commit with the target commit. It requests
  full provisioning for changes under `infra/azure`, maintenance and migrations for changes under
  `migrations`, and a new image for application changes. A manual dispatch can override the
  provisioning and migration decisions.
- `deploy-production.yml` promotes the image digest and source SHA reported by staging after the
  `prod` environment is approved. It applies the same change classification and does not rebuild
  the image.
- `manage-staging-data.yml` is manually dispatched to create or restore a consistent checkpoint of
  the staging PostgreSQL database and Media container. It shares the staging operation lock with
  deployments.
- `backup-production-data.yml` is a daily 02:30 UTC or manually dispatched, `prod`-approved off-site
  backup. It temporarily quiesces the production revision, runs an ephemeral Container Apps job,
  encrypts the PostgreSQL dump and each Media blob separately, and uploads them through explicit
  FTPS. A `.complete` marker is uploaded last, and the MyDevil archiver moves only marked directories
  outside the upload account's reach. It shares the `production-operations` lock with deploys and
  imports. Required `prod` approval also applies to scheduled runs.

Azure workflows authenticate through OIDC federation. The roles, variables, secrets, deployment
behavior, and recovery procedures are documented in the [Azure infrastructure guide](../../infra/azure/README.md).
