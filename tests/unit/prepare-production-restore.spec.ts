import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  createRestorePreparationDockerArguments,
  resolveRestoreConfiguration,
} from '../../scripts/prepare-production-restore'

const temporaryDirectories: string[] = []

function createProjectDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), 'wkf-restore-config-'))
  temporaryDirectories.push(directory)
  return directory
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { force: true, recursive: true })
  }
})

describe('production restore preparation configuration', () => {
  it('retains the capabilities required to read protected keys and write a private output root', () => {
    const arguments_ = createRestorePreparationDockerArguments({
      backupDirectory: '/recovery/production-20261022T115819Z',
      configuration: {
        BACKUP_AGE_IDENTITY_FILE: '/keys/backup.agekey',
        RESTORE_AGE_RECIPIENT_FILE: '/keys/restore.agepub',
        RESTORE_OUTPUT_ROOT: '/recovery/restore-ready',
        RESTORE_SIGNING_PRIVATE_KEY_FILE: '/keys/restore-signing',
      },
      operationsImage: 'wkf-operations:local',
      outputOwnerGid: 1000,
      outputOwnerUid: 1000,
    })
    const addedCapabilities = arguments_.flatMap((argument, index) =>
      argument === '--cap-add' ? [arguments_[index + 1]] : [],
    )

    expect(addedCapabilities).toEqual(['DAC_READ_SEARCH', 'DAC_OVERRIDE', 'CHOWN'])
  })

  it('uses CLI overrides before a selected config and the default .env.restore', () => {
    const projectDirectory = createProjectDirectory()
    const selectedConfiguration = join(projectDirectory, 'selected.env')
    writeFileSync(
      join(projectDirectory, '.env.restore'),
      [
        'BACKUP_AGE_IDENTITY_FILE=/default/backup.agekey',
        'RESTORE_AGE_RECIPIENT_FILE=/default/restore.agepub',
        'RESTORE_SIGNING_PRIVATE_KEY_FILE=/default/restore-signing',
        'RESTORE_OUTPUT_ROOT=/default/output',
      ].join('\n'),
    )
    writeFileSync(
      selectedConfiguration,
      [
        'RESTORE_AGE_RECIPIENT_FILE=/selected/restore.agepub',
        'RESTORE_OUTPUT_ROOT=/selected/output',
      ].join('\n'),
    )

    const configuration = resolveRestoreConfiguration(projectDirectory, {
      backupAgeIdentityFile: '/cli/backup.agekey',
      config: selectedConfiguration,
    })

    expect(configuration).toEqual({
      BACKUP_AGE_IDENTITY_FILE: '/cli/backup.agekey',
      RESTORE_AGE_RECIPIENT_FILE: '/selected/restore.agepub',
      RESTORE_OUTPUT_ROOT: '/selected/output',
      RESTORE_SIGNING_PRIVATE_KEY_FILE: '/default/restore-signing',
    })
  })

  it('uses a safe project-local output default but requires every key path', () => {
    const projectDirectory = createProjectDirectory()
    writeFileSync(
      join(projectDirectory, '.env.restore'),
      [
        'BACKUP_AGE_IDENTITY_FILE=/keys/backup.agekey',
        'RESTORE_AGE_RECIPIENT_FILE=/keys/restore.agepub',
        'RESTORE_SIGNING_PRIVATE_KEY_FILE=/keys/restore-signing',
      ].join('\n'),
    )

    expect(resolveRestoreConfiguration(projectDirectory, {})).toEqual({
      BACKUP_AGE_IDENTITY_FILE: '/keys/backup.agekey',
      RESTORE_AGE_RECIPIENT_FILE: '/keys/restore.agepub',
      RESTORE_OUTPUT_ROOT: join(projectDirectory, 'tmp', 'restore-ready'),
      RESTORE_SIGNING_PRIVATE_KEY_FILE: '/keys/restore-signing',
    })
  })

  it('rejects relative key paths without executing the dotenv file as shell code', () => {
    const projectDirectory = createProjectDirectory()
    writeFileSync(
      join(projectDirectory, '.env.restore'),
      [
        'BACKUP_AGE_IDENTITY_FILE=$(touch /tmp/must-not-run)',
        'RESTORE_AGE_RECIPIENT_FILE=/keys/restore.agepub',
        'RESTORE_SIGNING_PRIVATE_KEY_FILE=/keys/restore-signing',
      ].join('\n'),
    )

    expect(() => resolveRestoreConfiguration(projectDirectory, {})).toThrow(
      'BACKUP_AGE_IDENTITY_FILE must be an absolute path.',
    )
  })
})
