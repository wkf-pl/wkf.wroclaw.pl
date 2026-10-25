#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

backup_name="${1:?Usage: download-offsite-backup-ftps.sh <backup-name> <output-parent-directory>}"
output_parent_input="${2:?Usage: download-offsite-backup-ftps.sh <backup-name> <output-parent-directory>}"
output_owner_uid="${FTPS_DOWNLOAD_OUTPUT_UID:-}"
output_owner_gid="${FTPS_DOWNLOAD_OUTPUT_GID:-}"

for variable_name in AGE_IDENTITY_FILE FTPS_HOST FTPS_PASSWORD FTPS_PORT FTPS_REMOTE_ROOT FTPS_USER; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "$variable_name is required." >&2
    exit 1
  fi
done

if [[ ! "$backup_name" =~ ^production-[0-9]{8}T[0-9]{6}Z$ ]]; then
  echo 'Backup name must use the production-YYYYMMDDTHHMMSSZ format.' >&2
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
if [[ ! -r "$AGE_IDENTITY_FILE" || ! -f "$AGE_IDENTITY_FILE" ]]; then
  echo 'AGE_IDENTITY_FILE must point to a readable file.' >&2
  exit 1
fi
if [[ -n "$output_owner_uid" && -z "$output_owner_gid" ]] || [[ -z "$output_owner_uid" && -n "$output_owner_gid" ]]; then
  echo 'FTPS_DOWNLOAD_OUTPUT_UID and FTPS_DOWNLOAD_OUTPUT_GID must be provided together.' >&2
  exit 1
fi
if [[ -n "$output_owner_uid" && (! "$output_owner_uid" =~ ^[0-9]+$ || ! "$output_owner_gid" =~ ^[0-9]+$) ]]; then
  echo 'FTPS_DOWNLOAD_OUTPUT_UID and FTPS_DOWNLOAD_OUTPUT_GID must be numeric.' >&2
  exit 1
fi

allowed_signers_file="${BACKUP_ALLOWED_SIGNERS_FILE:-/opt/wkf/wkf-backup-allowed-signers}"
signing_public_key_file="${BACKUP_SIGNING_PUBLIC_KEY_FILE:-/opt/wkf/wkf-backup-manifest-signing.pub}"
if [[ ! -r "$allowed_signers_file" || ! -r "$signing_public_key_file" ]]; then
  echo 'The trusted manifest signer files are not readable.' >&2
  exit 1
fi

output_parent="$(realpath --canonicalize-missing -- "$output_parent_input")"
output_directory="$output_parent/$backup_name"
if [[ -e "$output_directory" ]]; then
  echo "Backup output already exists: $output_directory" >&2
  exit 1
fi

temporary_directory="$(mktemp --directory)"
download_succeeded=false
cleanup() {
  rm --recursive --force -- "$temporary_directory"
  if [[ "$download_succeeded" != 'true' ]]; then
    rm --recursive --force -- "$output_directory"
  fi
}
trap cleanup EXIT INT TERM

mkdir --parents -- "$output_directory/blobs"

curl_config_file="$temporary_directory/curl.config"
curl_config_escape() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  printf '%s' "$value"
}
(umask 077 && printf 'user = "%s:%s"\n' "$(curl_config_escape "$FTPS_USER")" "$(curl_config_escape "$FTPS_PASSWORD")" >"$curl_config_file")

remote_root="${FTPS_REMOTE_ROOT%/}"
if [[ -n "$remote_root" && "$remote_root" != /* ]]; then
  remote_root="/$remote_root"
fi
remote_backup_directory="$remote_root/$backup_name"
ftps_base_url="ftp://${FTPS_HOST}:${FTPS_PORT}"

download_ftps_file() {
  local remote_path="$1"
  local local_path="$2"

  mkdir --parents -- "$(dirname "$local_path")"
  curl \
    --disable \
    --config "$curl_config_file" \
    --connect-timeout 30 \
    --fail \
    --ftp-pasv \
    --max-time 7200 \
    --output "$local_path" \
    --proto '=ftp' \
    --retry 3 \
    --retry-all-errors \
    --retry-delay 2 \
    --show-error \
    --silent \
    --ssl-reqd \
    "${ftps_base_url}${remote_backup_directory}/${remote_path}"
}

download_ftps_file '.complete' "$output_directory/.complete"
download_ftps_file 'restore-descriptor.json' "$output_directory/restore-descriptor.json"
download_ftps_file 'restore-descriptor.json.sig' "$output_directory/restore-descriptor.json.sig"

descriptor_operations_image="$(
  RESTORE_ALLOWED_SIGNERS_FILE="$allowed_signers_file" \
    bash "$(dirname "$0")/validate-restore-descriptor.sh" "$output_directory" "$backup_name"
)"
download_ftps_file 'manifest.json.age' "$output_directory/manifest.json.age"
download_ftps_file 'manifest.json.age.sig' "$output_directory/manifest.json.age.sig"

completion_manifest_checksum="$(jq --raw-output '.manifest.sha256' "$output_directory/restore-descriptor.json")"
completion_signature_checksum="$(jq --raw-output '.manifestSignature.sha256' "$output_directory/restore-descriptor.json")"
if [[ "$(sha256sum "$output_directory/manifest.json.age" | cut --delimiter ' ' --fields 1)" != "$completion_manifest_checksum" \
  || "$(sha256sum "$output_directory/manifest.json.age.sig" | cut --delimiter ' ' --fields 1)" != "$completion_signature_checksum" ]]; then
  echo 'The signed restore descriptor does not authenticate the downloaded manifest artifacts.' >&2
  exit 1
fi
if ! ssh-keygen \
  -Y verify \
  -f "$allowed_signers_file" \
  -I wkf-production-restore \
  -n wkf-production-restore \
  -s "$output_directory/manifest.json.age.sig" \
  <"$output_directory/manifest.json.age" >/dev/null; then
  echo 'The downloaded backup manifest signature is invalid.' >&2
  exit 1
fi

manifest_path="$temporary_directory/manifest.json"
age --decrypt \
  --identity "$AGE_IDENTITY_FILE" \
  --output "$manifest_path" \
  "$output_directory/manifest.json.age"

if ! jq --exit-status \
  --arg backupName "$backup_name" \
  --arg operationsImageReference "$descriptor_operations_image" \
  '.backupName == $backupName
   and .operationsImageReference == $operationsImageReference
   and .database.archiveFile == "database.dump.age"
   and (.blobs | type == "array")
   and all(.blobs[]; .archiveFile | type == "string" and test("^blobs/[a-f0-9]{64}\\.age$"))' \
  "$manifest_path" >/dev/null; then
  echo 'The authenticated manifest contains unsupported artifact paths.' >&2
  exit 1
fi

download_ftps_file 'database.dump.age' "$output_directory/database.dump.age"
while IFS= read -r archive_file; do
  download_ftps_file "$archive_file" "$output_directory/$archive_file"
done < <(jq --raw-output '.blobs[].archiveFile' "$manifest_path" | LC_ALL=C sort --unique)

BACKUP_SIGNING_IDENTITY='wkf-production-restore' \
  bash "$(dirname "$0")/validate-offsite-backup.sh" "$output_directory"
if [[ -n "$output_owner_uid" ]]; then
  chown --recursive "$output_owner_uid:$output_owner_gid" "$output_directory"
fi
download_succeeded=true
echo "Downloaded and validated restore export: $backup_name"
