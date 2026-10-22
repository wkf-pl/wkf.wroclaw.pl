#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

backup_directory_input="${1:?Usage: extract-offsite-backup.sh <backup-directory> <output-directory>}"
output_directory_input="${2:?Usage: extract-offsite-backup.sh <backup-directory> <output-directory>}"
output_owner_uid="${OFFSITE_EXTRACT_OUTPUT_UID:-}"
output_owner_gid="${OFFSITE_EXTRACT_OUTPUT_GID:-}"

if [[ -n "$output_owner_uid" && -z "$output_owner_gid" ]] || [[ -z "$output_owner_uid" && -n "$output_owner_gid" ]]; then
  echo 'OFFSITE_EXTRACT_OUTPUT_UID and OFFSITE_EXTRACT_OUTPUT_GID must be provided together.' >&2
  exit 1
fi
if [[ -n "$output_owner_uid" && (! "$output_owner_uid" =~ ^[0-9]+$ || ! "$output_owner_gid" =~ ^[0-9]+$) ]]; then
  echo 'OFFSITE_EXTRACT_OUTPUT_UID and OFFSITE_EXTRACT_OUTPUT_GID must be numeric.' >&2
  exit 1
fi
if [[ -z "${AGE_IDENTITY_FILE:-}" || ! -r "$AGE_IDENTITY_FILE" || ! -f "$AGE_IDENTITY_FILE" ]]; then
  echo 'AGE_IDENTITY_FILE must point to a readable file.' >&2
  exit 1
fi
if [[ ! -d "$backup_directory_input" ]]; then
  echo "Backup directory does not exist: $backup_directory_input" >&2
  exit 1
fi

backup_directory="$(realpath -- "$backup_directory_input")"
output_directory="$(realpath --canonicalize-missing -- "$output_directory_input")"
if [[ -e "$output_directory" ]]; then
  echo "Extraction output already exists: $output_directory" >&2
  exit 1
fi

temporary_directory="$(mktemp --directory)"
extraction_succeeded=false
cleanup() {
  rm --recursive --force -- "$temporary_directory"
  if [[ "$extraction_succeeded" != 'true' ]]; then
    rm --recursive --force -- "$output_directory"
  fi
}
trap cleanup EXIT INT TERM

bash "$(dirname "$0")/validate-offsite-backup.sh" "$backup_directory"

mkdir --parents -- "$output_directory/media"
manifest_path="$output_directory/manifest.json"
database_path="$output_directory/database.dump"
media_manifest_path="$output_directory/media-manifest.json"

age --decrypt \
  --identity "$AGE_IDENTITY_FILE" \
  --output "$manifest_path" \
  "$backup_directory/manifest.json.age"
database_archive="$(jq --raw-output '.database.archiveFile' "$manifest_path")"
age --decrypt \
  --identity "$AGE_IDENTITY_FILE" \
  --output "$database_path" \
  "$backup_directory/$database_archive"

if [[ "$(wc --bytes <"$database_path")" != "$(jq --raw-output '.database.size' "$manifest_path")" \
  || "$(sha256sum "$database_path" | cut --delimiter ' ' --fields 1)" != "$(jq --raw-output '.database.sha256' "$manifest_path")" ]]; then
  echo 'Extracted database does not match the authenticated manifest.' >&2
  exit 1
fi
pg_restore --list "$database_path" >/dev/null

media_entries="$temporary_directory/media-entries.jsonl"
: >"$media_entries"
while IFS= read -r entry <&3; do
  archive_file="$(jq --raw-output '.archiveFile' <<<"$entry")"
  source_file="${archive_file#blobs/}"
  source_file="${source_file%.age}"
  blob_path="$output_directory/media/$source_file"
  age --decrypt \
    --identity "$AGE_IDENTITY_FILE" \
    --output "$blob_path" \
    "$backup_directory/$archive_file"
  if [[ "$(wc --bytes <"$blob_path")" != "$(jq --raw-output '.size' <<<"$entry")" \
    || "$(sha256sum "$blob_path" | cut --delimiter ' ' --fields 1)" != "$(jq --raw-output '.sha256' <<<"$entry")" ]]; then
    echo "Extracted blob does not match the authenticated manifest: $(jq --raw-output '.name' <<<"$entry")" >&2
    exit 1
  fi
  jq --compact-output --arg sourceFile "$source_file" '. + {sourceFile: $sourceFile}' <<<"$entry" >>"$media_entries"
done 3< <(jq --compact-output '.blobs[]' "$manifest_path")

jq --slurp '.' "$media_entries" >"$media_manifest_path"
if [[ "$(jq 'length' "$media_manifest_path")" != "$(jq --raw-output '.blobCount' "$manifest_path")" ]]; then
  echo 'Extracted media count does not match the authenticated manifest.' >&2
  exit 1
fi

if [[ -n "$output_owner_uid" ]]; then
  chown --recursive "$output_owner_uid:$output_owner_gid" "$output_directory"
fi
extraction_succeeded=true
echo "Extracted validated off-site backup: $(jq --raw-output '.backupName' "$manifest_path")"
