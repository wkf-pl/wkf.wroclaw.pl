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

"$(dirname "$0")/validate-offsite-backup.sh" "$backup_directory"

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

azcopy login --identity --identity-client-id "$AZURE_STORAGE_IDENTITY_CLIENT_ID"
azcopy remove "${PRODUCTION_MEDIA_CONTAINER_URL%/}" --recursive=true --output-type=text

pg_restore --clean --if-exists --no-owner --no-privileges --dbname "$POSTGRES_MIGRATOR_URL" "$database_path"
psql "$POSTGRES_MIGRATOR_URL" --set ON_ERROR_STOP=1 <<'SQL'
TRUNCATE TABLE users_sessions, payload_locked_documents CASCADE;
SQL

urlencode() {
  jq --null-input --raw-output --arg value "$1" '$value | @uri'
}

restored_blob_count=0
while IFS= read -r entry; do
  archive_file="$(jq --raw-output '.archiveFile' <<<"$entry")"
  blob_name="$(jq --raw-output '.name' <<<"$entry")"
  rm --force -- "$blob_path"
  age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$blob_path" "$backup_directory/$archive_file"
  azcopy copy "$blob_path" "${PRODUCTION_MEDIA_CONTAINER_URL%/}/$(urlencode "$blob_name")" --overwrite=true --output-type=text
  restored_blob_count=$((restored_blob_count + 1))
done < <(jq --compact-output '.blobs[]' "$manifest_path")

echo "Off-site restore completed. Run application migrations and reconcile grants before restarting production ($restored_blob_count blobs)."
