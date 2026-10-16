#!/usr/bin/env bash

set -Eeuo pipefail

if [[ -z "${POSTGRES_MIGRATOR_URL:-}" ]]; then
  echo 'POSTGRES_MIGRATOR_URL is required.' >&2
  exit 1
fi

psql "$POSTGRES_MIGRATOR_URL" \
  --set ON_ERROR_STOP=1 \
  --file "$(dirname "$0")/reconcile-postgres-grants.sql"

echo 'PostgreSQL runtime grants include all current tables and sequences.'
