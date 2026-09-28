# Payload migrations

Generate PostgreSQL migration files with:

```bash
pnpm migrate:create
```

Migrations must be included in the commit that changes the schema. On staging and production, a
dedicated Container Apps Job runs them before the application switches to the new image digest.
