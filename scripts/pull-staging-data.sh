#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

checkpoint_name="${1:-}"
import_confirmation="${2:-}"

resource_group_name="${STAGING_RESOURCE_GROUP_NAME:-rg-wkf-staging}"
checkpoint_container_name="${STAGING_CHECKPOINT_CONTAINER_NAME:-staging-checkpoints}"
local_media_container_name="media"
application_url="${LOCAL_APP_URL:-http://127.0.0.1:3000}"
health_timeout_seconds="${STAGING_PULL_HEALTH_TIMEOUT_SECONDS:-180}"

project_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
temporary_directory=""
local_rescue_directory=""
staging_storage_account_name=""
staging_storage_account_key=""
local_azurite_connection_string=""
application_was_running=false
destructive_import_started=false
import_succeeded=false
rollback_succeeded=false

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

is_compose_service_running() {
  local expected_service="$1"
  local running_service

  while IFS= read -r running_service; do
    if [[ "$running_service" == "$expected_service" ]]; then
      return 0
    fi
  done < <(docker compose ps --status running --services 2>/dev/null)

  return 1
}

staging_storage() {
  AZURE_STORAGE_ACCOUNT="$staging_storage_account_name" \
    AZURE_STORAGE_KEY="$staging_storage_account_key" \
    az storage "$@"
}

local_storage() {
  az storage "$@" --connection-string "$local_azurite_connection_string"
}

restore_database_from_dump() {
  local database_dump_path="$1"

  docker compose exec -T postgres sh -c \
    'dropdb --username "$POSTGRES_USER" --maintenance-db postgres --force --if-exists "$POSTGRES_DB"' \
    || return 1
  docker compose exec -T postgres sh -c \
    'createdb --username "$POSTGRES_USER" --maintenance-db postgres --owner "$POSTGRES_USER" "$POSTGRES_DB"' \
    || return 1
  docker compose exec -T postgres sh -c \
    'psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set ON_ERROR_STOP=1 --command "GRANT ALL ON SCHEMA public TO \"$POSTGRES_USER\""' \
    || return 1
  docker compose exec -T postgres sh -c \
    'pg_restore --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --exit-on-error --no-owner --no-privileges' \
    <"$database_dump_path" \
    || return 1
}

validate_blob_name() {
  local blob_name="$1"

  if [[ -z "$blob_name" || "$blob_name" == /* || "/$blob_name/" == *"/../"* ]]; then
    echo "Unsafe blob name: $blob_name" >&2
    return 1
  fi

  if [[ "$blob_name" == *$'\n'* || "$blob_name" == *$'\r'* ]]; then
    echo "Blob names containing line breaks are not supported." >&2
    return 1
  fi
}

validate_downloaded_blobs() {
  local blob_manifest_path="$1"
  local source_directory="$2"
  local blob_record
  local source_blob_name

  if ! jq --exit-status \
    'type == "array" and all(.[]; (.name | type == "string"))' \
    "$blob_manifest_path" >/dev/null; then
    echo "Blob manifest is invalid: $blob_manifest_path" >&2
    return 1
  fi

  while IFS= read -r blob_record; do
    source_blob_name="$(jq -r '.name' <<<"$blob_record")"
    validate_blob_name "$source_blob_name" || return 1

    if [[ ! -f "$source_directory/$source_blob_name" ]]; then
      echo "Downloaded blob file is missing: $source_directory/$source_blob_name" >&2
      return 1
    fi
  done < <(jq -c '.[]' "$blob_manifest_path")
}

upload_blobs_from_manifest() {
  local blob_manifest_path="$1"
  local source_directory="$2"
  local source_prefix="$3"
  local blob_record
  local source_blob_name
  local destination_blob_name
  local source_file_path
  local content_type
  local cache_control
  local content_disposition
  local content_encoding
  local content_language

  if ! jq --exit-status \
    'type == "array" and all(.[]; (.name | type == "string"))' \
    "$blob_manifest_path" >/dev/null; then
    echo "Blob manifest is invalid: $blob_manifest_path" >&2
    return 1
  fi

  while IFS= read -r blob_record; do
    source_blob_name="$(jq -r '.name' <<<"$blob_record")"

    if [[ -n "$source_prefix" && "$source_blob_name" != "$source_prefix"* ]]; then
      echo "Blob is outside the expected prefix: $source_blob_name" >&2
      return 1
    fi

    destination_blob_name="${source_blob_name#"$source_prefix"}"
    validate_blob_name "$destination_blob_name" || return 1
    source_file_path="$source_directory/$source_blob_name"

    if [[ ! -f "$source_file_path" ]]; then
      echo "Downloaded blob file is missing: $source_file_path" >&2
      return 1
    fi

    content_type="$(jq -r '.properties.contentSettings.contentType // empty' <<<"$blob_record")"
    cache_control="$(jq -r '.properties.contentSettings.cacheControl // empty' <<<"$blob_record")"
    content_disposition="$(jq -r '.properties.contentSettings.contentDisposition // empty' <<<"$blob_record")"
    content_encoding="$(jq -r '.properties.contentSettings.contentEncoding // empty' <<<"$blob_record")"
    content_language="$(jq -r '.properties.contentSettings.contentLanguage // empty' <<<"$blob_record")"

    local upload_arguments=(
      blob upload
      --container-name "$local_media_container_name"
      --name "$destination_blob_name"
      --file "$source_file_path"
      --overwrite true
      --output none
      --only-show-errors
    )

    if [[ -n "$content_type" ]]; then
      upload_arguments+=(--content-type "$content_type")
    fi
    if [[ -n "$cache_control" ]]; then
      upload_arguments+=(--content-cache-control "$cache_control")
    fi
    if [[ -n "$content_disposition" ]]; then
      upload_arguments+=(--content-disposition "$content_disposition")
    fi
    if [[ -n "$content_encoding" ]]; then
      upload_arguments+=(--content-encoding "$content_encoding")
    fi
    if [[ -n "$content_language" ]]; then
      upload_arguments+=(--content-language "$content_language")
    fi

    local_storage "${upload_arguments[@]}" || return 1
  done < <(jq -c '.[]' "$blob_manifest_path")
}

replace_local_media() {
  local blob_manifest_path="$1"
  local source_directory="$2"
  local source_prefix="$3"
  local expected_blob_count
  local restored_blob_count

  expected_blob_count="$(jq 'length' "$blob_manifest_path")" || return 1

  local_storage blob delete-batch \
    --source "$local_media_container_name" \
    --delete-snapshots include \
    --output none \
    --only-show-errors \
    || return 1
  upload_blobs_from_manifest "$blob_manifest_path" "$source_directory" "$source_prefix" \
    || return 1

  restored_blob_count="$(local_storage blob list \
    --container-name "$local_media_container_name" \
    --num-results '*' \
    --query 'length(@)' \
    --output tsv \
    --only-show-errors)" \
    || return 1

  if [[ "$restored_blob_count" != "$expected_blob_count" ]]; then
    echo "Local media count mismatch: expected $expected_blob_count, found $restored_blob_count." >&2
    return 1
  fi
}

wait_for_local_application() {
  local deadline=$((SECONDS + health_timeout_seconds))
  local health_status
  local liveness_status
  local route
  local route_status
  local routes=('/' '/admin' '/api/media?limit=1')

  while ((SECONDS < deadline)); do
    health_status="$(curl --silent --output /dev/null --write-out '%{http_code}' "$application_url/api/health" || true)"
    liveness_status="$(curl --silent --output /dev/null --write-out '%{http_code}' "$application_url/api/health/live" || true)"

    if [[ "$health_status" == "200" && "$liveness_status" == "200" ]]; then
      for route in "${routes[@]}"; do
        route_status="$(curl --silent --output /dev/null --write-out '%{http_code}' "$application_url$route" || true)"
        if [[ "$route_status" != "200" ]]; then
          break
        fi
      done

      if [[ "$route_status" == "200" ]]; then
        return 0
      fi
    fi

    sleep 5
  done

  echo "Local application did not pass smoke tests within $health_timeout_seconds seconds." >&2
  return 1
}

cleanup() {
  local exit_status=$?
  local rollback_database_succeeded=false
  local rollback_media_succeeded=false

  trap - EXIT INT TERM
  set +e

  if [[ "$destructive_import_started" == "true" && "$import_succeeded" != "true" ]]; then
    echo "Import failed after local data replacement started. Attempting automatic rollback." >&2
    docker compose stop app >/dev/null 2>&1

    if restore_database_from_dump "$local_rescue_directory/database.dump"; then
      rollback_database_succeeded=true
    fi
    if replace_local_media \
      "$local_rescue_directory/media-blobs.json" \
      "$local_rescue_directory/media" \
      ""; then
      rollback_media_succeeded=true
    fi

    if [[ "$rollback_database_succeeded" == "true" && "$rollback_media_succeeded" == "true" ]]; then
      rollback_succeeded=true
      echo "Automatic rollback restored the previous local database and media." >&2
    else
      echo "Automatic rollback was incomplete. The local application remains stopped." >&2
      echo "Recovery files: $local_rescue_directory" >&2
    fi
  fi

  if [[ "$application_was_running" == "true" && "$import_succeeded" != "true" ]]; then
    if [[ "$destructive_import_started" != "true" || "$rollback_succeeded" == "true" ]]; then
      docker compose up -d app >/dev/null \
        || echo "WARNING: The previously running local application could not be restarted." >&2
    fi
  fi

  if [[ -n "$temporary_directory" && -d "$temporary_directory" ]]; then
    rm -rf -- "$temporary_directory"
  fi

  exit "$exit_status"
}

if [[ ! "$checkpoint_name" =~ ^[a-z0-9][a-z0-9-]{2,62}$ ]]; then
  fail "Checkpoint name must contain 3-63 lowercase letters, digits, or hyphens."
fi

if [[ "$import_confirmation" != "IMPORT" ]]; then
  if [[ -t 0 ]]; then
    echo "This will replace the local PostgreSQL database and every blob in local Azurite."
    printf 'Type IMPORT to continue: '
    read -r import_confirmation
  fi

  if [[ "$import_confirmation" != "IMPORT" ]]; then
    fail "Import requires the exact confirmation value IMPORT."
  fi
fi

for required_command in az curl docker git jq sed sha256sum; do
  if ! command -v "$required_command" >/dev/null; then
    fail "Required command is unavailable: $required_command"
  fi
done

if [[ ! "$health_timeout_seconds" =~ ^[1-9][0-9]*$ ]]; then
  fail "STAGING_PULL_HEALTH_TIMEOUT_SECONDS must be a positive integer."
fi

case "$application_url" in
  http://127.0.0.1:* | http://localhost:*) ;;
  *) fail "LOCAL_APP_URL must use http://127.0.0.1 or http://localhost." ;;
esac

cd "$project_directory"
temporary_directory="$(mktemp -d)"
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

if is_compose_service_running app; then
  application_was_running=true
fi

az account show --output none

if [[ -n "${STAGING_STORAGE_ACCOUNT_NAME:-}" ]]; then
  staging_storage_account_name="$STAGING_STORAGE_ACCOUNT_NAME"
else
  mapfile -t staging_storage_accounts < <(
    az storage account list \
      --resource-group "$resource_group_name" \
      --query '[].name' \
      --output tsv
  )

  if [[ "${#staging_storage_accounts[@]}" -ne 1 ]]; then
    fail "Expected one Storage account in $resource_group_name; set STAGING_STORAGE_ACCOUNT_NAME explicitly."
  fi

  staging_storage_account_name="${staging_storage_accounts[0]}"
fi

staging_storage_account_key="$(az storage account keys list \
  --resource-group "$resource_group_name" \
  --account-name "$staging_storage_account_name" \
  --query '[0].value' \
  --output tsv)"

if [[ -z "$staging_storage_account_key" ]]; then
  fail "Could not resolve the staging Storage account key."
fi

staging_storage blob download-batch \
  --source "$checkpoint_container_name" \
  --destination "$temporary_directory" \
  --pattern "$checkpoint_name/*" \
  --overwrite true \
  --no-progress \
  --output none \
  --only-show-errors

checkpoint_directory="$temporary_directory/$checkpoint_name"
database_dump_path="$checkpoint_directory/database.dump"
database_checksum_path="$checkpoint_directory/database.sha256"
checkpoint_manifest_path="$checkpoint_directory/manifest.json"
staging_media_prefix="$checkpoint_name/media/"
staging_media_manifest_path="$temporary_directory/staging-media-blobs.json"

for required_file in "$database_dump_path" "$database_checksum_path" "$checkpoint_manifest_path"; do
  if [[ ! -f "$required_file" ]]; then
    fail "Checkpoint is incomplete: missing ${required_file#"$checkpoint_directory/"}."
  fi
done

IFS=' ' read -r expected_database_checksum _ <"$database_checksum_path"
actual_database_checksum="$(sha256sum "$database_dump_path")"
actual_database_checksum="${actual_database_checksum%% *}"

if [[ -z "$expected_database_checksum" || "$expected_database_checksum" != "$actual_database_checksum" ]]; then
  fail "Checkpoint database checksum does not match."
fi

if ! jq --exit-status \
  --arg checkpointName "$checkpoint_name" \
  '.checkpointName == $checkpointName and (.mediaBlobCount | type == "number")' \
  "$checkpoint_manifest_path" >/dev/null; then
  fail "Checkpoint manifest is invalid or belongs to a different checkpoint."
fi

expected_media_blob_count="$(jq -r '.mediaBlobCount' "$checkpoint_manifest_path")"
deployed_source_sha="$(jq -r '.deployedSourceSha // empty' "$checkpoint_manifest_path")"

staging_storage blob list \
  --container-name "$checkpoint_container_name" \
  --prefix "$staging_media_prefix" \
  --include m \
  --num-results '*' \
  --output json \
  --only-show-errors \
  >"$staging_media_manifest_path"

actual_media_blob_count="$(jq 'length' "$staging_media_manifest_path")"

if [[ "$actual_media_blob_count" != "$expected_media_blob_count" ]]; then
  fail "Checkpoint media count mismatch: expected $expected_media_blob_count, found $actual_media_blob_count."
fi

validate_downloaded_blobs "$staging_media_manifest_path" "$temporary_directory"

if [[ ! "$deployed_source_sha" =~ ^[0-9a-f]{40}$ ]]; then
  fail "Checkpoint manifest does not contain a valid deployed source SHA."
fi

if ! git cat-file -e "${deployed_source_sha}^{commit}" 2>/dev/null \
  || ! git merge-base --is-ancestor "$deployed_source_sha" HEAD; then
  if [[ "${STAGING_PULL_ALLOW_CODE_MISMATCH:-false}" != "true" ]]; then
    fail "Local HEAD does not contain staging commit $deployed_source_sha. Update the checkout or set STAGING_PULL_ALLOW_CODE_MISMATCH=true after reviewing the schema risk."
  fi

  echo "WARNING: Importing data from a staging commit not contained in local HEAD." >&2
fi

if [[ -n "$(git status --porcelain -- migrations src/payload.config.ts src/collections src/globals)" ]]; then
  echo "WARNING: Uncommitted schema-related changes may not match the staging checkpoint." >&2
fi

local_azurite_connection_string="${LOCAL_AZURITE_CONNECTION_STRING:-$(sed -n 's/^AZURE_STORAGE_CONNECTION_STRING=//p' .env.example)}"

case "$local_azurite_connection_string" in
  *"BlobEndpoint=http://127.0.0.1:"* | *"BlobEndpoint=http://localhost:"*) ;;
  *) fail "The local Storage connection must point to Azurite on 127.0.0.1 or localhost." ;;
esac

docker compose up -d --wait postgres azurite

local_storage container create \
  --name "$local_media_container_name" \
  --public-access off \
  --output none \
  --only-show-errors

docker compose exec -T postgres pg_restore --list <"$database_dump_path" >/dev/null

if [[ "$application_was_running" == "true" ]]; then
  docker compose stop app
fi

active_database_connections="$(docker compose exec -T postgres sh -c \
  'psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --tuples-only --no-align --command "SELECT count(*) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()"')"

if [[ "$active_database_connections" != "0" ]]; then
  fail "Local PostgreSQL still has $active_database_connections other connection(s). Stop local applications and database tools before importing."
fi

rescue_timestamp="$(date -u +%Y%m%d-%H%M%S)"
local_rescue_directory="$project_directory/tmp/staging-pulls/local-before-$rescue_timestamp-$checkpoint_name"
mkdir -p "$local_rescue_directory/media"

docker compose exec -T postgres sh -c \
  'pg_dump --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --format custom --compress 9 --no-owner --no-privileges' \
  >"$local_rescue_directory/database.dump"

if [[ ! -s "$local_rescue_directory/database.dump" ]]; then
  fail "Local rescue database dump is empty."
fi

docker compose exec -T postgres pg_restore --list \
  <"$local_rescue_directory/database.dump" \
  >/dev/null

local_storage blob list \
  --container-name "$local_media_container_name" \
  --include m \
  --num-results '*' \
  --output json \
  --only-show-errors \
  >"$local_rescue_directory/media-blobs.json"

local_media_blob_count="$(jq 'length' "$local_rescue_directory/media-blobs.json")"

if [[ "$local_media_blob_count" != "0" ]]; then
  local_storage blob download-batch \
    --source "$local_media_container_name" \
    --destination "$local_rescue_directory/media" \
    --overwrite true \
    --no-progress \
    --output none \
    --only-show-errors
fi

validate_downloaded_blobs \
  "$local_rescue_directory/media-blobs.json" \
  "$local_rescue_directory/media"

printf '%s\n' "$(git rev-parse HEAD)" >"$local_rescue_directory/source-sha"
cp "$checkpoint_manifest_path" "$local_rescue_directory/imported-checkpoint-manifest.json"

destructive_import_started=true
restore_database_from_dump "$database_dump_path"
replace_local_media "$staging_media_manifest_path" "$temporary_directory" "$staging_media_prefix"

imported_media_blob_count="$(local_storage blob list \
  --container-name "$local_media_container_name" \
  --num-results '*' \
  --query 'length(@)' \
  --output tsv \
  --only-show-errors)"

if [[ "$imported_media_blob_count" != "$expected_media_blob_count" ]]; then
  fail "Local media count mismatch after import: expected $expected_media_blob_count, found $imported_media_blob_count."
fi

docker compose run --rm --no-deps app pnpm migrate
docker compose run --rm --no-deps app pnpm payload migrate:status

docker compose exec -T postgres sh -c \
  'psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set ON_ERROR_STOP=1 --command "TRUNCATE TABLE users_sessions, payload_locked_documents CASCADE; UPDATE users SET reset_password_token = NULL, reset_password_expiration = NULL, login_attempts = 0, lock_until = NULL;"'

if [[ "$application_was_running" == "true" ]]; then
  docker compose up -d app
  wait_for_local_application
else
  echo "The local application was not running before import and remains stopped."
  echo "Start it with: docker compose up -d app"
fi

import_succeeded=true
echo "Imported staging checkpoint into the local environment: $checkpoint_name"
echo "Previous local data backup: $local_rescue_directory"
