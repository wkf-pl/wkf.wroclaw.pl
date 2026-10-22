import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('deployment workflows', () => {
  it('pins and verifies the Payload Azure adapter patch used for managed identity', () => {
    const packageConfiguration = JSON.parse(readFileSync('package.json', 'utf8')) as {
      dependencies: Record<string, string>
    }
    const workspaceConfiguration = readFileSync('pnpm-workspace.yaml', 'utf8')
    const adapterPatch = readFileSync('patches/@payloadcms__storage-azure@3.90.2.patch', 'utf8')

    expect(packageConfiguration.dependencies['@payloadcms/storage-azure']).toBe('3.90.2')
    expect(workspaceConfiguration).toContain(
      "'@payloadcms/storage-azure@3.90.2': patches/@payloadcms__storage-azure@3.90.2.patch",
    )
    expect(adapterPatch).toContain('getStorageClient?: () => ContainerClient')
    expect(adapterPatch).toContain('azureStorageOptions.getStorageClient ??')
  })

  it('keeps automatic production migrations out of the application runtime', () => {
    const payloadConfiguration = readFileSync('src/payload.config.ts', 'utf8')

    expect(payloadConfiguration).toContain(
      "getEnvironmentBoolean('PAYLOAD_RUN_MIGRATIONS_ON_START')",
    )
    expect(payloadConfiguration).toContain('disableCreateDatabase: true')
    expect(payloadConfiguration).toContain("getEnvironmentInteger('DATABASE_POOL_MAX', 8)")
    expect(payloadConfiguration).toContain(
      'runProductionMigrations ? { prodMigrations: migrations } : {}',
    )
  })

  it('classifies application, infrastructure, and migration changes independently', () => {
    const classifier = readFileSync('scripts/classify-deployment.sh', 'utf8')

    expect(classifier).toContain('infra/azure/*.md)')
    expect(classifier).toContain('infra/azure/*)')
    expect(classifier).toContain('provision_infrastructure=true')
    expect(classifier).toContain('migrations/*)')
    expect(classifier).toContain('run_migrations=true')
    expect(classifier).toContain(
      '.github/* | infra/* | scripts/deploy-azure.sh | scripts/classify-deployment.sh | *.md)',
    )
    expect(classifier).toContain('build_image=true')
    expect(classifier).toContain('git diff --name-only')
  })

  it('keeps the CI build single and staging deployment manual and cache-aware', () => {
    const continuousIntegrationWorkflow = readFileSync('.github/workflows/ci.yml', 'utf8')
    const stagingWorkflow = readFileSync('.github/workflows/deploy-staging.yml', 'utf8')

    expect(continuousIntegrationWorkflow.match(/run: pnpm build/g) ?? []).toHaveLength(1)
    expect(continuousIntegrationWorkflow).toContain('run: pnpm package:e2e-runtime')
    expect(continuousIntegrationWorkflow).not.toMatch(/^  push:/m)
    expect(continuousIntegrationWorkflow).toContain('cache-to: type=gha,mode=max,scope=wkf-online')
    expect(stagingWorkflow).toMatch(/^  workflow_dispatch:/m)
    expect(stagingWorkflow).not.toMatch(/^  push:/m)
    expect(stagingWorkflow).toContain('Require an explicit master deployment')
    expect(stagingWorkflow).toContain("GITHUB_REF\" != 'refs/heads/master'")
    expect(stagingWorkflow).toContain('docker/build-push-action@v7')
    expect(stagingWorkflow).toContain('push: true')
    expect(stagingWorkflow).not.toContain('az acr build')
  })

  it('runs every repository-level validation in CI', () => {
    const continuousIntegrationWorkflow = readFileSync('.github/workflows/ci.yml', 'utf8')
    const endToEndJob = continuousIntegrationWorkflow
      .split('  end-to-end:')[1]
      ?.split('\n  validate-container:')[0]

    expect(continuousIntegrationWorkflow).toContain('run: pnpm format:check')
    expect(continuousIntegrationWorkflow).toContain('run: pnpm generate:importmap')
    expect(continuousIntegrationWorkflow).toContain('git diff --exit-code --')
    expect(continuousIntegrationWorkflow).toContain('run: pnpm lint')
    expect(continuousIntegrationWorkflow).toContain('run: pnpm typecheck')
    expect(continuousIntegrationWorkflow).toContain('run: pnpm test:unit')
    expect(continuousIntegrationWorkflow).toContain('run: pnpm test:integration')
    expect(continuousIntegrationWorkflow).toContain('playwright install --with-deps chromium')
    expect(continuousIntegrationWorkflow).toContain('run: pnpm test:e2e:ci')
    expect(endToEndJob).toBeDefined()
    expect(endToEndJob).toContain('runs-on: ubuntu-24.04')
  })

  it('preserves deployment safety boundaries', () => {
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')
    const applicationTemplate = readFileSync('infra/azure/modules/application.bicep', 'utf8')
    const restorePreviousRevision = deploymentScript
      .split('restore_previous_revision() {')[1]
      ?.split('\n}\n\nrollback_deployment()')[0]

    expect(deploymentScript).toContain('sort_by([?properties.active], &properties.createdTime)')
    expect(deploymentScript).toContain('DEPLOYMENT_HEALTH_TIMEOUT_SECONDS:-600')
    expect(deploymentScript).toContain('No migration changes detected')
    expect(deploymentScript).toContain('restore_previous_revision')
    expect(restorePreviousRevision).toBeDefined()
    expect(restorePreviousRevision).toContain('get_latest_revision')
    expect(restorePreviousRevision).toContain('az containerapp revision deactivate')
    expect(restorePreviousRevision).toContain('az containerapp revision activate')
    expect(restorePreviousRevision).toContain('wait_for_revision_ready')
    expect(restorePreviousRevision).not.toContain('previous_revision_active')
    expect(deploymentScript).toContain('infrastructure_image_reference="$target_image_reference"')
    expect(deploymentScript).toMatch(
      /infrastructure_image_reference="\$target_image_reference"[\s\S]*application_update_started=true/,
    )
    expect(deploymentScript).toMatch(
      /if \[\[ "\$run_migrations" == "true" \]\]; then[\s\S]*infrastructure_image_reference="\$previous_image_reference"/,
    )
    expect(applicationTemplate).toContain("name: 'DEPLOYED_SOURCE_SHA'")
  })

  it('allows first production migrations to finish on the burstable database tier', () => {
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')
    const environmentTemplate = readFileSync('infra/azure/modules/environment.bicep', 'utf8')
    const migrationJobTemplate = readFileSync('infra/azure/modules/migration-job.bicep', 'utf8')

    expect(deploymentScript).toContain('MIGRATION_TIMEOUT_SECONDS:-3600')
    expect(deploymentScript).toContain('MIGRATION_TIMEOUT_SECONDS:-1800')
    expect(deploymentScript).toContain('SECONDS + migration_timeout_seconds')
    expect(deploymentScript).toContain('--replica-timeout "$migration_timeout_seconds"')
    expect(environmentTemplate).toContain('replicaTimeoutSeconds: isProduction ? 3600 : 1800')
    expect(migrationJobTemplate).toContain('param replicaTimeoutSeconds int')
    expect(migrationJobTemplate).toContain('replicaTimeout: replicaTimeoutSeconds')
  })

  it('keeps Azure budget start dates stable across monthly reconciliations', () => {
    const mainTemplate = readFileSync('infra/azure/main.bicep', 'utf8')
    const stagingParameters = readFileSync('infra/azure/environments/staging.bicepparam', 'utf8')
    const productionParameters = readFileSync('infra/azure/environments/prod.bicepparam', 'utf8')
    const subscriptionBudgetTemplate = readFileSync('infra/azure/subscription-budget.bicep', 'utf8')

    expect(mainTemplate).toContain('param budgetStartDate string')
    expect(mainTemplate).not.toContain("budgetStartDate string = utcNow('yyyy-MM-01')")
    expect(stagingParameters).toContain("param budgetStartDate = '2026-09-01'")
    expect(productionParameters).toContain("param budgetStartDate = '2026-10-01'")
    expect(subscriptionBudgetTemplate).toContain('param budgetStartDate string')
    expect(subscriptionBudgetTemplate).not.toContain(
      "budgetStartDate string = utcNow('yyyy-MM-01')",
    )
  })

  it('serializes PostgreSQL configuration and creates deletion locks after their targets', () => {
    const postgresTemplate = readFileSync('infra/azure/modules/postgres.bicep', 'utf8')
    const environmentTemplate = readFileSync('infra/azure/modules/environment.bicep', 'utf8')

    expect(postgresTemplate).toMatch(/resource logConnections[\s\S]*?dependsOn: \[\s*database\s*\]/)
    expect(postgresTemplate).toMatch(
      /resource logDisconnections[\s\S]*?dependsOn: \[\s*logConnections\s*\]/,
    )
    expect(postgresTemplate).toMatch(
      /resource extensions[\s\S]*?dependsOn: \[\s*logDisconnections\s*\]/,
    )
    expect(environmentTemplate).toMatch(
      /resource postgresDeleteLock[\s\S]*?dependsOn: \[\s*postgres\s*\]/,
    )
    expect(environmentTemplate).toMatch(
      /resource storageDeleteLock[\s\S]*?dependsOn: \[\s*storage\s*\]/,
    )
  })

  it('keeps staging public while protecting the production dry launch with Entra', () => {
    const stagingWorkflow = readFileSync('.github/workflows/deploy-staging.yml', 'utf8')
    const stagingParameters = readFileSync('infra/azure/environments/staging.bicepparam', 'utf8')
    const productionParameters = readFileSync('infra/azure/environments/prod.bicepparam', 'utf8')
    const applicationTemplate = readFileSync('infra/azure/modules/application.bicep', 'utf8')

    expect(stagingParameters).toContain('param enableEntraAuthentication = false')
    expect(stagingParameters).not.toContain('STAGING_ENTRA_')
    expect(stagingWorkflow).not.toContain('STAGING_ENTRA_')
    expect(productionParameters).toContain('param enableEntraAuthentication = true')
    expect(applicationTemplate).toContain(
      "resource authentication 'Microsoft.App/containerApps/authConfigs@2024-03-01' = {",
    )
    expect(applicationTemplate).toContain('properties: enableEntraAuthentication')
    expect(applicationTemplate).toContain("unauthenticatedClientAction: 'AllowAnonymous'")
  })

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
    expect(stagingDataScript).toContain('GRANT ALL ON SCHEMA public')
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
    expect(stagingPullScript).toContain('run --rm --no-deps app pnpm migrate')
    expect(stagingPullScript).toContain('TRUNCATE TABLE users_sessions, payload_locked_documents')
    expect(stagingPullScript.indexOf('>"$local_rescue_directory/database.dump"')).toBeLessThan(
      stagingPullScript.indexOf('destructive_import_started=true'),
    )
    expect(stagingPullScript).not.toMatch(/staging_storage blob (?:delete|upload)/)
  })

  it('copies only production dependencies into the runtime image', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf8')

    expect(dockerfile).toContain('FROM dependencies AS production-dependencies')
    expect(dockerfile).toContain('RUN pnpm prune --prod')
    expect(dockerfile).toContain('COPY --from=production-dependencies')
  })

  it('copies pnpm dependency patches before installing Docker dependencies', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf8')
    const dependenciesStage = dockerfile
      .split('FROM base AS dependencies')[1]
      ?.split('FROM base AS development')[0]

    expect(dependenciesStage).toBeDefined()
    expect(dependenciesStage).toContain('COPY patches ./patches')
    expect(dependenciesStage).toContain(
      'COPY scripts/patch-payload-ui-client.mjs ./scripts/patch-payload-ui-client.mjs',
    )
    expect(dependenciesStage!.indexOf('COPY patches ./patches')).toBeLessThan(
      dependenciesStage!.indexOf('RUN pnpm install --frozen-lockfile'),
    )
    expect(
      dependenciesStage!.indexOf(
        'COPY scripts/patch-payload-ui-client.mjs ./scripts/patch-payload-ui-client.mjs',
      ),
    ).toBeLessThan(dependenciesStage!.indexOf('RUN pnpm install --frozen-lockfile'))
  })

  it('never starts a Next development server during staging or production operations', () => {
    const deploymentFiles = [
      '.github/workflows/deploy-staging.yml',
      '.github/workflows/deploy-production.yml',
      '.github/workflows/manage-staging-data.yml',
      '.github/workflows/restore-production-offsite.yml',
      'scripts/deploy-azure.sh',
      'scripts/manage-staging-data.sh',
      'scripts/pull-production-data.sh',
      'scripts/pull-staging-data.sh',
    ]

    for (const deploymentFile of deploymentFiles) {
      const content = readFileSync(deploymentFile, 'utf8')
      expect(content).not.toMatch(/\bnext dev\b|\bpnpm dev(?::container)?\b/)
    }

    const runtimeImage = readFileSync('Dockerfile', 'utf8').split('FROM base AS runner')[1]
    expect(runtimeImage).toBeDefined()
    expect(runtimeImage).not.toMatch(/\bnext dev\b|\bpnpm dev(?::container)?\b/)
    expect(runtimeImage).toContain('CMD ["node", "server.js"]')
  })

  it('checks readiness before liveness after deployments and staging data operations', () => {
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')
    const stagingDataScript = readFileSync('scripts/manage-staging-data.sh', 'utf8')

    for (const content of [deploymentScript, stagingDataScript]) {
      expect(content.indexOf('/api/health')).toBeGreaterThanOrEqual(0)
      expect(content.indexOf('/api/health/live')).toBeGreaterThan(content.indexOf('/api/health'))
    }
  })

  it('uses environment-specific expectations for public deployment routes', () => {
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')

    expect(deploymentScript).toContain('expected_root_status="401"')
    expect(deploymentScript).toContain('expected_admin_status="401"')
    expect(deploymentScript).toContain('expected_robots_status="401"')
    expect(deploymentScript).toMatch(
      /if \[\[ "\$target_environment" == "staging" \]\]; then[\s\S]*expected_root_status="200"[\s\S]*expected_admin_status="200"[\s\S]*expected_robots_status="200"/,
    )
    expect(deploymentScript).toContain('"$root_status" == "$expected_root_status"')
    expect(deploymentScript).toContain('"$admin_status" == "$expected_admin_status"')
    expect(deploymentScript).toContain('"$robots_status" != "$expected_robots_status"')
  })

  it('keeps each environment within its availability and resource limits', () => {
    const mainTemplate = readFileSync('infra/azure/main.bicep', 'utf8')
    const applicationTemplate = readFileSync('infra/azure/modules/application.bicep', 'utf8')
    const environmentTemplate = readFileSync('infra/azure/modules/environment.bicep', 'utf8')
    const stagingParameters = readFileSync('infra/azure/environments/staging.bicepparam', 'utf8')
    const productionParameters = readFileSync('infra/azure/environments/prod.bicepparam', 'utf8')

    expect(mainTemplate).toMatch(/@maxValue\(1\)[\s\S]*param maximumReplicas int = 1/)
    expect(environmentTemplate).toMatch(/@maxValue\(1\)[\s\S]*param maximumReplicas int/)
    expect(applicationTemplate).toMatch(/@maxValue\(1\)[\s\S]*param maximumReplicas int/)
    expect(stagingParameters).toMatch(/param minimumReplicas = 0/)
    expect(stagingParameters).toMatch(/param maximumReplicas = 1/)
    expect(productionParameters).toMatch(/param minimumReplicas = 1/)
    expect(productionParameters).toMatch(/param maximumReplicas = 1/)
    expect(applicationTemplate).toContain("cpu: json('0.5')")
    expect(applicationTemplate).toContain("memory: '1Gi'")
    expect(applicationTemplate).toMatch(
      /type: 'Liveness'[\s\S]*path: '\/api\/health\/live'[\s\S]*periodSeconds: 30[\s\S]*failureThreshold: 3/,
    )
    expect(applicationTemplate).toMatch(
      /type: 'Readiness'[\s\S]*path: '\/api\/health'[\s\S]*periodSeconds: 10/,
    )
    expect(applicationTemplate).not.toMatch(/^\s*'\/health'\s*$/m)
  })

  it('defines the accepted private and low-cost production posture', () => {
    const productionParameters = readFileSync('infra/azure/environments/prod.bicepparam', 'utf8')
    const networkTemplate = readFileSync('infra/azure/modules/network.bicep', 'utf8')
    const postgresTemplate = readFileSync('infra/azure/modules/postgres.bicep', 'utf8')
    const storageTemplate = readFileSync('infra/azure/modules/storage.bicep', 'utf8')
    const applicationTemplate = readFileSync('infra/azure/modules/application.bicep', 'utf8')

    expect(productionParameters).toContain("param postgresSkuName = 'Standard_B1ms'")
    expect(productionParameters).toContain('param postgresBackupRetentionDays = 35')
    expect(productionParameters).toContain('param monthlyBudgetAmount = 50')
    expect(productionParameters).not.toContain("param customDomainName = 'wkf.wroclaw.pl'")
    expect(networkTemplate).toContain("'10.20.0.0/24'")
    expect(networkTemplate).toContain("addressPrefix: '10.20.0.0/27'")
    expect(networkTemplate).toContain("addressPrefix: '10.20.0.32/28'")
    expect(postgresTemplate).toContain("publicNetworkAccess: 'Disabled'")
    expect(postgresTemplate).toContain("value: 'pg_stat_statements,pgaudit'")
    expect(postgresTemplate).toContain("value: 'ROLE,DDL'")
    expect(postgresTemplate).toContain("category: 'PostgreSQLLogs'")
    expect(postgresTemplate).not.toContain("categoryGroup: 'audit'")
    expect(storageTemplate).toContain("skuName string = 'Standard_LRS'")
    expect(storageTemplate).toContain('allowSharedKeyAccess: allowSharedKeyAccess')
    expect(storageTemplate).toContain('daysAfterCreationGreaterThan: 90')
    expect(applicationTemplate).toContain("unauthenticatedClientAction: 'Return401'")
    expect(applicationTemplate).toContain("name: 'PUBLIC_LAUNCH_ENABLED'")
    expect(applicationTemplate).toContain("value: 'false'")
  })

  it('uses deterministic names for resources targeted by production locks', () => {
    const environmentTemplate = readFileSync('infra/azure/modules/environment.bicep', 'utf8')

    expect(environmentTemplate).toMatch(/resource postgresServer[^}]+name: postgresServerName/)
    expect(environmentTemplate).toMatch(/resource storageAccount[^}]+name: storageAccountName/)
    expect(environmentTemplate).not.toMatch(
      /resource postgresServer[^}]+name: postgres\.outputs\.name/,
    )
    expect(environmentTemplate).not.toMatch(
      /resource storageAccount[^}]+name: storage\.outputs\.accountName/,
    )
  })

  it('separates production provisioning, role bootstrap, migration, and application launch', () => {
    const productionWorkflow = readFileSync('.github/workflows/deploy-production.yml', 'utf8')
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')
    const databaseOperationScript = readFileSync(
      'scripts/run-production-database-operation.sh',
      'utf8',
    )
    const bootstrapScript = readFileSync('scripts/operations/bootstrap-postgres-roles.sql', 'utf8')
    const grantsScript = readFileSync('scripts/operations/reconcile-postgres-grants.sql', 'utf8')
    const bootstrapJob = readFileSync('infra/azure/bootstrap-job.bicep', 'utf8')

    expect(productionWorkflow).toContain('group: production-operations')
    expect(productionWorkflow).toContain('- provision\n          - bootstrap\n          - deploy')
    expect(productionWorkflow).toContain("$GITHUB_REF\" != 'refs/heads/master'")
    expect(productionWorkflow).not.toContain('infra/azure/shared.bicep')
    expect(productionWorkflow).toContain('POSTGRES_BACKUP_PASSWORD')
    expect(readFileSync('infra/azure/modules/registry-roles.bicep', 'utf8')).toContain(
      'resource deploymentRegistryPull',
    )
    expect(deploymentScript).toContain('--provision-only')
    expect(deploymentScript).toContain('isConfigPendingRestart')
    expect(deploymentScript).toContain('reconcile-grants')
    expect(bootstrapScript).toContain('REVOKE CREATE ON SCHEMA public FROM PUBLIC')
    expect(bootstrapScript).toContain('CREATE ROLE wkf_migrator')
    expect(bootstrapScript).toContain('CREATE ROLE wkf_runtime')
    expect(bootstrapScript).toContain('CREATE ROLE wkf_backup')
    expect(bootstrapScript).toContain('NOCREATEDB NOCREATEROLE')
    expect(bootstrapScript).toContain('CREATE EXTENSION IF NOT EXISTS pgaudit')
    expect(bootstrapScript).not.toContain('REASSIGN OWNED BY CURRENT_USER')
    expect(bootstrapJob).toContain("name: 'POSTGRES_BACKUP_PASSWORD'")
    expect(databaseOperationScript).toContain('backupPassword="$POSTGRES_BACKUP_PASSWORD"')
    expect(grantsScript).toContain('GRANT SELECT, INSERT, UPDATE, DELETE')
    expect(grantsScript).toContain('GRANT SELECT ON ALL TABLES IN SCHEMA public TO wkf_backup')
    expect(grantsScript).not.toContain(
      'INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO wkf_backup',
    )
    expect(grantsScript).toContain('ALTER DEFAULT PRIVILEGES')
  })

  it('can adopt existing production bootstrap role assignments without replacing them', () => {
    const productionRoleTemplate = readFileSync('infra/azure/production-rbac.bicep', 'utf8')
    const deploymentRoleModule = readFileSync(
      'infra/azure/modules/production-deployment-role.bicep',
      'utf8',
    )
    const registryRoleModule = readFileSync('infra/azure/modules/registry-roles.bicep', 'utf8')

    expect(productionRoleTemplate).toContain(
      "param deploymentContributorRoleAssignmentName string = ''",
    )
    expect(productionRoleTemplate).toContain(
      "param deploymentRegistryReaderRoleAssignmentName string = ''",
    )
    expect(productionRoleTemplate).toContain(
      "param deploymentRegistryPullRoleAssignmentName string = ''",
    )
    expect(productionRoleTemplate).toContain(
      "param registryIdentityPullRoleAssignmentName string = ''",
    )
    expect(deploymentRoleModule).toContain(
      'empty(roleAssignmentName) ? guid(resourceGroup().id, deploymentPrincipalId',
    )
    expect(registryRoleModule).toContain(
      'empty(deploymentReaderRoleAssignmentName) ? guid(registry.id, deploymentPrincipalId',
    )
    expect(registryRoleModule).toContain(
      'empty(deploymentPullRoleAssignmentName) ? guid(registry.id, deploymentPrincipalId',
    )
    expect(registryRoleModule).toContain(
      'empty(registryPullRoleAssignmentName) ? guid(registry.id, registryIdentityPrincipalId',
    )
  })

  it('grants production deployment discovery only on the staging storage account', () => {
    const productionRoleTemplate = readFileSync('infra/azure/production-rbac.bicep', 'utf8')
    const stagingCheckpointRoleModule = readFileSync(
      'infra/azure/modules/staging-checkpoint-role.bicep',
      'utf8',
    )

    expect(productionRoleTemplate).toContain('deploymentPrincipalId: deploymentPrincipalId')
    expect(stagingCheckpointRoleModule).toContain("'acdd72a7-3385-48ef-bd42-f606fba81ae7'")
    expect(stagingCheckpointRoleModule).toContain('scope: stagingStorageAccount')
    expect(stagingCheckpointRoleModule).toContain(
      'guid(stagingStorageAccount.id, deploymentPrincipalId, readerRoleDefinitionId)',
    )
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
    expect(restoreWorkflow).toContain(
      'sort_by([?properties.active], &properties.createdTime)[-1].name',
    )
    expect(restoreWorkflow).not.toContain('OFFSITE_BACKUP_FTPS_PASSWORD')
    expect(restoreJob).toContain('/opt/wkf/download-offsite-backup-ftps.sh')
    expect(restoreJob).toContain('/opt/wkf/restore-offsite-backup.sh')
    expect(restoreJob).toContain("lifecycle: 'ephemeral-operation'")
    expect(restoreJob).not.toContain('archive')
    const restoreScript = readFileSync('scripts/operations/restore-offsite-backup.sh', 'utf8')
    expect(restoreScript).toContain("--expression='/ EXTENSION - pgaudit$/d'")
    expect(restoreScript).toContain('--use-list "$restore_list_path"')
    expect(downloader).toContain("--proto '=ftp'")
    expect(downloader).toContain('--ssl-reqd')
    expect(downloader).toContain('validate-restore-descriptor.sh')
    expect(downloader).toContain('validate-offsite-backup.sh')
    expect(downloader).not.toContain('--upload-file')
    expect(productionPull).toContain('PRODUCTION_BACKUP_AGE_IDENTITY_FILE')
    expect(productionPull).toContain('STAGING_PULL_LOCAL_CHECKPOINT_ROOT')
    expect(productionPull).toContain('PRODUCTION_PULL_ALLOW_CODE_MISMATCH')
  })

  it('keeps the production source SHA query in one shell argument', () => {
    const restoreWorkflow = readFileSync('.github/workflows/restore-production-offsite.yml', 'utf8')

    expect(restoreWorkflow).toContain(
      `--query "properties.template.containers[0].env[?name=='DEPLOYED_SOURCE_SHA'] | [0].value" --output tsv`,
    )
    expect(restoreWorkflow).not.toContain('--query \\"')
  })

  it('supports safe retries after a stopped preview and transient ARM failures', () => {
    const importWorkflow = readFileSync('.github/workflows/import-production-data.yml', 'utf8')
    const databaseOperationScript = readFileSync(
      'scripts/run-production-database-operation.sh',
      'utf8',
    )

    expect(importWorkflow).toContain('sort_by(@, &properties.createdTime)[-1].name')
    expect(databaseOperationScript).toContain('run_arm_deployment_with_retry')
    expect(databaseOperationScript).toContain('Service Unavailable')
    expect(databaseOperationScript).toContain('HTTP 503')
  })

  it('validates a complete checkpoint before replacing production data', () => {
    const importScript = readFileSync('scripts/operations/import-production-checkpoint.sh', 'utf8')
    const stagingCheckpointScript = readFileSync('scripts/manage-staging-data.sh', 'utf8')

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
    expect(backupScript).toContain('formatVersion: 2')
    expect(backupScript).toContain('signingKeyFingerprint')
    expect(backupScript).toContain('FROM payload_migrations')
    expect(backupScript).toContain('done 3<"$blob_names_path"')
    expect(validatorScript).toContain('pg_restore --list')
    expect(validatorScript).toContain('-Y verify')
    expect(validatorScript).toContain('completion marker checksums do not match')
    expect(validatorScript).toContain('Validated blob count does not match')
    expect(validatorScript).toContain('.formatVersion == 2')
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
    expect(backupWorkflow).toContain('POSTGRES_BACKUP_PASSWORD')
    expect(backupWorkflow).not.toContain('POSTGRES_RUNTIME_PASSWORD')
    expect(backupWorkflow).not.toContain('POSTGRES_MIGRATOR_PASSWORD')
    expect(backupWorkflow).toContain('postgresql://wkf_backup:')
    expect(backupWorkflow).toContain('az containerapp revision deactivate')
    expect(backupWorkflow).toContain('reactivate_application')
    expect(backupWorkflow).toContain("always() && steps.resources.outcome == 'success'")
    expect(backupWorkflow).toContain('infra/azure/offsite-backup-job.bicep')
    expect(backupWorkflow).toContain('az deployment group delete')
    expect(backupWorkflow).toContain("cron: '30 2 * * *'")
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
