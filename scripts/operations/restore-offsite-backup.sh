#!/usr/bin/env bash

set -Eeuo pipefail

backup_directory="${1:?Usage: restore-offsite-backup.sh <downloaded-backup-directory> RESTORE}"
confirmation="${2:-}"

for variable_name in AGE_IDENTITY_FILE AZURE_STORAGE_IDENTITY_CLIENT_ID POSTGRES_MIGRATOR_URL PRODUCTION_MEDIA_CONTAINER_URL; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "$variable_name is required." >&2
    exit 1
  fi
done

if [[ "$confirmation" != 'RESTORE' ]]; then
  echo 'Off-site restore requires the exact confirmation value RESTORE.' >&2
  exit 1
fi

bash "$(dirname "$0")/validate-offsite-backup.sh" "$backup_directory"

temporary_directory="$(mktemp --directory)"
cleanup() {
  rm --recursive --force -- "$temporary_directory"
}
trap cleanup EXIT INT TERM

manifest_path="$temporary_directory/manifest.json"
database_path="$temporary_directory/database.dump"
blob_path="$temporary_directory/blob"
age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$manifest_path" "$backup_directory/manifest.json.age"
age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$database_path" "$backup_directory/$(jq --raw-output '.database.archiveFile' "$manifest_path")"
if [[ "$(wc --bytes <"$database_path")" != "$(jq --raw-output '.database.size' "$manifest_path")" || "$(sha256sum "$database_path" | cut --delimiter ' ' --fields 1)" != "$(jq --raw-output '.database.sha256' "$manifest_path")" ]]; then
  echo 'Database changed after backup validation.' >&2
  exit 1
fi

export AZCOPY_AUTO_LOGIN_TYPE=MSI
export AZCOPY_MSI_CLIENT_ID="$AZURE_STORAGE_IDENTITY_CLIENT_ID"
azcopy remove "${PRODUCTION_MEDIA_CONTAINER_URL%/}" --recursive=true --output-type=text

pg_restore --exit-on-error --clean --if-exists --no-owner --no-privileges --dbname "$POSTGRES_MIGRATOR_URL" "$database_path"
psql "$POSTGRES_MIGRATOR_URL" --set ON_ERROR_STOP=1 <<'SQL'
TRUNCATE TABLE users_sessions, payload_locked_documents CASCADE;
SQL

urlencode() {
  jq --null-input --raw-output --arg value "$1" '$value | @uri'
}

restored_blob_count=0
while IFS= read -r entry <&3; do
  archive_file="$(jq --raw-output '.archiveFile' <<<"$entry")"
  blob_name="$(jq --raw-output '.name' <<<"$entry")"
  expected_checksum="$(jq --raw-output '.sha256' <<<"$entry")"
  expected_size="$(jq --raw-output '.size' <<<"$entry")"
  rm --force -- "$blob_path"
  age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$blob_path" "$backup_directory/$archive_file"
  if [[ "$(wc --bytes <"$blob_path")" != "$expected_size" || "$(sha256sum "$blob_path" | cut --delimiter ' ' --fields 1)" != "$expected_checksum" ]]; then
    echo "Blob changed after backup validation: $blob_name" >&2
    exit 1
  fi
  azcopy copy "$blob_path" "${PRODUCTION_MEDIA_CONTAINER_URL%/}/$(urlencode "$blob_name")" --overwrite=true --output-type=text </dev/null
  restored_blob_count=$((restored_blob_count + 1))
done 3< <(jq --compact-output '.blobs[]' "$manifest_path")

echo "Off-site restore completed. Run application migrations and reconcile grants before restarting production ($restored_blob_count blobs)."
