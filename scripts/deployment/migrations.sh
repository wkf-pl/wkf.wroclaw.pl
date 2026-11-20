#!/usr/bin/env bash

wait_for_migration_job() {
  local execution_name="$1"
  local migration_direction="$2"
  local execution_status=""
  local deadline=$((SECONDS + migration_timeout_seconds))

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

  echo "Migration ${migration_direction} execution ${execution_name} did not finish within ${migration_timeout_seconds} seconds." >&2
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
    --replica-timeout "$migration_timeout_seconds" \
    --output none

  execution_name="$(az containerapp job start \
    --name "$migration_job_name" \
    --resource-group "$resource_group_name" \
    --query name \
    --output tsv)"

  wait_for_migration_job "$execution_name" "$payload_command"
}

verify_applied_migrations() (
  local required_migrations template_file execution_name execution_status report deadline
  local workspace_id
  local -a missing_migrations

  required_migrations="$(git ls-tree --name-only "$source_sha:migrations" |
    jq -Rse '
      split("\n") |
      map(select(test("[.](ts|js)$") and . != "index.ts" and . != "index.js") | split(".")[0]) |
      unique | select(length > 0 and all(.[]; test("^[a-zA-Z0-9_-]+$")))
    ')" || {
      echo "Could not determine required migrations for source commit $source_sha." >&2
      return 1
    }

  template_file="$(mktemp)" || return 1
  trap 'rm -f -- "$template_file"' EXIT
  az containerapp job show --name "$migration_job_name" --resource-group "$resource_group_name" \
    --query properties.template --output json |
    jq -e --arg image "$target_image_reference" --arg migrations "$required_migrations" \
      --rawfile check scripts/check-applied-migrations.mjs '
        .containers |= map(select(.name == "migration")) |
        select((.containers | length) == 1) |
        .containers[0] |= (
          .image = $image | .command = ["node"] |
          .args = ["--input-type=module", "-e", $check, "--", $migrations] |
          .env |= map(select(.name == "DATABASE_URL" and .secretRef))
        )
        | select((.containers[0].env | length) == 1)
      ' > "$template_file" || return 1

  execution_name="$(az containerapp job start --name "$migration_job_name" \
    --resource-group "$resource_group_name" --yaml "$template_file" --query name --output tsv)" || return 1
  [[ "$execution_name" =~ ^[a-zA-Z0-9-]+$ ]] || return 1
  echo "Checking migration history in Azure job execution: $execution_name"

  deadline=$((SECONDS + migration_timeout_seconds))
  report=""
  while ((SECONDS < deadline)); do
    if [[ -z "$report" ]]; then
      report="$(timeout 8 az containerapp job logs show --name "$migration_job_name" \
        --resource-group "$resource_group_name" --execution "$execution_name" --container migration \
        --format json --tail 300 2>/dev/null |
        jq -Rnr '[inputs | fromjson? | .Log | strings | match("WKF_MIGRATION_CHECK .*").string] | last // empty' || true)"
    fi
    execution_status="$(az containerapp job execution show --name "$migration_job_name" \
      --resource-group "$resource_group_name" --job-execution-name "$execution_name" \
      --query properties.status --output tsv)" || return 1
    case "$execution_status" in
      Succeeded | Failed | Stopped | Degraded)
        break
        ;;
    esac
    sleep 3
  done

  if [[ -z "$report" && "${execution_status:-}" =~ ^(Succeeded|Failed|Stopped|Degraded)$ ]]; then
    workspace_id="$(timeout 12 az containerapp env show --name "$application_name" \
      --resource-group "$resource_group_name" --query properties.appLogsConfiguration.logAnalyticsConfiguration.customerId \
      --output tsv 2>/dev/null || true)"
    if [[ -n "$workspace_id" ]]; then
      report="$(timeout 20 az monitor log-analytics query --workspace "$workspace_id" \
        --analytics-query "ContainerAppConsoleLogs_CL | where ContainerGroupName_s startswith '${execution_name}-' | where Log_s contains 'WKF_MIGRATION_CHECK ' | top 1 by TimeGenerated desc | project Log_s" \
        --query '[0].Log_s' --output tsv 2>/dev/null | sed -n 's/^.*\(WKF_MIGRATION_CHECK .*\)$/\1/p' || true)"
    fi
  fi

  case "$report" in
    'WKF_MIGRATION_CHECK complete')
      if [[ "${execution_status:-}" == 'Succeeded' ]]; then
        echo 'All required migrations are recorded in payload_migrations.'
        return 0
      fi
      ;;
    'WKF_MIGRATION_CHECK missing '*)
      read -r -a missing_migrations <<< "${report#WKF_MIGRATION_CHECK missing }"
      printf 'Missing migration: %s\n' "${missing_migrations[@]}" >&2
      ;;
    'WKF_MIGRATION_CHECK error '*)
      echo "Migration history query failed: ${report#WKF_MIGRATION_CHECK error }" >&2
      ;;
  esac
  echo "Could not confirm migration history from Azure execution $execution_name (status: ${execution_status:-unknown})." >&2
  return 1
)
