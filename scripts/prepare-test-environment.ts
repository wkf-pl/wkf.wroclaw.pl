import { spawn } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { loadIntegrationTestEnvironment } from '../tests/helpers/test-environment'

type SchemaPreparationOptions = {
  expectedMigrationNames: readonly string[]
  getAppliedMigrationNames: () => Promise<string[]>
  migrateFresh: () => Promise<void>
}

export async function prepareFreshTestSchema({
  expectedMigrationNames,
  getAppliedMigrationNames,
  migrateFresh,
}: SchemaPreparationOptions): Promise<void> {
  await migrateFresh()
  const appliedMigrationNames = await getAppliedMigrationNames()
  const missingMigrationNames = expectedMigrationNames.filter(
    (migrationName) => !appliedMigrationNames.includes(migrationName),
  )
  const unexpectedMigrationNames = appliedMigrationNames.filter(
    (migrationName) => !expectedMigrationNames.includes(migrationName),
  )

  if (missingMigrationNames.length > 0 || unexpectedMigrationNames.length > 0) {
    throw new Error(
      [
        'Payload migrations did not create the expected schema.',
        `Missing migrations: ${missingMigrationNames.join(', ') || '<none>'}.`,
        `Unexpected migrations: ${unexpectedMigrationNames.join(', ') || '<none>'}.`,
      ].join(' '),
    )
  }
}

async function main(): Promise<void> {
  loadIntegrationTestEnvironment()
  await runCommand('docker', ['compose', 'up', '--wait', 'postgres-test', 'azurite'])
  await prepareFreshTestSchema({
    expectedMigrationNames: getExpectedMigrationNames(),
    getAppliedMigrationNames,
    migrateFresh: () =>
      runCommand('payload', ['migrate:fresh', '--force-accept-warning']).then(() => undefined),
  })
}

function getExpectedMigrationNames(): string[] {
  return readdirSync(resolve(process.cwd(), 'migrations'))
    .filter((fileName) => /^\d{8}_\d{6}.*\.ts$/.test(fileName))
    .map((fileName) => fileName.replace(/\.ts$/, ''))
    .sort()
}

async function getAppliedMigrationNames(): Promise<string[]> {
  const databaseURL = new URL(process.env.DATABASE_URL!)
  const databaseName = decodeURIComponent(databaseURL.pathname.replace(/^\//, ''))
  const databaseUser = decodeURIComponent(databaseURL.username)
  const migrationTableExists = await runDatabaseQuery(
    databaseUser,
    databaseName,
    "SELECT to_regclass('public.payload_migrations') IS NOT NULL;",
  )

  if (migrationTableExists.trim() !== 't') return []

  const output = await runDatabaseQuery(
    databaseUser,
    databaseName,
    'SELECT name FROM payload_migrations WHERE batch > 0 ORDER BY name;',
  )

  return output
    .split('\n')
    .map((migrationName) => migrationName.trim())
    .filter(Boolean)
}

function runDatabaseQuery(
  databaseUser: string,
  databaseName: string,
  query: string,
): Promise<string> {
  return runCommand(
    'docker',
    [
      'compose',
      'exec',
      '-T',
      'postgres-test',
      'psql',
      '-U',
      databaseUser,
      '-d',
      databaseName,
      '-tAc',
      query,
    ],
    true,
  )
}

function runCommand(command: string, arguments_: string[], captureOutput = false): Promise<string> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, arguments_, {
      env: process.env,
      stdio: captureOutput ? ['ignore', 'pipe', 'inherit'] : 'inherit',
    })
    let output = ''

    child.stdout?.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    child.on('error', reject)
    child.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolvePromise(output)
        return
      }

      reject(
        new Error(`${command} ${arguments_.join(' ')} exited with code ${exitCode ?? 'unknown'}.`),
      )
    })
  })
}

const entryPoint = process.argv[1]
if (entryPoint && resolve(entryPoint) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
