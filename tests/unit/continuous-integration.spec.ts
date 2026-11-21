import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('CI and runtime images', () => {
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

  it('switches away from the unreliable Azure Ubuntu mirror before installing Playwright', () => {
    const continuousIntegrationWorkflow = readFileSync('.github/workflows/ci.yml', 'utf8')
    const endToEndJob = continuousIntegrationWorkflow
      .split('  end-to-end:')[1]
      ?.split('\n  validate-container:')[0]

    expect(endToEndJob).toBeDefined()
    expect(endToEndJob).toContain('sudo bash scripts/configure-ci-ubuntu-mirror.sh')
    expect(endToEndJob!.indexOf('Use global Ubuntu package mirror')).toBeLessThan(
      endToEndJob!.indexOf('playwright install --with-deps chromium'),
    )
  })

  it.each([
    'mirror+file:/etc/apt/apt-mirrors.txt',
    'http://azure.archive.ubuntu.com/ubuntu/',
    'http://us-east-2.ec2.archive.ubuntu.com/ubuntu',
    'https://archive.ubuntu.com/ubuntu/',
  ])('uses the global Ubuntu archive when the runner source is %s', (archiveSource) => {
    const fixtureDirectory = mkdtempSync(join(tmpdir(), 'wkf-apt-mirror-'))
    const ubuntuSourcesPath = join(fixtureDirectory, 'ubuntu.sources')
    const securitySource = 'URIs: http://security.ubuntu.com/ubuntu/'
    const sources = (archive: string) =>
      [
        'Types: deb',
        `URIs: ${archive}`,
        'Suites: noble noble-updates noble-backports',
        '',
        'Types: deb',
        securitySource,
        'Suites: noble-security',
        '',
      ].join('\n')

    try {
      writeFileSync(ubuntuSourcesPath, sources(archiveSource))
      execFileSync('bash', ['scripts/configure-ci-ubuntu-mirror.sh', ubuntuSourcesPath], {
        stdio: 'pipe',
      })
      expect(readFileSync(ubuntuSourcesPath, 'utf8')).toBe(
        sources('https://archive.ubuntu.com/ubuntu/'),
      )
    } finally {
      rmSync(fixtureDirectory, { force: true, recursive: true })
    }
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
})
