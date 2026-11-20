import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('Azure deployment', () => {
  it.each([
    {
      description: 'accepts rendered CMS listing markup',
      listing: '<div class="listingBlock"></div>',
      status: '200',
      exitCode: 0,
    },
    {
      description: 'rejects HTTP 200 without a listing',
      listing: '',
      status: '200',
      exitCode: 1,
    },
    {
      description: 'rejects a streamed Next.js render error',
      listing: '<div class="listingBlock"></div><template data-next-error-message="error">',
      status: '200',
      exitCode: 1,
    },
    {
      description: 'rejects redirects even if their body resembles the page',
      listing: '<div class="listingBlock"></div>',
      status: '307',
      exitCode: 1,
    },
  ])('$description on the revision hostname', ({ listing, status, exitCode }) => {
    const result = spawnSync(
      'bash',
      [
        '-c',
        `source scripts/staging-ingress-mode.sh
curl() {
  [[ "\${!#}" == 'https://candidate.example.test/aktualnosci' ]] || return 1
  printf '%s\n%s\n' "$PAGE_CONTENT" "$PAGE_STATUS"
}
check_staging_listing_page https://candidate.example.test`,
      ],
      {
        env: {
          ...process.env,
          PAGE_CONTENT: `<article class="cmsDocument cmsPageDocument">${listing}</article>`,
          PAGE_STATUS: status,
        },
      },
    )

    expect(result.status).toBe(exitCode)
  })

  it('classifies application, infrastructure, and migration changes independently', () => {
    const classifier = readFileSync('scripts/classify-deployment.sh', 'utf8')

    expect(classifier).toContain('infra/azure/*.md)')
    expect(classifier).toContain('infra/azure/*)')
    expect(classifier).toContain('provision_infrastructure=true')
    expect(classifier).toContain('migrations/*)')
    expect(classifier).toContain('run_migrations=true')
    expect(classifier).toContain(
      '.github/* | infra/* | scripts/deploy-azure.sh | scripts/deployment/* | scripts/classify-deployment.sh | *.md)',
    )
    expect(classifier).toContain('build_image=true')
    expect(classifier).toContain('git diff --name-only')
  })

  it('preserves deployment safety boundaries', () => {
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')
    const revisionScript = readFileSync('scripts/deployment/revisions.sh', 'utf8')
    const applicationTemplate = readFileSync('infra/azure/modules/application.bicep', 'utf8')
    const restorePreviousRevision = revisionScript.split('restore_previous_revision() {')[1]

    expect(revisionScript).toContain('sort_by([?properties.active], &properties.createdTime)')
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

  it('keeps production public while retaining optional Entra sign-in', () => {
    const stagingWorkflow = readFileSync('.github/workflows/deploy-staging.yml', 'utf8')
    const stagingParameters = readFileSync('infra/azure/environments/staging.bicepparam', 'utf8')
    const productionParameters = readFileSync('infra/azure/environments/prod.bicepparam', 'utf8')
    const applicationTemplate = readFileSync('infra/azure/modules/application.bicep', 'utf8')

    expect(stagingParameters).toContain('param enableEntraAuthentication = false')
    expect(stagingParameters).not.toContain('STAGING_ENTRA_')
    expect(stagingWorkflow).not.toContain('STAGING_ENTRA_')
    expect(productionParameters).toContain('param enableEntraAuthentication = true')
    expect(productionParameters).toContain('param requireEntraSignIn = false')
    expect(applicationTemplate).toContain(
      "resource authentication 'Microsoft.App/containerApps/authConfigs@2024-03-01' = {",
    )
    expect(applicationTemplate).toContain('properties: enableEntraAuthentication')
    expect(applicationTemplate).toContain(
      "unauthenticatedClientAction: requireEntraSignIn ? 'Return401' : 'AllowAnonymous'",
    )
  })

  it('publishes production while keeping staging pre-launch', () => {
    const mainTemplate = readFileSync('infra/azure/main.bicep', 'utf8')
    const environmentTemplate = readFileSync('infra/azure/modules/environment.bicep', 'utf8')
    const applicationTemplate = readFileSync('infra/azure/modules/application.bicep', 'utf8')
    const stagingParameters = readFileSync('infra/azure/environments/staging.bicepparam', 'utf8')
    const productionParameters = readFileSync('infra/azure/environments/prod.bicepparam', 'utf8')
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')

    expect(mainTemplate).toContain('param publicLaunchEnabled bool = false')
    expect(environmentTemplate).toContain('param publicLaunchEnabled bool')
    expect(environmentTemplate).toContain('publicLaunchEnabled: publicLaunchEnabled')
    expect(applicationTemplate).toContain('param publicLaunchEnabled bool = false')
    expect(applicationTemplate).toContain("value: publicLaunchEnabled ? 'true' : 'false'")
    expect(stagingParameters).toContain('param publicLaunchEnabled = false')
    expect(productionParameters).toContain('param publicLaunchEnabled = true')
    expect(deploymentScript).toContain("target_environment\" == 'prod'")
    expect(deploymentScript).toContain("expected_robots_directive='Allow: /'")
    expect(deploymentScript).toContain("expected_robots_directive='Disallow: /'")
  })

  it('persists the canonical host and redirect host bindings', () => {
    const mainTemplate = readFileSync('infra/azure/main.bicep', 'utf8')
    const environmentTemplate = readFileSync('infra/azure/modules/environment.bicep', 'utf8')
    const applicationTemplate = readFileSync('infra/azure/modules/application.bicep', 'utf8')
    const productionParameters = readFileSync('infra/azure/environments/prod.bicepparam', 'utf8')
    const productionWorkflow = readFileSync('.github/workflows/deploy-production.yml', 'utf8')
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')

    expect(mainTemplate).toContain("param redirectDomainName string = ''")
    expect(mainTemplate).toContain("param redirectDomainCertificateId string = ''")
    expect(environmentTemplate).toContain('redirectDomainName: redirectDomainName')
    expect(environmentTemplate).toContain(
      'redirectDomainCertificateId: redirectDomainCertificateId',
    )
    expect(applicationTemplate).toContain('var customDomains = concat(')
    expect(applicationTemplate).toContain('customDomains: customDomains')
    expect(applicationTemplate).toContain('allowInsecure: false')
    expect(productionParameters).toContain("param redirectDomainName = 'www.wkf.wroclaw.pl'")
    expect(productionWorkflow).toContain(
      'REDIRECT_DOMAIN_CERTIFICATE_ID: ${{ vars.REDIRECT_DOMAIN_CERTIFICATE_ID }}',
    )
    expect(deploymentScript).toContain(
      'redirectDomainCertificateId="${REDIRECT_DOMAIN_CERTIFICATE_ID:-}"',
    )
  })

  it('checks readiness before liveness after deployments and staging data operations', () => {
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')
    const stagingDataScript = readFileSync('scripts/manage-staging-data.sh', 'utf8')

    for (const content of [deploymentScript, stagingDataScript]) {
      expect(content.indexOf('/api/health')).toBeGreaterThanOrEqual(0)
      expect(content.indexOf('/api/health/live')).toBeGreaterThan(content.indexOf('/api/health'))
    }
  })

  it('requires public routes after every deployment', () => {
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')

    expect(deploymentScript).toContain('expected_root_status="200"')
    expect(deploymentScript).toContain('expected_admin_status="200"')
    expect(deploymentScript).toContain('expected_robots_status="200"')
    expect(deploymentScript).toContain("expected_robots_directive='Allow: /'")
    expect(deploymentScript).toContain("expected_robots_directive='Disallow: /'")
    expect(deploymentScript).not.toContain('expected_root_status="401"')
    expect(deploymentScript).toContain('"$root_status" == "$expected_root_status"')
    expect(deploymentScript).toContain('"$admin_status" == "$expected_admin_status"')
    expect(deploymentScript).toContain('"$robots_status" != "$expected_robots_status"')
    expect(deploymentScript).toContain(
      'grep --fixed-strings --line-regexp "$expected_robots_directive"',
    )
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
    expect(productionParameters).toContain('param postgresMaxLocksPerTransaction = 256')
    expect(productionParameters).toContain('param monthlyBudgetAmount = 50')
    expect(productionParameters).toContain("param customDomainName = 'wkf.wroclaw.pl'")
    expect(networkTemplate).toContain("'10.20.0.0/24'")
    expect(networkTemplate).toContain("addressPrefix: '10.20.0.0/27'")
    expect(networkTemplate).toContain("addressPrefix: '10.20.0.32/28'")
    expect(postgresTemplate).toContain("publicNetworkAccess: 'Disabled'")
    expect(postgresTemplate).toContain("value: 'pg_stat_statements,pgaudit'")
    expect(postgresTemplate).toContain("value: 'ROLE,DDL'")
    expect(postgresTemplate).toContain("name: 'max_locks_per_transaction'")
    expect(postgresTemplate).toContain('value: string(maxLocksPerTransaction)')
    expect(postgresTemplate).toContain("category: 'PostgreSQLLogs'")
    expect(postgresTemplate).not.toContain("categoryGroup: 'audit'")
    expect(storageTemplate).toContain("skuName string = 'Standard_LRS'")
    expect(storageTemplate).toContain('allowSharedKeyAccess: allowSharedKeyAccess')
    expect(storageTemplate).toContain('daysAfterCreationGreaterThan: 90')
    expect(applicationTemplate).toContain(
      "unauthenticatedClientAction: requireEntraSignIn ? 'Return401' : 'AllowAnonymous'",
    )
    expect(applicationTemplate).toContain("name: 'PUBLIC_LAUNCH_ENABLED'")
    expect(applicationTemplate).toContain("value: publicLaunchEnabled ? 'true' : 'false'")
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
})
