#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

usage='Usage: prepare-offsite-restore-bundle.sh <backup-directory> <source-age-identity-file> <restore-age-recipient-file> <restore-signing-private-key-file> <output-root>'
backup_directory_input="${1:?$usage}"
source_age_identity_input="${2:?$usage}"
restore_age_recipient_input="${3:?$usage}"
restore_signing_private_key_input="${4:?$usage}"
output_root_input="${5:?$usage}"
output_owner_uid="${RESTORE_BUNDLE_OUTPUT_UID:-}"
output_owner_gid="${RESTORE_BUNDLE_OUTPUT_GID:-}"

if [[ -n "$output_owner_uid" && -z "$output_owner_gid" ]] || [[ -z "$output_owner_uid" && -n "$output_owner_gid" ]]; then
  echo 'RESTORE_BUNDLE_OUTPUT_UID and RESTORE_BUNDLE_OUTPUT_GID must be provided together.' >&2
  exit 1
fi
if [[ -n "$output_owner_uid" && (! "$output_owner_uid" =~ ^[0-9]+$ || ! "$output_owner_gid" =~ ^[0-9]+$) ]]; then
  echo 'RESTORE_BUNDLE_OUTPUT_UID and RESTORE_BUNDLE_OUTPUT_GID must be numeric.' >&2
  exit 1
fi
if [[ ! -d "$backup_directory_input" ]]; then
  echo "Backup directory does not exist: $backup_directory_input" >&2
  exit 1
fi
for key_file in "$source_age_identity_input" "$restore_age_recipient_input" "$restore_signing_private_key_input"; do
  if [[ ! -r "$key_file" || ! -f "$key_file" ]]; then
    echo "Required restore key file is not readable: $key_file" >&2
    exit 1
  fi
done

backup_directory="$(realpath -- "$backup_directory_input")"
source_age_identity_file="$(realpath -- "$source_age_identity_input")"
restore_age_recipient_file="$(realpath -- "$restore_age_recipient_input")"
restore_signing_private_key="$(realpath -- "$restore_signing_private_key_input")"
output_root="$(realpath --canonicalize-missing -- "$output_root_input")"
mkdir --parents -- "$output_root"

temporary_directory="$(mktemp --directory)"
bundle_directory=''
bundle_completed=false
cleanup() {
  rm --recursive --force -- "$temporary_directory"
  if [[ "$bundle_completed" != 'true' && -n "$bundle_directory" ]]; then
    rm --recursive --force -- "$bundle_directory"
  fi
}
trap cleanup EXIT INT TERM

AGE_IDENTITY_FILE="$source_age_identity_file" \
  bash "$(dirname "$0")/validate-offsite-backup.sh" "$backup_directory"

source_manifest="$temporary_directory/source-manifest.json"
age --decrypt \
  --identity "$source_age_identity_file" \
  --output "$source_manifest" \
  "$backup_directory/manifest.json.age"
backup_name="$(jq --raw-output '.backupName' "$source_manifest")"
operations_image_reference="$(jq --raw-output '.operationsImageReference' "$source_manifest")"
if [[ ! "$backup_name" =~ ^production-[0-9]{8}T[0-9]{6}Z$ ]]; then
  echo 'The validated source manifest contains an invalid backup name.' >&2
  exit 1
fi
if [[ ! "$operations_image_reference" =~ ^[a-zA-Z0-9.-]+(:[0-9]+)?/[a-zA-Z0-9._/-]+@sha256:[a-f0-9]{64}$ ]]; then
  echo 'The validated source manifest does not contain an immutable operations image.' >&2
  exit 1
fi

bundle_directory="$output_root/$backup_name"
if [[ -e "$bundle_directory" ]]; then
  echo "Restore bundle already exists: $bundle_directory" >&2
  exit 1
fi
mkdir --parents -- "$bundle_directory/blobs"

restore_age_recipient="$(tr --delete '\r\n' <"$restore_age_recipient_file")"
if [[ ! "$restore_age_recipient" =~ ^age1[0-9a-z]+$ ]]; then
  echo 'The restore age recipient file does not contain one native age recipient.' >&2
  exit 1
fi

restore_signing_public_key="$temporary_directory/manifest-signing.pub"
restore_allowed_signers="$temporary_directory/allowed-signers"
ssh-keygen -y -P '' -f "$restore_signing_private_key" >"$restore_signing_public_key"
printf 'wkf-production-restore %s\n' "$(cat "$restore_signing_public_key")" >"$restore_allowed_signers"
restore_signing_fingerprint="$(ssh-keygen -lf "$restore_signing_public_key" -E sha256 | awk '{ print $2 }')"

reencrypt_artifact() {
  local source_archive="$1"
  local destination_archive="$2"
  local clear_artifact="$temporary_directory/clear-artifact"

  rm --force -- "$clear_artifact"
  age --decrypt \
    --identity "$source_age_identity_file" \
    --output "$clear_artifact" \
    "$backup_directory/$source_archive"
  age --recipient "$restore_age_recipient" \
    --output "$bundle_directory/$destination_archive" \
    "$clear_artifact"
  rm --force -- "$clear_artifact"
}

database_archive="$(jq --raw-output '.database.archiveFile' "$source_manifest")"
reencrypt_artifact "$database_archive" "$database_archive"

while IFS= read -r archive_file; do
  reencrypt_artifact "$archive_file" "$archive_file"
done < <(jq --raw-output '.blobs[].archiveFile' "$source_manifest")

restore_manifest="$temporary_directory/restore-manifest.json"
jq --arg signingKeyFingerprint "$restore_signing_fingerprint" \
  '.signingKeyFingerprint = $signingKeyFingerprint' \
  "$source_manifest" >"$restore_manifest"

encrypted_manifest="$bundle_directory/manifest.json.age"
age --recipient "$restore_age_recipient" \
  --output "$encrypted_manifest" \
  "$restore_manifest"
ssh-keygen -Y sign \
  -q \
  -f "$restore_signing_private_key" \
  -n wkf-production-restore \
  "$encrypted_manifest"

manifest_checksum="$(sha256sum "$encrypted_manifest" | cut --delimiter ' ' --fields 1)"
manifest_signature_checksum="$(sha256sum "$encrypted_manifest.sig" | cut --delimiter ' ' --fields 1)"
descriptor="$bundle_directory/restore-descriptor.json"
jq --null-input \
  --arg backupName "$backup_name" \
  --arg manifestSha256 "$manifest_checksum" \
  --arg manifestSignatureSha256 "$manifest_signature_checksum" \
  --arg operationsImageReference "$operations_image_reference" \
  '{formatVersion: 1, backupName: $backupName, operationsImageReference: $operationsImageReference, manifest: {archiveFile: "manifest.json.age", sha256: $manifestSha256}, manifestSignature: {archiveFile: "manifest.json.age.sig", sha256: $manifestSignatureSha256}}' \
  >"$descriptor"
ssh-keygen -Y sign \
  -q \
  -f "$restore_signing_private_key" \
  -n wkf-production-restore \
  "$descriptor"

descriptor_checksum="$(sha256sum "$descriptor" | cut --delimiter ' ' --fields 1)"
descriptor_signature_checksum="$(sha256sum "$descriptor.sig" | cut --delimiter ' ' --fields 1)"
{
  echo 'formatVersion=2'
  echo "backupName=$backup_name"
  echo "descriptorSha256=$descriptor_checksum"
  echo "descriptorSignatureSha256=$descriptor_signature_checksum"
  echo "manifestSha256=$manifest_checksum"
  echo "signatureSha256=$manifest_signature_checksum"
  echo "completedAt=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
} >"$bundle_directory/.complete"

resolved_operations_image="$(
  RESTORE_ALLOWED_SIGNERS_FILE="$restore_allowed_signers" \
    bash "$(dirname "$0")/validate-restore-descriptor.sh" "$bundle_directory" "$backup_name"
)"
if [[ "$resolved_operations_image" != "$operations_image_reference" ]]; then
  echo 'Prepared restore descriptor resolved an unexpected operations image.' >&2
  exit 1
fi
if ! ssh-keygen \
  -Y verify \
  -f "$restore_allowed_signers" \
  -I wkf-production-restore \
  -n wkf-production-restore \
  -s "$encrypted_manifest.sig" \
  <"$encrypted_manifest" >/dev/null; then
  echo 'Prepared restore manifest signature verification failed.' >&2
  exit 1
fi

if [[ -n "$output_owner_uid" ]]; then
  chown --recursive "$output_owner_uid:$output_owner_gid" "$bundle_directory"
fi
bundle_completed=true

echo "Restore export prepared: $bundle_directory"
echo 'Upload every file except .complete first; upload .complete only after all other transfers succeed.'
