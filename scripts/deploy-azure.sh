#!/usr/bin/env bash

set -euo pipefail

target_environment="${1:?Usage: deploy-azure.sh <staging|prod> <image-reference>}"
target_image_reference="${2:?Usage: deploy-azure.sh <staging|prod> <image-reference>}"

if [[ "$target_environment" != "staging" && "$target_environment" != "prod" ]]; then
  echo "Target environment must be staging or prod." >&2
  exit 1
fi

azure_location="${AZURE_LOCATION:-westeurope}"
resource_prefix="${AZURE_RESOURCE_PREFIX:-wkf}"
resource_group_name="${resource_prefix}-${target_environment}"
application_name="${resource_prefix}-${target_environment}"
migration_job_name="${resource_prefix}-${target_environment}-migrate"
parameter_file="infra/azure/environments/${target_environment}.bicepparam"

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

az deployment sub create \
  --name "${resource_prefix}-${target_environment}-infrastructure" \
  --location "$azure_location" \
  --template-file infra/azure/main.bicep \
  --parameters "$parameter_file" \
  --parameters customDomainCertificateId="${CUSTOM_DOMAIN_CERTIFICATE_ID:-}" deployApplication="$deploy_application" location="$azure_location" resourcePrefix="$resource_prefix" \
  --output none

az containerapp job update \
  --name "$migration_job_name" \
  --resource-group "$resource_group_name" \
  --image "$target_image_reference" \
  --output none

execution_name="$(az containerapp job start \
  --name "$migration_job_name" \
  --resource-group "$resource_group_name" \
  --query name \
  --output tsv)"

deadline=$((SECONDS + 1800))

while (( SECONDS < deadline )); do
  execution_status="$(az containerapp job execution show \
    --name "$migration_job_name" \
    --resource-group "$resource_group_name" \
    --job-execution-name "$execution_name" \
    --query properties.status \
    --output tsv)"

  case "$execution_status" in
    Succeeded)
      break
      ;;
    Failed | Degraded)
      echo "Migration job execution $execution_name finished with status $execution_status." >&2
      exit 1
      ;;
  esac

  sleep 10
done

if [[ "${execution_status:-}" != "Succeeded" ]]; then
  echo "Migration job execution $execution_name did not finish within 30 minutes." >&2
  exit 1
fi

if [[ "$deploy_application" == "false" ]]; then
  export IMAGE_REFERENCE="$target_image_reference"

  az deployment sub create \
    --name "${resource_prefix}-${target_environment}-application" \
    --location "$azure_location" \
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

for attempt in {1..30}; do
  if curl --fail --silent --show-error "https://${application_fqdn}/health" >/dev/null; then
    echo "Deployment health check succeeded: https://${application_fqdn}/health"
    exit 0
  fi

  if [[ "$attempt" -lt 30 ]]; then
    sleep 10
  fi
done

echo "Deployment health check failed: https://${application_fqdn}/health" >&2
exit 1
