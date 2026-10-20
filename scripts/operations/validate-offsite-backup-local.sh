#!/usr/bin/env bash

set -Eeuo pipefail

usage='Usage: validate-offsite-backup-local.sh <backup-directory> <age-identity-file> [operations-image] [allowed-signers-file signing-public-key-file]'
backup_directory_input="${1:?$usage}"
age_identity_input="${2:?$usage}"
operations_image="${3:-wkf-operations:local}"
allowed_signers_input="${4:-}"
signing_public_key_input="${5:-}"
validation_tmpfs_size="${WKF_BACKUP_VALIDATION_TMPFS_SIZE:-1g}"

if [[ -n "$allowed_signers_input" && -z "$signing_public_key_input" ]] || [[ -z "$allowed_signers_input" && -n "$signing_public_key_input" ]]; then
  echo 'The allowed signers and signing public key files must be provided together.' >&2
  exit 1
fi

if [[ ! -d "$backup_directory_input" ]]; then
  echo "Backup directory does not exist: $backup_directory_input" >&2
  exit 1
fi
if [[ ! -r "$age_identity_input" || ! -f "$age_identity_input" ]]; then
  echo "The age identity is not a readable file: $age_identity_input" >&2
  exit 1
fi
if [[ ! "$validation_tmpfs_size" =~ ^[1-9][0-9]*[kKmMgG]$ ]]; then
  echo 'WKF_BACKUP_VALIDATION_TMPFS_SIZE must use Docker size syntax such as 512m or 1g.' >&2
  exit 1
fi

backup_directory="$(realpath -- "$backup_directory_input")"
age_identity_file="$(realpath -- "$age_identity_input")"

docker_arguments=(
  run
  --rm
  --network none
  --read-only
  --cap-drop ALL
  --cap-add DAC_READ_SEARCH
  --security-opt no-new-privileges
  --user 0:0
  --tmpfs "/tmp:rw,nosuid,nodev,noexec,size=$validation_tmpfs_size"
  --env AGE_IDENTITY_FILE=/run/age/identity.txt
  --volume "$backup_directory:/backup:ro"
  --volume "$age_identity_file:/run/age/identity.txt:ro"
)

if [[ -n "$allowed_signers_input" ]]; then
  if [[ ! -r "$allowed_signers_input" || ! -f "$allowed_signers_input" ]]; then
    echo "The allowed signers file is not readable: $allowed_signers_input" >&2
    exit 1
  fi
  if [[ ! -r "$signing_public_key_input" || ! -f "$signing_public_key_input" ]]; then
    echo "The signing public key file is not readable: $signing_public_key_input" >&2
    exit 1
  fi
  allowed_signers_file="$(realpath -- "$allowed_signers_input")"
  signing_public_key_file="$(realpath -- "$signing_public_key_input")"
  docker_arguments+=(
    --env BACKUP_ALLOWED_SIGNERS_FILE=/run/signing/allowed-signers
    --env BACKUP_SIGNING_PUBLIC_KEY_FILE=/run/signing/manifest-signing.pub
    --volume "$allowed_signers_file:/run/signing/allowed-signers:ro"
    --volume "$signing_public_key_file:/run/signing/manifest-signing.pub:ro"
  )
fi

docker_arguments+=(
  "$operations_image"
  /opt/wkf/validate-offsite-backup.sh
  /backup
)

docker "${docker_arguments[@]}"
