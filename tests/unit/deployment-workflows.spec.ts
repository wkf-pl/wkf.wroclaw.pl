import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('deployment workflows', () => {
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

  it('keeps the CI and staging build paths single and cache-aware', () => {
    const continuousIntegrationWorkflow = readFileSync('.github/workflows/ci.yml', 'utf8')
    const stagingTriggerWorkflow = readFileSync(
      '.github/workflows/deploy-staging-on-master.yml',
      'utf8',
    )
    const stagingWorkflow = readFileSync('.github/workflows/deploy-staging.yml', 'utf8')

    expect(continuousIntegrationWorkflow).not.toContain('run: pnpm build')
    expect(continuousIntegrationWorkflow).not.toMatch(/^  push:/m)
    expect(continuousIntegrationWorkflow).toContain('cache-to: type=gha,mode=max,scope=wkf-online')
    expect(stagingTriggerWorkflow).toMatch(/^  push:\n    branches:\n      - master$/m)
    expect(stagingTriggerWorkflow).toContain('uses: ./.github/workflows/deploy-staging.yml')
    expect(stagingTriggerWorkflow).not.toContain('needs:')
    expect(stagingWorkflow).toContain('git ls-remote origin refs/heads/master')
    expect(stagingWorkflow).toContain('docker/build-push-action@v7')
    expect(stagingWorkflow).toContain('push: true')
    expect(stagingWorkflow).not.toContain('az acr build')
  })

  it('runs every repository-level validation in CI', () => {
    const continuousIntegrationWorkflow = readFileSync('.github/workflows/ci.yml', 'utf8')

    expect(continuousIntegrationWorkflow).toContain('run: pnpm format:check')
    expect(continuousIntegrationWorkflow).toContain('run: pnpm generate:importmap')
    expect(continuousIntegrationWorkflow).toContain('git diff --exit-code --')
    expect(continuousIntegrationWorkflow).toContain('run: pnpm test:integration')
    expect(continuousIntegrationWorkflow).toContain('playwright install --with-deps chromium')
    expect(continuousIntegrationWorkflow).toContain('run: pnpm test:e2e:ci')
  })

  it('preserves deployment safety boundaries', () => {
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')
    const applicationTemplate = readFileSync('infra/azure/modules/application.bicep', 'utf8')

    expect(deploymentScript).toContain('sort_by([?properties.active], &properties.createdTime)')
    expect(deploymentScript).toContain('DEPLOYMENT_HEALTH_TIMEOUT_SECONDS:-600')
    expect(deploymentScript).toContain('No migration changes detected')
    expect(deploymentScript).toContain('restore_previous_revision')
    expect(deploymentScript).toContain('infrastructure_image_reference="$target_image_reference"')
    expect(deploymentScript).toMatch(
      /infrastructure_image_reference="\$target_image_reference"[\s\S]*application_update_started=true/,
    )
    expect(deploymentScript).toMatch(
      /if \[\[ "\$run_migrations" == "true" \]\]; then[\s\S]*infrastructure_image_reference="\$previous_image_reference"/,
    )
    expect(applicationTemplate).toContain("name: 'DEPLOYED_SOURCE_SHA'")
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
    expect(storageTemplate).toContain('isVersioningEnabled: enableStagingCheckpoints')
    expect(storageTemplate).toContain('containerDeleteRetentionPolicy')
    expect(storageTemplate).toContain('deleteRetentionPolicy')
  })

  it('copies only production dependencies into the runtime image', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf8')

    expect(dockerfile).toContain('FROM dependencies AS production-dependencies')
    expect(dockerfile).toContain('RUN pnpm prune --prod')
    expect(dockerfile).toContain('COPY --from=production-dependencies')
  })

  it('never starts a Next development server during staging or production operations', () => {
    const deploymentFiles = [
      '.github/workflows/deploy-staging.yml',
      '.github/workflows/deploy-staging-on-master.yml',
      '.github/workflows/deploy-production.yml',
      '.github/workflows/manage-staging-data.yml',
      'scripts/deploy-azure.sh',
      'scripts/manage-staging-data.sh',
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
})
