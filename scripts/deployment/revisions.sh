#!/usr/bin/env bash

get_active_revision() {
  az containerapp revision list \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --query 'sort_by([?properties.active], &properties.createdTime)[-1].name' \
    --output tsv 2>/dev/null || true
}

get_latest_revision() {
  az containerapp show \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --query properties.latestRevisionName \
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

wait_for_revision_ready() {
  local revision_name="$1"
  local revision_active=""
  local revision_health_state=""
  local revision_running_state=""
  local deadline=$((SECONDS + health_timeout_seconds))

  while ((SECONDS < deadline)); do
    read -r revision_active revision_health_state revision_running_state < <(az containerapp revision show \
      --name "$application_name" \
      --resource-group "$resource_group_name" \
      --revision "$revision_name" \
      --query '{active: properties.active, health: properties.healthState, running: properties.runningState}' \
      --output tsv 2>/dev/null || true)

    if [[ "${revision_active,,}" == "true" && "$revision_health_state" == "Healthy" ]]; then
      echo "Restored previous revision: $revision_name ($revision_running_state)" >&2
      return 0
    fi

    sleep 5
  done

  echo "Previous revision did not become active and healthy within ${health_timeout_seconds} seconds: $revision_name (active=${revision_active:-unknown}, health=${revision_health_state:-unknown}, running=${revision_running_state:-unknown})" >&2
  return 1
}

restore_previous_revision() {
  local latest_revision=""

  [[ -n "$previous_revision" ]] || return 0

  latest_revision="$(get_latest_revision)"
  if [[ -n "$latest_revision" && "$latest_revision" != "$previous_revision" ]]; then
    if ! az containerapp revision deactivate \
      --name "$application_name" \
      --resource-group "$resource_group_name" \
      --revision "$latest_revision" \
      --output none; then
      echo "Could not deactivate the failed revision during rollback: $latest_revision" >&2
      return 1
    fi
  fi

  deactivate_revisions_except "$previous_revision"
  if ! az containerapp revision activate \
    --name "$application_name" \
    --resource-group "$resource_group_name" \
    --revision "$previous_revision" \
    --output none; then
    echo "Could not reactivate the previous revision during rollback: $previous_revision" >&2
    return 1
  fi

  wait_for_revision_ready "$previous_revision"
}
