#!/usr/bin/env bash

set -Eeuo pipefail

target_environment="${1:?Usage: deploy-azure.sh <staging|prod> <image-reference> --maintenance}"
target_image_reference="${2:?Usage: deploy-azure.sh <staging|prod> <image-reference> --maintenance}"
maintenance_mode="${3:-}"

if [[ "$target_environment" != "staging" && "$target_environment" != "prod" ]]; then
  echo "Target environment must be staging or prod." >&2
  exit 1
fi

if [[ "$maintenance_mode" != "--maintenance" ]]; then
  echo "This deployment changes the database destructively and requires the explicit --maintenance flag." >&2
  exit 1
fi

azure_location="${AZURE_LOCATION:-polandcentral}"
resource_prefix="${AZURE_RESOURCE_PREFIX:-wkf}"
resource_group_name="rg-${resource_prefix}-${target_environment}"
application_name="${resource_prefix}-${target_environment}"
migration_job_name="${resource_prefix}-${target_environment}-migrate"
parameter_file="infra/azure/environments/${target_environment}.bicepparam"
previous_revision=""
backup_name=""
maintenance_started=false
migration_completed=false

wait_for_migration_job() {
  local execution_name="$1"
  local migration_direction="$2"
  local execution_status=""
  local deadline=$((SECONDS + 1800))

  while (( SECONDS < deadline )); do
    execution_status="$(az containerapp job execution show \
      --name "$migration_job_name" \
      --resource-group "$resource_group_name" \
      --job-execution-name "$execution_name" \
      --query properties.status \
      --output tsv)"

    case "$execution_status" in
      Succeeded)
        return 0
        ;;
      Failed | Degraded)
        echo "Migration ${migration_direction} execution ${execution_name} finished with status ${execution_status}." >&2
        return 1
        ;;
    esac

    sleep 10
  done

  echo "Migration ${migration_direction} execution ${execution_name} did not finish within 30 minutes." >&2
  return 1
}

run_migration_job() {
  local payload_command="$1"
  local execution_name

  az containerapp job update \
    --name "$migration_job_name" \
    --resource-group "$resource_group_name" \
    --container-name migration \
    --image "$target_image_reference" \
    --command ./node_modules/.bin/payload \
    --args "$payload_command" \
    --output none

  execution_name="$(az containerapp job start \
    --name "$migration_job_name" \
    --resource-group "$resource_group_name" \
    --query name \
    --output tsv)"

  wait_for_migration_job "$execution_name" "$payload_command"
}

deactivate_current_revisions() {
  local revision

  while IFS= read -r revision; do
    if [[ -n "$revision" ]]; then
      az containerapp revision deactivate \
        --resource-group "$resource_group_name" \
        --revision "$revision" \
        --output none
    fi
  done < <(az containerapp revision list \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --query '[?properties.active].name' \
    --output tsv 2>/dev/null || true)
}

rollback_deployment() {
  local failure_status=$?

  trap - ERR
  set +e

  echo "Deployment failed. Starting automatic rollback." >&2
  if [[ "$maintenance_started" == "true" ]]; then
    deactivate_current_revisions
  fi

  if [[ "$migration_completed" == "true" ]]; then
    if ! run_migration_job "migrate:down"; then
      echo "Automatic database rollback failed. The previous revision will not be activated against an incompatible schema." >&2
      exit "$failure_status"
    fi
  fi

  if [[ -n "$previous_revision" ]]; then
    az containerapp revision activate \
      --resource-group "$resource_group_name" \
      --revision "$previous_revision" \
      --output none
    echo "Reactivated previous revision: $previous_revision" >&2
  fi

  exit "$failure_status"
}

trap rollback_deployment ERR

current_image_reference="$(az containerapp show \
  --name "$application_name" \
  --resource-group "$resource_group_name" \
  --query 'properties.template.containers[0].image' \
  --output tsv 2>/dev/null || true)"

if [[ -n "$current_image_reference" ]]; then
  infrastructure_image_reference="$current_image_reference"
  deploy_application=true
else
  infrastructure_image_reference="$target_image_reference"
  deploy_application=false
fi

export IMAGE_REFERENCE="$infrastructure_image_reference"

az deployment group create \
  --name "${resource_prefix}-${target_environment}-infrastructure" \
  --resource-group "$resource_group_name" \
  --template-file infra/azure/main.bicep \
  --parameters "$parameter_file" \
  --parameters customDomainCertificateId="${CUSTOM_DOMAIN_CERTIFICATE_ID:-}" deployApplication="$deploy_application" location="$azure_location" resourcePrefix="$resource_prefix" \
  --output none

postgres_server_name="$(az postgres flexible-server list \
  --resource-group "$resource_group_name" \
  --query '[0].name' \
  --output tsv)"

if [[ -z "$postgres_server_name" ]]; then
  echo "Could not resolve the PostgreSQL Flexible Server for $target_environment." >&2
  exit 1
fi

postgres_sku_tier="$(az postgres flexible-server show \
  --resource-group "$resource_group_name" \
  --name "$postgres_server_name" \
  --query 'sku.tier' \
  --output tsv)"

if [[ "$postgres_sku_tier" == "Burstable" ]]; then
  backup_name="automatic-backups-only"
  echo "Skipping on-demand backup for Burstable PostgreSQL; automatic backups remain enabled."
else
  backup_name="predeploy-${target_environment}-$(date -u +%Y%m%dT%H%M%SZ)"
  az postgres flexible-server backup create \
    --resource-group "$resource_group_name" \
    --server-name "$postgres_server_name" \
    --name "$backup_name" \
    --output none
  echo "Created on-demand database backup: $backup_name"
fi

if [[ "$deploy_application" == "true" ]]; then
  previous_revision="$(az containerapp revision list \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --query '[?properties.active].name | [0]' \
    --output tsv)"

  if [[ -z "$previous_revision" ]]; then
    echo "Could not resolve the active application revision before maintenance." >&2
    exit 1
  fi

  echo "Recorded active revision: $previous_revision"
  az containerapp revision deactivate \
    --resource-group "$resource_group_name" \
    --revision "$previous_revision" \
    --output none
  maintenance_started=true
  echo "Maintenance mode started by deactivating revision: $previous_revision"
fi

az containerapp job update \
  --name "$migration_job_name" \
  --resource-group "$resource_group_name" \
  --image "$target_image_reference" \
  --output none

run_migration_job "migrate"
migration_completed=true

if [[ "$deploy_application" == "false" ]]; then
  export IMAGE_REFERENCE="$target_image_reference"

  az deployment group create \
    --name "${resource_prefix}-${target_environment}-application" \
    --resource-group "$resource_group_name" \
    --template-file infra/azure/main.bicep \
    --parameters "$parameter_file" \
    --parameters customDomainCertificateId="${CUSTOM_DOMAIN_CERTIFICATE_ID:-}" deployApplication=true location="$azure_location" resourcePrefix="$resource_prefix" \
    --output none
else
  az containerapp update \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --image "$target_image_reference" \
    --output none
fi

application_fqdn="$(az containerapp show \
  --name "$application_name" \
  --resource-group "$resource_group_name" \
  --query properties.configuration.ingress.fqdn \
  --output tsv)"

for attempt in {1..60}; do
  health_check_succeeded=false

  if curl --fail --silent --show-error "https://${application_fqdn}/health" >/dev/null; then
    if curl --fail --silent --show-error --head "https://${application_fqdn}/" >/dev/null \
      && curl --fail --silent --show-error --head "https://${application_fqdn}/admin" >/dev/null \
      && curl --fail --silent --show-error --head "https://${application_fqdn}/blog" >/dev/null; then
      health_check_succeeded=true

      if [[ "$target_environment" == "staging" ]]; then
        robots_content="$(curl --fail --silent --show-error "https://${application_fqdn}/robots.txt")"

        if ! grep --fixed-strings --line-regexp 'Disallow: /' <<<"$robots_content" >/dev/null; then
          health_check_succeeded=false
        fi
      fi
    fi
  fi

  if [[ "$health_check_succeeded" == "true" ]]; then
    trap - ERR
    echo "Deployment checks succeeded: https://${application_fqdn}"
    echo "Rollback point: revision=${previous_revision:-none}, backup=${backup_name}"
    exit 0
  fi

  if [[ "$attempt" -lt 60 ]]; then
    sleep 10
  fi
done

echo "Deployment checks failed: https://${application_fqdn}" >&2
false
