#!/usr/bin/env bash

set -Eeuo pipefail

restore_directory_input="${1:?Usage: validate-restore-descriptor.sh <restore-directory> <expected-backup-name>}"
expected_backup_name="${2:?Usage: validate-restore-descriptor.sh <restore-directory> <expected-backup-name>}"
allowed_signers_file="${RESTORE_ALLOWED_SIGNERS_FILE:-${BACKUP_ALLOWED_SIGNERS_FILE:-/opt/wkf/wkf-backup-allowed-signers}}"

if [[ ! "$expected_backup_name" =~ ^production-[0-9]{8}T[0-9]{6}Z$ ]]; then
  echo 'Expected backup name must use the production-YYYYMMDDTHHMMSSZ format.' >&2
  exit 1
fi
if [[ ! -d "$restore_directory_input" ]]; then
  echo "Restore directory does not exist: $restore_directory_input" >&2
  exit 1
fi
if [[ ! -r "$allowed_signers_file" || ! -f "$allowed_signers_file" ]]; then
  echo 'The restore allowed-signers file is not readable.' >&2
  exit 1
fi

restore_directory="$(realpath -- "$restore_directory_input")"
completion_marker="$restore_directory/.complete"
descriptor="$restore_directory/restore-descriptor.json"
descriptor_signature="$restore_directory/restore-descriptor.json.sig"
if [[ ! -f "$completion_marker" || ! -f "$descriptor" || ! -f "$descriptor_signature" ]]; then
  echo 'Restore completion marker, descriptor, or descriptor signature is missing.' >&2
  exit 1
fi

completion_format_version=''
completion_backup_name=''
completion_descriptor_checksum=''
completion_descriptor_signature_checksum=''
completion_manifest_checksum=''
completion_manifest_signature_checksum=''
completion_timestamp=''
while IFS='=' read -r key value; do
  case "$key" in
    formatVersion) completion_format_version="$value" ;;
    backupName) completion_backup_name="$value" ;;
    descriptorSha256) completion_descriptor_checksum="$value" ;;
    descriptorSignatureSha256) completion_descriptor_signature_checksum="$value" ;;
    manifestSha256) completion_manifest_checksum="$value" ;;
    signatureSha256) completion_manifest_signature_checksum="$value" ;;
    completedAt) completion_timestamp="$value" ;;
    *)
      echo 'Restore completion marker has an unsupported field.' >&2
      exit 1
      ;;
  esac
done <"$completion_marker"

if [[ "$completion_format_version" != '2' \
  || "$completion_backup_name" != "$expected_backup_name" \
  || ! "$completion_descriptor_checksum" =~ ^[a-f0-9]{64}$ \
  || ! "$completion_descriptor_signature_checksum" =~ ^[a-f0-9]{64}$ \
  || ! "$completion_manifest_checksum" =~ ^[a-f0-9]{64}$ \
  || ! "$completion_manifest_signature_checksum" =~ ^[a-f0-9]{64}$ \
  || ! "$completion_timestamp" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$ ]]; then
  echo 'Restore completion marker has an invalid or unsupported structure.' >&2
  exit 1
fi

if [[ "$(sha256sum "$descriptor" | cut --delimiter ' ' --fields 1)" != "$completion_descriptor_checksum" \
  || "$(sha256sum "$descriptor_signature" | cut --delimiter ' ' --fields 1)" != "$completion_descriptor_signature_checksum" ]]; then
  echo 'Restore descriptor checksums do not match the completion marker.' >&2
  exit 1
fi
if ! ssh-keygen \
  -Y verify \
  -f "$allowed_signers_file" \
  -I wkf-production-restore \
  -n wkf-production-restore \
  -s "$descriptor_signature" \
  <"$descriptor" >/dev/null; then
  echo 'Restore descriptor signature verification failed.' >&2
  exit 1
fi

if ! jq --exit-status \
  --arg backupName "$expected_backup_name" \
  --arg manifestSha256 "$completion_manifest_checksum" \
  --arg manifestSignatureSha256 "$completion_manifest_signature_checksum" \
  'keys == ["backupName", "formatVersion", "manifest", "manifestSignature", "operationsImageReference"]
   and .formatVersion == 1
   and .backupName == $backupName
   and (.operationsImageReference | type == "string" and test("^[A-Za-z0-9.-]+(:[0-9]+)?/[A-Za-z0-9._/-]+@sha256:[a-f0-9]{64}$"))
   and .manifest == {archiveFile: "manifest.json.age", sha256: $manifestSha256}
   and .manifestSignature == {archiveFile: "manifest.json.age.sig", sha256: $manifestSignatureSha256}' \
  "$descriptor" >/dev/null; then
  echo 'Signed restore descriptor is invalid or inconsistent with the completion marker.' >&2
  exit 1
fi

jq --raw-output '.operationsImageReference' "$descriptor"
