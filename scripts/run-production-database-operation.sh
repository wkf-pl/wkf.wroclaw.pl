#!/usr/bin/env bash

set -Eeuo pipefail

operation="${1:-}"
operations_image_reference="${2:-}"

if [[ "$operation" != "bootstrap" && "$operation" != "reconcile-grants" ]]; then
  echo 'Usage: run-production-database-operation.sh <bootstrap|reconcile-grants> <operations-image-reference>' >&2
  exit 1
fi

for required_command in az; do
  if ! command -v "$required_command" >/dev/null; then
    echo "Required command is unavailable: $required_command" >&2
    exit 1
  fi
done

if [[ ! "$operations_image_reference" =~ @sha256:[a-f0-9]{64}$ ]]; then
  echo 'The operations image must be referenced by an immutable sha256 digest.' >&2
  exit 1
fi

resource_group_name='rg-wkf-prod'
container_app_environment_name='wkf-prod'
registry_identity_name='wkf-prod-registry'
postgres_database_name='wkf'
postgres_administrator_login='wkfadmin'

container_app_environment_id="$(az containerapp env show --resource-group "$resource_group_name" --name "$container_app_environment_name" --query id --output tsv)"
registry_identity_id="$(az identity show --resource-group "$resource_group_name" --name "$registry_identity_name" --query id --output tsv)"
registry_server="${operations_image_reference%%/*}"
postgres_fqdn="$(az postgres flexible-server list --resource-group "$resource_group_name" --query '[0].fullyQualifiedDomainName' --output tsv)"

if [[ -z "$container_app_environment_id" || -z "$registry_identity_id" || -z "$postgres_fqdn" ]]; then
  echo 'Could not resolve the production resources required for the database operation.' >&2
  exit 1
fi

wait_for_job() {
  local execution_name="$1"
  local job_name="$2"
  local deadline=$((SECONDS + 1200))
  local status

  while ((SECONDS < deadline)); do
    status="$(az containerapp job execution show --resource-group "$resource_group_name" --name "$job_name" --job-execution-name "$execution_name" --query properties.status --output tsv)"
    case "$status" in
      Succeeded) return 0 ;;
      Failed | Stopped | Degraded)
        echo "Database operation failed with status $status." >&2
        return 1
        ;;
    esac
    sleep 5
  done

  echo 'Database operation did not complete within 20 minutes.' >&2
  return 1
}

if [[ "$operation" == 'bootstrap' ]]; then
  for variable_name in POSTGRES_ADMIN_PASSWORD POSTGRES_MIGRATOR_PASSWORD POSTGRES_RUNTIME_PASSWORD; do
    if [[ -z "${!variable_name:-}" ]]; then
      echo "$variable_name is required for bootstrap." >&2
      exit 1
    fi
  done

  job_name='wkf-prod-bootstrap'
  administrator_database_url="postgresql://${postgres_administrator_login}:$(printf '%s' "$POSTGRES_ADMIN_PASSWORD" | jq --slurp --raw-input --raw-output @uri)@${postgres_fqdn}:5432/${postgres_database_name}?sslmode=require"

  az deployment group create \
    --name wkf-prod-bootstrap \
    --resource-group "$resource_group_name" \
    --template-file infra/azure/bootstrap-job.bicep \
    --parameters administratorDatabaseUrl="$administrator_database_url" containerAppEnvironmentId="$container_app_environment_id" imageReference="$operations_image_reference" migratorPassword="$POSTGRES_MIGRATOR_PASSWORD" registryIdentityId="$registry_identity_id" registryServer="$registry_server" runtimePassword="$POSTGRES_RUNTIME_PASSWORD" \
    --output none
else
  if [[ -z "${POSTGRES_MIGRATOR_PASSWORD:-}" ]]; then
    echo 'POSTGRES_MIGRATOR_PASSWORD is required for grant reconciliation.' >&2
    exit 1
  fi

  job_name='wkf-prod-reconcile-grants'
  migrator_database_url="postgresql://wkf_migrator:$(printf '%s' "$POSTGRES_MIGRATOR_PASSWORD" | jq --slurp --raw-input --raw-output @uri)@${postgres_fqdn}:5432/${postgres_database_name}?sslmode=require"

  az deployment group create \
    --name wkf-prod-reconcile-grants \
    --resource-group "$resource_group_name" \
    --template-file infra/azure/grants-job.bicep \
    --parameters containerAppEnvironmentId="$container_app_environment_id" imageReference="$operations_image_reference" migratorDatabaseUrl="$migrator_database_url" registryIdentityId="$registry_identity_id" registryServer="$registry_server" \
    --output none
fi

cleanup_job() {
  az containerapp job delete --resource-group "$resource_group_name" --name "$job_name" --yes --output none >/dev/null 2>&1 || true
}
trap cleanup_job EXIT INT TERM

execution_name="$(az containerapp job start --resource-group "$resource_group_name" --name "$job_name" --query name --output tsv)"
wait_for_job "$execution_name" "$job_name"
cleanup_job
trap - EXIT INT TERM

echo "Production database operation completed and ephemeral job was removed: $operation"
