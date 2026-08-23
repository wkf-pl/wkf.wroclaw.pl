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
    expect(applicationTemplate).toContain("name: 'DEPLOYED_SOURCE_SHA'")
  })

  it('copies only production dependencies into the runtime image', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf8')

    expect(dockerfile).toContain('FROM dependencies AS production-dependencies')
    expect(dockerfile).toContain('RUN pnpm prune --prod')
    expect(dockerfile).toContain('COPY --from=production-dependencies')
  })

  it('keeps the local Next data cache on a single scale-to-zero replica', () => {
    const mainTemplate = readFileSync('infra/azure/main.bicep', 'utf8')
    const stagingParameters = readFileSync('infra/azure/environments/staging.bicepparam', 'utf8')
    const productionParameters = readFileSync('infra/azure/environments/prod.bicepparam', 'utf8')

    for (const content of [mainTemplate, stagingParameters, productionParameters]) {
      expect(content).toMatch(/param minimumReplicas(?: int)? = 0/)
      expect(content).toMatch(/param maximumReplicas(?: int)? = 1/)
    }
  })
})
