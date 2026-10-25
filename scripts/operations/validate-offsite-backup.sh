#!/usr/bin/env bash

set -Eeuo pipefail

backup_directory="${1:?Usage: validate-offsite-backup.sh <downloaded-backup-directory>}"

for variable_name in AGE_IDENTITY_FILE; do
  if [[ -z "${!variable_name:-}" ]]; then
    echo "$variable_name is required." >&2
    exit 1
  fi
done

allowed_signers_file="${BACKUP_ALLOWED_SIGNERS_FILE:-/opt/wkf/wkf-backup-allowed-signers}"
signing_public_key_file="${BACKUP_SIGNING_PUBLIC_KEY_FILE:-/opt/wkf/wkf-backup-manifest-signing.pub}"
signing_identity="${BACKUP_SIGNING_IDENTITY:-wkf-production-backup}"
storage_signing_identity="${BACKUP_STORAGE_SIGNING_IDENTITY:-wkf-production-backup-storage}"
if [[ ! -r "$allowed_signers_file" || ! -r "$signing_public_key_file" ]]; then
  echo 'The trusted manifest signer files are not readable.' >&2
  exit 1
fi

temporary_directory="$(mktemp --directory)"
cleanup() {
  rm --recursive --force -- "$temporary_directory"
}
trap cleanup EXIT INT TERM

manifest_path="$temporary_directory/manifest.json"
completion_marker="$backup_directory/.complete"
encrypted_manifest="$backup_directory/manifest.json.age"
manifest_signature="$backup_directory/manifest.json.age.sig"
if [[ ! -f "$completion_marker" || ! -f "$encrypted_manifest" || ! -f "$manifest_signature" ]]; then
  echo 'Backup completion marker, encrypted manifest, or manifest signature is missing.' >&2
  exit 1
fi

completion_format_version=''
completion_backup_name=''
completion_descriptor_checksum=''
completion_descriptor_signature_checksum=''
completion_manifest_checksum=''
completion_signature_checksum=''
completion_storage_manifest_checksum=''
completion_storage_manifest_signature_checksum=''
completion_timestamp=''
while IFS='=' read -r key value; do
  case "$key" in
    formatVersion) completion_format_version="$value" ;;
    backupName) completion_backup_name="$value" ;;
    descriptorSha256) completion_descriptor_checksum="$value" ;;
    descriptorSignatureSha256) completion_descriptor_signature_checksum="$value" ;;
    manifestSha256) completion_manifest_checksum="$value" ;;
    signatureSha256) completion_signature_checksum="$value" ;;
    storageManifestSha256) completion_storage_manifest_checksum="$value" ;;
    storageManifestSignatureSha256) completion_storage_manifest_signature_checksum="$value" ;;
    completedAt) completion_timestamp="$value" ;;
    *)
      echo 'Backup completion marker has an unsupported field.' >&2
      exit 1
      ;;
  esac
done <"$completion_marker"
if [[ ! "$completion_format_version" =~ ^[23]$ || ! "$completion_backup_name" =~ ^production-[0-9]{8}T[0-9]{6}Z$ || ! "$completion_manifest_checksum" =~ ^[a-f0-9]{64}$ || ! "$completion_signature_checksum" =~ ^[a-f0-9]{64}$ || ! "$completion_timestamp" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$ ]]; then
  echo 'Backup completion marker has an invalid structure.' >&2
  exit 1
fi
descriptor_operations_image=''
if [[ "$completion_format_version" == '2' ]]; then
  if [[ ! "$completion_descriptor_checksum" =~ ^[a-f0-9]{64}$ || ! "$completion_descriptor_signature_checksum" =~ ^[a-f0-9]{64}$ ]]; then
    echo 'Restore completion marker is missing descriptor checksums.' >&2
    exit 1
  fi
  descriptor_operations_image="$(
    RESTORE_ALLOWED_SIGNERS_FILE="$allowed_signers_file" \
      bash "$(dirname "$0")/validate-restore-descriptor.sh" "$backup_directory" "$completion_backup_name"
  )"
elif [[ -n "$completion_descriptor_checksum" || -n "$completion_descriptor_signature_checksum" ]]; then
  echo 'Source backup completion marker unexpectedly contains restore descriptor fields.' >&2
  exit 1
fi
if [[ "$completion_format_version" == '3' ]]; then
  storage_manifest="$backup_directory/storage-manifest.json"
  storage_manifest_signature="$backup_directory/storage-manifest.json.sig"
  if [[ ! "$completion_storage_manifest_checksum" =~ ^[a-f0-9]{64}$ || ! "$completion_storage_manifest_signature_checksum" =~ ^[a-f0-9]{64}$ || ! -f "$storage_manifest" || ! -f "$storage_manifest_signature" ]]; then
    echo 'Source backup completion marker or storage manifest artifacts are incomplete.' >&2
    exit 1
  fi
  if [[ "$(sha256sum "$storage_manifest" | cut --delimiter ' ' --fields 1)" != "$completion_storage_manifest_checksum" || "$(sha256sum "$storage_manifest_signature" | cut --delimiter ' ' --fields 1)" != "$completion_storage_manifest_signature_checksum" ]]; then
    echo 'Backup completion marker checksums do not match the storage manifest artifacts.' >&2
    exit 1
  fi
  if ! ssh-keygen \
    -Y verify \
    -f "$allowed_signers_file" \
    -I "$storage_signing_identity" \
    -n "$storage_signing_identity" \
    -s "$storage_manifest_signature" \
    <"$storage_manifest" >/dev/null; then
    echo 'Backup storage manifest signature verification failed.' >&2
    exit 1
  fi
elif [[ -n "$completion_storage_manifest_checksum" || -n "$completion_storage_manifest_signature_checksum" ]]; then
  echo 'Restore completion marker unexpectedly contains storage manifest fields.' >&2
  exit 1
fi
if [[ "$(sha256sum "$encrypted_manifest" | cut --delimiter ' ' --fields 1)" != "$completion_manifest_checksum" || "$(sha256sum "$manifest_signature" | cut --delimiter ' ' --fields 1)" != "$completion_signature_checksum" ]]; then
  echo 'Backup completion marker checksums do not match the manifest artifacts.' >&2
  exit 1
fi
if ! ssh-keygen \
  -Y verify \
  -f "$allowed_signers_file" \
  -I "$signing_identity" \
  -n "$signing_identity" \
  -s "$manifest_signature" \
  <"$encrypted_manifest" >/dev/null; then
  echo 'Backup manifest signature verification failed.' >&2
  exit 1
fi
age --decrypt --identity "$AGE_IDENTITY_FILE" --output "$manifest_path" "$encrypted_manifest"

expected_signing_fingerprint="$(ssh-keygen -lf "$signing_public_key_file" -E sha256 | awk '{ print $2 }')"

if ! jq --exit-status '
  .blobCount as $blobCount
  | .uniqueBlobCount as $uniqueBlobCount
  | .formatVersion == 3
  and (.backupName | type == "string" and test("^production-[0-9]{8}T[0-9]{6}Z$"))
  and (.createdAt | type == "string")
  and (.deployedSourceSha | type == "string" and test("^[a-f0-9]{40}$"))
  and (.imageReference | type == "string" and test("@sha256:[a-f0-9]{64}$"))
  and (.operationsImageReference | type == "string" and test("@sha256:[a-f0-9]{64}$"))
  and (.signingKeyFingerprint | type == "string" and startswith("SHA256:"))
  and (.migrationState | type == "array")
  and .database.archiveFile == "database.dump.age"
  and (.database.sha256 | type == "string" and test("^[a-f0-9]{64}$"))
  and (.database.size | type == "number" and . >= 0 and floor == .)
  and (.blobCount | type == "number" and . >= 0 and floor == .)
  and (.uniqueBlobCount | type == "number" and . >= 0 and . <= $blobCount and floor == .)
  and (.blobs | type == "array" and length == $blobCount)
  and all(.blobs[];
    (.archiveFile | type == "string" and test("^blobs/[a-f0-9]{64}\\.age$"))
    and (.name | type == "string" and length > 0)
    and (.sha256 | type == "string" and test("^[a-f0-9]{64}$"))
    and (.size | type == "number" and . >= 0 and floor == .)
    and .archiveFile == ("blobs/" + .sha256 + ".age")
  )
  and ([.blobs[].archiveFile] | unique | length) == $uniqueBlobCount
  and ([.blobs[].sha256] | unique | length) == $uniqueBlobCount
  and ([.blobs | group_by(.sha256)[] | [.[].size] | unique | length] | all(. == 1))
  and ([.blobs[].name] | unique | length) == $blobCount
' "$manifest_path" >/dev/null; then
  echo 'Backup manifest has an invalid or unsupported structure.' >&2
  exit 1
fi

if [[ "$completion_format_version" == '3' ]]; then
  if ! jq --exit-status \
    --arg backupName "$completion_backup_name" '
      .objectCount as $objectCount
      | .formatVersion == 1
      and .backupName == $backupName
      and .database.archiveFile == "database.dump.age"
      and (.database.ciphertextSha256 | type == "string" and test("^[a-f0-9]{64}$"))
      and (.database.ciphertextSize | type == "number" and . >= 0 and floor == .)
      and .manifest.archiveFile == "manifest.json.age"
      and (.manifest.ciphertextSha256 | type == "string" and test("^[a-f0-9]{64}$"))
      and (.manifest.ciphertextSize | type == "number" and . >= 0 and floor == .)
      and .manifestSignature.archiveFile == "manifest.json.age.sig"
      and (.manifestSignature.ciphertextSha256 | type == "string" and test("^[a-f0-9]{64}$"))
      and (.manifestSignature.ciphertextSize | type == "number" and . >= 0 and floor == .)
      and (.objectCount | type == "number" and . >= 0 and floor == .)
      and (.objects | type == "array" and length == $objectCount)
      and all(.objects[];
        (.plaintextSha256 | type == "string" and test("^[a-f0-9]{64}$"))
        and (.plaintextSize | type == "number" and . >= 0 and floor == .)
        and .archiveFile == ("blobs/" + .plaintextSha256 + ".age")
        and (.ciphertextSha256 | type == "string" and test("^[a-f0-9]{64}$"))
        and (.ciphertextSize | type == "number" and . >= 0 and floor == .)
      )
      and ([.objects[].archiveFile] | unique | length) == $objectCount
    ' "$storage_manifest" >/dev/null; then
    echo 'Backup storage manifest has an invalid or unsupported structure.' >&2
    exit 1
  fi

  for artifact_key in database manifest manifestSignature; do
    artifact_path="$(jq --raw-output --arg key "$artifact_key" '.[$key].archiveFile' "$storage_manifest")"
    expected_ciphertext_checksum="$(jq --raw-output --arg key "$artifact_key" '.[$key].ciphertextSha256' "$storage_manifest")"
    expected_ciphertext_size="$(jq --raw-output --arg key "$artifact_key" '.[$key].ciphertextSize' "$storage_manifest")"
    if [[ ! -f "$backup_directory/$artifact_path" || "$(wc --bytes <"$backup_directory/$artifact_path")" != "$expected_ciphertext_size" || "$(sha256sum "$backup_directory/$artifact_path" | cut --delimiter ' ' --fields 1)" != "$expected_ciphertext_checksum" ]]; then
      echo "Storage manifest validation failed for artifact: $artifact_path" >&2
      exit 1
    fi
  done

  if ! jq --exit-status --slurpfile manifest "$manifest_path" '
    ([.objects[] | {sha256: .plaintextSha256, size: .plaintextSize}] | sort_by(.sha256))
    == ([$manifest[0].blobs[] | {sha256, size}] | unique_by(.sha256) | sort_by(.sha256))
    and .objectCount == $manifest[0].uniqueBlobCount
  ' "$storage_manifest" >/dev/null; then
    echo 'Storage manifest objects do not match the encrypted backup manifest.' >&2
    exit 1
  fi

  if [[ ! -f "$backup_directory/.repository-snapshot" ]]; then
    while IFS= read -r entry <&3; do
      archive_file="$(jq --raw-output '.archiveFile' <<<"$entry")"
      expected_ciphertext_checksum="$(jq --raw-output '.ciphertextSha256' <<<"$entry")"
      expected_ciphertext_size="$(jq --raw-output '.ciphertextSize' <<<"$entry")"
      if [[ ! -f "$backup_directory/$archive_file" || "$(wc --bytes <"$backup_directory/$archive_file")" != "$expected_ciphertext_size" || "$(sha256sum "$backup_directory/$archive_file" | cut --delimiter ' ' --fields 1)" != "$expected_ciphertext_checksum" ]]; then
        echo "Storage manifest validation failed for uploaded object: $archive_file" >&2
        exit 1
      fi
    done 3< <(jq --compact-output '.objects[]' "$storage_manifest")
  fi
fi
if [[ "$(jq --raw-output '.backupName' "$manifest_path")" != "$completion_backup_name" || "$(jq --raw-output '.signingKeyFingerprint' "$manifest_path")" != "$expected_signing_fingerprint" ]]; then
  echo 'Backup identity does not match the trusted completion marker or signing key.' >&2
  exit 1
fi
if [[ -n "$descriptor_operations_image" && "$(jq --raw-output '.operationsImageReference' "$manifest_path")" != "$descriptor_operations_image" ]]; then
  echo 'Restore descriptor and encrypted manifest name different operations images.' >&2
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
