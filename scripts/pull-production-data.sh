#!/usr/bin/env bash

# Replaces local PostgreSQL and Azurite data with a validated production off-site backup.

set -Eeuo pipefail
umask 077

backup_name="${1:-}"
import_confirmation="${2:-}"
project_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
age_identity_input="${PRODUCTION_BACKUP_AGE_IDENTITY_FILE:-}"
operations_image="${PRODUCTION_PULL_OPERATIONS_IMAGE:-wkf-operations:local}"
local_backup_directory_input="${PRODUCTION_BACKUP_LOCAL_DIRECTORY:-}"
ssh_source="${PRODUCTION_BACKUP_SSH_SOURCE:-forseti@s47.mydevil.net}"
archive_directory="${PRODUCTION_BACKUP_ARCHIVE_DIRECTORY:-/usr/home/forseti/remote-backups/wkf/repository-v3/snapshots}"
temporary_directory=""

fail() {
  echo "ERROR: $*" >&2
  exit 1
}

cleanup() {
  local exit_status=$?
  trap - EXIT INT TERM
  if [[ -n "$temporary_directory" && -d "$temporary_directory" ]]; then
    rm --recursive --force -- "$temporary_directory"
  fi
  exit "$exit_status"
}

validate_blob_name() {
  local blob_name="$1"
  if [[ -z "$blob_name" || "$blob_name" == /* || "/$blob_name/" == *'/../'* ]]; then
    fail "Unsafe production blob name: $blob_name"
  fi
  if [[ "$blob_name" == *$'\n'* || "$blob_name" == *$'\r'* ]]; then
    fail 'Production blob names containing line breaks are not supported.'
  fi
}

if [[ ! "$backup_name" =~ ^production-[0-9]{8}T[0-9]{6}Z$ ]]; then
  fail 'Backup name must use the production-YYYYMMDDTHHMMSSZ format.'
fi
if [[ -z "$age_identity_input" || ! -r "$age_identity_input" || ! -f "$age_identity_input" ]]; then
  fail 'Set PRODUCTION_BACKUP_AGE_IDENTITY_FILE to the readable local age private-key file.'
fi
if [[ "$import_confirmation" != 'IMPORT' ]]; then
  if [[ -t 0 ]]; then
    echo 'This will replace the local PostgreSQL database and every blob in local Azurite.'
    printf 'Type IMPORT to continue: '
    read -r import_confirmation
  fi
  if [[ "$import_confirmation" != 'IMPORT' ]]; then
    fail 'Production import requires the exact confirmation value IMPORT.'
  fi
fi
if [[ "${PRODUCTION_PULL_REBUILD_OPERATIONS_IMAGE:-true}" != 'true' \
  && "${PRODUCTION_PULL_REBUILD_OPERATIONS_IMAGE:-true}" != 'false' ]]; then
  fail 'PRODUCTION_PULL_REBUILD_OPERATIONS_IMAGE must be true or false.'
fi

for required_command in docker git jq rsync sha256sum; do
  if ! command -v "$required_command" >/dev/null; then
    fail "Required command is unavailable: $required_command"
  fi
done

cd "$project_directory"
temporary_directory="$(mktemp --directory)"
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

backup_directory="$temporary_directory/$backup_name"
mkdir --parents -- "$backup_directory"
if [[ -n "$local_backup_directory_input" ]]; then
  local_backup_directory="$(realpath -- "$local_backup_directory_input")"
  if [[ ! -d "$local_backup_directory" ]]; then
    fail "Local production backup directory does not exist: $local_backup_directory_input"
  fi
  rsync --archive --protect-args "$local_backup_directory/" "$backup_directory/"
else
  if [[ ! "$ssh_source" =~ ^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$ ]]; then
    fail 'PRODUCTION_BACKUP_SSH_SOURCE must use the user@host form.'
  fi
  if [[ "$archive_directory" != /* || "/$archive_directory/" == *'/../'* ]]; then
    fail 'PRODUCTION_BACKUP_ARCHIVE_DIRECTORY must be an absolute path without parent-directory segments.'
  fi
  rsync --archive --protect-args \
    "$ssh_source:$archive_directory/$backup_name/" \
    "$backup_directory/"
fi

if [[ ! -f "$backup_directory/.complete" ]]; then
  fail 'The selected production backup is incomplete.'
fi

if [[ "${PRODUCTION_PULL_REBUILD_OPERATIONS_IMAGE:-true}" == 'true' ]]; then
  docker build --file Dockerfile.operations --tag "$operations_image" .
elif ! docker image inspect "$operations_image" >/dev/null 2>&1; then
  fail "Operations image does not exist locally: $operations_image"
fi

age_identity_file="$(realpath -- "$age_identity_input")"
extracted_directory="$temporary_directory/extracted"
mkdir --parents -- "$extracted_directory"
docker run --rm --network none --read-only --user 0:0 \
  --cap-drop ALL \
  --cap-add DAC_READ_SEARCH \
  --cap-add DAC_OVERRIDE \
  --cap-add CHOWN \
  --security-opt no-new-privileges \
  --tmpfs /tmp:rw,nosuid,nodev,noexec,size=1g \
  --env AGE_IDENTITY_FILE=/run/age/identity.txt \
  --env OFFSITE_EXTRACT_OUTPUT_UID="$(id -u)" \
  --env OFFSITE_EXTRACT_OUTPUT_GID="$(id -g)" \
  --volume "$backup_directory:/backup:ro" \
  --volume "$age_identity_file:/run/age/identity.txt:ro" \
  --volume "$extracted_directory:/output" \
  "$operations_image" \
  /opt/wkf/extract-offsite-backup.sh /backup /output/validated

validated_directory="$extracted_directory/validated"
manifest_path="$validated_directory/manifest.json"
database_dump_path="$validated_directory/database.dump"
media_manifest_path="$validated_directory/media-manifest.json"
if [[ "$(jq --raw-output '.backupName' "$manifest_path")" != "$backup_name" ]]; then
  fail 'The authenticated manifest belongs to another production backup.'
fi

local_checkpoint_name="${backup_name,,}"
checkpoint_root="$temporary_directory/local-checkpoint"
checkpoint_directory="$checkpoint_root/$local_checkpoint_name"
checkpoint_media_directory="$checkpoint_directory/media"
mkdir --parents -- "$checkpoint_media_directory"
cp -- "$database_dump_path" "$checkpoint_directory/database.dump"
printf '%s  database.dump\n' "$(sha256sum "$database_dump_path" | cut --delimiter ' ' --fields 1)" \
  >"$checkpoint_directory/database.sha256"

expected_blob_count="$(jq --raw-output '.blobCount' "$manifest_path")"
deployed_source_sha="$(jq --raw-output '.deployedSourceSha' "$manifest_path")"
jq --null-input \
  --arg checkpointName "$local_checkpoint_name" \
  --arg deployedSourceSha "$deployed_source_sha" \
  --argjson mediaBlobCount "$expected_blob_count" \
  '{checkpointName: $checkpointName, deployedSourceSha: $deployedSourceSha, mediaBlobCount: $mediaBlobCount}' \
  >"$checkpoint_directory/manifest.json"

staging_media_entries="$temporary_directory/staging-media-entries.jsonl"
: >"$staging_media_entries"
while IFS= read -r entry <&3; do
  blob_name="$(jq --raw-output '.name' <<<"$entry")"
  source_file="$(jq --raw-output '.sourceFile' <<<"$entry")"
  validate_blob_name "$blob_name"
  source_path="$validated_directory/media/$source_file"
  destination_path="$checkpoint_media_directory/$blob_name"
  if [[ ! -f "$source_path" ]]; then
    fail "Extracted production blob is missing: $blob_name"
  fi
  mkdir --parents -- "$(dirname "$destination_path")"
  cp -- "$source_path" "$destination_path"
  jq --compact-output --null-input \
    --arg name "$local_checkpoint_name/media/$blob_name" \
    '{name: $name, properties: {contentSettings: {}}}' \
    >>"$staging_media_entries"
done 3< <(jq --compact-output '.[]' "$media_manifest_path")
jq --slurp '.' "$staging_media_entries" >"$checkpoint_root/staging-media-blobs.json"

STAGING_PULL_LOCAL_CHECKPOINT_ROOT="$checkpoint_root" \
STAGING_PULL_SOURCE_LABEL='production' \
STAGING_PULL_ALLOW_CODE_MISMATCH="${PRODUCTION_PULL_ALLOW_CODE_MISMATCH:-false}" \
  bash scripts/pull-staging-data.sh "$local_checkpoint_name" IMPORT

echo "Imported production off-site backup into the local environment: $backup_name"
