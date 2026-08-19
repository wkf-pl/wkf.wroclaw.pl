#!/usr/bin/env bash

set -Eeuo pipefail

deployed_source_sha="${1:-}"
target_source_sha="${2:?Usage: classify-deployment.sh <deployed-sha|empty> <target-sha> [output-file]}"
output_file="${3:-}"

write_output() {
  local name="$1"
  local value="$2"

  if [[ -n "$output_file" ]]; then
    printf '%s=%s\n' "$name" "$value" >> "$output_file"
  else
    printf '%s=%s\n' "$name" "$value"
  fi
}

if ! git rev-parse --verify --quiet "${target_source_sha}^{commit}" >/dev/null; then
  echo "Target source SHA is not available in the repository: $target_source_sha" >&2
  exit 1
fi

if [[ -z "$deployed_source_sha" ]] \
  || ! git rev-parse --verify --quiet "${deployed_source_sha}^{commit}" >/dev/null; then
  write_output build_image true
  write_output provision_infrastructure true
  write_output run_migrations true
  exit 0
fi

build_image=false
provision_infrastructure=false
run_migrations=false

while IFS= read -r changed_path; do
  [[ -n "$changed_path" ]] || continue

  case "$changed_path" in
    infra/azure/*.md)
      ;;
    infra/azure/*)
      provision_infrastructure=true
      ;;
  esac

  case "$changed_path" in
    migrations/*)
      run_migrations=true
      ;;
  esac

  case "$changed_path" in
    .github/* | infra/* | scripts/deploy-azure.sh | scripts/classify-deployment.sh | *.md)
      ;;
    *)
      build_image=true
      ;;
  esac
done < <(git diff --name-only "$deployed_source_sha" "$target_source_sha")

write_output build_image "$build_image"
write_output provision_infrastructure "$provision_infrastructure"
write_output run_migrations "$run_migrations"
