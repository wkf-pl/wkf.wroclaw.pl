#!/usr/bin/env bash

set -Eeuo pipefail

for variable_name in POSTGRES_ADMIN_URL POSTGRES_MIGRATOR_PASSWORD POSTGRES_RUNTIME_PASSWORD; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "$variable_name is required." >&2
    exit 1
  fi
done

psql "$POSTGRES_ADMIN_URL" \
  --set ON_ERROR_STOP=1 \
  --set install_audit_extension=true \
  --set migrator_password="$POSTGRES_MIGRATOR_PASSWORD" \
  --set runtime_password="$POSTGRES_RUNTIME_PASSWORD" \
  --file "$(dirname "$0")/bootstrap-postgres-roles.sql"

echo 'PostgreSQL production roles and privileges are reconciled.'
