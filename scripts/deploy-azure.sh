#!/usr/bin/env bash

set -Eeuo pipefail

target_environment="${1:?Usage: deploy-azure.sh <staging|prod> <image-reference> [--maintenance] [--provision]}"
target_image_reference="${2:?Usage: deploy-azure.sh <staging|prod> <image-reference> [--maintenance] [--provision]}"
shift 2

provision_infrastructure=false
run_migrations=false

for deployment_option in "$@"; do
  case "$deployment_option" in
    --maintenance)
      run_migrations=true
      ;;
    --provision)
      provision_infrastructure=true
      ;;
    *)
      echo "Unknown deployment option: $deployment_option" >&2
      exit 1
      ;;
  esac
done

if [[ "$target_environment" != "staging" && "$target_environment" != "prod" ]]; then
  echo "Target environment must be staging or prod." >&2
  exit 1
fi

source_sha="${SOURCE_SHA:-}"
if [[ -z "$source_sha" ]]; then
  source_sha="$(git rev-parse HEAD)"
fi

if [[ ! "$source_sha" =~ ^[a-f0-9]{40}$ ]]; then
  echo "SOURCE_SHA must be a full Git commit SHA." >&2
  exit 1
fi

health_timeout_seconds="${DEPLOYMENT_HEALTH_TIMEOUT_SECONDS:-600}"
if [[ ! "$health_timeout_seconds" =~ ^[1-9][0-9]*$ ]]; then
  echo "DEPLOYMENT_HEALTH_TIMEOUT_SECONDS must be a positive integer." >&2
  exit 1
fi

azure_location="${AZURE_LOCATION:-polandcentral}"
resource_prefix="${AZURE_RESOURCE_PREFIX:-wkf}"
resource_group_name="rg-${resource_prefix}-${target_environment}"
application_name="${resource_prefix}-${target_environment}"
migration_job_name="${resource_prefix}-${target_environment}-migrate"
parameter_file="infra/azure/environments/${target_environment}.bicepparam"
previous_revision=""
previous_image_reference=""
previous_source_sha=""
backup_name="not-requested"
maintenance_started=false
migration_completed=false
application_update_started=false

get_active_revision() {
  az containerapp revision list \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --query 'sort_by([?properties.active], &properties.createdTime)[-1].name' \
    --output tsv 2>/dev/null || true
}

get_revision_image() {
  local revision_name="$1"

  az containerapp revision show \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --revision "$revision_name" \
    --query 'properties.template.containers[0].image' \
    --output tsv
}

get_revision_source_sha() {
  local revision_name="$1"

  az containerapp revision show \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --revision "$revision_name" \
    --query "properties.template.containers[0].env[?name=='DEPLOYED_SOURCE_SHA'] | [0].value" \
    --output tsv 2>/dev/null || true
}

wait_for_migration_job() {
  local execution_name="$1"
  local migration_direction="$2"
  local execution_status=""
  local deadline=$((SECONDS + 1800))

  while ((SECONDS < deadline)); do
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

deactivate_revisions_except() {
  local preserved_revision="${1:-}"
  local active_revision

  while IFS= read -r active_revision; do
    if [[ -n "$active_revision" && "$active_revision" != "$preserved_revision" ]]; then
      az containerapp revision deactivate \
        --resource-group "$resource_group_name" \
        --revision "$active_revision" \
        --output none
    fi
  done < <(az containerapp revision list \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --query '[?properties.active].name' \
    --output tsv 2>/dev/null || true)
}

restore_previous_revision() {
  local previous_revision_active=""

  [[ -n "$previous_revision" ]] || return 0

  deactivate_revisions_except "$previous_revision"
  previous_revision_active="$(az containerapp revision show \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --revision "$previous_revision" \
    --query properties.active \
    --output tsv 2>/dev/null || true)"

  if [[ "$previous_revision_active" != "true" ]]; then
    az containerapp revision activate \
      --resource-group "$resource_group_name" \
      --revision "$previous_revision" \
      --output none
    echo "Reactivated previous revision: $previous_revision" >&2
  else
    echo "Previous revision remained active: $previous_revision" >&2
  fi
}

rollback_deployment() {
  local failure_status=$?

  trap - ERR
  set +e

  echo "Deployment failed. Starting automatic rollback." >&2

  if [[ "$migration_completed" == "true" ]]; then
    if ! run_migration_job "migrate:down"; then
      echo "Automatic database rollback failed. The previous revision will not be activated against an incompatible schema." >&2
      exit "$failure_status"
    fi
  fi

  if [[ "$maintenance_started" == "true" || "$application_update_started" == "true" ]]; then
    restore_previous_revision
  fi

  exit "$failure_status"
}

trap rollback_deployment ERR

application_exists=false
if az containerapp show \
  --name "$application_name" \
  --resource-group "$resource_group_name" \
  --output none 2>/dev/null; then
  application_exists=true
  previous_revision="$(get_active_revision)"

  if [[ -z "$previous_revision" ]]; then
    echo "The application exists but has no active revision to use as a rollback point." >&2
    exit 1
  fi

  previous_image_reference="$(get_revision_image "$previous_revision")"
  previous_source_sha="$(get_revision_source_sha "$previous_revision")"
  echo "Recorded active revision before deployment: $previous_revision"
fi

if [[ "$provision_infrastructure" == "true" ]]; then
  if [[ "$application_exists" == "true" ]]; then
    if [[ "$run_migrations" == "true" ]]; then
      infrastructure_image_reference="$previous_image_reference"
      infrastructure_source_sha="$previous_source_sha"
    else
      infrastructure_image_reference="$target_image_reference"
      infrastructure_source_sha="$source_sha"
      application_update_started=true
    fi
    deploy_application=true
  else
    infrastructure_image_reference="$target_image_reference"
    infrastructure_source_sha="$source_sha"
    deploy_application=false
  fi

  export IMAGE_REFERENCE="$infrastructure_image_reference"

  az deployment group create \
    --name "${resource_prefix}-${target_environment}-infrastructure" \
    --resource-group "$resource_group_name" \
    --template-file infra/azure/main.bicep \
    --parameters "$parameter_file" \
    --parameters customDomainCertificateId="${CUSTOM_DOMAIN_CERTIFICATE_ID:-}" deployApplication="$deploy_application" location="$azure_location" resourcePrefix="$resource_prefix" sourceSha="$infrastructure_source_sha" \
    --output none
elif [[ "$application_exists" != "true" ]]; then
  echo "The application does not exist. Re-run the deployment with --provision." >&2
  exit 1
fi

if [[ "$run_migrations" == "true" ]]; then
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

  if [[ "$application_exists" == "true" ]]; then
    deactivate_revisions_except
    maintenance_started=true
    echo "Maintenance mode started after deactivating active revisions."
  fi

  run_migration_job "migrate"
  migration_completed=true
else
  echo "No migration changes detected; database maintenance was skipped."
fi

application_update_started=true

if [[ "$application_exists" == "false" ]]; then
  export IMAGE_REFERENCE="$target_image_reference"

  az deployment group create \
    --name "${resource_prefix}-${target_environment}-application" \
    --resource-group "$resource_group_name" \
    --template-file infra/azure/main.bicep \
    --parameters "$parameter_file" \
    --parameters customDomainCertificateId="${CUSTOM_DOMAIN_CERTIFICATE_ID:-}" deployApplication=true location="$azure_location" resourcePrefix="$resource_prefix" sourceSha="$source_sha" \
    --output none
else
  az containerapp update \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --image "$target_image_reference" \
    --set-env-vars "DEPLOYED_SOURCE_SHA=$source_sha" \
    --output none
fi

application_fqdn="$(az containerapp show \
  --name "$application_name" \
  --resource-group "$resource_group_name" \
  --query properties.configuration.ingress.fqdn \
  --output tsv)"

read_http_status() {
  local route="$1"

  curl --connect-timeout 3 --max-time 8 --silent --output /dev/null --write-out '%{http_code}' \
    "https://${application_fqdn}${route}" || true
}

health_deadline=$((SECONDS + health_timeout_seconds))
health_check_attempt=0

while ((SECONDS < health_deadline)); do
  health_check_attempt=$((health_check_attempt + 1))
  health_status="$(read_http_status '/api/health')"

  if [[ "$health_status" == "200" ]]; then
    liveness_status="$(read_http_status '/api/health/live')"
  else
    liveness_status="skipped"
  fi

  if [[ "$liveness_status" == "200" ]]; then
    root_status="$(read_http_status '/')"
    admin_status="$(read_http_status '/admin')"
  else
    root_status="skipped"
    admin_status="skipped"
  fi

  echo "Deployment check ${health_check_attempt}: /api/health=${health_status:-000} /api/health/live=${liveness_status:-000} /=${root_status:-000} /admin=${admin_status:-000}"

  health_check_succeeded=false
  if [[ "$health_status" == "200" && "$liveness_status" == "200" && "$root_status" == "200" && "$admin_status" == "200" ]]; then
    health_check_succeeded=true

    if [[ "$target_environment" == "staging" ]]; then
      robots_status="$(read_http_status '/robots.txt')"
      robots_content="$(curl --connect-timeout 3 --max-time 8 --silent "https://${application_fqdn}/robots.txt" || true)"
      echo "Deployment check ${health_check_attempt}: /robots.txt=${robots_status:-000}, expected Disallow: /"

      if [[ "$robots_status" != "200" ]] \
        || ! grep --fixed-strings --line-regexp 'Disallow: /' <<<"$robots_content" >/dev/null; then
        health_check_succeeded=false
      fi
    fi
  fi

  if [[ "$health_check_succeeded" == "true" ]]; then
    trap - ERR
    echo "Deployment checks succeeded: https://${application_fqdn}"
    echo "Rollback point: revision=${previous_revision:-none}, backup=${backup_name}"
    exit 0
  fi

  sleep 5
done

echo "Deployment checks did not succeed within ${health_timeout_seconds} seconds: https://${application_fqdn}" >&2
false
