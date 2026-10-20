#!/usr/bin/env bash

set -Eeuo pipefail

resource_group="${1:?Usage: ensure-containerapp-revision-active.sh <resource-group> <application-name> <revision-name>}"
application_name="${2:?Usage: ensure-containerapp-revision-active.sh <resource-group> <application-name> <revision-name>}"
revision_name="${3:?Usage: ensure-containerapp-revision-active.sh <resource-group> <application-name> <revision-name>}"
retry_delay_seconds="${REVISION_ACTIVATION_RETRY_DELAY_SECONDS:-10}"

if [[ ! "$retry_delay_seconds" =~ ^[0-9]+$ ]]; then
  echo 'REVISION_ACTIVATION_RETRY_DELAY_SECONDS must be a non-negative integer.' >&2
  exit 1
fi

revision_is_active() {
  local revision_active
  revision_active="$(
    az containerapp revision show \
      --resource-group "$resource_group" \
      --name "$application_name" \
      --revision "$revision_name" \
      --query properties.active \
      --output tsv 2>/dev/null || true
  )"
  [[ "$revision_active" == 'true' ]]
}

for attempt in 1 2 3; do
  if revision_is_active; then
    exit 0
  fi

  activation_error=''
  if activation_error="$(
    az containerapp revision activate \
      --resource-group "$resource_group" \
      --revision "$revision_name" \
      --output none 2>&1
  )"; then
    exit 0
  fi

  # Azure can apply the activation and still return a transient or already-active error.
  if revision_is_active; then
    exit 0
  fi

  if [[ -n "$activation_error" ]]; then
    printf '%s\n' "$activation_error" >&2
  fi
  if [[ "$attempt" != '3' ]]; then
    sleep "$retry_delay_seconds"
  fi
done

echo "Could not ensure that revision $revision_name was active." >&2
exit 1
