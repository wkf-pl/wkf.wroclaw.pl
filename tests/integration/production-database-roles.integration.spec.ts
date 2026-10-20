import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const databaseName = 'wkf_production_roles_test'
const administratorPassword = 'wkf'
const backupPassword = 'backup-integration-password'
const migratorPassword = 'migrator-integration-password'
const runtimePassword = 'runtime-integration-password'

type CommandResult = {
  exitCode: number
  stderr: string
  stdout: string
}

function runDockerCompose(arguments_: string[], input?: string): Promise<CommandResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('docker', ['compose', ...arguments_], {
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let stderr = ''
    let stdout = ''

    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString()
    })
    child.on('error', reject)
    child.on('close', (exitCode) => {
      resolvePromise({ exitCode: exitCode ?? -1, stderr, stdout })
    })
    child.stdin.end(input)
  })
}

function psqlArguments(
  databaseUser: string,
  targetDatabase: string,
  password: string,
  extraArguments: string[],
): string[] {
  return [
    'exec',
    '-T',
    '-e',
    `PGPASSWORD=${password}`,
    'postgres-test',
    'psql',
    '--host',
    '127.0.0.1',
    '--username',
    databaseUser,
    '--dbname',
    targetDatabase,
    '--set',
    'ON_ERROR_STOP=1',
    ...extraArguments,
  ]
}

async function runSQL(
  databaseUser: string,
  targetDatabase: string,
  password: string,
  sql: string,
): Promise<CommandResult> {
  return runDockerCompose(psqlArguments(databaseUser, targetDatabase, password, ['--command', sql]))
}

async function resetRoleTestDatabase(): Promise<void> {
  const dropDatabase = await runSQL(
    'wkf',
    'postgres',
    administratorPassword,
    `DROP DATABASE IF EXISTS ${databaseName} WITH (FORCE)`,
  )
  expect(dropDatabase.exitCode, dropDatabase.stderr).toBe(0)

  const dropRoles = await runSQL(
    'wkf',
    'postgres',
    administratorPassword,
    'DROP ROLE IF EXISTS wkf_backup; DROP ROLE IF EXISTS wkf_runtime; DROP ROLE IF EXISTS wkf_migrator',
  )
  expect(dropRoles.exitCode, dropRoles.stderr).toBe(0)
}

beforeAll(async () => {
  await resetRoleTestDatabase()

  const createDatabase = await runSQL(
    'wkf',
    'postgres',
    administratorPassword,
    `CREATE DATABASE ${databaseName}`,
  )
  expect(createDatabase.exitCode, createDatabase.stderr).toBe(0)

  const bootstrapSQL = readFileSync('scripts/operations/bootstrap-postgres-roles.sql', 'utf8')
  const bootstrap = await runDockerCompose(
    psqlArguments('wkf', databaseName, administratorPassword, [
      '--set',
      'install_audit_extension=false',
      '--set',
      `backup_password=${backupPassword}`,
      '--set',
      `migrator_password=${migratorPassword}`,
      '--set',
      `runtime_password=${runtimePassword}`,
    ]),
    bootstrapSQL,
  )
  expect(bootstrap.exitCode, bootstrap.stderr).toBe(0)

  const createObjects = await runSQL(
    'wkf_migrator',
    databaseName,
    migratorPassword,
    "CREATE TABLE role_grant_probe (id integer PRIMARY KEY, value text NOT NULL); CREATE SEQUENCE role_grant_sequence; INSERT INTO role_grant_probe VALUES (1, 'initial')",
  )
  expect(createObjects.exitCode, createObjects.stderr).toBe(0)

  const reconcileSQL = readFileSync('scripts/operations/reconcile-postgres-grants.sql', 'utf8')
  const reconcile = await runDockerCompose(
    psqlArguments('wkf_migrator', databaseName, migratorPassword, []),
    reconcileSQL,
  )
  expect(reconcile.exitCode, reconcile.stderr).toBe(0)
})

afterAll(async () => {
  await resetRoleTestDatabase()
})

describe('production PostgreSQL roles', () => {
  it('allows the backup role to read tables and sequences', async () => {
    const result = await runSQL(
      'wkf_backup',
      databaseName,
      backupPassword,
      'SELECT value FROM role_grant_probe WHERE id = 1; SELECT last_value FROM role_grant_sequence',
    )

    expect(result.exitCode, result.stderr).toBe(0)
    expect(result.stdout).toContain('initial')
  })

  it('allows the backup role to create a complete custom-format dump', async () => {
    const dumpPath = '/tmp/wkf-backup-role-test.dump'
    const result = await runDockerCompose([
      'exec',
      '-T',
      '-e',
      `PGPASSWORD=${backupPassword}`,
      'postgres-test',
      'pg_dump',
      '--host',
      '127.0.0.1',
      '--username',
      'wkf_backup',
      '--dbname',
      databaseName,
      '--format',
      'custom',
      '--file',
      dumpPath,
    ])
    const cleanup = await runDockerCompose(['exec', '-T', 'postgres-test', 'rm', '-f', dumpPath])

    expect(result.exitCode, result.stderr).toBe(0)
    expect(cleanup.exitCode, cleanup.stderr).toBe(0)
  })

  it.each([
    ['inserting rows', "INSERT INTO role_grant_probe VALUES (3, 'backup')"],
    ['updating rows', "UPDATE role_grant_probe SET value = 'backup' WHERE id = 1"],
    ['deleting rows', 'DELETE FROM role_grant_probe WHERE id = 1'],
    ['creating tables', 'CREATE TABLE backup_must_not_create (id integer)'],
    ['creating roles', 'CREATE ROLE backup_must_not_create'],
  ])('prevents the backup role from %s', async (_operation, sql) => {
    const result = await runSQL('wkf_backup', databaseName, backupPassword, sql)

    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toMatch(/permission denied|must be superuser/)
  })

  it('allows runtime DML and sequence use', async () => {
    const result = await runSQL(
      'wkf_runtime',
      databaseName,
      runtimePassword,
      "SELECT value FROM role_grant_probe WHERE id = 1; INSERT INTO role_grant_probe VALUES (2, 'runtime'); UPDATE role_grant_probe SET value = 'updated' WHERE id = 2; DELETE FROM role_grant_probe WHERE id = 2; SELECT nextval('role_grant_sequence')",
    )

    expect(result.exitCode, result.stderr).toBe(0)
    expect(result.stdout).toContain('initial')
  })

  it.each([
    ['tables', 'CREATE TABLE runtime_must_not_create (id integer)'],
    ['roles', 'CREATE ROLE runtime_must_not_create'],
    ['extensions', 'CREATE EXTENSION hstore'],
  ])('prevents runtime from creating %s', async (_resource, sql) => {
    const result = await runSQL('wkf_runtime', databaseName, runtimePassword, sql)

    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toMatch(/permission denied|must be superuser/)
  })

  it('allows migrator DDL but not role management', async () => {
    const ddlResult = await runSQL(
      'wkf_migrator',
      databaseName,
      migratorPassword,
      'ALTER TABLE role_grant_probe ADD COLUMN migrated boolean DEFAULT false; DROP TABLE role_grant_probe; DROP SEQUENCE role_grant_sequence',
    )
    expect(ddlResult.exitCode, ddlResult.stderr).toBe(0)

    const roleResult = await runSQL(
      'wkf_migrator',
      databaseName,
      migratorPassword,
      'CREATE ROLE migrator_must_not_create',
    )
    expect(roleResult.exitCode).not.toBe(0)
    expect(roleResult.stderr).toContain('permission denied to create role')
  })
})
