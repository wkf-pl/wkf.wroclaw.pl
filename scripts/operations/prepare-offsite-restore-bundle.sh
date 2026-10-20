#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

backup_directory_input="${1:?Usage: prepare-offsite-restore-bundle.sh <backup-directory> <source-age-identity-file> <output-directory>}"
source_age_identity_input="${2:?Usage: prepare-offsite-restore-bundle.sh <backup-directory> <source-age-identity-file> <output-directory>}"
output_directory_input="${3:?Usage: prepare-offsite-restore-bundle.sh <backup-directory> <source-age-identity-file> <output-directory>}"
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
if [[ ! -r "$source_age_identity_input" || ! -f "$source_age_identity_input" ]]; then
  echo "The source age identity is not a readable file: $source_age_identity_input" >&2
  exit 1
fi

backup_directory="$(realpath -- "$backup_directory_input")"
source_age_identity_file="$(realpath -- "$source_age_identity_input")"
output_directory="$(realpath --canonicalize-missing -- "$output_directory_input")"
if [[ -e "$output_directory" ]]; then
  echo "Restore bundle output already exists: $output_directory" >&2
  exit 1
fi

temporary_directory="$(mktemp --directory)"
bundle_completed=false
cleanup() {
  rm --recursive --force -- "$temporary_directory"
  if [[ "$bundle_completed" != 'true' ]]; then
    rm --recursive --force -- "$output_directory"
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
if [[ ! "$backup_name" =~ ^production-[0-9]{8}T[0-9]{6}Z$ ]]; then
  echo 'The validated source manifest contains an invalid backup name.' >&2
  exit 1
fi

bundle_directory="$output_directory/$backup_name"
secrets_directory="$output_directory/secrets"
mkdir --parents -- "$bundle_directory/blobs" "$secrets_directory"

restore_age_identity="$secrets_directory/age-identity.txt"
restore_age_recipient_file="$secrets_directory/age-recipient.txt"
age-keygen --output "$restore_age_identity"
restore_age_recipient="$(age-keygen -y "$restore_age_identity")"
printf '%s\n' "$restore_age_recipient" >"$restore_age_recipient_file"

restore_signing_private_key="$temporary_directory/manifest-signing-key"
restore_signing_public_key="$secrets_directory/manifest-signing.pub"
restore_allowed_signers="$secrets_directory/allowed-signers"
ssh-keygen -q -t ed25519 -N '' -f "$restore_signing_private_key"
ssh-keygen -y -P '' -f "$restore_signing_private_key" >"$restore_signing_public_key"
printf 'wkf-production-backup %s\n' "$(cat "$restore_signing_public_key")" >"$restore_allowed_signers"
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
  -n wkf-production-backup \
  "$encrypted_manifest"

manifest_checksum="$(sha256sum "$encrypted_manifest" | cut --delimiter ' ' --fields 1)"
signature_checksum="$(sha256sum "$encrypted_manifest.sig" | cut --delimiter ' ' --fields 1)"
{
  echo 'formatVersion=1'
  echo "backupName=$backup_name"
  echo "manifestSha256=$manifest_checksum"
  echo "signatureSha256=$signature_checksum"
  echo "completedAt=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
} >"$bundle_directory/.complete"

chmod 0600 "$restore_age_identity"
chmod 0644 "$restore_age_recipient_file" "$restore_signing_public_key" "$restore_allowed_signers"
if [[ -n "$output_owner_uid" ]]; then
  chown --recursive "$output_owner_uid:$output_owner_gid" "$output_directory"
fi
bundle_completed=true

echo "One-time restore bundle prepared: $bundle_directory"
echo "One-time restore secrets prepared: $secrets_directory"
