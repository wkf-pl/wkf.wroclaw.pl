#!/usr/bin/env bash

set -Eeuo pipefail

backup_directory="${1:?Usage: validate-offsite-backup.sh <downloaded-backup-directory>}"

if [[ -z "${AGE_IDENTITY_FILE:-}" ]]; then
  echo 'AGE_IDENTITY_FILE is required.' >&2
  exit 1
fi

temporary_directory="$(mktemp --directory)"
cleanup() {
  rm --recursive --force -- "$temporary_directory"
}
trap cleanup EXIT INT TERM

manifest_path="$temporary_directory/manifest.json"
age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$manifest_path" "$backup_directory/manifest.json.age"

database_path="$temporary_directory/database.dump"
age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$database_path" "$backup_directory/$(jq --raw-output '.database.archiveFile' "$manifest_path")"
if [[ "$(sha256sum "$database_path" | cut --delimiter ' ' --fields 1)" != "$(jq --raw-output '.database.sha256' "$manifest_path")" ]]; then
  echo 'Database checksum does not match the backup manifest.' >&2
  exit 1
fi
pg_restore --list "$database_path" >/dev/null

validated_blob_count=0
while IFS= read -r entry; do
  archive_file="$(jq --raw-output '.archiveFile' <<<"$entry")"
  expected_checksum="$(jq --raw-output '.sha256' <<<"$entry")"
  expected_size="$(jq --raw-output '.size' <<<"$entry")"
  blob_path="$temporary_directory/blob"
  rm --force -- "$blob_path"
  age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$blob_path" "$backup_directory/$archive_file"
  if [[ "$(wc --bytes <"$blob_path")" != "$expected_size" || "$(sha256sum "$blob_path" | cut --delimiter ' ' --fields 1)" != "$expected_checksum" ]]; then
    echo "Blob validation failed: $(jq --raw-output '.name' <<<"$entry")" >&2
    exit 1
  fi
  validated_blob_count=$((validated_blob_count + 1))
done < <(jq --compact-output '.blobs[]' "$manifest_path")

if [[ "$validated_blob_count" != "$(jq --raw-output '.blobCount' "$manifest_path")" ]]; then
  echo 'Validated blob count does not match the backup manifest.' >&2
  exit 1
fi

echo "Backup validation succeeded: $(jq --raw-output '.backupName' "$manifest_path") ($validated_blob_count blobs)."
