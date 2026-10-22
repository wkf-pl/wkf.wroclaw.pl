#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

backup_name="${1:?Usage: download-restore-descriptor-ftps.sh <backup-name> <output-directory>}"
output_directory_input="${2:?Usage: download-restore-descriptor-ftps.sh <backup-name> <output-directory>}"

for variable_name in FTPS_HOST FTPS_PASSWORD FTPS_PORT FTPS_REMOTE_ROOT FTPS_USER RESTORE_ALLOWED_SIGNERS_FILE; do
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

output_directory="$(realpath --canonicalize-missing -- "$output_directory_input")"
if [[ -e "$output_directory" ]]; then
  echo "Descriptor output already exists: $output_directory" >&2
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
mkdir --parents -- "$output_directory"

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

for artifact_name in .complete restore-descriptor.json restore-descriptor.json.sig; do
  curl \
    --disable \
    --config "$curl_config_file" \
    --connect-timeout 30 \
    --fail \
    --ftp-pasv \
    --max-time 120 \
    --output "$output_directory/$artifact_name" \
    --proto '=ftp' \
    --retry 3 \
    --retry-all-errors \
    --retry-delay 2 \
    --show-error \
    --silent \
    --ssl-reqd \
    "${ftps_base_url}${remote_backup_directory}/${artifact_name}"
done

operations_image_reference="$(
  bash "$(dirname "$0")/validate-restore-descriptor.sh" "$output_directory" "$backup_name"
)"
download_succeeded=true
printf '%s\n' "$operations_image_reference"
