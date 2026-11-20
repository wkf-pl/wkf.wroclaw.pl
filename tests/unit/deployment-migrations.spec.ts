import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

describe('deployment migrations', () => {
  it.each(['production', 'development'])(
    'resolves Lexical static exports in %s CLI runs',
    (condition) => {
      const result = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          `
      const { initialize, resolve } = await import(process.env.LEXICAL_LOADER_URL)
      initialize(process.env.LEXICAL_CONDITION)
      const requests = []
      const nextResolve = (specifier, context) => requests.push({ specifier, ...context })
      resolve('lexical', { conditions: ['node', 'import'] }, nextResolve)
      resolve('@lexical/rich-text', { conditions: ['node', 'import'] }, nextResolve)
      resolve('react', { conditions: ['node', 'import'] }, nextResolve)
      resolve('lexical', { conditions: ['node', 'development'] }, nextResolve)
      console.log(JSON.stringify(requests))
    `,
        ],
        {
          encoding: 'utf8',
          env: {
            ...process.env,
            LEXICAL_LOADER_URL: pathToFileURL(
              join(process.cwd(), 'node_modules/payload/dist/bin/lexicalLoader.mjs'),
            ).href,
            LEXICAL_CONDITION: condition,
          },
        },
      )

      expect(result.status).toBe(0)
      expect(JSON.parse(result.stdout)).toEqual([
        { specifier: 'lexical', conditions: ['node', 'import', condition] },
        { specifier: '@lexical/rich-text', conditions: ['node', 'import', condition] },
        { specifier: 'react', conditions: ['node', 'import'] },
        { specifier: 'lexical', conditions: ['node', 'development'] },
      ])
    },
  )

  it('fails migration startup when the config import never settles', () => {
    const fixtureDirectory = mkdtempSync(join(tmpdir(), 'wkf-payload-startup-'))
    try {
      const configPath = join(fixtureDirectory, 'payload.config.mts')
      writeFileSync(configPath, 'export default await new Promise(() => {})\n')
      const result = spawnSync(process.execPath, ['node_modules/payload/bin.js', 'migrate'], {
        encoding: 'utf8',
        timeout: 10_000,
        env: { ...process.env, NODE_ENV: 'production', PAYLOAD_CONFIG_PATH: configPath },
      })

      expect(result.error).toBeUndefined()
      expect(result.status).toBe(13)
      expect(result.stderr).toContain('unsettled top-level await')
    } finally {
      rmSync(fixtureDirectory, { force: true, recursive: true })
    }
  })

  it('runs explicit migrations without automatic startup migrations and sizes staging locks', () => {
    const migrationJob = readFileSync('infra/azure/modules/migration-job.bicep', 'utf8')
    const stagingParameters = readFileSync('infra/azure/environments/staging.bicepparam', 'utf8')

    expect(migrationJob).toMatch(/name: 'PAYLOAD_RUN_MIGRATIONS_ON_START'\s+value: 'false'/)
    expect(stagingParameters).toContain('param postgresMaxLocksPerTransaction = 256')
  })

  it.each([false, true])(
    'keeps staging in maintenance with infrastructure provisioning=%s when migrations are missing',
    (provisionInfrastructure) => {
      const fixtureDirectory = mkdtempSync(join(tmpdir(), 'wkf-deploy-migrations-'))
      const commandLog = join(fixtureDirectory, 'commands')
      try {
        writeFileSync(
          join(fixtureDirectory, 'az'),
          `#!/bin/bash
echo "$*" >> "$COMMAND_LOG"
case "$*" in
  'containerapp revision list '*) echo previous-revision ;;
  'containerapp revision show '*) echo previous-image ;;
  'postgres flexible-server list '*) echo staging-database ;;
  'postgres flexible-server show '*) echo Burstable ;;
  'postgres flexible-server parameter show '*) echo true ;;
  'containerapp show '*fqdn*) echo staging.example.test ;;
  'containerapp job show '*) echo '{"containers":[{"name":"migration","env":[{"name":"DATABASE_URL","secretRef":"database-url"}]}]}' ;;
  'containerapp job start '*--yaml*) echo verifier ;;
  'containerapp job start '*) echo migrator ;;
  'containerapp job execution show '*migrator*) echo Succeeded ;;
  'containerapp job execution show '*verifier*) echo Failed ;;
  'containerapp job logs show '*verifier*) echo '{"Log":"verification: WKF_MIGRATION_CHECK missing 20261115_195332_remove_event_status 20261115_212154_locations"}' ;;
esac
`,
          { mode: 0o755 },
        )
        writeFileSync(
          join(fixtureDirectory, 'curl'),
          `#!/bin/bash
while [[ "$1" != --output ]]; do shift; done
echo 'httpErrorCode">503< mailto:webmaster@wkf.wroclaw.pl' > "$2"
echo 503
`,
          { mode: 0o755 },
        )

        const result = spawnSync(
          'bash',
          [
            'scripts/deploy-azure.sh',
            'staging',
            'image',
            '--maintenance',
            ...(provisionInfrastructure ? ['--provision'] : []),
          ],
          {
            encoding: 'utf8',
            timeout: 5_000,
            env: {
              ...process.env,
              PATH: `${fixtureDirectory}:${process.env.PATH}`,
              COMMAND_LOG: commandLog,
              SOURCE_SHA: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
              STAGING_INGRESS_REQUIRED: 'true',
            },
          },
        )

        expect(result.status).toBe(1)
        expect(result.stderr).toContain('Missing migration: 20261115_195332_remove_event_status')
        expect(result.stderr).toContain('Missing migration: 20261115_212154_locations')
        const commands = readFileSync(commandLog, 'utf8')
        expect(commands).toContain('MAINTENANCE_ENABLED=1')
        expect(commands).not.toContain('MAINTENANCE_ENABLED=0')
        expect(commands).not.toContain('containerapp revision activate')
        expect(commands).not.toMatch(/containerapp update --name/)
        if (provisionInfrastructure)
          expect(commands).toContain(
            'postgres flexible-server restart --resource-group rg-wkf-staging',
          )
      } finally {
        rmSync(fixtureDirectory, { force: true, recursive: true })
      }
    },
  )

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

  it('allows first production migrations to finish on the burstable database tier', () => {
    const deploymentScript = readFileSync('scripts/deploy-azure.sh', 'utf8')
    const migrationScript = readFileSync('scripts/deployment/migrations.sh', 'utf8')
    const environmentTemplate = readFileSync('infra/azure/modules/environment.bicep', 'utf8')
    const migrationJobTemplate = readFileSync('infra/azure/modules/migration-job.bicep', 'utf8')

    expect(deploymentScript).toContain('MIGRATION_TIMEOUT_SECONDS:-3600')
    expect(deploymentScript).toContain('MIGRATION_TIMEOUT_SECONDS:-1800')
    expect(migrationScript).toContain('SECONDS + migration_timeout_seconds')
    expect(migrationScript).toContain('--replica-timeout "$migration_timeout_seconds"')
    expect(environmentTemplate).toContain('replicaTimeoutSeconds: isProduction ? 3600 : 1800')
    expect(migrationJobTemplate).toContain('param replicaTimeoutSeconds int')
    expect(migrationJobTemplate).toContain('replicaTimeout: replicaTimeoutSeconds')
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
    expect(deploymentScript).toContain(
      'for postgres_parameter_name in shared_preload_libraries max_locks_per_transaction',
    )
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
})
