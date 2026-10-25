#!/usr/bin/env bash

set -Eeuo pipefail

for variable_name in AGE_RECIPIENT AZURE_STORAGE_IDENTITY_CLIENT_ID DEPLOYED_SOURCE_SHA FTPS_HOST FTPS_PASSWORD FTPS_PORT FTPS_REMOTE_ROOT FTPS_USER OPERATIONS_IMAGE_REFERENCE POSTGRES_BACKUP_URL PRODUCTION_IMAGE_REFERENCE PRODUCTION_MEDIA_CONTAINER_URL; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "$variable_name is required." >&2
    exit 1
  fi
done

if [[ -z "${BACKUP_SIGNING_PRIVATE_KEY_FILE:-}" && -z "${BACKUP_SIGNING_PRIVATE_KEY:-}" ]]; then
  echo 'BACKUP_SIGNING_PRIVATE_KEY_FILE or BACKUP_SIGNING_PRIVATE_KEY is required.' >&2
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
if [[ ! "$FTPS_HOST" =~ ^[a-zA-Z0-9.-]+$ || ! "$FTPS_USER" =~ ^[a-zA-Z0-9._-]+$ ]]; then
  echo 'FTPS_HOST or FTPS_USER contains unsupported characters.' >&2
  exit 1
fi
if [[ ! "$FTPS_PORT" =~ ^[0-9]+$ ]] || ((FTPS_PORT < 1 || FTPS_PORT > 65535)); then
  echo 'FTPS_PORT must be an integer from 1 to 65535.' >&2
  exit 1
fi
if [[ ! "$FTPS_REMOTE_ROOT" =~ ^/?[a-zA-Z0-9._/-]*$ || "/$FTPS_REMOTE_ROOT/" == *'/../'* ]]; then
  echo 'FTPS_REMOTE_ROOT must be a simple path without parent-directory segments.' >&2
  exit 1
fi
if [[ "$FTPS_PASSWORD" == *$'\n'* || "$FTPS_PASSWORD" == *$'\r'* ]]; then
  echo 'FTPS_PASSWORD must not contain line breaks.' >&2
  exit 1
fi

backup_name="${BACKUP_NAME:-production-$(date -u +%Y%m%dT%H%M%SZ)}"
if [[ ! "$backup_name" =~ ^production-[0-9]{8}T[0-9]{6}Z$ ]]; then
  echo 'BACKUP_NAME must use the production-YYYYMMDDTHHMMSSZ format.' >&2
  exit 1
fi

temporary_directory="$(mktemp --directory)"
cleanup() {
  rm --recursive --force -- "$temporary_directory"
}
trap cleanup EXIT INT TERM

if [[ -n "${BACKUP_SIGNING_PRIVATE_KEY_FILE:-}" ]]; then
  signing_private_key_file="$BACKUP_SIGNING_PRIVATE_KEY_FILE"
else
  signing_private_key_file="$temporary_directory/manifest-signing-key"
  (umask 077 && printf '%s\n' "$BACKUP_SIGNING_PRIVATE_KEY" >"$signing_private_key_file")
fi
signing_public_key_file="${BACKUP_SIGNING_PUBLIC_KEY_FILE:-/opt/wkf/wkf-backup-manifest-signing.pub}"
if [[ ! -r "$signing_private_key_file" || ! -r "$signing_public_key_file" ]]; then
  echo 'The manifest signing private or public key is not readable.' >&2
  exit 1
fi

expected_public_key="$(awk 'NR == 1 { print $1 " " $2 }' "$signing_public_key_file")"
derived_public_key="$(ssh-keygen -y -P '' -f "$signing_private_key_file" 2>/dev/null | awk 'NR == 1 { print $1 " " $2 }')"
if [[ -z "$expected_public_key" || "$derived_public_key" != "$expected_public_key" ]]; then
  echo 'The manifest signing private key does not match the trusted public key.' >&2
  exit 1
fi
signing_key_fingerprint="$(ssh-keygen -lf "$signing_public_key_file" -E sha256 | awk '{ print $2 }')"

curl_config_escape() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '%s' "$value"
}

curl_config_file="$temporary_directory/curl.config"
(umask 077 && printf 'user = "%s:%s"\n' "$(curl_config_escape "$FTPS_USER")" "$(curl_config_escape "$FTPS_PASSWORD")" >"$curl_config_file")

remote_root="${FTPS_REMOTE_ROOT%/}"
if [[ -n "$remote_root" && "$remote_root" != /* ]]; then
  remote_root="/$remote_root"
fi
remote_backup_directory="$remote_root/$backup_name"
ftps_base_url="ftp://${FTPS_HOST}:${FTPS_PORT}"

upload_ftps_file() {
  local local_path="$1"
  local remote_path="$2"

  curl \
    --disable \
    --config "$curl_config_file" \
    --connect-timeout 30 \
    --fail \
    --ftp-create-dirs \
    --ftp-pasv \
    --max-time 7200 \
    --proto '=ftp' \
    --retry 3 \
    --retry-all-errors \
    --retry-delay 2 \
    --show-error \
    --silent \
    --ssl-reqd \
    --upload-file "$local_path" \
    "${ftps_base_url}${remote_path}"
}

manifest_entries="$temporary_directory/blob-entries.jsonl"
storage_object_entries="$temporary_directory/storage-object-entries.jsonl"
manifest_path="$temporary_directory/manifest.json"
storage_manifest_path="$temporary_directory/storage-manifest.json"
blob_names_path="$temporary_directory/blob-names.txt"
database_path="$temporary_directory/database.dump"
blob_path="$temporary_directory/blob"
encrypted_path="$temporary_directory/artifact.age"
completion_marker_path="$temporary_directory/.complete"
uploaded_objects_directory="$temporary_directory/uploaded-objects"

: >"$manifest_entries"
: >"$storage_object_entries"
mkdir --parents -- "$uploaded_objects_directory"

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
database_ciphertext_checksum="$(sha256sum "$encrypted_path" | cut --delimiter ' ' --fields 1)"
database_ciphertext_size="$(wc --bytes <"$encrypted_path")"
upload_ftps_file "$encrypted_path" "$remote_backup_directory/database.dump.age"
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
unique_blob_count=0
while IFS= read -r blob_name <&3; do
  [[ -n "$blob_name" ]] || continue
  rm --force -- "$blob_path" "$encrypted_path"
  azcopy copy "${PRODUCTION_MEDIA_CONTAINER_URL%/}/$(urlencode "$blob_name")" "$blob_path" --overwrite=true --output-type=text </dev/null
  clear_checksum="$(sha256sum "$blob_path" | cut --delimiter ' ' --fields 1)"
  clear_size="$(wc --bytes <"$blob_path")"
  archive_name="$clear_checksum.age"
  if [[ ! -e "$uploaded_objects_directory/$clear_checksum" ]]; then
    age --recipient "$AGE_RECIPIENT" --output "$encrypted_path" "$blob_path"
    ciphertext_checksum="$(sha256sum "$encrypted_path" | cut --delimiter ' ' --fields 1)"
    ciphertext_size="$(wc --bytes <"$encrypted_path")"
    upload_ftps_file "$encrypted_path" "$remote_backup_directory/blobs/$archive_name"
    jq --compact-output --null-input \
      --arg archiveFile "blobs/$archive_name" \
      --arg plaintextSha256 "$clear_checksum" \
      --argjson plaintextSize "$clear_size" \
      --arg ciphertextSha256 "$ciphertext_checksum" \
      --argjson ciphertextSize "$ciphertext_size" \
      '{archiveFile: $archiveFile, plaintextSha256: $plaintextSha256, plaintextSize: $plaintextSize, ciphertextSha256: $ciphertextSha256, ciphertextSize: $ciphertextSize}' >>"$storage_object_entries"
    : >"$uploaded_objects_directory/$clear_checksum"
    unique_blob_count=$((unique_blob_count + 1))
  fi
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
  --arg signingKeyFingerprint "$signing_key_fingerprint" \
  --argjson migrationState "$migration_state" \
  --argjson blobCount "$blob_count" \
  --argjson uniqueBlobCount "$unique_blob_count" \
  --slurpfile blobs "$manifest_entries" \
  '{formatVersion: 3, backupName: $backupName, createdAt: $createdAt, database: {archiveFile: "database.dump.age", sha256: $databaseSha256, size: $databaseSize}, deployedSourceSha: $deployedSourceSha, imageReference: $imageReference, operationsImageReference: $operationsImageReference, signingKeyFingerprint: $signingKeyFingerprint, migrationState: $migrationState, blobCount: $blobCount, uniqueBlobCount: $uniqueBlobCount, blobs: $blobs}' \
  >"$manifest_path"

rm --force -- "$encrypted_path"
age --recipient "$AGE_RECIPIENT" --output "$encrypted_path" "$manifest_path"
ssh-keygen -Y sign -q -f "$signing_private_key_file" -n wkf-production-backup "$encrypted_path"

upload_ftps_file "$encrypted_path" "$remote_backup_directory/manifest.json.age"
upload_ftps_file "$encrypted_path.sig" "$remote_backup_directory/manifest.json.age.sig"

manifest_checksum="$(sha256sum "$encrypted_path" | cut --delimiter ' ' --fields 1)"
manifest_size="$(wc --bytes <"$encrypted_path")"
signature_checksum="$(sha256sum "$encrypted_path.sig" | cut --delimiter ' ' --fields 1)"
signature_size="$(wc --bytes <"$encrypted_path.sig")"

jq --null-input \
  --arg backupName "$backup_name" \
  --arg databaseCiphertextSha256 "$database_ciphertext_checksum" \
  --argjson databaseCiphertextSize "$database_ciphertext_size" \
  --arg manifestCiphertextSha256 "$manifest_checksum" \
  --argjson manifestCiphertextSize "$manifest_size" \
  --arg manifestSignatureSha256 "$signature_checksum" \
  --argjson manifestSignatureSize "$signature_size" \
  --argjson objectCount "$unique_blob_count" \
  --slurpfile objects "$storage_object_entries" \
  '{formatVersion: 1, backupName: $backupName, database: {archiveFile: "database.dump.age", ciphertextSha256: $databaseCiphertextSha256, ciphertextSize: $databaseCiphertextSize}, manifest: {archiveFile: "manifest.json.age", ciphertextSha256: $manifestCiphertextSha256, ciphertextSize: $manifestCiphertextSize}, manifestSignature: {archiveFile: "manifest.json.age.sig", ciphertextSha256: $manifestSignatureSha256, ciphertextSize: $manifestSignatureSize}, objectCount: $objectCount, objects: $objects}' \
  >"$storage_manifest_path"
ssh-keygen -Y sign -q -f "$signing_private_key_file" -n wkf-production-backup-storage "$storage_manifest_path"
upload_ftps_file "$storage_manifest_path" "$remote_backup_directory/storage-manifest.json"
upload_ftps_file "$storage_manifest_path.sig" "$remote_backup_directory/storage-manifest.json.sig"

storage_manifest_checksum="$(sha256sum "$storage_manifest_path" | cut --delimiter ' ' --fields 1)"
storage_manifest_signature_checksum="$(sha256sum "$storage_manifest_path.sig" | cut --delimiter ' ' --fields 1)"
{
  echo 'formatVersion=3'
  echo "backupName=$backup_name"
  echo "manifestSha256=$manifest_checksum"
  echo "signatureSha256=$signature_checksum"
  echo "storageManifestSha256=$storage_manifest_checksum"
  echo "storageManifestSignatureSha256=$storage_manifest_signature_checksum"
  echo "completedAt=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
} >"$completion_marker_path"

# The marker is deliberately uploaded last. MyDevil must never archive a directory without it.
upload_ftps_file "$completion_marker_path" "$remote_backup_directory/.complete"

echo "Published complete encrypted off-site backup: $backup_name ($blob_count blobs, $unique_blob_count unique objects)."
