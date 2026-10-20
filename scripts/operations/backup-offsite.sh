#!/usr/bin/env bash

set -Eeuo pipefail

for variable_name in AGE_RECIPIENT AZURE_STORAGE_IDENTITY_CLIENT_ID DEPLOYED_SOURCE_SHA OPERATIONS_IMAGE_REFERENCE POSTGRES_BACKUP_URL PRODUCTION_IMAGE_REFERENCE PRODUCTION_MEDIA_CONTAINER_URL SFTP_HOST SFTP_PORT SFTP_REMOTE_ROOT SFTP_USER; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "$variable_name is required." >&2
    exit 1
  fi
done

if [[ -z "${SFTP_PRIVATE_KEY_FILE:-}" && -z "${SFTP_PRIVATE_KEY:-}" ]]; then
  echo 'SFTP_PRIVATE_KEY_FILE or SFTP_PRIVATE_KEY is required.' >&2
  exit 1
fi
if [[ -z "${SFTP_KNOWN_HOSTS_FILE:-}" && -z "${SFTP_KNOWN_HOSTS:-}" ]]; then
  echo 'SFTP_KNOWN_HOSTS_FILE or SFTP_KNOWN_HOSTS is required.' >&2
  exit 1
fi
if [[ ! "$DEPLOYED_SOURCE_SHA" =~ ^[a-f0-9]{40}$ ]]; then
  echo 'DEPLOYED_SOURCE_SHA must be a full Git SHA.' >&2
  exit 1
fi
if [[ ! "$PRODUCTION_IMAGE_REFERENCE" =~ @sha256:[a-f0-9]{64}$ ]]; then
  echo 'PRODUCTION_IMAGE_REFERENCE must use an immutable sha256 digest.' >&2
  exit 1
fi
if [[ ! "$OPERATIONS_IMAGE_REFERENCE" =~ @sha256:[a-f0-9]{64}$ ]]; then
  echo 'OPERATIONS_IMAGE_REFERENCE must use an immutable sha256 digest.' >&2
  exit 1
fi
if [[ ! "$SFTP_HOST" =~ ^[a-zA-Z0-9.-]+$ || ! "$SFTP_USER" =~ ^[a-zA-Z0-9._-]+$ ]]; then
  echo 'SFTP_HOST or SFTP_USER contains unsupported characters.' >&2
  exit 1
fi
if [[ ! "$SFTP_PORT" =~ ^[0-9]+$ ]] || ((SFTP_PORT < 1 || SFTP_PORT > 65535)); then
  echo 'SFTP_PORT must be an integer from 1 to 65535.' >&2
  exit 1
fi
if [[ ! "$SFTP_REMOTE_ROOT" =~ ^/?[a-zA-Z0-9._/-]+$ || "/$SFTP_REMOTE_ROOT/" == *'/../'* ]]; then
  echo 'SFTP_REMOTE_ROOT must be a simple path without parent-directory segments.' >&2
  exit 1
fi

backup_name="${BACKUP_NAME:-production-$(date -u +%Y%m%dT%H%M%SZ)}"
if [[ ! "$backup_name" =~ ^production-[0-9]{8}T[0-9]{6}Z$ ]]; then
  echo 'BACKUP_NAME must use the production-YYYYMMDDTHHMMSSZ format.' >&2
  exit 1
fi

temporary_directory="$(mktemp --directory)"
sftp_control_path="$temporary_directory/sftp-control"
close_sftp_connection() {
  if [[ -S "$sftp_control_path" ]]; then
    ssh \
      -i "$sftp_private_key_file" \
      -o BatchMode=yes \
      -o IdentitiesOnly=yes \
      -o "UserKnownHostsFile=$sftp_known_hosts_file" \
      -o StrictHostKeyChecking=yes \
      -S "$sftp_control_path" \
      -O exit \
      -p "$SFTP_PORT" \
      "${SFTP_USER}@${SFTP_HOST}" >/dev/null 2>&1 || true
  fi
}
cleanup() {
  close_sftp_connection
  rm --recursive --force -- "$temporary_directory"
}
trap cleanup EXIT INT TERM

if [[ -n "${SFTP_PRIVATE_KEY_FILE:-}" ]]; then
  sftp_private_key_file="$SFTP_PRIVATE_KEY_FILE"
else
  sftp_private_key_file="$temporary_directory/sftp-private-key"
  (umask 077 && printf '%s\n' "$SFTP_PRIVATE_KEY" >"$sftp_private_key_file")
fi
if [[ -n "${SFTP_KNOWN_HOSTS_FILE:-}" ]]; then
  sftp_known_hosts_file="$SFTP_KNOWN_HOSTS_FILE"
else
  sftp_known_hosts_file="$temporary_directory/sftp-known-hosts"
  (umask 077 && printf '%s\n' "$SFTP_KNOWN_HOSTS" >"$sftp_known_hosts_file")
fi
if [[ ! -r "$sftp_private_key_file" || ! -r "$sftp_known_hosts_file" ]]; then
  echo 'The SFTP identity or known-hosts file is not readable.' >&2
  exit 1
fi

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
    -i "$sftp_private_key_file" \
    -o BatchMode=yes \
    -o ConnectTimeout=30 \
    -o ControlMaster=auto \
    -o ControlPersist=300 \
    -o "ControlPath=$sftp_control_path" \
    -o IdentitiesOnly=yes \
    -o ServerAliveCountMax=3 \
    -o ServerAliveInterval=30 \
    -o StrictHostKeyChecking=yes \
    -o "UserKnownHostsFile=$sftp_known_hosts_file" \
    -P "$SFTP_PORT" \
    "${SFTP_USER}@${SFTP_HOST}"
}

sftp_batch <<EOF
mkdir $remote_partial_directory
mkdir $remote_partial_directory/blobs
EOF

migration_state="$({
  psql \
    "$POSTGRES_BACKUP_URL" \
    --no-align \
    --quiet \
    --set ON_ERROR_STOP=1 \
    --tuples-only \
    --command 'SELECT COALESCE(json_agg(migration ORDER BY migration.id), '\''[]'\''::json) FROM (SELECT id, name, batch, created_at AS "createdAt", updated_at AS "updatedAt" FROM payload_migrations) migration;'
} | tr --delete '\n')"
if ! jq --exit-status 'type == "array"' <<<"$migration_state" >/dev/null; then
  echo 'Could not capture the Payload migration state as JSON.' >&2
  exit 1
fi

pg_dump \
  --dbname "$POSTGRES_BACKUP_URL" \
  --format custom \
  --compress 9 \
  --no-owner \
  --no-privileges \
  --file "$database_path"
pg_restore --list "$database_path" >/dev/null

database_checksum="$(sha256sum "$database_path" | cut --delimiter ' ' --fields 1)"
database_size="$(wc --bytes <"$database_path")"
age --recipient "$AGE_RECIPIENT" --output "$encrypted_path" "$database_path"
sftp_batch <<EOF
put $encrypted_path $remote_partial_directory/database.dump.age
EOF
rm --force -- "$database_path" "$encrypted_path"

export AZCOPY_AUTO_LOGIN_TYPE=MSI
export AZCOPY_MSI_CLIENT_ID="$AZURE_STORAGE_IDENTITY_CLIENT_ID"

azcopy list "${PRODUCTION_MEDIA_CONTAINER_URL%/}" --machine-readable --output-type=json \
  | jq --raw-output 'select(.MessageType == "ListObject") | .MessageContent | fromjson | .Path' \
  | LC_ALL=C sort --unique >"$blob_names_path"

urlencode() {
  jq --null-input --raw-output --arg value "$1" '$value | @uri'
}

blob_count=0
while IFS= read -r blob_name <&3; do
  [[ -n "$blob_name" ]] || continue
  archive_name="$(printf '%s' "$blob_name" | sha256sum | cut --delimiter ' ' --fields 1).age"
  rm --force -- "$blob_path" "$encrypted_path"
  azcopy copy "${PRODUCTION_MEDIA_CONTAINER_URL%/}/$(urlencode "$blob_name")" "$blob_path" --overwrite=true --output-type=text </dev/null
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
done 3<"$blob_names_path"

jq --null-input \
  --arg backupName "$backup_name" \
  --arg createdAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --arg databaseSha256 "$database_checksum" \
  --argjson databaseSize "$database_size" \
  --arg deployedSourceSha "$DEPLOYED_SOURCE_SHA" \
  --arg imageReference "$PRODUCTION_IMAGE_REFERENCE" \
  --arg operationsImageReference "$OPERATIONS_IMAGE_REFERENCE" \
  --argjson migrationState "$migration_state" \
  --argjson blobCount "$blob_count" \
  --slurpfile blobs "$manifest_entries" \
  '{formatVersion: 1, backupName: $backupName, createdAt: $createdAt, database: {archiveFile: "database.dump.age", sha256: $databaseSha256, size: $databaseSize}, deployedSourceSha: $deployedSourceSha, imageReference: $imageReference, operationsImageReference: $operationsImageReference, migrationState: $migrationState, blobCount: $blobCount, blobs: $blobs}' \
  >"$manifest_path"

rm --force -- "$encrypted_path"
age --recipient "$AGE_RECIPIENT" --output "$encrypted_path" "$manifest_path"
ssh-keygen -Y sign -q -f "$sftp_private_key_file" -n wkf-production-backup "$encrypted_path"
sftp_batch <<EOF
put $encrypted_path $remote_partial_directory/manifest.json.age
put $encrypted_path.sig $remote_partial_directory/manifest.json.age.sig
rename $remote_partial_directory $remote_final_directory
ls $remote_final_directory/manifest.json.age
ls $remote_final_directory/manifest.json.age.sig
EOF

echo "Published complete encrypted off-site backup: $backup_name ($blob_count blobs)."
