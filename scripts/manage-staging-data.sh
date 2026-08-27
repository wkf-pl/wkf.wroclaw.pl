#!/usr/bin/env bash

set -Eeuo pipefail

operation="${1:-}"
checkpoint_name="${2:-}"
restore_confirmation="${3:-}"

resource_group_name="rg-wkf-staging"
application_name="wkf-staging"
migration_job_name="wkf-staging-migrate"
database_name="wkf"
database_administrator="${STAGING_DATABASE_ADMINISTRATOR:-wkfadmin}"
media_container_name="media"
checkpoint_container_name="staging-checkpoints"
postgres_image="postgres:17.10-alpine3.23"
health_timeout_seconds="${STAGING_DATA_HEALTH_TIMEOUT_SECONDS:-600}"

if [[ "$operation" != "backup" && "$operation" != "restore" ]]; then
  echo "Usage: manage-staging-data.sh <backup|restore> <checkpoint-name> [RESTORE]" >&2
  exit 1
fi

if [[ ! "$checkpoint_name" =~ ^[a-z0-9][a-z0-9-]{2,62}$ ]]; then
  echo "Checkpoint name must contain 3-63 lowercase letters, digits, or hyphens." >&2
  exit 1
fi

if [[ "$operation" == "restore" && "$restore_confirmation" != "RESTORE" ]]; then
  echo "Restore requires the exact confirmation value RESTORE." >&2
  exit 1
fi

if [[ -z "${POSTGRES_ADMIN_PASSWORD:-}" ]]; then
  echo "POSTGRES_ADMIN_PASSWORD is required." >&2
  exit 1
fi

if [[ ! "$database_administrator" =~ ^[a-zA-Z_][a-zA-Z0-9_]{0,62}$ ]]; then
  echo "STAGING_DATABASE_ADMINISTRATOR must be a valid PostgreSQL identifier." >&2
  exit 1
fi

for required_command in az curl docker jq sha256sum; do
  if ! command -v "$required_command" >/dev/null; then
    echo "Required command is unavailable: $required_command" >&2
    exit 1
  fi
done

if [[ ! "$health_timeout_seconds" =~ ^[1-9][0-9]*$ ]]; then
  echo "STAGING_DATA_HEALTH_TIMEOUT_SECONDS must be a positive integer." >&2
  exit 1
fi

temporary_directory="$(mktemp -d)"
firewall_rule_name="staging-data-${GITHUB_RUN_ID:-manual}-${RANDOM}"
postgres_server_name=""
postgres_server_fqdn=""
storage_account_name=""
storage_account_key=""
application_url=""
active_revision=""
active_image_reference=""
deployed_source_sha=""
firewall_rule_created=false
maintenance_started=false
application_reactivated=false
destructive_restore_started=false
operation_succeeded=false

mask_secret() {
  local secret_value="$1"

  if [[ "${GITHUB_ACTIONS:-false}" == "true" ]]; then
    printf '::add-mask::%s\n' "$secret_value"
  fi
}

reactivate_application() {
  if [[ "$maintenance_started" != "true" || "$application_reactivated" == "true" ]]; then
    return
  fi

  az containerapp revision activate \
    --resource-group "$resource_group_name" \
    --revision "$active_revision" \
    --output none
  application_reactivated=true
  echo "Reactivated staging revision: $active_revision"
}

cleanup() {
  local exit_status=$?

  trap - EXIT INT TERM
  set +e

  if [[ "$firewall_rule_created" == "true" ]]; then
    az postgres flexible-server firewall-rule delete \
      --resource-group "$resource_group_name" \
      --server-name "$postgres_server_name" \
      --name "$firewall_rule_name" \
      --yes \
      --output none >/dev/null 2>&1 \
      || az rest \
        --method delete \
        --url "$(az postgres flexible-server show --resource-group "$resource_group_name" --name "$postgres_server_name" --query id --output tsv)/firewallRules/$firewall_rule_name?api-version=2024-08-01" \
        --output none >/dev/null 2>&1 \
      || echo "WARNING: Temporary PostgreSQL firewall rule could not be removed: $firewall_rule_name" >&2
  fi

  if [[ "$maintenance_started" == "true" && "$application_reactivated" != "true" ]]; then
    if [[ "$operation" == "backup" || "$destructive_restore_started" != "true" ]]; then
      reactivate_application || echo "WARNING: Staging revision could not be reactivated." >&2
    else
      echo "Restore failed after destructive work started. Staging remains in maintenance mode." >&2
    fi
  elif [[ "$operation_succeeded" != "true" && "$operation" == "restore" && "$destructive_restore_started" == "true" && "$application_reactivated" == "true" ]]; then
    az containerapp revision deactivate \
      --resource-group "$resource_group_name" \
      --revision "$active_revision" \
      --output none \
      || echo "WARNING: Staging revision could not be returned to maintenance mode." >&2
    echo "Restore validation failed. Staging was returned to maintenance mode." >&2
  fi

  rm -rf -- "$temporary_directory"
  exit "$exit_status"
}

trap cleanup EXIT INT TERM

resolve_resources() {
  postgres_server_name="$(az postgres flexible-server list \
    --resource-group "$resource_group_name" \
    --query '[0].name' \
    --output tsv)"
  postgres_server_fqdn="$(az postgres flexible-server show \
    --resource-group "$resource_group_name" \
    --name "$postgres_server_name" \
    --query fullyQualifiedDomainName \
    --output tsv)"
  storage_account_name="$(az storage account list \
    --resource-group "$resource_group_name" \
    --query '[0].name' \
    --output tsv)"
  storage_account_key="$(az storage account keys list \
    --resource-group "$resource_group_name" \
    --account-name "$storage_account_name" \
    --query '[0].value' \
    --output tsv)"
  active_revision="$(az containerapp revision list \
    --resource-group "$resource_group_name" \
    --name "$application_name" \
    --query 'sort_by([?properties.active], &properties.createdTime)[-1].name' \
    --output tsv)"
  if [[ -z "$active_revision" && "$operation" == "restore" ]]; then
    active_revision="$(az containerapp show \
      --resource-group "$resource_group_name" \
      --name "$application_name" \
      --query properties.latestRevisionName \
      --output tsv)"
    echo "No active revision found; restore will recover the latest staging revision: $active_revision"
  fi
  active_image_reference="$(az containerapp revision show \
    --resource-group "$resource_group_name" \
    --name "$application_name" \
    --revision "$active_revision" \
    --query properties.template.containers[0].image \
    --output tsv)"
  deployed_source_sha="$(az containerapp revision show \
    --resource-group "$resource_group_name" \
    --name "$application_name" \
    --revision "$active_revision" \
    --query "properties.template.containers[0].env[?name=='DEPLOYED_SOURCE_SHA'] | [0].value" \
    --output tsv)"
  application_url="https://$(az containerapp show \
    --resource-group "$resource_group_name" \
    --name "$application_name" \
    --query properties.configuration.ingress.fqdn \
    --output tsv)"

  if [[ -z "$postgres_server_name" || -z "$postgres_server_fqdn" || -z "$storage_account_name" || -z "$storage_account_key" || -z "$active_revision" || -z "$active_image_reference" ]]; then
    echo "Could not resolve all staging resources." >&2
    exit 1
  fi

  mask_secret "$POSTGRES_ADMIN_PASSWORD"
  mask_secret "$storage_account_key"
  export AZURE_STORAGE_ACCOUNT="$storage_account_name"
  export AZURE_STORAGE_KEY="$storage_account_key"
  export PGPASSWORD="$POSTGRES_ADMIN_PASSWORD"
  export PGSSLMODE=require
}

start_maintenance() {
  local revision_active

  revision_active="$(az containerapp revision show \
    --resource-group "$resource_group_name" \
    --name "$application_name" \
    --revision "$active_revision" \
    --query properties.active \
    --output tsv)"
  if [[ "$revision_active" == "true" ]]; then
    az containerapp revision deactivate \
      --resource-group "$resource_group_name" \
      --revision "$active_revision" \
      --output none
  else
    echo "Staging revision is already inactive: $active_revision"
  fi
  maintenance_started=true
  echo "Staging maintenance started after deactivating revision: $active_revision"
}

open_database_firewall() {
  local current_ipv4

  current_ipv4="$(curl -4 --fail --silent --show-error https://api.ipify.org)"
  if [[ ! "$current_ipv4" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
    echo "Could not resolve a valid public IPv4 address for the GitHub runner." >&2
    exit 1
  fi

  az postgres flexible-server firewall-rule create \
    --resource-group "$resource_group_name" \
    --server-name "$postgres_server_name" \
    --name "$firewall_rule_name" \
    --start-ip-address "$current_ipv4" \
    --end-ip-address "$current_ipv4" \
    --output none
  firewall_rule_created=true
}

checkpoint_blob_exists() {
  local blob_name="$1"

  [[ "$(az storage blob exists \
    --container-name "$checkpoint_container_name" \
    --name "$blob_name" \
    --query exists \
    --output tsv)" == "true" ]]
}

copy_blob_synchronously() {
  local source_container="$1"
  local source_blob="$2"
  local destination_container="$3"
  local destination_blob="$4"

  az storage blob copy start \
    --source-account-name "$storage_account_name" \
    --source-account-key "$storage_account_key" \
    --source-container "$source_container" \
    --source-blob "$source_blob" \
    --destination-container "$destination_container" \
    --destination-blob "$destination_blob" \
    --requires-sync true \
    --output none
}

create_checkpoint() {
  local target_checkpoint_name="$1"
  local checkpoint_prefix="$target_checkpoint_name"
  local database_dump_path="$temporary_directory/$target_checkpoint_name.dump"
  local database_checksum_path="$database_dump_path.sha256"
  local manifest_path="$temporary_directory/$target_checkpoint_name.json"
  local media_blob_count
  local source_blob

  if checkpoint_blob_exists "$checkpoint_prefix/manifest.json"; then
    echo "Checkpoint already exists and will not be overwritten: $target_checkpoint_name" >&2
    return 1
  fi

  docker run --rm \
    --env PGPASSWORD \
    --env PGSSLMODE \
    --volume "$temporary_directory:/work" \
    "$postgres_image" \
    pg_dump \
      --host "$postgres_server_fqdn" \
      --username "$database_administrator" \
      --dbname "$database_name" \
      --format custom \
      --compress 9 \
      --no-owner \
      --no-privileges \
      --file "/work/$target_checkpoint_name.dump"

  docker run --rm \
    --volume "$temporary_directory:/work:ro" \
    "$postgres_image" \
    pg_restore --list "/work/$target_checkpoint_name.dump" >/dev/null

  sha256sum "$database_dump_path" >"$database_checksum_path"
  media_blob_count="$(az storage blob list \
    --container-name "$media_container_name" \
    --query 'length(@)' \
    --output tsv)"

  while IFS= read -r source_blob; do
    if [[ -n "$source_blob" ]]; then
      copy_blob_synchronously \
        "$media_container_name" \
        "$source_blob" \
        "$checkpoint_container_name" \
        "$checkpoint_prefix/media/$source_blob"
    fi
  done < <(az storage blob list \
    --container-name "$media_container_name" \
    --query '[].name' \
    --output tsv)

  jq -n \
    --arg checkpointName "$target_checkpoint_name" \
    --arg createdAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg databaseName "$database_name" \
    --arg deployedSourceSha "$deployed_source_sha" \
    --arg imageReference "$active_image_reference" \
    --argjson mediaBlobCount "$media_blob_count" \
    '{checkpointName: $checkpointName, createdAt: $createdAt, databaseName: $databaseName, deployedSourceSha: $deployedSourceSha, imageReference: $imageReference, mediaBlobCount: $mediaBlobCount}' \
    >"$manifest_path"

  az storage blob upload \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/database.dump" \
    --file "$database_dump_path" \
    --overwrite false \
    --output none
  az storage blob upload \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/database.sha256" \
    --file "$database_checksum_path" \
    --overwrite false \
    --output none
  az storage blob upload \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/manifest.json" \
    --file "$manifest_path" \
    --overwrite false \
    --output none

  echo "Created staging checkpoint: $target_checkpoint_name ($media_blob_count media blobs)"
}

download_and_validate_checkpoint() {
  local source_checkpoint_name="$1"
  local checkpoint_prefix="$source_checkpoint_name"
  local database_dump_path="$temporary_directory/restore.dump"
  local database_checksum_path="$temporary_directory/restore.sha256"
  local manifest_path="$temporary_directory/restore-manifest.json"
  local expected_media_blob_count
  local actual_media_blob_count

  for required_blob in manifest.json database.dump database.sha256; do
    if ! checkpoint_blob_exists "$checkpoint_prefix/$required_blob"; then
      echo "Checkpoint is incomplete: missing $required_blob in $source_checkpoint_name" >&2
      return 1
    fi
  done

  az storage blob download \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/database.dump" \
    --file "$database_dump_path" \
    --overwrite true \
    --output none
  az storage blob download \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/database.sha256" \
    --file "$database_checksum_path" \
    --overwrite true \
    --output none
  az storage blob download \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/manifest.json" \
    --file "$manifest_path" \
    --overwrite true \
    --output none

  (
    cd "$temporary_directory"
    sed "s#  .*#  restore.dump#" restore.sha256 | sha256sum --check --strict
  )
  docker run --rm \
    --volume "$temporary_directory:/work:ro" \
    "$postgres_image" \
    pg_restore --list /work/restore.dump >/dev/null

  expected_media_blob_count="$(jq -r '.mediaBlobCount' "$manifest_path")"
  actual_media_blob_count="$(az storage blob list \
    --container-name "$checkpoint_container_name" \
    --prefix "$checkpoint_prefix/media/" \
    --query 'length(@)' \
    --output tsv)"
  if [[ "$actual_media_blob_count" != "$expected_media_blob_count" ]]; then
    echo "Checkpoint media count mismatch: expected $expected_media_blob_count, found $actual_media_blob_count." >&2
    return 1
  fi
}

restore_database() {
  docker run --rm \
    --env PGPASSWORD \
    --env PGSSLMODE \
    "$postgres_image" \
    dropdb \
      --host "$postgres_server_fqdn" \
      --username "$database_administrator" \
      --maintenance-db postgres \
      --force \
      --if-exists \
      "$database_name"
  docker run --rm \
    --env PGPASSWORD \
    --env PGSSLMODE \
    "$postgres_image" \
    createdb \
      --host "$postgres_server_fqdn" \
      --username "$database_administrator" \
      --maintenance-db postgres \
      --owner "$database_administrator" \
      "$database_name"
  docker run --rm \
    --env PGPASSWORD \
    --env PGSSLMODE \
    "$postgres_image" \
    psql \
      --host "$postgres_server_fqdn" \
      --username "$database_administrator" \
      --dbname "$database_name" \
      --set ON_ERROR_STOP=1 \
      --command "GRANT ALL ON SCHEMA public TO \"$database_administrator\""
  docker run --rm \
    --env PGPASSWORD \
    --env PGSSLMODE \
    --volume "$temporary_directory:/work:ro" \
    "$postgres_image" \
    pg_restore \
      --host "$postgres_server_fqdn" \
      --username "$database_administrator" \
      --dbname "$database_name" \
      --exit-on-error \
      --no-owner \
      --no-privileges \
      /work/restore.dump
}

restore_media() {
  local source_checkpoint_name="$1"
  local checkpoint_prefix="$source_checkpoint_name/media/"
  local source_blob
  local destination_blob

  az storage blob delete-batch \
    --source "$media_container_name" \
    --delete-snapshots include \
    --output none

  while IFS= read -r source_blob; do
    if [[ -n "$source_blob" ]]; then
      destination_blob="${source_blob#"$checkpoint_prefix"}"
      copy_blob_synchronously \
        "$checkpoint_container_name" \
        "$source_blob" \
        "$media_container_name" \
        "$destination_blob"
    fi
  done < <(az storage blob list \
    --container-name "$checkpoint_container_name" \
    --prefix "$checkpoint_prefix" \
    --query '[].name' \
    --output tsv)
}

wait_for_job() {
  local execution_name="$1"
  local operation_label="$2"
  local deadline=$((SECONDS + 1800))
  local execution_status

  while ((SECONDS < deadline)); do
    execution_status="$(az containerapp job execution show \
      --resource-group "$resource_group_name" \
      --name "$migration_job_name" \
      --job-execution-name "$execution_name" \
      --query properties.status \
      --output tsv)"
    case "$execution_status" in
      Succeeded)
        return
        ;;
      Failed | Degraded)
        echo "$operation_label job failed with status $execution_status: $execution_name" >&2
        return 1
        ;;
    esac
    sleep 10
  done

  echo "$operation_label job did not finish within 30 minutes: $execution_name" >&2
  return 1
}

run_payload_job() {
  local payload_command="$1"
  local execution_name

  az containerapp job update \
    --resource-group "$resource_group_name" \
    --name "$migration_job_name" \
    --container-name migration \
    --image "$active_image_reference" \
    --command ./node_modules/.bin/payload \
    --args "$payload_command" \
    --output none
  execution_name="$(az containerapp job start \
    --resource-group "$resource_group_name" \
    --name "$migration_job_name" \
    --query name \
    --output tsv)"
  wait_for_job "$execution_name" "Payload $payload_command"
}

wait_for_application() {
  local deadline=$((SECONDS + health_timeout_seconds))
  local health_status

  while ((SECONDS < deadline)); do
    health_status="$(curl --silent --output /dev/null --write-out '%{http_code}' "$application_url/health" || true)"
    if [[ "$health_status" == "200" ]]; then
      for route in / /admin /robots.txt; do
        local route_status
        route_status="$(curl --silent --output /dev/null --write-out '%{http_code}' "$application_url$route" || true)"
        if [[ "$route_status" != "200" ]]; then
          echo "Staging route returned $route_status after data operation: $route" >&2
          return 1
        fi
      done
      return
    fi
    sleep 10
  done

  echo "Staging did not become healthy within $health_timeout_seconds seconds." >&2
  return 1
}

resolve_resources
az storage container create \
  --name "$checkpoint_container_name" \
  --public-access off \
  --output none
start_maintenance
open_database_firewall

if [[ "$operation" == "backup" ]]; then
  create_checkpoint "$checkpoint_name"
else
  rescue_checkpoint_name="rescue-$(date -u +%Y%m%d-%H%M%S)"
  download_and_validate_checkpoint "$checkpoint_name"
  create_checkpoint "$rescue_checkpoint_name"
  destructive_restore_started=true
  restore_database
  restore_media "$checkpoint_name"
  run_payload_job migrate
  run_payload_job migrate:status
  az containerapp job update \
    --resource-group "$resource_group_name" \
    --name "$migration_job_name" \
    --container-name migration \
    --image "$active_image_reference" \
    --command ./node_modules/.bin/payload \
    --args migrate \
    --output none
  echo "Restored staging checkpoint: $checkpoint_name"
fi

reactivate_application
wait_for_application
operation_succeeded=true

if [[ "${GITHUB_STEP_SUMMARY:-}" != "" ]]; then
  {
    echo "## Staging data operation"
    echo
    echo "Operation: \`$operation\`"
    echo "Checkpoint: \`$checkpoint_name\`"
    echo "Source revision: \`$active_revision\`"
    echo "Source commit: \`${deployed_source_sha:-unknown}\`"
  } >>"$GITHUB_STEP_SUMMARY"
fi
