# WKF Online

A single Node.js application combining a public Next.js frontend, the Payload administration panel
and API, and the domain code of Wrocławski Klub Fantastyki.

## Stack

- Next.js 16 and React 19
- Payload 3
- PostgreSQL
- Azure Blob Storage, with Azurite used locally
- SMTP through the official Nodemailer adapter
- Docker Compose with PostgreSQL, Azurite, and Mailpit

## Local runtime

The project pins Node.js 22.18.0 through the `volta` section in `package.json`. After Volta is
installed, entering the project directory automatically selects the correct runtime. pnpm 11.16.0
is pinned through the `packageManager` field.

## Run with Docker

1. Copy `.env.example` to `.env`.
2. Set `PAYLOAD_SECRET`, for example to the result of `openssl rand -base64 32`.
3. Run `docker compose up --build`.
4. In another terminal, run `docker compose exec -T app pnpm verify:compose` to verify HTTP, the
   first-administrator bootstrap, an Azurite upload, and delivery to Mailpit. The check requires an
   empty users collection and removes the records and message it creates.

The application is available at `http://127.0.0.1:3000` and `http://localhost:3000`, the Payload
admin panel at `http://127.0.0.1:3000/admin`, and Mailpit at `http://127.0.0.1:8025`.

Uploads use the same official Azure adapter in every environment. Locally they are stored in
Azurite; staging and production use separate Azure Blob Storage containers.

## Run the application outside Docker

The Next.js process can run locally while supporting services remain in containers:

```bash
docker compose up -d postgres azurite mailpit
pnpm install
WKF_ALLOW_NEXT_DEV=1 pnpm dev
```

The default `.env.example` uses service addresses reachable from the host, including the local
Azurite endpoint.

## Main commands

```bash
pnpm test
pnpm pre-push
pnpm build
pnpm generate:types
pnpm migrate:create
pnpm migrate
pnpm seed
pnpm verify:compose
```

`pnpm test` runs the unit and integration suites. `pnpm pre-push` runs the complete local validation
pipeline with a terminal dashboard: formatting check, lint, typecheck, unit and integration tests,
production build, and production-mode browser tests.

See the [pnpm command and operational scripts reference](scripts/README.md#pnpm-command-reference)
for every `package.json` command, including how to rerun detailed E2E diagnostics against the
production runtime created by `pnpm pre-push`.

## Structure

```text
src/
├── app/          frontend, Payload admin panel, API, and health checks
├── collections/  thin Payload collection configurations
├── globals/      global site settings
├── modules/      domain logic grouped by business capability
├── access/       shared Payload access rules
├── jobs/         Payload domain jobs
├── email/        SMTP configuration and templates
├── storage/      Azure Blob Storage and Azurite configuration
└── lib/          small infrastructure utilities
```

`collections/` should not absorb business logic. Operations such as session registration,
cancellation, and promotion from a waiting list belong in `modules/sessions/` and are called from
thin hooks, endpoints, or jobs.

## Infrastructure

The project has three environments:

- `local` runs in Docker Compose with PostgreSQL, Azurite, and Mailpit.
- `staging` runs in a dedicated resource group and Azure Container Apps Environment.
- `prod` runs in a dedicated resource group at `https://wkf.wroclaw.pl`.

Bicep definitions live in `infra/azure/`. Staging and production have separate PostgreSQL
databases, Storage accounts, Container Apps Environments, and Log Analytics workspaces. Only Azure
Container Registry is shared.

The staging workflow builds an image once and publishes its digest. Production requires the digest
verified on staging to be supplied manually. In both environments, a separate Azure Container Apps
Job runs migrations before the application switches to the new image.

### Staging data checkpoints

The manually dispatched **Manage staging data** GitHub Actions workflow creates and restores named
checkpoints of the PostgreSQL database and Media container. Open **Actions → Manage staging data →
Run workflow**, then choose `backup` or `restore`. A restore requires the exact confirmation value
`RESTORE`, saves the pre-operation state automatically, and runs all later Payload migrations before
making staging available again.

Staging checkpoints and deployments share one concurrency lock, so they cannot modify the
environment simultaneously. The detailed procedure and failure behavior are documented in the
[Azure infrastructure guide](infra/azure/README.md#staging-data-checkpoints).

## Documentation

- [Architecture decision record index](docs/ADR.md)
- [Privacy policy](docs/Privacy.md)
- [Azure infrastructure](infra/azure/README.md)
- [Operational scripts](scripts/README.md)
