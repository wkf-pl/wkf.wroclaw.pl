#!/usr/bin/env bash

set -Eeuo pipefail

image_reference="${1:?An immutable ingress image reference is required.}"
resource_group_name="rg-${AZURE_RESOURCE_PREFIX:-wkf}-staging"
application_name="${AZURE_RESOURCE_PREFIX:-wkf}-staging"

IFS=$'\t' read -r environment_id origin_host registry_server registry_identity_id < <(
  az containerapp show --resource-group "$resource_group_name" --name "$application_name" \
    --output json | jq -er '
      .properties |
      [.environmentId, .configuration.ingress.fqdn,
       .configuration.registries[0].server, .configuration.registries[0].identity] |
      select(all(type == "string" and length > 0)) | @tsv
    '
)

maintenance_enabled="$(az containerapp list --resource-group "$resource_group_name" --output json |
  jq -er --arg ingress_name "${application_name}-ingress" '
    ([.[] | select(.name == $ingress_name) | .properties.template.containers[].env[] |
      select(.name == "MAINTENANCE_ENABLED") | .value] | first) // "0"
  ')"

az deployment group create --name staging-ingress --resource-group "$resource_group_name" \
  --template-file infra/azure/maintenance/staging-ingress.bicep \
  --parameters location="${AZURE_LOCATION:-polandcentral}" applicationName="$application_name" environmentId="$environment_id" \
    originHost="$origin_host" registryServer="$registry_server" registryIdentityId="$registry_identity_id" \
    imageReference="$image_reference" maintenanceEnabled="$maintenance_enabled" \
  --query properties.outputs.url.value --output tsv
