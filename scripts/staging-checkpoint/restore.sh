#!/usr/bin/env bash

restore_database() {
  docker run --rm \
    --env PGPASSWORD \
    --env PGSSLMODE \
    "$postgres_image" \
    dropdb \
      --host "$postgres_server_fqdn" \
      --username "$database_administrator" \
      --maintenance-db postgres \
      --force \
      --if-exists \
      "$database_name"
  docker run --rm \
    --env PGPASSWORD \
    --env PGSSLMODE \
    "$postgres_image" \
    createdb \
      --host "$postgres_server_fqdn" \
      --username "$database_administrator" \
      --maintenance-db postgres \
      --owner "$database_administrator" \
      "$database_name"
  docker run --rm \
    --env PGPASSWORD \
    --env PGSSLMODE \
    "$postgres_image" \
    psql \
      --host "$postgres_server_fqdn" \
      --username "$database_administrator" \
      --dbname "$database_name" \
      --set ON_ERROR_STOP=1 \
      --command "GRANT ALL ON SCHEMA public TO \"$database_administrator\""
  docker run --rm \
    --env PGPASSWORD \
    --env PGSSLMODE \
    --volume "$temporary_directory:/work:ro" \
    "$postgres_image" \
    pg_restore \
      --host "$postgres_server_fqdn" \
      --username "$database_administrator" \
      --dbname "$database_name" \
      --exit-on-error \
      --no-owner \
      --no-privileges \
      /work/restore.dump
}

analyze_restored_database() {
  local started_at=$SECONDS
  echo 'Collecting PostgreSQL planner statistics after staging migrations.'
  docker run --rm \
    --env PGPASSWORD \
    --env PGSSLMODE \
    "$postgres_image" \
    psql \
      --no-psqlrc \
      --host "$postgres_server_fqdn" \
      --username "$database_administrator" \
      --dbname "$database_name" \
      --set ON_ERROR_STOP=1 \
      --command 'ANALYZE' \
      --command "SELECT count(*) AS analyzed_application_tables FROM pg_stat_user_tables WHERE schemaname = 'public' AND last_analyze IS NOT NULL"
  echo "PostgreSQL ANALYZE completed in $((SECONDS - started_at)) seconds."
}

restore_media() {
  local source_checkpoint_name="$1"
  local checkpoint_prefix="$source_checkpoint_name/media/"
  local source_blob
  local destination_blob

  az storage blob delete-batch \
    --source "$media_container_name" \
    --delete-snapshots include \
    --output none

  while IFS= read -r source_blob; do
    if [[ -n "$source_blob" ]]; then
      destination_blob="${source_blob#"$checkpoint_prefix"}"
      copy_blob_synchronously \
        "$checkpoint_container_name" \
        "$source_blob" \
        "$media_container_name" \
        "$destination_blob"
    fi
  done < <(az storage blob list \
    --container-name "$checkpoint_container_name" \
    --prefix "$checkpoint_prefix" \
    --query '[].name' \
    --output tsv)
}

wait_for_job() {
  local execution_name="$1"
  local operation_label="$2"
  local deadline=$((SECONDS + 1800))
  local execution_status

  while ((SECONDS < deadline)); do
    execution_status="$(az containerapp job execution show \
      --resource-group "$resource_group_name" \
      --name "$migration_job_name" \
      --job-execution-name "$execution_name" \
      --query properties.status \
      --output tsv)"
    case "$execution_status" in
      Succeeded)
        return
        ;;
      Failed | Degraded)
        echo "$operation_label job failed with status $execution_status: $execution_name" >&2
        return 1
        ;;
    esac
    sleep 10
  done

  echo "$operation_label job did not finish within 30 minutes: $execution_name" >&2
  return 1
}

run_payload_job() {
  local payload_command="$1"
  local execution_name

  az containerapp job update \
    --resource-group "$resource_group_name" \
    --name "$migration_job_name" \
    --container-name migration \
    --image "$active_image_reference" \
    --command ./node_modules/.bin/payload \
    --args "$payload_command" \
    --output none
  execution_name="$(az containerapp job start \
    --resource-group "$resource_group_name" \
    --name "$migration_job_name" \
    --query name \
    --output tsv)"
  wait_for_job "$execution_name" "Payload $payload_command"
}
