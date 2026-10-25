#!/bin/sh

set -eu

incoming_directory="${WKF_BACKUP_INCOMING_DIRECTORY:-/usr/home/forseti/remote-backups/wkf/incoming}"
repository_directory="${WKF_BACKUP_REPOSITORY_DIRECTORY:-/usr/home/forseti/remote-backups/wkf/repository-v3}"
quarantine_directory="${WKF_BACKUP_QUARANTINE_DIRECTORY:-/usr/home/forseti/remote-backups/wkf/quarantine}"
allowed_signers_file="${WKF_BACKUP_ALLOWED_SIGNERS_FILE:-/usr/home/forseti/.config/wkf-backup/wkf-backup-allowed-signers}"
incomplete_max_age_seconds="${WKF_BACKUP_INCOMPLETE_MAX_AGE_SECONDS:-86400}"
lock_file="${WKF_BACKUP_ARCHIVER_LOCK_FILE:-/usr/home/forseti/remote-backups/wkf/.archive-offsite-backups.lock}"
lock_command="${WKF_BACKUP_LOCK_COMMAND:-/usr/bin/lockf}"
jq_command="${WKF_BACKUP_JQ_COMMAND:-/usr/local/bin/jq}"
sha256_command="${WKF_BACKUP_SHA256_COMMAND:-/sbin/sha256sum}"
ssh_keygen_command="${WKF_BACKUP_SSH_KEYGEN_COMMAND:-/usr/bin/ssh-keygen}"

if [ "${1:-}" != '--locked' ]; then
  exec "$lock_command" -t 0 "$lock_file" "$0" --locked
fi
shift

case "$incomplete_max_age_seconds" in
  '' | *[!0-9]*)
    echo 'WKF_BACKUP_INCOMPLETE_MAX_AGE_SECONDS must be a non-negative integer.' >&2
    exit 1
    ;;
esac

for required_directory in "$incoming_directory" "$quarantine_directory"; do
  if [ ! -d "$required_directory" ]; then
    echo "Required backup directory does not exist: $required_directory" >&2
    exit 1
  fi
done
if [ ! -r "$allowed_signers_file" ]; then
  echo "The trusted backup signers file is not readable: $allowed_signers_file" >&2
  exit 1
fi

snapshots_directory="$repository_directory/snapshots"
objects_directory="$repository_directory/objects/sha256"
mkdir -p "$snapshots_directory" "$objects_directory"

file_checksum() {
  "$sha256_command" "$1" | cut -d ' ' -f 1
}

file_size() {
  wc -c <"$1" | tr -d ' '
}

directory_modified_epoch() {
  if modified_epoch="$(stat -f '%m' "$1" 2>/dev/null)"; then
    printf '%s\n' "$modified_epoch"
  else
    stat -c '%Y' "$1"
  fi
}

verify_signed_file() {
  signed_file="$1"
  signature_file="$2"
  signing_identity="$3"

  "$ssh_keygen_command" -Y verify \
    -f "$allowed_signers_file" \
    -I "$signing_identity" \
    -n "$signing_identity" \
    -s "$signature_file" \
    <"$signed_file" >/dev/null
}

replica_is_valid() {
  replica_path="$1"
  checksum_path="$2"
  [ -f "$replica_path" ] || return 1
  [ -f "$checksum_path" ] || return 1
  expected_checksum="$(cat "$checksum_path")"
  case "$expected_checksum" in
    *[!a-f0-9]* | '') return 1 ;;
  esac
  [ "${#expected_checksum}" -eq 64 ] || return 1
  [ "$(file_checksum "$replica_path")" = "$expected_checksum" ]
}

ingest_object() {
  backup_directory="$1"
  snapshot_staging_directory="$2"
  archive_file="$3"
  plaintext_checksum="$4"
  uploaded_ciphertext_checksum="$5"

  candidate_path="$backup_directory/$archive_file"
  shard="$(printf '%s' "$plaintext_checksum" | cut -c 1-2)"
  object_parent="$objects_directory/$shard"
  object_directory="$object_parent/$plaintext_checksum"
  mkdir -p "$object_parent"

  if [ ! -e "$object_directory" ]; then
    object_staging_directory="$object_parent/.${plaintext_checksum}.staging-$$"
    rm -rf -- "$object_staging_directory"
    mkdir "$object_staging_directory"
    cp "$candidate_path" "$object_staging_directory/replica-1.age"
    cp "$candidate_path" "$object_staging_directory/replica-2.age"
    printf '%s\n' "$uploaded_ciphertext_checksum" >"$object_staging_directory/replica-1.sha256"
    printf '%s\n' "$uploaded_ciphertext_checksum" >"$object_staging_directory/replica-2.sha256"
    mv "$object_staging_directory" "$object_directory"
  else
    if ! replica_is_valid "$object_directory/replica-1.age" "$object_directory/replica-1.sha256" \
      || ! replica_is_valid "$object_directory/replica-2.age" "$object_directory/replica-2.sha256"; then
      echo "Object repository has a missing or corrupt replica: $plaintext_checksum" >&2
      return 1
    fi
    replica_one_checksum="$(cat "$object_directory/replica-1.sha256")"
    replica_two_checksum="$(cat "$object_directory/replica-2.sha256")"
    if [ "$replica_one_checksum" = "$replica_two_checksum" ] \
      && [ "$uploaded_ciphertext_checksum" != "$replica_one_checksum" ]; then
      replacement_path="$object_directory/.replica-2.age.replacement-$$"
      replacement_checksum_path="$object_directory/.replica-2.sha256.replacement-$$"
      cp "$candidate_path" "$replacement_path"
      printf '%s\n' "$uploaded_ciphertext_checksum" >"$replacement_checksum_path"
      mv "$replacement_path" "$object_directory/replica-2.age"
      mv "$replacement_checksum_path" "$object_directory/replica-2.sha256"
    fi
  fi

  mkdir -p "$snapshot_staging_directory/blobs"
  ln "$object_directory/replica-1.age" "$snapshot_staging_directory/$archive_file"
}

archive_complete_backup() {
  backup_directory="$1"
  backup_name="$2"
  completion_marker="$backup_directory/.complete"
  encrypted_manifest="$backup_directory/manifest.json.age"
  manifest_signature="$backup_directory/manifest.json.age.sig"
  storage_manifest="$backup_directory/storage-manifest.json"
  storage_manifest_signature="$backup_directory/storage-manifest.json.sig"

  completion_format_version=''
  completion_backup_name=''
  manifest_checksum=''
  manifest_signature_checksum=''
  storage_manifest_checksum=''
  storage_manifest_signature_checksum=''
  completion_timestamp=''
  while IFS='=' read -r key value; do
    case "$key" in
      formatVersion) completion_format_version="$value" ;;
      backupName) completion_backup_name="$value" ;;
      manifestSha256) manifest_checksum="$value" ;;
      signatureSha256) manifest_signature_checksum="$value" ;;
      storageManifestSha256) storage_manifest_checksum="$value" ;;
      storageManifestSignatureSha256) storage_manifest_signature_checksum="$value" ;;
      completedAt) completion_timestamp="$value" ;;
      *)
        echo "Completion marker has an unsupported field: $backup_name" >&2
        return 1
        ;;
    esac
  done <"$completion_marker"

  if [ "$completion_format_version" != '3' ] \
    || [ "$completion_backup_name" != "$backup_name" ] \
    || ! printf '%s\n' "$completion_timestamp" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$'; then
    echo "Completion marker has an invalid structure or backup name: $backup_name" >&2
    return 1
  fi
  for checksum_value in "$manifest_checksum" "$manifest_signature_checksum" "$storage_manifest_checksum" "$storage_manifest_signature_checksum"; do
    if ! printf '%s\n' "$checksum_value" | grep -Eq '^[a-f0-9]{64}$'; then
      echo "Completion marker has an invalid checksum: $backup_name" >&2
      return 1
    fi
  done
  for required_file in "$encrypted_manifest" "$manifest_signature" "$storage_manifest" "$storage_manifest_signature" "$backup_directory/database.dump.age"; do
    if [ ! -f "$required_file" ]; then
      echo "Complete backup is missing an artifact: $required_file" >&2
      return 1
    fi
  done
  if [ "$(file_checksum "$encrypted_manifest")" != "$manifest_checksum" ] \
    || [ "$(file_checksum "$manifest_signature")" != "$manifest_signature_checksum" ] \
    || [ "$(file_checksum "$storage_manifest")" != "$storage_manifest_checksum" ] \
    || [ "$(file_checksum "$storage_manifest_signature")" != "$storage_manifest_signature_checksum" ]; then
    echo "Completion marker checksums do not match signed artifacts: $backup_name" >&2
    return 1
  fi
  if ! verify_signed_file "$encrypted_manifest" "$manifest_signature" 'wkf-production-backup'; then
    echo "Encrypted manifest signature verification failed: $backup_name" >&2
    return 1
  fi
  if ! verify_signed_file "$storage_manifest" "$storage_manifest_signature" 'wkf-production-backup-storage'; then
    echo "Storage manifest signature verification failed: $backup_name" >&2
    return 1
  fi

  if ! "$jq_command" --exit-status --arg backupName "$backup_name" '
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
    echo "Storage manifest has an invalid structure: $backup_name" >&2
    return 1
  fi

  for artifact_key in database manifest manifestSignature; do
    artifact_path="$("$jq_command" --raw-output --arg key "$artifact_key" '.[$key].archiveFile' "$storage_manifest")"
    expected_checksum="$("$jq_command" --raw-output --arg key "$artifact_key" '.[$key].ciphertextSha256' "$storage_manifest")"
    expected_size="$("$jq_command" --raw-output --arg key "$artifact_key" '.[$key].ciphertextSize' "$storage_manifest")"
    if [ "$(file_checksum "$backup_directory/$artifact_path")" != "$expected_checksum" ] \
      || [ "$(file_size "$backup_directory/$artifact_path")" != "$expected_size" ]; then
      echo "Storage manifest validation failed for artifact: $artifact_path" >&2
      return 1
    fi
  done

  listed_object_count=0
  while IFS="$(printf '\t')" read -r archive_file plaintext_checksum expected_checksum expected_size; do
    [ -n "$archive_file" ] || continue
    candidate_path="$backup_directory/$archive_file"
    if [ ! -f "$candidate_path" ] \
      || [ "$(file_checksum "$candidate_path")" != "$expected_checksum" ] \
      || [ "$(file_size "$candidate_path")" != "$expected_size" ]; then
      echo "Storage manifest validation failed for uploaded object: $archive_file" >&2
      return 1
    fi
    listed_object_count=$((listed_object_count + 1))
  done <<EOF
$("$jq_command" --raw-output '.objects[] | [.archiveFile, .plaintextSha256, .ciphertextSha256, .ciphertextSize] | @tsv' "$storage_manifest")
EOF
  object_count="$("$jq_command" --raw-output '.objectCount' "$storage_manifest")"
  actual_object_count="$(find "$backup_directory/blobs" -type f | wc -l | tr -d ' ')"
  if [ "$listed_object_count" != "$object_count" ] || [ "$actual_object_count" != "$object_count" ]; then
    echo "Uploaded object count does not match the storage manifest: $backup_name" >&2
    return 1
  fi

  snapshot_target="$snapshots_directory/$backup_name"
  if [ -e "$snapshot_target" ]; then
    echo "Snapshot target already exists; leaving incoming backup unchanged: $backup_name" >&2
    return 1
  fi
  snapshot_staging_directory="$snapshots_directory/.${backup_name}.staging-$$"
  rm -rf -- "$snapshot_staging_directory"
  mkdir "$snapshot_staging_directory"
  for artifact_name in database.dump.age manifest.json.age manifest.json.age.sig storage-manifest.json storage-manifest.json.sig .complete; do
    cp "$backup_directory/$artifact_name" "$snapshot_staging_directory/$artifact_name"
  done

  while IFS="$(printf '\t')" read -r archive_file plaintext_checksum uploaded_ciphertext_checksum; do
    [ -n "$archive_file" ] || continue
    ingest_object "$backup_directory" "$snapshot_staging_directory" "$archive_file" "$plaintext_checksum" "$uploaded_ciphertext_checksum"
  done <<EOF
$("$jq_command" --raw-output '.objects[] | [.archiveFile, .plaintextSha256, .ciphertextSha256] | @tsv' "$storage_manifest")
EOF

  {
    echo 'formatVersion=1'
    echo "backupName=$backup_name"
    echo "archivedAt=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  } >"$snapshot_staging_directory/.repository-snapshot"
  mv "$snapshot_staging_directory" "$snapshot_target"
  rm -rf -- "$backup_directory"
  echo "Archived deduplicated backup: $backup_name ($object_count unique objects)"
}

now_epoch="$(date +%s)"
for backup_directory in "$incoming_directory"/production-*; do
  [ -d "$backup_directory" ] || continue
  backup_name="${backup_directory##*/}"
  if ! printf '%s\n' "$backup_name" | grep -Eq '^production-[0-9]{8}T[0-9]{6}Z$'; then
    echo "Ignoring unexpected incoming directory: $backup_name" >&2
    continue
  fi

  completion_marker="$backup_directory/.complete"
  if [ -f "$completion_marker" ]; then
    archive_complete_backup "$backup_directory" "$backup_name"
    continue
  fi

  modified_epoch="$(directory_modified_epoch "$backup_directory")"
  age_seconds=$((now_epoch - modified_epoch))
  if [ "$age_seconds" -lt "$incomplete_max_age_seconds" ]; then
    continue
  fi
  quarantine_target="$quarantine_directory/${backup_name}.incomplete-${now_epoch}"
  if [ -e "$quarantine_target" ]; then
    quarantine_target="${quarantine_target}-$$"
  fi
  mv "$backup_directory" "$quarantine_target"
  echo "Quarantined stale incomplete backup: $backup_name"
done
