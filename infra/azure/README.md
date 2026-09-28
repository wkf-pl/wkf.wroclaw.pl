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

Both environments scale the application from zero to one replica because the local Next Data Cache
is not shared between replicas. [ADR 0001](../../docs/ADR/0001-content-listing-index-and-public-data-cache.md)
explains the constraint and the path to later scaling.

## GitHub environments

Create `staging` and `prod` GitHub environments. The `prod` environment should require manual
approval.

Configure these variables in both environments:

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

Configure these secrets in both environments:

- `PAYLOAD_SECRET`
- `POSTGRES_ADMIN_PASSWORD`

Production additionally requires the `SMTP_HOST` variable and these secrets:

- `SMTP_USER`
- `SMTP_PASSWORD`

SMTP is initially disabled on staging. This does not block the website or admin panel, but email
features remain unavailable until an SMTP server is configured.

Staging keeps a Microsoft Entra configuration for optional Easy Auth sign-in and additionally
requires these variables:

- `ENTRA_TENANT_ID`
- `ENTRA_CLIENT_ID`
- `ENTRA_ALLOWED_GROUP_ID` — the group containing board members and technical staff

It also requires the `ENTRA_CLIENT_SECRET` secret.

The staging app registration must emit group identifiers in the token. Easy Auth allows anonymous
requests to the website and Payload admin panel, while the group selected by
`ENTRA_ALLOWED_GROUP_ID` restricts accounts used for optional Microsoft sign-in. The Payload admin
panel still requires its own authentication. Staging also serves a `robots.txt` that blocks the
entire site from indexing.

After staging is first created, add this redirect URI to the Entra app registration:

```text
https://<staging-address>/.auth/login/aad/callback
```

Enable the ID tokens required by the Easy Auth sign-in flow:

```bash
az ad app update --id "$ENTRA_CLIENT_ID" --enable-id-token-issuance true
```

## Deployments

A push to `master` invokes the reusable `deploy-staging.yml` workflow through
`deploy-staging-on-master.yml`. Pull requests run CI, including a production Next.js build used by
the Playwright shards and a cache-aware container image validation, but they do not deploy.

Every deployed revision records `DEPLOYED_SOURCE_SHA`. The workflow compares that commit with the
target and determines automatically whether it needs a new image, full provisioning, and
migrations. If the active revision does not yet have SHA metadata, the workflow safely enables all
three actions. A manual run can force or skip provisioning and migrations.

The staging workflow:

1. Skips an obsolete commit that waited in the queue.
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

The current version allows PostgreSQL connections from Azure services through the `0.0.0.0` rule.
This is a functional starting point, but private endpoints and separate virtual networks for staging
and production should be considered before processing production data. Application database
connections require TLS through `sslmode=require`.
