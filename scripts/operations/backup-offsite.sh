#!/usr/bin/env bash

set -Eeuo pipefail

for variable_name in AGE_RECIPIENT AZURE_STORAGE_IDENTITY_CLIENT_ID DEPLOYED_SOURCE_SHA MIGRATION_STATE POSTGRES_BACKUP_URL PRODUCTION_IMAGE_REFERENCE PRODUCTION_MEDIA_CONTAINER_URL SFTP_HOST SFTP_KNOWN_HOSTS_FILE SFTP_PORT SFTP_PRIVATE_KEY_FILE SFTP_REMOTE_ROOT SFTP_USER; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "$variable_name is required." >&2
    exit 1
  fi
done

temporary_directory="$(mktemp --directory)"
cleanup() {
  rm --recursive --force -- "$temporary_directory"
}
trap cleanup EXIT INT TERM

backup_name="production-$(date -u +%Y%m%dT%H%M%SZ)"
remote_partial_directory="${SFTP_REMOTE_ROOT%/}/.${backup_name}.partial"
remote_final_directory="${SFTP_REMOTE_ROOT%/}/${backup_name}"
manifest_entries="$temporary_directory/blob-entries.jsonl"
manifest_path="$temporary_directory/manifest.json"
blob_names_path="$temporary_directory/blob-names.txt"
database_path="$temporary_directory/database.dump"
blob_path="$temporary_directory/blob"
encrypted_path="$temporary_directory/artifact.age"

: >"$manifest_entries"

sftp_batch() {
  sftp \
    -b - \
    -i "$SFTP_PRIVATE_KEY_FILE" \
    -o BatchMode=yes \
    -o IdentitiesOnly=yes \
    -o "UserKnownHostsFile=$SFTP_KNOWN_HOSTS_FILE" \
    -P "$SFTP_PORT" \
    "${SFTP_USER}@${SFTP_HOST}"
}

sftp_batch <<EOF
mkdir $remote_partial_directory
mkdir $remote_partial_directory/blobs
EOF

pg_dump \
  --dbname "$POSTGRES_BACKUP_URL" \
  --format custom \
  --compress 9 \
  --no-owner \
  --no-privileges \
  --file "$database_path"
pg_restore --list "$database_path" >/dev/null

database_checksum="$(sha256sum "$database_path" | cut --delimiter ' ' --fields 1)"
age --recipient "$AGE_RECIPIENT" --output "$encrypted_path" "$database_path"
sftp_batch <<EOF
put $encrypted_path $remote_partial_directory/database.dump.age
EOF
rm --force -- "$database_path" "$encrypted_path"

export AZCOPY_AUTO_LOGIN_TYPE=MSI
export AZCOPY_MSI_CLIENT_ID="$AZURE_STORAGE_IDENTITY_CLIENT_ID"

azcopy list "${PRODUCTION_MEDIA_CONTAINER_URL%/}" --machine-readable --output-type=json \
  | jq --raw-output 'select(.MessageType == "ListObject") | .MessageContent | fromjson | .Path' \
    >"$blob_names_path"

urlencode() {
  jq --null-input --raw-output --arg value "$1" '$value | @uri'
}

blob_count=0
while IFS= read -r blob_name; do
  [[ -n "$blob_name" ]] || continue
  archive_name="$(printf '%s' "$blob_name" | sha256sum | cut --delimiter ' ' --fields 1).age"
  rm --force -- "$blob_path" "$encrypted_path"
  azcopy copy "${PRODUCTION_MEDIA_CONTAINER_URL%/}/$(urlencode "$blob_name")" "$blob_path" --overwrite=true --output-type=text
  clear_checksum="$(sha256sum "$blob_path" | cut --delimiter ' ' --fields 1)"
  clear_size="$(wc --bytes <"$blob_path")"
  age --recipient "$AGE_RECIPIENT" --output "$encrypted_path" "$blob_path"
  sftp_batch <<EOF
put $encrypted_path $remote_partial_directory/blobs/$archive_name
EOF
  jq --compact-output --null-input \
    --arg archiveFile "blobs/$archive_name" \
    --arg name "$blob_name" \
    --arg sha256 "$clear_checksum" \
    --argjson size "$clear_size" \
    '{archiveFile: $archiveFile, name: $name, sha256: $sha256, size: $size}' >>"$manifest_entries"
  blob_count=$((blob_count + 1))
done <"$blob_names_path"

jq --null-input \
  --arg backupName "$backup_name" \
  --arg createdAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg databaseSha256 "$database_checksum" \
  --arg deployedSourceSha "$DEPLOYED_SOURCE_SHA" \
  --arg imageReference "$PRODUCTION_IMAGE_REFERENCE" \
  --arg migrationState "$MIGRATION_STATE" \
  --argjson blobCount "$blob_count" \
  --slurpfile blobs "$manifest_entries" \
  '{backupName: $backupName, createdAt: $createdAt, database: {archiveFile: "database.dump.age", sha256: $databaseSha256}, deployedSourceSha: $deployedSourceSha, imageReference: $imageReference, migrationState: $migrationState, blobCount: $blobCount, blobs: $blobs}' \
  >"$manifest_path"

rm --force -- "$encrypted_path"
age --recipient "$AGE_RECIPIENT" --output "$encrypted_path" "$manifest_path"
sftp_batch <<EOF
put $encrypted_path $remote_partial_directory/manifest.json.age
rename $remote_partial_directory $remote_final_directory
EOF

echo "Published complete encrypted off-site backup: $backup_name ($blob_count blobs)."
