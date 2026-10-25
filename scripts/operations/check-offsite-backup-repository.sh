#!/bin/sh

set -eu

repair=false
case "${1:-}" in
  '') ;;
  --repair) repair=true ;;
  *)
    echo 'Usage: check-offsite-backup-repository.sh [--repair]' >&2
    exit 2
    ;;
esac

repository_directory="${WKF_BACKUP_REPOSITORY_DIRECTORY:-/usr/home/forseti/remote-backups/wkf/repository-v3}"
jq_command="${WKF_BACKUP_JQ_COMMAND:-/usr/local/bin/jq}"
sha256_command="${WKF_BACKUP_SHA256_COMMAND:-/sbin/sha256sum}"
objects_directory="$repository_directory/objects/sha256"
snapshots_directory="$repository_directory/snapshots"

if [ ! -d "$objects_directory" ] || [ ! -d "$snapshots_directory" ]; then
  echo "Backup repository is incomplete: $repository_directory" >&2
  exit 1
fi

file_checksum() {
  "$sha256_command" "$1" | cut -d ' ' -f 1
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

replace_replica() {
  source_replica="$1"
  destination_replica="$2"
  destination_checksum="$3"
  temporary_replica="${destination_replica}.repair-$$"
  temporary_checksum="${destination_checksum}.repair-$$"
  cp "$source_replica" "$temporary_replica"
  file_checksum "$temporary_replica" >"$temporary_checksum"
  mv "$temporary_replica" "$destination_replica"
  mv "$temporary_checksum" "$destination_checksum"
}

error_count=0
object_count=0
for shard_directory in "$objects_directory"/[a-f0-9][a-f0-9]; do
  [ -d "$shard_directory" ] || continue
  for object_directory in "$shard_directory"/[a-f0-9]*; do
    [ -d "$object_directory" ] || continue
    object_checksum="${object_directory##*/}"
    shard="${shard_directory##*/}"
    if ! printf '%s\n' "$object_checksum" | grep -Eq '^[a-f0-9]{64}$' \
      || [ "$(printf '%s' "$object_checksum" | cut -c 1-2)" != "$shard" ]; then
      echo "Invalid object repository path: $object_directory" >&2
      error_count=$((error_count + 1))
      continue
    fi
    object_count=$((object_count + 1))
    replica_one="$object_directory/replica-1.age"
    replica_two="$object_directory/replica-2.age"
    replica_one_checksum="$object_directory/replica-1.sha256"
    replica_two_checksum="$object_directory/replica-2.sha256"
    replica_one_valid=false
    replica_two_valid=false
    if replica_is_valid "$replica_one" "$replica_one_checksum"; then
      replica_one_valid=true
    fi
    if replica_is_valid "$replica_two" "$replica_two_checksum"; then
      replica_two_valid=true
    fi

    if [ "$replica_one_valid" = 'false' ] && [ "$replica_two_valid" = 'false' ]; then
      echo "Both replicas are missing or corrupt: $object_checksum" >&2
      error_count=$((error_count + 1))
      continue
    fi
    if [ "$replica_one_valid" = 'false' ]; then
      if [ "$repair" = 'true' ]; then
        replace_replica "$replica_two" "$replica_one" "$replica_one_checksum"
        replica_one_valid=true
        echo "Repaired replica 1: $object_checksum"
      else
        echo "Replica 1 is missing or corrupt: $object_checksum" >&2
        error_count=$((error_count + 1))
      fi
    fi
    if [ "$replica_two_valid" = 'false' ]; then
      if [ "$repair" = 'true' ]; then
        replace_replica "$replica_one" "$replica_two" "$replica_two_checksum"
        replica_two_valid=true
        echo "Repaired replica 2: $object_checksum"
      else
        echo "Replica 2 is missing or corrupt: $object_checksum" >&2
        error_count=$((error_count + 1))
      fi
    fi
    if [ "$replica_one_valid" = 'true' ] && [ "$replica_two_valid" = 'true' ] \
      && [ "$replica_one" -ef "$replica_two" ]; then
      if [ "$repair" = 'true' ]; then
        replace_replica "$replica_one" "$replica_two" "$replica_two_checksum"
        echo "Separated hard-linked replicas: $object_checksum"
      else
        echo "Object replicas share one inode: $object_checksum" >&2
        error_count=$((error_count + 1))
      fi
    fi
  done
done

snapshot_count=0
for snapshot_directory in "$snapshots_directory"/production-*; do
  [ -d "$snapshot_directory" ] || continue
  snapshot_count=$((snapshot_count + 1))
  backup_name="${snapshot_directory##*/}"
  storage_manifest="$snapshot_directory/storage-manifest.json"
  if [ ! -f "$snapshot_directory/.repository-snapshot" ] || [ ! -f "$storage_manifest" ]; then
    echo "Snapshot metadata is incomplete: $backup_name" >&2
    error_count=$((error_count + 1))
    continue
  fi
  while IFS="$(printf '\t')" read -r archive_file plaintext_checksum; do
    [ -n "$archive_file" ] || continue
    snapshot_object="$snapshot_directory/$archive_file"
    shard="$(printf '%s' "$plaintext_checksum" | cut -c 1-2)"
    object_directory="$objects_directory/$shard/$plaintext_checksum"
    replica_one="$object_directory/replica-1.age"
    replica_two="$object_directory/replica-2.age"
    linked_to_replica=false
    if [ -f "$snapshot_object" ] \
      && { [ "$snapshot_object" -ef "$replica_one" ] || [ "$snapshot_object" -ef "$replica_two" ]; }; then
      linked_to_replica=true
    fi
    if [ "$linked_to_replica" = 'false' ]; then
      if [ "$repair" = 'true' ] && replica_is_valid "$replica_one" "$object_directory/replica-1.sha256"; then
        mkdir -p "$(dirname "$snapshot_object")"
        temporary_link="${snapshot_object}.repair-$$"
        rm -f -- "$temporary_link"
        ln "$replica_one" "$temporary_link"
        mv "$temporary_link" "$snapshot_object"
        echo "Re-linked snapshot object: $backup_name/$archive_file"
      else
        echo "Snapshot object is not linked to a healthy repository replica: $backup_name/$archive_file" >&2
        error_count=$((error_count + 1))
      fi
    fi
  done <<EOF
$("$jq_command" --raw-output '.objects[] | [.archiveFile, .plaintextSha256] | @tsv' "$storage_manifest")
EOF
done

if [ "$error_count" -ne 0 ]; then
  echo "Backup repository check failed: $error_count problem(s)." >&2
  exit 1
fi

echo "Backup repository check succeeded: $snapshot_count snapshots, $object_count unique objects."
