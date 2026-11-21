#!/usr/bin/env bash

checkpoint_blob_exists() {
  local blob_name="$1"

  [[ "$(az storage blob exists \
    --container-name "$checkpoint_container_name" \
    --name "$blob_name" \
    --query exists \
    --output tsv)" == "true" ]]
}

copy_blob_synchronously() {
  local source_container="$1"
  local source_blob="$2"
  local destination_container="$3"
  local destination_blob="$4"

  az storage blob copy start \
    --source-account-name "$storage_account_name" \
    --source-account-key "$storage_account_key" \
    --source-container "$source_container" \
    --source-blob "$source_blob" \
    --destination-container "$destination_container" \
    --destination-blob "$destination_blob" \
    --requires-sync true \
    --output none
}

create_checkpoint() {
  local target_checkpoint_name="$1"
  local checkpoint_prefix="$target_checkpoint_name"
  local database_dump_path="$temporary_directory/$target_checkpoint_name.dump"
  local database_checksum_path="$database_dump_path.sha256"
  local manifest_path="$temporary_directory/$target_checkpoint_name.json"
  local media_manifest_path="$temporary_directory/$target_checkpoint_name-media.jsonl"
  local media_manifest_checksum
  local media_blob_count
  local source_blob
  local temporary_blob_path="$temporary_directory/checkpoint-media-blob"

  : >"$media_manifest_path"

  if checkpoint_blob_exists "$checkpoint_prefix/manifest.json"; then
    echo "Checkpoint already exists and will not be overwritten: $target_checkpoint_name" >&2
    return 1
  fi

  docker run --rm \
    --env PGPASSWORD \
    --env PGSSLMODE \
    --volume "$temporary_directory:/work" \
    "$postgres_image" \
    pg_dump \
      --host "$postgres_server_fqdn" \
      --username "$database_administrator" \
      --dbname "$database_name" \
      --format custom \
      --compress 9 \
      --no-owner \
      --no-privileges \
      --file "/work/$target_checkpoint_name.dump"

  docker run --rm \
    --volume "$temporary_directory:/work:ro" \
    "$postgres_image" \
    pg_restore --list "/work/$target_checkpoint_name.dump" >/dev/null

  sha256sum "$database_dump_path" >"$database_checksum_path"
  media_blob_count="$(az storage blob list \
    --container-name "$media_container_name" \
    --query 'length(@)' \
    --output tsv)"

  while IFS= read -r source_blob; do
    if [[ -n "$source_blob" ]]; then
      copy_blob_synchronously \
        "$media_container_name" \
        "$source_blob" \
        "$checkpoint_container_name" \
        "$checkpoint_prefix/media/$source_blob"
      az storage blob download \
        --container-name "$checkpoint_container_name" \
        --name "$checkpoint_prefix/media/$source_blob" \
        --file "$temporary_blob_path" \
        --overwrite true \
        --output none
      jq --compact-output --null-input \
        --arg name "$source_blob" \
        --arg sha256 "$(sha256sum "$temporary_blob_path" | cut -d ' ' -f1)" \
        --argjson size "$(wc --bytes <"$temporary_blob_path")" \
        '{name: $name, sha256: $sha256, size: $size}' >>"$media_manifest_path"
      rm --force -- "$temporary_blob_path"
    fi
  done < <(az storage blob list \
    --container-name "$media_container_name" \
    --query '[].name' \
    --output tsv)

  media_manifest_checksum="$(sha256sum "$media_manifest_path" | cut -d ' ' -f1)"

  jq -n \
    --arg checkpointName "$target_checkpoint_name" \
    --arg createdAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg databaseName "$database_name" \
    --arg deployedSourceSha "$deployed_source_sha" \
    --arg imageReference "$active_image_reference" \
    --arg mediaManifestSha256 "$media_manifest_checksum" \
    --argjson mediaBlobCount "$media_blob_count" \
    '{checkpointName: $checkpointName, createdAt: $createdAt, databaseName: $databaseName, deployedSourceSha: $deployedSourceSha, imageReference: $imageReference, mediaBlobCount: $mediaBlobCount, mediaManifestSha256: $mediaManifestSha256}' \
    >"$manifest_path"

  az storage blob upload \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/media-manifest.jsonl" \
    --file "$media_manifest_path" \
    --overwrite false \
    --output none
  az storage blob upload \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/database.dump" \
    --file "$database_dump_path" \
    --overwrite false \
    --output none
  az storage blob upload \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/database.sha256" \
    --file "$database_checksum_path" \
    --overwrite false \
    --output none
  az storage blob upload \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/manifest.json" \
    --file "$manifest_path" \
    --overwrite false \
    --output none

  echo "Created staging checkpoint: $target_checkpoint_name ($media_blob_count media blobs)"
}

download_and_validate_checkpoint() {
  local source_checkpoint_name="$1"
  local checkpoint_prefix="$source_checkpoint_name"
  local database_dump_path="$temporary_directory/restore.dump"
  local database_checksum_path="$temporary_directory/restore.sha256"
  local manifest_path="$temporary_directory/restore-manifest.json"
  local media_manifest_path="$temporary_directory/restore-media-manifest.jsonl"
  local expected_media_blob_count
  local actual_media_blob_count

  for required_blob in manifest.json database.dump database.sha256 media-manifest.jsonl; do
    if ! checkpoint_blob_exists "$checkpoint_prefix/$required_blob"; then
      echo "Checkpoint is incomplete: missing $required_blob in $source_checkpoint_name" >&2
      return 1
    fi
  done

  az storage blob download \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/media-manifest.jsonl" \
    --file "$media_manifest_path" \
    --overwrite true \
    --output none
  az storage blob download \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/database.dump" \
    --file "$database_dump_path" \
    --overwrite true \
    --output none
  az storage blob download \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/database.sha256" \
    --file "$database_checksum_path" \
    --overwrite true \
    --output none
  az storage blob download \
    --container-name "$checkpoint_container_name" \
    --name "$checkpoint_prefix/manifest.json" \
    --file "$manifest_path" \
    --overwrite true \
    --output none

  (
    cd "$temporary_directory"
    sed "s#  .*#  restore.dump#" restore.sha256 | sha256sum --check --strict
  )
  docker run --rm \
    --volume "$temporary_directory:/work:ro" \
    "$postgres_image" \
    pg_restore --list /work/restore.dump >/dev/null

  expected_media_blob_count="$(jq -r '.mediaBlobCount' "$manifest_path")"
  if [[ "$(sha256sum "$media_manifest_path" | cut -d ' ' -f1)" != "$(jq -r '.mediaManifestSha256' "$manifest_path")" ]]; then
    echo 'Checkpoint media manifest checksum does not match.' >&2
    return 1
  fi
  if [[ "$(wc --lines <"$media_manifest_path")" != "$expected_media_blob_count" ]]; then
    echo 'Checkpoint media manifest entry count does not match.' >&2
    return 1
  fi
  actual_media_blob_count="$(az storage blob list \
    --container-name "$checkpoint_container_name" \
    --prefix "$checkpoint_prefix/media/" \
    --query 'length(@)' \
    --output tsv)"
  if [[ "$actual_media_blob_count" != "$expected_media_blob_count" ]]; then
    echo "Checkpoint media count mismatch: expected $expected_media_blob_count, found $actual_media_blob_count." >&2
    return 1
  fi
}
