import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { basename, isAbsolute, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'

import { parse } from 'dotenv'

const restoreConfigurationKeys = [
  'BACKUP_AGE_IDENTITY_FILE',
  'RESTORE_AGE_RECIPIENT_FILE',
  'RESTORE_SIGNING_PRIVATE_KEY_FILE',
  'RESTORE_OUTPUT_ROOT',
] as const

type RestoreConfigurationKey = (typeof restoreConfigurationKeys)[number]

export type RestoreConfiguration = Record<RestoreConfigurationKey, string>

type CommandOptions = {
  backupAgeIdentityFile?: string
  config?: string
  outputRoot?: string
  restoreAgeRecipientFile?: string
  restoreSigningPrivateKeyFile?: string
}

type RestorePreparationDockerOptions = {
  backupDirectory: string
  configuration: RestoreConfiguration
  operationsImage: string
  outputOwnerGid: number
  outputOwnerUid: number
}

function readDotenvFile(filePath: string, required: boolean): Record<string, string> {
  if (!existsSync(filePath)) {
    if (required) {
      throw new Error(`Restore configuration file does not exist: ${filePath}`)
    }
    return {}
  }
  if (!statSync(filePath).isFile()) {
    throw new Error(`Restore configuration path is not a file: ${filePath}`)
  }
  return parse(readFileSync(filePath))
}

function requireAbsolutePath(value: string, name: RestoreConfigurationKey): string {
  if (!isAbsolute(value)) {
    throw new Error(`${name} must be an absolute path.`)
  }
  return resolve(value)
}

export function resolveRestoreConfiguration(
  projectDirectory: string,
  options: CommandOptions,
): RestoreConfiguration {
  const defaultConfigurationPath = join(projectDirectory, '.env.restore')
  const selectedConfigurationPath = options.config
    ? resolve(projectDirectory, options.config)
    : undefined
  const defaultConfiguration = readDotenvFile(defaultConfigurationPath, false)
  const selectedConfiguration =
    selectedConfigurationPath && selectedConfigurationPath !== defaultConfigurationPath
      ? readDotenvFile(selectedConfigurationPath, true)
      : {}
  const commandLineConfiguration: Partial<RestoreConfiguration> = {
    BACKUP_AGE_IDENTITY_FILE: options.backupAgeIdentityFile,
    RESTORE_AGE_RECIPIENT_FILE: options.restoreAgeRecipientFile,
    RESTORE_OUTPUT_ROOT: options.outputRoot,
    RESTORE_SIGNING_PRIVATE_KEY_FILE: options.restoreSigningPrivateKeyFile,
  }
  const builtInConfiguration: Partial<RestoreConfiguration> = {
    RESTORE_OUTPUT_ROOT: join(projectDirectory, 'tmp', 'restore-ready'),
  }
  const mergedConfiguration: Partial<RestoreConfiguration> = {
    ...builtInConfiguration,
  }

  for (const source of [defaultConfiguration, selectedConfiguration, commandLineConfiguration]) {
    for (const key of restoreConfigurationKeys) {
      const value = source[key]
      if (typeof value === 'string' && value.trim() !== '') {
        mergedConfiguration[key] = value.trim()
      }
    }
  }

  for (const key of restoreConfigurationKeys) {
    const value = mergedConfiguration[key]
    if (!value) {
      throw new Error(`${key} is required in .env.restore, --config, or a CLI override.`)
    }
    mergedConfiguration[key] = requireAbsolutePath(value, key)
  }

  return mergedConfiguration as RestoreConfiguration
}

function runCommand(command: string, arguments_: string[], projectDirectory: string): void {
  const result = spawnSync(command, arguments_, {
    cwd: projectDirectory,
    stdio: 'inherit',
  })
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(`${command} failed with exit code ${result.status ?? 'unknown'}.`)
  }
}

function requireReadableFile(filePath: string, name: RestoreConfigurationKey): void {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw new Error(`${name} does not point to a readable file: ${filePath}`)
  }
}

export function createRestorePreparationDockerArguments({
  backupDirectory,
  configuration,
  operationsImage,
  outputOwnerGid,
  outputOwnerUid,
}: RestorePreparationDockerOptions): string[] {
  return [
    'run',
    '--rm',
    '--network',
    'none',
    '--read-only',
    '--user',
    '0:0',
    '--cap-drop',
    'ALL',
    '--cap-add',
    'DAC_READ_SEARCH',
    '--cap-add',
    'DAC_OVERRIDE',
    '--cap-add',
    'CHOWN',
    '--security-opt',
    'no-new-privileges',
    '--tmpfs',
    '/tmp:rw,nosuid,nodev,noexec,size=1g',
    '--env',
    `RESTORE_BUNDLE_OUTPUT_UID=${outputOwnerUid}`,
    '--env',
    `RESTORE_BUNDLE_OUTPUT_GID=${outputOwnerGid}`,
    '--volume',
    `${backupDirectory}:/source:ro`,
    '--volume',
    `${configuration.BACKUP_AGE_IDENTITY_FILE}:/run/keys/backup-age-identity:ro`,
    '--volume',
    `${configuration.RESTORE_AGE_RECIPIENT_FILE}:/run/keys/restore-age-recipient:ro`,
    '--volume',
    `${configuration.RESTORE_SIGNING_PRIVATE_KEY_FILE}:/run/keys/restore-signing-private-key:ro`,
    '--volume',
    `${configuration.RESTORE_OUTPUT_ROOT}:/output`,
    operationsImage,
    '/opt/wkf/prepare-offsite-restore-bundle.sh',
    '/source',
    '/run/keys/backup-age-identity',
    '/run/keys/restore-age-recipient',
    '/run/keys/restore-signing-private-key',
    '/output',
  ]
}

function main(): void {
  const projectDirectory = resolve(import.meta.dirname, '..')
  const parsedArguments = parseArgs({
    allowPositionals: true,
    options: {
      'backup-age-identity-file': { type: 'string' },
      config: { type: 'string', short: 'c' },
      'output-root': { type: 'string' },
      'restore-age-recipient-file': { type: 'string' },
      'restore-signing-private-key-file': { type: 'string' },
    },
    strict: true,
  })
  if (parsedArguments.positionals.length !== 1) {
    throw new Error(
      'Usage: pnpm backup:prepare-restore <backup-directory> [--config <configuration-file>]',
    )
  }

  const backupDirectory = resolve(parsedArguments.positionals[0])
  if (!existsSync(backupDirectory) || !statSync(backupDirectory).isDirectory()) {
    throw new Error(`Backup directory does not exist: ${backupDirectory}`)
  }
  const backupName = basename(backupDirectory)
  if (!/^production-[0-9]{8}T[0-9]{6}Z$/.test(backupName)) {
    throw new Error('Backup directory name must use production-YYYYMMDDTHHMMSSZ.')
  }

  const configuration = resolveRestoreConfiguration(projectDirectory, {
    backupAgeIdentityFile: parsedArguments.values['backup-age-identity-file'],
    config: parsedArguments.values.config,
    outputRoot: parsedArguments.values['output-root'],
    restoreAgeRecipientFile: parsedArguments.values['restore-age-recipient-file'],
    restoreSigningPrivateKeyFile: parsedArguments.values['restore-signing-private-key-file'],
  })
  requireReadableFile(configuration.BACKUP_AGE_IDENTITY_FILE, 'BACKUP_AGE_IDENTITY_FILE')
  requireReadableFile(configuration.RESTORE_AGE_RECIPIENT_FILE, 'RESTORE_AGE_RECIPIENT_FILE')
  requireReadableFile(
    configuration.RESTORE_SIGNING_PRIVATE_KEY_FILE,
    'RESTORE_SIGNING_PRIVATE_KEY_FILE',
  )
  mkdirSync(configuration.RESTORE_OUTPUT_ROOT, { recursive: true, mode: 0o700 })

  const operationsImage = 'wkf-operations:local'
  runCommand(
    'docker',
    ['build', '--file', 'Dockerfile.operations', '--tag', operationsImage, '.'],
    projectDirectory,
  )
  runCommand(
    'docker',
    createRestorePreparationDockerArguments({
      backupDirectory,
      configuration,
      operationsImage,
      outputOwnerGid: process.getgid?.() ?? 0,
      outputOwnerUid: process.getuid?.() ?? 0,
    }),
    projectDirectory,
  )

  console.log(`Restore export is ready at ${join(configuration.RESTORE_OUTPUT_ROOT, backupName)}`)
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}
