#!/bin/sh

set -eu

pnpm exec tsx scripts/prepare-development-migrations.ts
pnpm payload migrate
exec pnpm dev:container
