#!/bin/sh

set -eu

pnpm exec tsx scripts/prepare-development-migrations.ts
pnpm migrate:with-media
exec pnpm dev:container
