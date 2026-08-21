import { config } from 'dotenv'
import { resolve } from 'node:path'

export const integrationTestDatabaseName = 'wkf_test'

export function assertIntegrationTestDatabaseURL(databaseURL: string): void {
  const parsedURL = new URL(databaseURL)
  const databaseName = parsedURL.pathname.replace(/^\//, '')

  if (databaseName !== integrationTestDatabaseName) {
    throw new Error(
      `Integration tests require the ${integrationTestDatabaseName} database, received ${databaseName || '<none>'}.`,
    )
  }
}

export function loadIntegrationTestEnvironment(): void {
  const result = config({
    override: true,
    path: resolve(process.cwd(), 'test.env'),
  })

  if (result.error) {
    throw new Error(`Could not load test.env: ${result.error.message}`)
  }

  const databaseURL = process.env.DATABASE_URL
  if (!databaseURL) {
    throw new Error('Integration tests require DATABASE_URL in test.env.')
  }

  assertIntegrationTestDatabaseURL(databaseURL)
}
