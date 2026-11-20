import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('deployment data operations', () => {
  it('serializes staging deployments and protected data operations', () => {
    const stagingWorkflow = readFileSync('.github/workflows/deploy-staging.yml', 'utf8')
    const stagingDataWorkflow = readFileSync('.github/workflows/manage-staging-data.yml', 'utf8')
    const stagingDataScript = readFileSync('scripts/manage-staging-data.sh', 'utf8')
    const storageTemplate = readFileSync('infra/azure/modules/storage.bicep', 'utf8')

    expect(stagingWorkflow).toContain('group: staging-operations')
    expect(stagingDataWorkflow).toContain('group: staging-operations')
    expect(stagingDataWorkflow).toMatch(/^  workflow_dispatch:/m)
    expect(stagingDataWorkflow).not.toMatch(/^  push:/m)
    expect(stagingDataWorkflow).toContain('environment: staging')
    expect(stagingDataWorkflow).toContain('RESTORE_CONFIRMATION')
    expect(stagingDataScript).toContain('restore_confirmation" != "RESTORE"')
    expect(stagingDataScript).toContain('create_checkpoint "$rescue_checkpoint_name"')
    expect(stagingDataScript).toContain('destructive_restore_started=true')
    expect(stagingDataScript).toContain('run_payload_job migrate')
    expect(stagingDataScript).toContain('run_payload_job migrate:status')
    expect(stagingDataScript).toContain('No active revision found; restore will recover')
    expect(readFileSync('scripts/staging-checkpoint/restore.sh', 'utf8')).toContain(
      'GRANT ALL ON SCHEMA public',
    )
    expect(stagingDataScript).toContain('Restore failed after destructive work started')
    expect(stagingDataScript).toContain(
      `--query "properties.template.containers[0].env[?name=='DEPLOYED_SOURCE_SHA'] | [0].value"`,
    )
    expect(storageTemplate).toContain(
      'isVersioningEnabled: enableStagingCheckpoints || enableProductionProtection',
    )
    expect(storageTemplate).toContain('containerDeleteRetentionPolicy')
    expect(storageTemplate).toContain('deleteRetentionPolicy')
  })

  it('imports a complete staging checkpoint only after validating and backing up local data', () => {
    const packageConfiguration = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }
    const stagingPullScript = readFileSync('scripts/pull-staging-data.sh', 'utf8')

    expect(packageConfiguration.scripts['staging:pull']).toBe('bash scripts/pull-staging-data.sh')
    expect(stagingPullScript).toContain('import_confirmation" != "IMPORT"')
    expect(stagingPullScript).toContain('Checkpoint database checksum does not match')
    expect(stagingPullScript).toContain('validate_downloaded_blobs')
    expect(stagingPullScript).toContain('git merge-base --is-ancestor')
    expect(stagingPullScript).toContain('The local Storage connection must point to Azurite')
    expect(stagingPullScript).toContain('local-before-$rescue_timestamp-$checkpoint_name')
    expect(stagingPullScript).toContain('Attempting automatic rollback')
    expect(stagingPullScript).toContain('Local media count mismatch')
    expect(stagingPullScript).toContain(' EXTENSION - pgaudit[[:space:]]*$')
    expect(stagingPullScript).toContain(' COMMENT - EXTENSION pgaudit[[:space:]]*$')
    expect(stagingPullScript).toContain('--use-list "$restore_list_path"')
    expect(stagingPullScript).toContain(
      '"$route" == "/api/media?limit=1" && "$route_status" == "403"',
    )
    expect(stagingPullScript).toContain('run --rm --no-deps app pnpm migrate')
    expect(stagingPullScript).toContain('TRUNCATE TABLE users_sessions, payload_locked_documents')
    expect(stagingPullScript.indexOf('>"$local_rescue_directory/database.dump"')).toBeLessThan(
      stagingPullScript.indexOf('destructive_import_started=true'),
    )
    expect(stagingPullScript).not.toMatch(/staging_storage blob (?:delete|upload)/)
  })

  it('publishes and serializes immutable production operation images', () => {
    const stagingWorkflow = readFileSync('.github/workflows/deploy-staging.yml', 'utf8')
    const productionWorkflow = readFileSync('.github/workflows/deploy-production.yml', 'utf8')
    const importWorkflow = readFileSync('.github/workflows/import-production-data.yml', 'utf8')
    const restoreWorkflow = readFileSync('.github/workflows/restore-production-offsite.yml', 'utf8')

    expect(stagingWorkflow).toContain('file: Dockerfile.operations')
    expect(stagingWorkflow).toContain('/wkf-operations:${{ env.SOURCE_SHA }}')
    expect(stagingWorkflow).toContain('Operations image digest')
    expect(productionWorkflow).toContain('wkf-operations@${OPERATIONS_IMAGE_DIGEST}')
    expect(importWorkflow).toContain('group: production-operations')
    expect(importWorkflow).toContain('environment: prod')
    expect(importWorkflow).toContain("CONFIRMATION\" != 'IMPORT'")
    expect(importWorkflow).toContain('stop_failed_preview')
    expect(restoreWorkflow).toContain('group: production-operations')
    expect(restoreWorkflow).toContain('environment: prod-restore')
    expect(restoreWorkflow).toContain("CONFIRMATION\" != 'RESTORE'")
    expect(restoreWorkflow).not.toContain('drill_confirmation')
    expect(restoreWorkflow).not.toContain('inputs.operations_image_digest')
    expect(restoreWorkflow).toContain('download-restore-descriptor-ftps.sh')
    expect(restoreWorkflow).toContain('steps.restore-export.outputs.operations_image')
  })

  it('restores an authenticated disposable export without exposing the protected archive', () => {
    const packageConfiguration = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }
    const restoreWorkflow = readFileSync('.github/workflows/restore-production-offsite.yml', 'utf8')
    const restoreJob = readFileSync('infra/azure/offsite-restore-job.bicep', 'utf8')
    const downloader = readFileSync('scripts/operations/download-offsite-backup-ftps.sh', 'utf8')
    const productionPull = readFileSync('scripts/pull-production-data.sh', 'utf8')
    const restoreDownloadContainerStart = restoreWorkflow.indexOf(
      'docker run --rm --read-only --user 0:0',
    )
    const restoreDownloadContainerEnd = restoreWorkflow.indexOf(
      '/opt/wkf/download-offsite-backup-ftps.sh',
      restoreDownloadContainerStart,
    )
    const restoreDownloadContainer = restoreWorkflow.slice(
      restoreDownloadContainerStart,
      restoreDownloadContainerEnd,
    )
    const manifestDecryptContainerStart = restoreWorkflow.indexOf(
      'docker run --rm --network none --read-only --user 0:0',
    )
    const manifestDecryptContainerEnd = restoreWorkflow.indexOf(
      'manifest_operations_image=',
      manifestDecryptContainerStart,
    )
    const manifestDecryptContainer = restoreWorkflow.slice(
      manifestDecryptContainerStart,
      manifestDecryptContainerEnd,
    )

    expect(packageConfiguration.scripts['production:pull']).toBe(
      'bash scripts/pull-production-data.sh',
    )
    expect(packageConfiguration.scripts['backup:prepare-restore']).toBe(
      'tsx scripts/prepare-production-restore.ts',
    )
    expect(restoreWorkflow).toContain('OFFSITE_RESTORE_FTPS_PASSWORD')
    expect(restoreWorkflow).toContain('OFFSITE_RESTORE_AGE_IDENTITY')
    expect(restoreWorkflow).toContain('vars.OFFSITE_RESTORE_FTPS_PORT')
    expect(restoreWorkflow).not.toContain('vars.OFFSITE_BACKUP_FTPS_PORT')
    expect(restoreWorkflow).toContain('az deployment group what-if')
    expect(restoreWorkflow).toContain('infra/azure/offsite-restore-job.bicep')
    expect(restoreWorkflow).toContain('Production remains inactive')
    expect(restoreDownloadContainerStart).toBeGreaterThan(-1)
    expect(restoreDownloadContainerEnd).toBeGreaterThan(restoreDownloadContainerStart)
    expect(restoreDownloadContainer).toContain('--cap-add DAC_READ_SEARCH')
    expect(restoreDownloadContainer).toContain('--cap-add DAC_OVERRIDE')
    expect(restoreDownloadContainer).toContain('--cap-add CHOWN')
    expect(manifestDecryptContainerStart).toBeGreaterThan(-1)
    expect(manifestDecryptContainerEnd).toBeGreaterThan(manifestDecryptContainerStart)
    expect(manifestDecryptContainer).toContain('--cap-add DAC_OVERRIDE')
    expect(restoreWorkflow).toContain(
      'revision list --all --resource-group "$resource_group" --name "$application_name"',
    )
    expect(restoreWorkflow).toContain(
      "sort_by([?properties.provisioningState == 'Provisioned' && properties.healthState == 'Healthy'], &properties.createdTime)[].name",
    )
    expect(restoreWorkflow).not.toContain(
      'sort_by([?properties.active], &properties.createdTime)[-1].name',
    )
    expect(restoreWorkflow).not.toContain('OFFSITE_BACKUP_FTPS_PASSWORD')
    expect(restoreJob).toContain('/opt/wkf/download-offsite-backup-ftps.sh')
    expect(restoreJob).toContain('/opt/wkf/restore-offsite-backup.sh')
    expect(restoreJob).toContain('export AZCOPY_AUTO_LOGIN_TYPE=MSI')
    expect(restoreJob).toContain('export AZCOPY_MSI_CLIENT_ID="$AZURE_STORAGE_IDENTITY_CLIENT_ID"')
    expect(restoreJob).toContain('Could not count restored production blobs with Managed Identity.')
    expect(restoreJob).toContain(
      'Production restore verification failed: blobs=$restored_blob_count expected_blobs=$expected_blob_count sessions=$session_count expected_sessions=0',
    )
    expect(restoreJob).toContain("lifecycle: 'ephemeral-operation'")
    expect(restoreJob).not.toContain('archive')
    expect(restoreWorkflow).toContain(
      'az containerapp job logs show --resource-group "$resource_group" --name "$job_name" --execution "$execution_name" --container restore --tail 300 --format text',
    )
    const restoreScript = readFileSync('scripts/operations/restore-offsite-backup.sh', 'utf8')
    expect(restoreScript).toContain("--expression='/ EXTENSION - pgaudit[[:space:]]*$/d'")
    expect(restoreScript).toContain('--use-list "$restore_list_path"')
    expect(downloader).toContain("--proto '=ftp'")
    expect(downloader).toContain('--ssl-reqd')
    expect(downloader).toContain('validate-restore-descriptor.sh')
    expect(downloader).toContain('validate-offsite-backup.sh')
    expect(downloader).not.toContain('--upload-file')
    expect(productionPull).toContain('PRODUCTION_BACKUP_AGE_IDENTITY_FILE')
    expect(productionPull).toContain('STAGING_PULL_LOCAL_CHECKPOINT_ROOT')
    expect(productionPull).toContain('PRODUCTION_PULL_ALLOW_CODE_MISMATCH')
    const productionExtractContainerStart = productionPull.indexOf(
      'docker run --rm --network none --read-only --user 0:0',
    )
    const productionExtractContainerEnd = productionPull.indexOf(
      '/opt/wkf/extract-offsite-backup.sh',
      productionExtractContainerStart,
    )
    const productionExtractContainer = productionPull.slice(
      productionExtractContainerStart,
      productionExtractContainerEnd,
    )
    expect(productionExtractContainerStart).toBeGreaterThan(-1)
    expect(productionExtractContainerEnd).toBeGreaterThan(productionExtractContainerStart)
    expect(productionExtractContainer).toContain('--cap-add DAC_READ_SEARCH')
    expect(productionExtractContainer).toContain('--cap-add DAC_OVERRIDE')
    expect(productionExtractContainer).toContain('--cap-add CHOWN')
    expect(productionPull).toContain('local_checkpoint_name="${backup_name,,}"')
    expect(productionPull).toContain('--arg checkpointName "$local_checkpoint_name"')
    expect(productionPull).toContain(
      'bash scripts/pull-staging-data.sh "$local_checkpoint_name" IMPORT',
    )
  })

  it('restores only to a revision matching the signed backup application identity', () => {
    const restoreWorkflow = readFileSync('.github/workflows/restore-production-offsite.yml', 'utf8')
    const manifestValidation = restoreWorkflow.indexOf('id: validated-backup')
    const revisionResolution = restoreWorkflow.indexOf(
      'name: Resolve the exact production revision for the signed backup',
    )

    expect(manifestValidation).toBeGreaterThan(-1)
    expect(revisionResolution).toBeGreaterThan(manifestValidation)
    expect(restoreWorkflow).toContain(
      'MANIFEST_IMAGE_REFERENCE: ${{ steps.validated-backup.outputs.image_reference }}',
    )
    expect(restoreWorkflow).toContain(
      'MANIFEST_SOURCE_SHA: ${{ steps.validated-backup.outputs.source_sha }}',
    )
    expect(restoreWorkflow).toContain('[[ "$revision_image" == "$MANIFEST_IMAGE_REFERENCE" ]]')
    expect(restoreWorkflow).toContain('[[ "$revision_source_sha" == "$MANIFEST_SOURCE_SHA" ]]')
    expect(restoreWorkflow).toContain(
      'No healthy, provisioned production revision exactly matches the signed backup application identity.',
    )
    expect(restoreWorkflow).not.toContain("migration_job='wkf-prod-migrate'")
    expect(restoreWorkflow).toContain(
      'bash scripts/run-production-database-operation.sh reconcile-grants',
    )
  })

  it('validates a complete checkpoint before replacing production data', () => {
    const importScript = readFileSync('scripts/operations/import-production-checkpoint.sh', 'utf8')
    const stagingCheckpointScript = readFileSync('scripts/staging-checkpoint/artifacts.sh', 'utf8')

    expect(stagingCheckpointScript).toContain('media-manifest.jsonl')
    expect(stagingCheckpointScript).toContain('mediaManifestSha256')
    expect(importScript).toContain('Production import requires the exact confirmation value IMPORT')
    expect(importScript).toContain('Checkpoint database checksum does not match')
    expect(importScript).toContain('Checkpoint is missing media blob')
    expect(importScript).toContain('Checkpoint media count does not match its media manifest')
    expect(importScript).toContain('Checkpoint media checksum mismatch')
    expect(importScript.indexOf('Checkpoint validated before destructive work')).toBeLessThan(
      importScript.indexOf('azcopy remove "$production_url"'),
    )
    expect(importScript).toContain('TRUNCATE TABLE users_sessions, payload_locked_documents')
  })

  it('uses keyring-free managed identity authentication for AzCopy operations', () => {
    const operationScripts = [
      'scripts/operations/import-production-checkpoint.sh',
      'scripts/operations/backup-offsite.sh',
      'scripts/operations/restore-offsite-backup.sh',
    ].map((scriptPath) => readFileSync(scriptPath, 'utf8'))

    for (const operationScript of operationScripts) {
      expect(operationScript).toContain('export AZCOPY_AUTO_LOGIN_TYPE=MSI')
      expect(operationScript).toContain(
        'export AZCOPY_MSI_CLIENT_ID="$AZURE_STORAGE_IDENTITY_CLIENT_ID"',
      )
      expect(operationScript).not.toContain('azcopy login')
    }
  })

  it('keeps off-site backup publication encrypted and atomic', () => {
    const backupScript = readFileSync('scripts/operations/backup-offsite.sh', 'utf8')
    const archiverScript = readFileSync('scripts/operations/archive-offsite-backups.sh', 'utf8')
    const validatorScript = readFileSync('scripts/operations/validate-offsite-backup.sh', 'utf8')
    const restoreScript = readFileSync('scripts/operations/restore-offsite-backup.sh', 'utf8')

    expect(backupScript).toContain('pg_dump')
    expect(backupScript).toContain('age --recipient')
    expect(backupScript).toContain('ssh-keygen -Y sign')
    expect(backupScript).toContain('--ssl-reqd')
    expect(backupScript).toContain("--proto '=ftp'")
    expect(backupScript).toContain('.MessageContent | fromjson | .Path')
    expect(backupScript).not.toMatch(/azcopy list[^\n]*--recursive/)
    expect(backupScript.indexOf('manifest.json.age.sig')).toBeLessThan(
      backupScript.lastIndexOf('remote_backup_directory/.complete'),
    )
    expect(backupScript).toContain('deployedSourceSha')
    expect(backupScript).toContain('migrationState')
    expect(backupScript).toContain('formatVersion: 3')
    expect(backupScript).toContain('uniqueBlobCount')
    expect(backupScript).toContain('storage-manifest.json')
    expect(backupScript).toContain('wkf-production-backup-storage')
    expect(backupScript).toContain('signingKeyFingerprint')
    expect(backupScript).toContain('FROM payload_migrations')
    expect(backupScript).toContain('done 3<"$blob_names_path"')
    expect(validatorScript).toContain('pg_restore --list')
    expect(validatorScript).toContain('-Y verify')
    expect(validatorScript).toContain('completion marker checksums do not match')
    expect(validatorScript).toContain('Validated blob count does not match')
    expect(validatorScript).toContain('.formatVersion == 3')
    expect(archiverScript).toContain('objects/sha256')
    expect(archiverScript).toContain('replica-1.age')
    expect(archiverScript).toContain('replica-2.age')
    expect(archiverScript).toContain('ln "$object_directory/replica-1.age"')
    expect(restoreScript).toContain("confirmation\" != 'RESTORE'")
    expect(restoreScript).toContain('pg_restore --exit-on-error')
    expect(restoreScript).toContain('TRUNCATE TABLE users_sessions, payload_locked_documents')
    expect(restoreScript).toContain('Blob changed after backup validation')
  })

  it('keeps Azure restore drills isolated from production data and public ingress', () => {
    const restoreDrill = readFileSync('infra/azure/offsite-restore-drill.bicep', 'utf8')

    expect(restoreDrill).toContain("var sourceContainerName = 'restore-source'")
    expect(restoreDrill).toContain("var restoredMediaContainerName = 'restored-media'")
    expect(restoreDrill).toContain("environment: 'restore-drill'")
    expect(restoreDrill).toContain("lifecycle: 'ephemeral-operation'")
    expect(restoreDrill).toContain('allowSharedKeyAccess: false')
    expect(restoreDrill).toContain('external: false')
    expect(restoreDrill).toContain("name: 'BACKUP_SIGNING_IDENTITY'")
    expect(restoreDrill).toContain("value: 'wkf-production-restore'")
    expect(restoreDrill).toContain('restoredApplicationEnabled bool = false')
    expect(restoreDrill).toContain('storageAllowPublicUpload bool = true')
    expect(restoreDrill).not.toContain("name: 'wkf-prod'")
  })

  it('runs off-site backups as serialized ephemeral production jobs', () => {
    const backupWorkflow = readFileSync('.github/workflows/backup-production-data.yml', 'utf8')
    const backupJob = readFileSync('infra/azure/offsite-backup-job.bicep', 'utf8')

    expect(backupWorkflow).toContain('group: production-operations')
    expect(backupWorkflow).toContain('environment: prod-backup')
    expect(backupWorkflow).toContain('deployments: read')
    expect(backupWorkflow).toContain('Resolve latest successful staging deployment')
    expect(backupWorkflow).toContain('environment=staging')
    expect(backupWorkflow).toContain('select(.ref == "master")')
    expect(backupWorkflow).toContain('/statuses?per_page=1')
    expect(backupWorkflow).toContain("== 'success'")
    expect(backupWorkflow).toContain('ref: ${{ steps.qualified-staging.outputs.source_sha }}')
    expect(backupWorkflow).toContain('wkf-operations:${QUALIFIED_SOURCE_SHA}')
    expect(backupWorkflow).not.toContain('wkf-operations:${GITHUB_SHA}')
    expect(backupWorkflow).toContain('POSTGRES_BACKUP_PASSWORD')
    expect(backupWorkflow).not.toContain('POSTGRES_RUNTIME_PASSWORD')
    expect(backupWorkflow).not.toContain('POSTGRES_MIGRATOR_PASSWORD')
    expect(backupWorkflow).toContain('postgresql://wkf_backup:')
    expect(backupWorkflow).toContain('az containerapp revision deactivate')
    expect(backupWorkflow).toContain('reactivate_application')
    expect(backupWorkflow).toContain("always() && steps.resources.outcome == 'success'")
    expect(backupWorkflow).toContain(`"$root" == '200' && "$admin" == '200'`)
    expect(backupWorkflow).toContain('infra/azure/offsite-backup-job.bicep')
    expect(backupWorkflow).toContain('az deployment group delete')
    expect(backupWorkflow).toContain("cron: '49 0 * * *'")
    expect(backupWorkflow).toContain('OFFSITE_BACKUP_FTPS_PASSWORD')
    expect(backupWorkflow).toContain('OFFSITE_BACKUP_SIGNING_PRIVATE_KEY')
    expect(backupWorkflow).not.toContain('OFFSITE_BACKUP_SFTP_')
    expect(backupJob).toContain("'/opt/wkf/backup-offsite.sh'")
    expect(backupJob).toContain("name: 'ftps-password'")
    expect(backupJob).toContain("name: 'manifest-signing-private-key'")
    expect(backupJob).toContain("lifecycle: 'ephemeral-operation'")
  })

  it('treats an already active production revision as a successful recovery', () => {
    const backupWorkflow = readFileSync('.github/workflows/backup-production-data.yml', 'utf8')

    expect(
      backupWorkflow.match(/bash scripts\/ensure-containerapp-revision-active\.sh/g),
    ).toHaveLength(2)
  })
})
