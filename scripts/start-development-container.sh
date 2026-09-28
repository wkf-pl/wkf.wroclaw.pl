#!/bin/sh

# Reconciles local Payload migrations and then starts the development container application.

set -eu

pnpm exec tsx scripts/prepare-development-migrations.ts
pnpm payload migrate
exec pnpm dev:container
