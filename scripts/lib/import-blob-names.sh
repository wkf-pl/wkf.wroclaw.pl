#!/usr/bin/env bash

validate_import_blob_name() {
  local blob_name="$1"
  local error_prefix=''
  local blob_kind='blob'
  local capitalized_blob_kind='Blob'

  if [[ "${2:-}" == production ]]; then
    error_prefix='ERROR: '
    blob_kind='production blob'
    capitalized_blob_kind='Production blob'
  fi

  if [[ -z "$blob_name" || "$blob_name" == /* || "/$blob_name/" == *'/../'* ]]; then
    printf '%sUnsafe %s name: %s\n' "$error_prefix" "$blob_kind" "$blob_name" >&2
    return 1
  fi
  if [[ "$blob_name" == *$'\n'* || "$blob_name" == *$'\r'* ]]; then
    printf '%s%s names containing line breaks are not supported.\n' "$error_prefix" "$capitalized_blob_kind" >&2
    return 1
  fi
}
