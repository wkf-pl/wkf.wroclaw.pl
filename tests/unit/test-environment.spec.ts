import { readdirSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { prepareFreshTestSchema } from '../../scripts/prepare-test-environment'

import {
  assertIntegrationTestDatabaseURL,
  integrationTestDatabaseName,
} from '../helpers/test-environment'

describe('integration test environment', () => {
  it('uses migrations instead of interactive schema pushes', () => {
    const payloadConfiguration = readFileSync('src/payload.config.ts', 'utf8')
    const composeConfiguration = readFileSync('compose.yml', 'utf8')
    const containerStartupScript = readFileSync('scripts/start-development-container.sh', 'utf8')

    expect(payloadConfiguration).toContain('push: false')
    expect(payloadConfiguration).not.toContain('shouldPushDatabaseSchema')
    expect(composeConfiguration).toContain('command: ./scripts/start-development-container.sh')
    expect(containerStartupScript).toContain(
      'pnpm exec tsx scripts/prepare-development-migrations.ts\npnpm payload migrate\nexec pnpm dev:container',
    )
  })

  it('uses the dedicated test database configured by the setup file', () => {
    expect(new URL(process.env.DATABASE_URL!).pathname).toBe(`/${integrationTestDatabaseName}`)
  })

  it('rejects a development database URL', () => {
    expect(() =>
      assertIntegrationTestDatabaseURL('postgresql://wkf:wkf@127.0.0.1:5432/wkf'),
    ).toThrow('Integration tests require the wkf_test database')
  })

  it('prepares the isolated database before running integration tests', () => {
    const packageConfiguration = readFileSync('package.json', 'utf8')
    const packageScripts = JSON.parse(packageConfiguration).scripts as Record<string, string>
    const preparationScript = readFileSync('scripts/prepare-test-environment.ts', 'utf8')
    const composeConfiguration = readFileSync('compose.yml', 'utf8')
    const testEnvironment = readFileSync('test.env', 'utf8')

    expect(packageScripts['prepare:integration']).toContain('scripts/prepare-test-environment.ts')
    expect(packageScripts['prepare:integration']).not.toContain('scripts/seed.ts')
    expect(preparationScript).toContain('payload.db.migrateFresh')
    expect(preparationScript).not.toContain("runCommand('payload'")
    expect(preparationScript).toContain('payloadConfig.typescript.autoGenerate = false')
    expect(composeConfiguration).toContain('- path: .env\n        required: false')
    expect(testEnvironment).toContain('AZURE_STORAGE_ALLOW_CONTAINER_CREATE=true')
  })

  it('creates a fresh schema once and verifies its complete migration history', async () => {
    let migrationAttempts = 0

    await prepareFreshTestSchema({
      expectedMigrationNames: ['001_initial'],
      getAppliedMigrationNames: async () => ['001_initial'],
      migrateFresh: async () => {
        migrationAttempts += 1
      },
    })

    expect(migrationAttempts).toBe(1)
  })

  it('fails before seeding when a successful migration command does not create the schema', async () => {
    await expect(
      prepareFreshTestSchema({
        expectedMigrationNames: ['001_initial', '002_content'],
        getAppliedMigrationNames: async () => [],
        migrateFresh: async () => undefined,
      }),
    ).rejects.toThrow(
      'Payload migrations did not create the expected schema. Missing migrations: 001_initial, 002_content.',
    )
  })

  it('runs CI end-to-end tests against the isolated test environment', () => {
    const packageConfiguration = readFileSync('package.json', 'utf8')
    const packageScripts = JSON.parse(packageConfiguration).scripts as Record<string, string>
    const prePushScript = readFileSync('scripts/pre-push.ts', 'utf8')
    const runtimePackagingScript = readFileSync('scripts/package-e2e-runtime.sh', 'utf8')
    const scriptsDocumentation = readFileSync('scripts/README.md', 'utf8')
    const playwrightConfiguration = readFileSync('playwright.config.ts', 'utf8')

    expect(packageScripts['prepare:e2e']).toContain('scripts/seed.ts')
    expect(packageScripts['seed']).toContain('tsx ./scripts/seed.ts')
    expect(packageScripts['test:e2e:ci']).toContain('pnpm prepare:e2e')
    expect(packageScripts['test:e2e:ci']).toContain('WKF_E2E_RUNTIME_DIRECTORY')
    expect(packageScripts['test:e2e:ci:production']).toBeUndefined()
    expect(packageScripts['package:e2e-runtime']).toBe('bash scripts/package-e2e-runtime.sh')
    expect(packageConfiguration).toContain('DOTENV_CONFIG_OVERRIDE=true')
    expect(packageConfiguration).toContain('DOTENV_CONFIG_PATH=test.env')
    expect(packageConfiguration).toContain('PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100')
    expect(packageConfiguration).toContain('PLAYWRIGHT_REUSE_EXISTING_SERVER=false')
    expect(runtimePackagingScript).toContain('NEXT_DIST_DIR:-.next-host')
    expect(runtimePackagingScript).toContain('standalone')
    expect(runtimePackagingScript).toContain('runtime_distribution_directory')
    expect(runtimePackagingScript).toContain('public')
    expect(prePushScript).toContain(
      'replaceReusableEndToEndRuntime(runtimeDirectory, reusableEndToEndRuntimeDirectory)',
    )
    expect(prePushScript).toContain('WKF_E2E_RUNTIME_DIRECTORY: reusableEndToEndRuntimeDirectory')
    expect(scriptsDocumentation).toContain(
      '`test:e2e:ci` deliberately consumes an existing runtime instead of building one.',
    )
    expect(scriptsDocumentation).toContain('pnpm test:e2e:ci --grep')
    expect(scriptsDocumentation).not.toContain('pnpm test:e2e:ci -- --grep')
    for (const scriptName of Object.keys(packageScripts)) {
      expect(scriptsDocumentation).toContain(`pnpm ${scriptName}`)
    }
    expect(playwrightConfiguration).toContain('PLAYWRIGHT_OUTPUT_DIR')
    expect(playwrightConfiguration).toContain('PLAYWRIGHT_HTML_OUTPUT_DIR')
    expect(playwrightConfiguration).toContain("join(tmpdir(), 'wkf-online-playwright-results')")
    expect(playwrightConfiguration).toContain("join(tmpdir(), 'wkf-online-playwright-report')")
    expect(playwrightConfiguration).toContain('failOnFlakyTests: !!process.env.CI')
    expect(playwrightConfiguration).toContain(
      "trace: process.env.CI ? 'retain-on-first-failure' : 'on-first-retry'",
    )
  })

  it('provides the seed author when Payload validates filtered global relationships', () => {
    const seedScript = readFileSync('scripts/seed.ts', 'utf8')
    const globalUpdates = seedScript.match(/await payload\.updateGlobal\(\{[\s\S]*?^  \}\)/gm) ?? []

    expect(globalUpdates).toHaveLength(4)
    expect(globalUpdates.every((globalUpdate) => globalUpdate.includes('user: author'))).toBe(true)
  })

  it('manages shared Playwright users once per complete run', () => {
    const playwrightConfiguration = readFileSync('playwright.config.ts', 'utf8')
    const endToEndSpecifications = readdirSync('tests/e2e').filter((fileName) =>
      fileName.endsWith('.spec.ts'),
    )

    expect(playwrightConfiguration).toContain("globalSetup: './tests/e2e/global-setup.ts'")
    expect(playwrightConfiguration).toContain("globalTeardown: './tests/e2e/global-teardown.ts'")

    for (const fileName of endToEndSpecifications) {
      const specification = readFileSync(`tests/e2e/${fileName}`, 'utf8')
      expect(specification).not.toContain('seedTestUsers')
      expect(specification).not.toContain('cleanupTestUsers')
    }
  })

  it('authenticates E2E helpers without repeatedly exercising the login form', () => {
    const loginHelper = readFileSync('tests/helpers/login.ts', 'utf8')

    expect(loginHelper).toContain('page.request.post(`${serverURL}/api/users/login`')
    expect(loginHelper).not.toContain("page.fill('#field-email'")
    expect(loginHelper).not.toContain("page.fill('#field-password'")
  })

  it('builds one verified production runtime before starting the E2E shards', () => {
    const continuousIntegrationWorkflow = readFileSync('.github/workflows/ci.yml', 'utf8')

    expect(continuousIntegrationWorkflow).toMatch(/^  verify:\n/m)
    expect(continuousIntegrationWorkflow).toMatch(/^  build-e2e:\n/m)
    expect(continuousIntegrationWorkflow).toMatch(/^  integration:\n/m)
    expect(continuousIntegrationWorkflow).toMatch(/^  end-to-end:\n/m)
    expect(continuousIntegrationWorkflow).toMatch(/^  validate-container:\n/m)
    expect(continuousIntegrationWorkflow).toContain('needs: [verify, build-e2e]')
    expect(continuousIntegrationWorkflow).toContain('run: pnpm package:e2e-runtime')
    expect(continuousIntegrationWorkflow).toContain('name: wkf-next-runtime-${{ github.sha }}')
    expect(continuousIntegrationWorkflow).toContain('uses: actions/download-artifact@v8')
    expect(continuousIntegrationWorkflow).toContain('run: pnpm test:e2e:ci')
    expect(continuousIntegrationWorkflow).toContain('shard: [1, 2, 3, 4]')
    expect(continuousIntegrationWorkflow).toContain('PLAYWRIGHT_SHARD: ${{ matrix.shard }}/4')
    expect(continuousIntegrationWorkflow).toContain('playwright-diagnostics-${{ matrix.shard }}')

    const validateContainerJob = continuousIntegrationWorkflow.split('  validate-container:\n')[1]
    expect(validateContainerJob).toBeDefined()
    expect(validateContainerJob).not.toContain('needs:')
  })

  it('keeps local validation commands explicit', () => {
    const packageConfiguration = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }

    expect(packageConfiguration.scripts.check).toBeUndefined()
    expect(packageConfiguration.scripts.test).toBe('pnpm test:unit && pnpm test:integration')
    expect(packageConfiguration.scripts['pre-push']).toBe('tsx ./scripts/pre-push.ts')
  })

  it('cancels superseded CI runs for the same pull request', () => {
    const continuousIntegrationWorkflow = readFileSync('.github/workflows/ci.yml', 'utf8')

    expect(continuousIntegrationWorkflow).toContain(
      'group: ci-${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}',
    )
    expect(continuousIntegrationWorkflow).toContain('cancel-in-progress: true')
  })

  it('keeps host and container Next build artifacts separate', () => {
    const continuousIntegrationSetup = readFileSync(
      '.github/actions/setup-project/action.yml',
      'utf8',
    )
    const composeConfiguration = readFileSync('compose.yml', 'utf8')
    const developmentServerScript = readFileSync('scripts/run-development-server.sh', 'utf8')
    const temporaryPreviewScript = readFileSync('scripts/run-temporary-preview.sh', 'utf8')
    const dockerfile = readFileSync('Dockerfile', 'utf8')
    const eslintConfiguration = readFileSync('eslint.config.mjs', 'utf8')
    const nextConfiguration = readFileSync('next.config.ts', 'utf8')
    const packageConfiguration = readFileSync('package.json', 'utf8')
    const packageScripts = JSON.parse(packageConfiguration).scripts as Record<string, string>

    expect(packageScripts.dev).toBe('bash scripts/run-development-server.sh')
    expect(packageScripts['dev:container']).toContain('NEXT_DIST_DIR=.next-container')
    expect(developmentServerScript).toContain('WKF_ALLOW_NEXT_DEV')
    expect(developmentServerScript).toContain('NEXT_DIST_DIR:-.next-host')
    expect(temporaryPreviewScript).toContain('if [[ "${1:-}" == "--" ]]')
    expect(continuousIntegrationSetup).toContain('node-version: 22.18.0')
    expect(dockerfile).toMatch(/^FROM node:22\.18\.0-alpine AS base$/m)
    expect(temporaryPreviewScript).toContain('volta run --node 22.18.0 pnpm dev\n')
    expect(temporaryPreviewScript).not.toContain('pnpm dev --\n')
    expect(temporaryPreviewScript).toContain('NEXT_DIST_DIR="$preview_directory_relative"')
    expect(temporaryPreviewScript).not.toContain('NEXT_DIST_DIR="$preview_directory"')
    expect(temporaryPreviewScript).toContain('NEXT_TSCONFIG_PATH=')
    expect(temporaryPreviewScript).toContain('printf \'{"extends":"../tsconfig.json"}')
    expect(temporaryPreviewScript).toContain('remove_preview_tsconfig')
    expect(temporaryPreviewScript).toContain('preview_process_group_is_running')
    expect(nextConfiguration).toContain(
      "tsconfigPath: process.env.NEXT_TSCONFIG_PATH || 'tsconfig.json'",
    )
    expect(packageConfiguration).toContain(
      '"build": "cross-env NODE_ENV=production NEXT_DIST_DIR=.next-host',
    )
    expect(packageConfiguration).toContain('"build:container": "cross-env NODE_ENV=production')
    expect(composeConfiguration).toContain('command: ./scripts/start-development-container.sh')
    expect(composeConfiguration).toContain('NODE_ENV: development')
    expect(composeConfiguration).toContain("WKF_ALLOW_NEXT_DEV: '1'")
    expect(composeConfiguration).toContain('app_next:/app/.next-container')
    expect(eslintConfiguration).toContain("'.next*/**'")
  })

  it('installs bash in the development image used by the container startup command', () => {
    const dockerfile = readFileSync('Dockerfile', 'utf8')
    const developmentImage = dockerfile
      .split('FROM base AS development')[1]
      ?.split('FROM development AS builder')[0]

    expect(developmentImage).toBeDefined()
    expect(developmentImage).toContain('apk add --no-cache bash')
  })
})
