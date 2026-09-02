#!/usr/bin/env bash

set -Eeuo pipefail

if [[ "${WKF_ALLOW_NEXT_DEV:-}" != "1" ]]; then
  echo "Refusing to start a preview without the local-only WKF_ALLOW_NEXT_DEV=1 opt-in." >&2
  exit 2
fi

if [[ "${1:-}" == "--" ]]; then
  shift
fi

preview_port="${1:-3101}"
if (($# > 0)); then
  shift
fi

if [[ ! "$preview_port" =~ ^31[0-9]{2}$ ]]; then
  echo "Preview port must be in the 3100-3199 range." >&2
  exit 2
fi

maximum_lifetime_seconds="${WKF_PREVIEW_MAX_SECONDS:-900}"
if [[ ! "$maximum_lifetime_seconds" =~ ^[1-9][0-9]*$ ]]; then
  echo "WKF_PREVIEW_MAX_SECONDS must be a positive integer." >&2
  exit 2
fi

project_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
preview_directory_relative="tmp/wkf-preview-next-${preview_port}"
preview_directory="${project_directory}/${preview_directory_relative}"
preview_tsconfig_relative_path="tmp/wkf-preview-tsconfig-${preview_port}.json"
preview_tsconfig_path="${project_directory}/${preview_tsconfig_relative_path}"
timeout_marker="${preview_directory}/.timed-out"
preview_process_id=""
timeout_process_id=""

port_is_listening() {
  ss --no-header --listening --tcp "sport = :${preview_port}" 2>/dev/null | grep --quiet .
}

preview_process_group_is_running() {
  [[ -n "$preview_process_id" ]] || return 1
  kill -0 -- "-${preview_process_id}" 2>/dev/null
}

stop_preview_process_group() {
  preview_process_group_is_running || return 0

  kill -TERM -- "-${preview_process_id}" 2>/dev/null || true
  for _ in {1..20}; do
    if ! preview_process_group_is_running; then
      return 0
    fi
    sleep 0.5
  done

  kill -KILL -- "-${preview_process_id}" 2>/dev/null || true
  for _ in {1..20}; do
    if ! preview_process_group_is_running; then
      return 0
    fi
    sleep 0.5
  done
}

remove_preview_directory() {
  case "$preview_directory" in
    "${project_directory}"/tmp/wkf-preview-next-31[0-9][0-9])
      find "$preview_directory" -depth -delete 2>/dev/null || true
      ;;
    *)
      echo "Refusing to remove unexpected preview directory: ${preview_directory}" >&2
      return 1
      ;;
  esac
}

remove_preview_tsconfig() {
  case "$preview_tsconfig_path" in
    "${project_directory}"/tmp/wkf-preview-tsconfig-31[0-9][0-9].json)
      find "$preview_tsconfig_path" -maxdepth 0 -delete 2>/dev/null || true
      ;;
    *)
      echo "Refusing to remove unexpected preview tsconfig: ${preview_tsconfig_path}" >&2
      return 1
      ;;
  esac
}

cleanup() {
  local exit_status=$?

  trap - EXIT INT TERM HUP

  if [[ -n "$timeout_process_id" ]]; then
    kill "$timeout_process_id" 2>/dev/null || true
    wait "$timeout_process_id" 2>/dev/null || true
  fi

  stop_preview_process_group
  if [[ -n "$preview_process_id" ]]; then
    wait "$preview_process_id" 2>/dev/null || true
  fi

  for _ in {1..20}; do
    if ! port_is_listening; then
      break
    fi
    sleep 0.5
  done

  if port_is_listening; then
    echo "Preview port ${preview_port} is still listening after cleanup." >&2
    exit_status=1
  fi

  remove_preview_directory || exit_status=1
  remove_preview_tsconfig || exit_status=1
  exit "$exit_status"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM HUP

if port_is_listening; then
  echo "Preview port ${preview_port} is already in use." >&2
  exit 2
fi

mkdir -p "$preview_directory"
printf '{"extends":"../tsconfig.json"}\n' >"$preview_tsconfig_path"

if (($# > 0)); then
  preview_command=("$@")
else
  preview_command=(
    volta run --node 22.17.0 pnpm dev
    --hostname 127.0.0.1
    --port "$preview_port"
  )
fi

echo "Starting temporary preview on http://127.0.0.1:${preview_port} for at most ${maximum_lifetime_seconds} seconds."
echo "Preview cache: ${preview_directory}"

setsid env \
  NODE_ENV=development \
  NEXT_DIST_DIR="$preview_directory_relative" \
  NEXT_TSCONFIG_PATH="$preview_tsconfig_relative_path" \
  NODE_OPTIONS=--no-deprecation \
  "${preview_command[@]}" &
preview_process_id=$!

(
  sleep "$maximum_lifetime_seconds"
  if kill -0 "$preview_process_id" 2>/dev/null; then
    touch "$timeout_marker"
    echo "Temporary preview reached its lifetime limit; stopping process group ${preview_process_id}." >&2
    kill -TERM -- "-${preview_process_id}" 2>/dev/null || true
  fi
) &
timeout_process_id=$!

set +e
wait "$preview_process_id"
preview_exit_status=$?
set -e

if [[ -f "$timeout_marker" ]]; then
  preview_exit_status=124
fi

exit "$preview_exit_status"
