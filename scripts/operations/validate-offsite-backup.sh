#!/usr/bin/env bash

set -Eeuo pipefail

backup_directory="${1:?Usage: validate-offsite-backup.sh <downloaded-backup-directory>}"

for variable_name in AGE_IDENTITY_FILE BACKUP_ALLOWED_SIGNERS_FILE; do
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

manifest_path="$temporary_directory/manifest.json"
if [[ ! -f "$backup_directory/manifest.json.age" || ! -f "$backup_directory/manifest.json.age.sig" ]]; then
  echo 'Encrypted backup manifest or its signature is missing.' >&2
  exit 1
fi
if ! ssh-keygen \
  -Y verify \
  -f "$BACKUP_ALLOWED_SIGNERS_FILE" \
  -I wkf-production-backup \
  -n wkf-production-backup \
  -s "$backup_directory/manifest.json.age.sig" \
  <"$backup_directory/manifest.json.age" >/dev/null; then
  echo 'Backup manifest signature verification failed.' >&2
  exit 1
fi
age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$manifest_path" "$backup_directory/manifest.json.age"

if ! jq --exit-status '
  .blobCount as $blobCount
  | .formatVersion == 1
  and (.backupName | type == "string" and test("^production-[0-9]{8}T[0-9]{6}Z$"))
  and (.createdAt | type == "string")
  and (.deployedSourceSha | type == "string" and test("^[a-f0-9]{40}$"))
  and (.imageReference | type == "string" and test("@sha256:[a-f0-9]{64}$"))
  and (.operationsImageReference | type == "string" and test("@sha256:[a-f0-9]{64}$"))
  and (.migrationState | type == "array")
  and .database.archiveFile == "database.dump.age"
  and (.database.sha256 | type == "string" and test("^[a-f0-9]{64}$"))
  and (.database.size | type == "number" and . >= 0 and floor == .)
  and (.blobCount | type == "number" and . >= 0 and floor == .)
  and (.blobs | type == "array" and length == $blobCount)
  and all(.blobs[];
    (.archiveFile | type == "string" and test("^blobs/[a-f0-9]{64}\\.age$"))
    and (.name | type == "string" and length > 0)
    and (.sha256 | type == "string" and test("^[a-f0-9]{64}$"))
    and (.size | type == "number" and . >= 0 and floor == .)
  )
  and ([.blobs[].archiveFile] | unique | length) == $blobCount
  and ([.blobs[].name] | unique | length) == $blobCount
' "$manifest_path" >/dev/null; then
  echo 'Backup manifest has an invalid or unsupported structure.' >&2
  exit 1
fi

database_path="$temporary_directory/database.dump"
database_archive="$backup_directory/$(jq --raw-output '.database.archiveFile' "$manifest_path")"
if [[ ! -f "$database_archive" ]]; then
  echo 'Encrypted database archive is missing.' >&2
  exit 1
fi
age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$database_path" "$database_archive"
if [[ "$(wc --bytes <"$database_path")" != "$(jq --raw-output '.database.size' "$manifest_path")" || "$(sha256sum "$database_path" | cut --delimiter ' ' --fields 1)" != "$(jq --raw-output '.database.sha256' "$manifest_path")" ]]; then
  echo 'Database checksum does not match the backup manifest.' >&2
  exit 1
fi
pg_restore --list "$database_path" >/dev/null

validated_blob_count=0
while IFS= read -r entry <&3; do
  archive_file="$(jq --raw-output '.archiveFile' <<<"$entry")"
  expected_checksum="$(jq --raw-output '.sha256' <<<"$entry")"
  expected_size="$(jq --raw-output '.size' <<<"$entry")"
  if [[ ! -f "$backup_directory/$archive_file" ]]; then
    echo "Encrypted blob archive is missing: $(jq --raw-output '.name' <<<"$entry")" >&2
    exit 1
  fi
  blob_path="$temporary_directory/blob"
  rm --force -- "$blob_path"
  age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$blob_path" "$backup_directory/$archive_file"
  if [[ "$(wc --bytes <"$blob_path")" != "$expected_size" || "$(sha256sum "$blob_path" | cut --delimiter ' ' --fields 1)" != "$expected_checksum" ]]; then
    echo "Blob validation failed: $(jq --raw-output '.name' <<<"$entry")" >&2
    exit 1
  fi
  validated_blob_count=$((validated_blob_count + 1))
done 3< <(jq --compact-output '.blobs[]' "$manifest_path")

if [[ "$validated_blob_count" != "$(jq --raw-output '.blobCount' "$manifest_path")" ]]; then
  echo 'Validated blob count does not match the backup manifest.' >&2
  exit 1
fi

echo "Backup validation succeeded: $(jq --raw-output '.backupName' "$manifest_path") ($validated_blob_count blobs)."
