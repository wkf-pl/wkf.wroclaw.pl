#!/usr/bin/env bash

set -Eeuo pipefail

environment="${1:-}"
image_reference="${2:-}"
mode="${3:-}"
if [[ ( "$environment" != staging && "$environment" != prod ) ||
  ! "$image_reference" =~ @sha256:[a-f0-9]{64}$ ||
  ! "$mode" =~ ^(inspect|apply|verify|finalize|rollback|prune)$ ]]; then
  echo 'Usage: bash scripts/run-media-image-conversion-job.sh staging|prod <image@sha256:digest> inspect|apply|verify|finalize|rollback|prune' >&2
  exit 1
fi

prefix="${AZURE_RESOURCE_PREFIX:-wkf}"
group="rg-${prefix}-${environment}"
app="${prefix}-${environment}"
job="${app}-migrate"
maintenance=false
if [[ "$mode" != inspect && "$mode" != verify ]]; then
  if [[ "${WKF_MEDIA_IMAGE_MAINTENANCE:-}" != true ]]; then
    echo 'First suspend backups and stop application writes for the maintenance window.' >&2
    exit 1
  fi
  active_revisions="$(az containerapp revision list --resource-group "$group" --name "$app" \
    --query 'length([?properties.active == `true`])' --output tsv)"
  if [[ "$active_revisions" != 0 ]]; then
    echo 'Media conversion writes require all application revisions to be inactive.' >&2
    exit 1
  fi
  maintenance=true
fi

backup_reference="${WKF_MEDIA_IMAGE_BACKUP_REFERENCE:-}"
if [[ "$mode" == finalize && -z "$backup_reference" ]]; then
  echo 'Set WKF_MEDIA_IMAGE_BACKUP_REFERENCE to the verified pre-conversion backup identifier.' >&2
  exit 1
fi

template_file="$(mktemp)"
trap 'rm -f -- "$template_file"' EXIT
az containerapp job show --resource-group "$group" --name "$job" \
  --query properties.template --output json |
  jq -e --arg image "$image_reference" --arg mode "$mode" --arg maintenance "$maintenance" \
    --arg backup "$backup_reference" '
      .containers |= map(select(.name == "migration")) |
      select((.containers | length) == 1) |
      .containers[0] |= (
        .image = $image |
        .command = ["./node_modules/.bin/payload"] |
        .args = ["run", "src/modules/media/media-image-conversion-cli.ts", $mode] |
        .env |= (
          map(select(.name != "WKF_MEDIA_IMAGE_MAINTENANCE" and .name != "WKF_MEDIA_IMAGE_BACKUP_REFERENCE")) +
          [{"name":"WKF_MEDIA_IMAGE_MAINTENANCE","value":$maintenance},
          {"name":"WKF_MEDIA_IMAGE_BACKUP_REFERENCE","value":$backup}]
        )
      )' > "$template_file"

execution="$(az containerapp job start --resource-group "$group" --name "$job" \
  --yaml "$template_file" --query name --output tsv)"
if [[ ! "$execution" =~ ^[a-zA-Z0-9_-]+$ ]]; then
  echo 'The image conversion execution name is missing or invalid.' >&2
  exit 1
fi
echo "Image conversion $mode execution: $execution"

deadline=$((SECONDS + ${MIGRATION_TIMEOUT_SECONDS:-3600}))
while (( SECONDS < deadline )); do
  status="$(az containerapp job execution show --resource-group "$group" --name "$job" \
    --job-execution-name "$execution" --query properties.status --output tsv)"
  case "$status" in
    Succeeded)
      exit 0
      ;;
    Failed|Degraded|Stopped)
      echo "Image conversion $mode ended with $status. Keep maintenance active and inspect the execution logs." >&2
      exit 1
      ;;
  esac
  sleep 10
done
echo "Image conversion $mode did not complete within the wait window. Inspect $execution before retrying." >&2
exit 1
