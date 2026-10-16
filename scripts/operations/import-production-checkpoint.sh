#!/usr/bin/env bash

set -Eeuo pipefail

for variable_name in AZURE_STORAGE_IDENTITY_CLIENT_ID CHECKPOINT_NAME EXPECTED_SOURCE_SHA IMPORT_CONFIRMATION POSTGRES_MIGRATOR_URL PRODUCTION_MEDIA_CONTAINER_URL STAGING_CHECKPOINT_CONTAINER_URL; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "$variable_name is required." >&2
    exit 1
  fi
done

if [[ "$IMPORT_CONFIRMATION" != 'IMPORT' ]]; then
  echo 'Production import requires the exact confirmation value IMPORT.' >&2
  exit 1
fi

if [[ ! "$CHECKPOINT_NAME" =~ ^[a-z0-9][a-z0-9-]{2,62}$ ]]; then
  echo 'Checkpoint name must contain 3-63 lowercase letters, digits, or hyphens.' >&2
  exit 1
fi

temporary_directory="$(mktemp --directory)"
cleanup() {
  rm --recursive --force -- "$temporary_directory"
}
trap cleanup EXIT INT TERM

azcopy login --identity --identity-client-id "$AZURE_STORAGE_IDENTITY_CLIENT_ID"

checkpoint_url="${STAGING_CHECKPOINT_CONTAINER_URL%/}/$CHECKPOINT_NAME"
production_url="${PRODUCTION_MEDIA_CONTAINER_URL%/}"
database_dump_path="$temporary_directory/database.dump"
database_checksum_path="$temporary_directory/database.sha256"
manifest_path="$temporary_directory/manifest.json"
media_manifest_path="$temporary_directory/media-manifest.jsonl"
blob_path="$temporary_directory/blob"

download_checkpoint_file() {
  local name="$1"
  local destination="$2"

  azcopy copy "$checkpoint_url/$name" "$destination" --overwrite=true --output-type=text
  if [[ ! -f "$destination" ]]; then
    echo "Checkpoint is incomplete: missing $name." >&2
    return 1
  fi
}

download_checkpoint_file manifest.json "$manifest_path"
download_checkpoint_file database.dump "$database_dump_path"
download_checkpoint_file database.sha256 "$database_checksum_path"
download_checkpoint_file media-manifest.jsonl "$media_manifest_path"

if [[ "$(jq --raw-output '.checkpointName' "$manifest_path")" != "$CHECKPOINT_NAME" ]]; then
  echo 'Checkpoint manifest name does not match the requested checkpoint.' >&2
  exit 1
fi

if [[ "$(jq --raw-output '.deployedSourceSha' "$manifest_path")" != "$EXPECTED_SOURCE_SHA" ]]; then
  echo 'Checkpoint source SHA does not match the active production source SHA.' >&2
  exit 1
fi

expected_database_checksum="$(awk '{print $1}' "$database_checksum_path")"
if [[ "$(sha256sum "$database_dump_path" | cut --delimiter ' ' --fields 1)" != "$expected_database_checksum" ]]; then
  echo 'Checkpoint database checksum does not match.' >&2
  exit 1
fi
pg_restore --list "$database_dump_path" >/dev/null

expected_media_count="$(jq --raw-output '.mediaBlobCount' "$manifest_path")"
if [[ ! "$expected_media_count" =~ ^[0-9]+$ ]]; then
  echo 'Checkpoint manifest contains an invalid media blob count.' >&2
  exit 1
fi
if [[ "$(wc --lines <"$media_manifest_path")" != "$expected_media_count" ]]; then
  echo 'Checkpoint media count does not match its media manifest.' >&2
  exit 1
fi
if [[ "$(sha256sum "$media_manifest_path" | cut --delimiter ' ' --fields 1)" != "$(jq --raw-output '.mediaManifestSha256' "$manifest_path")" ]]; then
  echo 'Checkpoint media manifest checksum does not match.' >&2
  exit 1
fi

urlencode() {
  jq --null-input --raw-output --arg value "$1" '$value | @uri'
}

validate_checkpoint_blob() {
  local manifest_entry="$1"
  local blob_name
  local expected_checksum
  local expected_size

  blob_name="$(jq --raw-output '.name' <<<"$manifest_entry")"
  expected_checksum="$(jq --raw-output '.sha256' <<<"$manifest_entry")"
  expected_size="$(jq --raw-output '.size' <<<"$manifest_entry")"
  rm --force -- "$blob_path"
  azcopy copy "$checkpoint_url/media/$(urlencode "$blob_name")" "$blob_path" --overwrite=true --output-type=text

  if [[ ! -f "$blob_path" ]]; then
    echo "Checkpoint is missing media blob: $blob_name" >&2
    return 1
  fi
  if [[ "$(wc --bytes <"$blob_path")" != "$expected_size" ]]; then
    echo "Checkpoint media size mismatch: $blob_name" >&2
    return 1
  fi
  if [[ "$(sha256sum "$blob_path" | cut --delimiter ' ' --fields 1)" != "$expected_checksum" ]]; then
    echo "Checkpoint media checksum mismatch: $blob_name" >&2
    return 1
  fi
}

while IFS= read -r manifest_entry; do
  [[ -n "$manifest_entry" ]] && validate_checkpoint_blob "$manifest_entry"
done <"$media_manifest_path"

echo "Checkpoint validated before destructive work: $CHECKPOINT_NAME ($expected_media_count media blobs)."

azcopy remove "$production_url" --recursive=true --output-type=text

pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname "$POSTGRES_MIGRATOR_URL" \
  "$database_dump_path"

psql "$POSTGRES_MIGRATOR_URL" --set ON_ERROR_STOP=1 <<'SQL'
TRUNCATE TABLE users_sessions, payload_locked_documents CASCADE;
SQL

copied_media_count=0
while IFS= read -r manifest_entry; do
  [[ -n "$manifest_entry" ]] || continue
  blob_name="$(jq --raw-output '.name' <<<"$manifest_entry")"
  expected_checksum="$(jq --raw-output '.sha256' <<<"$manifest_entry")"
  azcopy copy "$checkpoint_url/media/$(urlencode "$blob_name")" "$production_url/$(urlencode "$blob_name")" --overwrite=true --output-type=text
  rm --force -- "$blob_path"
  azcopy copy "$production_url/$(urlencode "$blob_name")" "$blob_path" --overwrite=true --output-type=text
  if [[ "$(sha256sum "$blob_path" | cut --delimiter ' ' --fields 1)" != "$expected_checksum" ]]; then
    echo "Production media checksum mismatch after copy: $blob_name" >&2
    exit 1
  fi
  copied_media_count=$((copied_media_count + 1))
done <"$media_manifest_path"

if [[ "$copied_media_count" != "$expected_media_count" ]]; then
  echo "Production media count mismatch: expected $expected_media_count, copied $copied_media_count." >&2
  exit 1
fi

echo "Production checkpoint import completed: $CHECKPOINT_NAME ($copied_media_count media blobs)."
