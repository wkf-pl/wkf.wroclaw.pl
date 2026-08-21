import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config'

const frontendURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000'
const webServerCommand = process.env.PLAYWRIGHT_WEB_SERVER_COMMAND || 'pnpm dev'
const reuseExistingServer = process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER !== 'false'
const outputDirectory =
  process.env.PLAYWRIGHT_OUTPUT_DIR || join(tmpdir(), 'wkf-online-playwright-results')
const reportDirectory =
  process.env.PLAYWRIGHT_HTML_OUTPUT_DIR || join(tmpdir(), 'wkf-online-playwright-report')
const shard = parseShard(process.env.PLAYWRIGHT_SHARD)

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  outputDir: outputDirectory,
  testDir: './tests/e2e',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never', outputFolder: reportDirectory }]]
    : [['html', { open: 'never', outputFolder: reportDirectory }]],
  shard,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: frontendURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chromium' },
    },
  ],
  webServer: {
    command: webServerCommand,
    reuseExistingServer,
    timeout: 120_000,
    url: `${frontendURL}/admin/login`,
  },
})

function parseShard(value: string | undefined): { current: number; total: number } | undefined {
  if (!value) return undefined

  const [current, total, unexpectedPart] = value.split('/').map(Number)
  if (
    unexpectedPart !== undefined ||
    !Number.isInteger(current) ||
    !Number.isInteger(total) ||
    current < 1 ||
    total < current
  ) {
    throw new Error(`PLAYWRIGHT_SHARD must use the current/total format, received: ${value}`)
  }

  return { current, total }
}
