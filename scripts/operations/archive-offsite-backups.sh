#!/bin/sh

set -eu

incoming_directory="${WKF_BACKUP_INCOMING_DIRECTORY:-/usr/home/forseti/remote-backups/wkf/incoming}"
archive_directory="${WKF_BACKUP_ARCHIVE_DIRECTORY:-/usr/home/forseti/remote-backups/wkf/archive}"
quarantine_directory="${WKF_BACKUP_QUARANTINE_DIRECTORY:-/usr/home/forseti/remote-backups/wkf/quarantine}"
incomplete_max_age_seconds="${WKF_BACKUP_INCOMPLETE_MAX_AGE_SECONDS:-86400}"
lock_file="${WKF_BACKUP_ARCHIVER_LOCK_FILE:-/usr/home/forseti/remote-backups/wkf/.archive-offsite-backups.lock}"
lock_command="${WKF_BACKUP_LOCK_COMMAND:-/usr/bin/lockf}"

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

for required_directory in "$incoming_directory" "$archive_directory" "$quarantine_directory"; do
  if [ ! -d "$required_directory" ]; then
    echo "Required backup directory does not exist: $required_directory" >&2
    exit 1
  fi
done

directory_modified_epoch() {
  if modified_epoch="$(stat -f '%m' "$1" 2>/dev/null)"; then
    printf '%s\n' "$modified_epoch"
  else
    stat -c '%Y' "$1"
  fi
}

completion_marker_backup_name() {
  marker_path="$1"
  marker_backup_name=''
  marker_format_version=''
  while IFS='=' read -r key value; do
    case "$key" in
      backupName) marker_backup_name="$value" ;;
      formatVersion) marker_format_version="$value" ;;
    esac
  done <"$marker_path"
  if [ "$marker_format_version" = '1' ]; then
    printf '%s\n' "$marker_backup_name"
  fi
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
    marker_backup_name="$(completion_marker_backup_name "$completion_marker")"
    if [ "$marker_backup_name" != "$backup_name" ]; then
      echo "Completion marker does not match its directory: $backup_name" >&2
      continue
    fi
    archive_target="$archive_directory/$backup_name"
    if [ -e "$archive_target" ]; then
      echo "Archive target already exists; leaving incoming backup unchanged: $backup_name" >&2
      continue
    fi
    mv "$backup_directory" "$archive_target"
    echo "Archived complete backup: $backup_name"
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
