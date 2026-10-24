#!/usr/bin/env bash

# Inspects or changes whether the production Container App requires Microsoft Entra sign-in.
# Changes apply only to the current Azure runtime configuration. A later infrastructure deployment
# will restore AllowAnonymous while requireEntraSignIn=false remains in prod.bicepparam.

set -Eeuo pipefail

usage='Usage: pnpm entra:sign-in [on|off]'

if (( $# > 1 )); then
  echo "$usage" >&2
  exit 1
fi

target_state="${1:-}"

if [[ -n "$target_state" && "$target_state" != "on" && "$target_state" != "off" ]]; then
  echo 'State must be on or off when provided.' >&2
  echo "$usage" >&2
  exit 1
fi

if ! command -v az >/dev/null; then
  echo 'Required command is unavailable: az' >&2
  exit 1
fi

resource_group_name='rg-wkf-prod'
application_name='wkf-prod'

show_authentication_state() {
  az containerapp auth show \
    --resource-group "$resource_group_name" \
    --name "$application_name" \
    --query '{enabled:platform.enabled,action:globalValidation.unauthenticatedClientAction,excludedPaths:globalValidation.excludedPaths,microsoft:identityProviders.azureActiveDirectory.enabled}' \
    --output yaml
}

case "$target_state" in
  on)
    az containerapp auth update \
      --resource-group "$resource_group_name" \
      --name "$application_name" \
      --enabled true \
      --unauthenticated-client-action Return401 \
      --excluded-paths /api/health /api/health/live \
      --yes \
      --output none
    show_authentication_state
    ;;
  off)
    az containerapp auth update \
      --resource-group "$resource_group_name" \
      --name "$application_name" \
      --enabled true \
      --unauthenticated-client-action AllowAnonymous \
      --yes \
      --output none
    show_authentication_state
    ;;
  '')
    show_authentication_state
    ;;
esac
