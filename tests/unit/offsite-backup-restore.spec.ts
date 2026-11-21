import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  backupName,
  createOffsiteBackupFixture,
  runOffsiteBackupCommand,
  sha256,
} from '../helpers/offsite-backup'

describe('off-site backup export and restore', () => {
  it('re-encrypts a validated backup with dedicated restore keys and a signed descriptor', async () => {
    const fixture = createOffsiteBackupFixture()
    const reboundOperationsImageReference = `wkf.azurecr.io/wkf-operations@sha256:${'d'.repeat(64)}`
    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)
    const restoreBundleRoot = join(fixture.directory, 'restore-bundle')
    const restoreRecipient = join(fixture.directory, 'restore.agepub')
    const restoreAllowedSigners = join(fixture.directory, 'restore-allowed-signers')
    writeFileSync(restoreRecipient, 'age1restoretest\n')
    writeFileSync(
      restoreAllowedSigners,
      `wkf-production-restore ${readFileSync(fixture.environment.BACKUP_SIGNING_PUBLIC_KEY_FILE!, 'utf8').trim()}\n`,
    )

    const preparationResult = await runOffsiteBackupCommand(
      'bash',
      [
        'scripts/operations/prepare-offsite-restore-bundle.sh',
        backupDirectory,
        join(fixture.directory, 'identity.txt'),
        restoreRecipient,
        fixture.environment.BACKUP_SIGNING_PRIVATE_KEY_FILE!,
        restoreBundleRoot,
      ],
      {
        ...fixture.environment,
        RESTORE_OPERATIONS_IMAGE_REFERENCE: reboundOperationsImageReference,
      },
    )

    expect(preparationResult.exitCode, preparationResult.stderr).toBe(0)
    const reEncryptedBackup = join(restoreBundleRoot, backupName)
    expect(existsSync(join(reEncryptedBackup, '.complete'))).toBe(true)
    expect(existsSync(join(reEncryptedBackup, 'restore-descriptor.json'))).toBe(true)
    expect(existsSync(join(restoreBundleRoot, 'secrets'))).toBe(false)
    expect(
      JSON.parse(readFileSync(join(reEncryptedBackup, 'manifest.json.age'), 'utf8'))
        .operationsImageReference,
    ).toBe(reboundOperationsImageReference)
    expect(
      JSON.parse(readFileSync(join(reEncryptedBackup, 'restore-descriptor.json'), 'utf8'))
        .operationsImageReference,
    ).toBe(reboundOperationsImageReference)

    const validationResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/validate-offsite-backup.sh', reEncryptedBackup],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
        BACKUP_ALLOWED_SIGNERS_FILE: restoreAllowedSigners,
        BACKUP_SIGNING_IDENTITY: 'wkf-production-restore',
      },
    )
    expect(validationResult.exitCode, validationResult.stderr).toBe(0)

    const descriptorPath = join(reEncryptedBackup, 'restore-descriptor.json')
    const changedDescriptor = JSON.parse(readFileSync(descriptorPath, 'utf8')) as {
      operationsImageReference: string
    }
    changedDescriptor.operationsImageReference = `wkf.azurecr.io/wkf-operations@sha256:${'d'.repeat(64)}`
    writeFileSync(descriptorPath, JSON.stringify(changedDescriptor))
    const completionMarkerPath = join(reEncryptedBackup, '.complete')
    writeFileSync(
      completionMarkerPath,
      readFileSync(completionMarkerPath, 'utf8').replace(
        /^descriptorSha256=.*$/m,
        `descriptorSha256=${sha256(readFileSync(descriptorPath, 'utf8'))}`,
      ),
    )
    const descriptorValidationResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/validate-restore-descriptor.sh', reEncryptedBackup, backupName],
      {
        ...fixture.environment,
        RESTORE_ALLOWED_SIGNERS_FILE: restoreAllowedSigners,
      },
    )
    expect(descriptorValidationResult.exitCode).not.toBe(0)
    expect(descriptorValidationResult.stderr).toContain(
      'Restore descriptor signature verification failed',
    )
  })

  it('downloads only authenticated restore-export artifacts over FTPS', async () => {
    const fixture = createOffsiteBackupFixture()
    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const restoreRecipient = join(fixture.directory, 'restore.agepub')
    const restoreAllowedSigners = join(fixture.directory, 'restore-allowed-signers')
    const restoreExportRoot = join(fixture.directory, 'remote', 'restore-export')
    writeFileSync(restoreRecipient, 'age1restoretest\n')
    writeFileSync(
      restoreAllowedSigners,
      `wkf-production-restore ${readFileSync(fixture.environment.BACKUP_SIGNING_PUBLIC_KEY_FILE!, 'utf8').trim()}\n`,
    )
    const preparationResult = await runOffsiteBackupCommand(
      'bash',
      [
        'scripts/operations/prepare-offsite-restore-bundle.sh',
        join(fixture.remoteRoot, backupName),
        join(fixture.directory, 'identity.txt'),
        restoreRecipient,
        fixture.environment.BACKUP_SIGNING_PRIVATE_KEY_FILE!,
        restoreExportRoot,
      ],
      fixture.environment,
    )
    expect(preparationResult.exitCode, preparationResult.stderr).toBe(0)
    const descriptorDownloadResult = await runOffsiteBackupCommand(
      'bash',
      [
        'scripts/operations/download-restore-descriptor-ftps.sh',
        backupName,
        join(fixture.directory, 'descriptor-download'),
      ],
      {
        ...fixture.environment,
        FTPS_REMOTE_ROOT: 'restore-export',
        RESTORE_ALLOWED_SIGNERS_FILE: restoreAllowedSigners,
      },
    )
    expect(descriptorDownloadResult.exitCode, descriptorDownloadResult.stderr).toBe(0)
    expect(descriptorDownloadResult.stdout.trim()).toBe(
      fixture.environment.OPERATIONS_IMAGE_REFERENCE,
    )
    const downloadParent = join(fixture.directory, 'download')
    mkdirSync(downloadParent)

    const downloadResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/download-offsite-backup-ftps.sh', backupName, downloadParent],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
        BACKUP_ALLOWED_SIGNERS_FILE: restoreAllowedSigners,
        BACKUP_SIGNING_IDENTITY: 'wkf-production-restore',
        FTPS_REMOTE_ROOT: 'restore-export',
      },
    )

    expect(downloadResult.exitCode, downloadResult.stderr).toBe(0)
    const downloadedBackup = join(downloadParent, backupName)
    expect(existsSync(join(downloadedBackup, '.complete'))).toBe(true)
    expect(existsSync(join(downloadedBackup, 'restore-descriptor.json'))).toBe(true)
    expect(existsSync(join(downloadedBackup, 'database.dump.age'))).toBe(true)
    expect(readdirSync(join(downloadedBackup, 'blobs'))).toHaveLength(2)
    expect(downloadResult.stdout).toContain(
      `Downloaded and validated restore export: ${backupName}`,
    )
  })

  it('extracts a validated backup without using blob names as source paths', async () => {
    const fixture = createOffsiteBackupFixture()
    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)
    const extractionDirectory = join(fixture.directory, 'extracted')

    const extractionResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/extract-offsite-backup.sh', backupDirectory, extractionDirectory],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
      },
    )

    expect(extractionResult.exitCode, extractionResult.stderr).toBe(0)
    const mediaManifest = JSON.parse(
      readFileSync(join(extractionDirectory, 'media-manifest.json'), 'utf8'),
    ) as Array<{ name: string; sourceFile: string }>
    expect(mediaManifest.map((entry) => entry.name)).toEqual(['first.txt', 'second.txt'])
    expect(mediaManifest.every((entry) => /^[a-f0-9]{64}$/.test(entry.sourceFile))).toBe(true)
    expect(
      mediaManifest.every((entry) =>
        existsSync(join(extractionDirectory, 'media', entry.sourceFile)),
      ),
    ).toBe(true)
  })

  it('rejects a backup whose completion marker does not authenticate the manifest', async () => {
    const fixture = createOffsiteBackupFixture()
    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)
    const completionMarker = join(backupDirectory, '.complete')
    writeFileSync(
      completionMarker,
      readFileSync(completionMarker, 'utf8').replace(/[a-f0-9]{64}/, '0'.repeat(64)),
    )

    const validationResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/validate-offsite-backup.sh', backupDirectory],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
      },
    )

    expect(validationResult.exitCode).not.toBe(0)
    expect(validationResult.stderr).toContain(
      'completion marker checksums do not match the manifest artifacts',
    )
  })

  it('rejects a corrupted blob before restore can start', async () => {
    const fixture = createOffsiteBackupFixture()
    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)
    const manifest = JSON.parse(readFileSync(join(backupDirectory, 'manifest.json.age'), 'utf8'))
    writeFileSync(join(backupDirectory, manifest.blobs[0].archiveFile), 'corrupted')

    const validationResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/validate-offsite-backup.sh', backupDirectory],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
      },
    )

    expect(validationResult.exitCode).not.toBe(0)
    expect(validationResult.stderr).toContain(
      'Storage manifest validation failed for uploaded object',
    )
  })

  it('rejects an encrypted manifest that was replaced without the signing key', async () => {
    const fixture = createOffsiteBackupFixture()
    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)
    const manifestPath = join(backupDirectory, 'manifest.json.age')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    manifest.blobs[0].archiveFile = '../../outside.age'
    writeFileSync(manifestPath, JSON.stringify(manifest))
    const completionMarkerPath = join(backupDirectory, '.complete')
    writeFileSync(
      completionMarkerPath,
      readFileSync(completionMarkerPath, 'utf8').replace(
        /^manifestSha256=.*$/m,
        `manifestSha256=${sha256(readFileSync(manifestPath, 'utf8'))}`,
      ),
    )

    const validationResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/validate-offsite-backup.sh', backupDirectory],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
      },
    )

    expect(validationResult.exitCode).not.toBe(0)
    expect(validationResult.stderr).toContain('signature verification failed')
  })

  it('rejects a storage inventory that was replaced without the signing key', async () => {
    const fixture = createOffsiteBackupFixture()
    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)
    const storageManifestPath = join(backupDirectory, 'storage-manifest.json')
    const storageManifest = JSON.parse(readFileSync(storageManifestPath, 'utf8'))
    storageManifest.objects[0].ciphertextSize += 1
    writeFileSync(storageManifestPath, JSON.stringify(storageManifest))
    const completionMarkerPath = join(backupDirectory, '.complete')
    writeFileSync(
      completionMarkerPath,
      readFileSync(completionMarkerPath, 'utf8').replace(
        /^storageManifestSha256=.*$/m,
        `storageManifestSha256=${sha256(readFileSync(storageManifestPath, 'utf8'))}`,
      ),
    )

    const validationResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/validate-offsite-backup.sh', backupDirectory],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
      },
    )

    expect(validationResult.exitCode).not.toBe(0)
    expect(validationResult.stderr).toContain(
      'Backup storage manifest signature verification failed',
    )
  })

  it('requires explicit confirmation before destructive restore work', async () => {
    const fixture = createOffsiteBackupFixture()
    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)

    const restoreResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/restore-offsite-backup.sh', backupDirectory, 'NO'],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
      },
    )

    expect(restoreResult.exitCode).not.toBe(0)
    expect(restoreResult.stderr).toContain('exact confirmation value RESTORE')
    expect(existsSync(fixture.environment.MOCK_REMOVE_MARKER!)).toBe(false)
  })

  it('restores every validated blob even when AzCopy consumes standard input', async () => {
    const fixture = createOffsiteBackupFixture()
    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)

    const restoreResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/restore-offsite-backup.sh', backupDirectory, 'RESTORE'],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
      },
    )

    expect(restoreResult.exitCode, `${restoreResult.stderr}\n${restoreResult.stdout}`).toBe(0)
    expect(existsSync(fixture.environment.MOCK_REMOVE_MARKER!)).toBe(true)
    expect(readFileSync(fixture.environment.MOCK_PG_RESTORE_LIST!, 'utf8')).not.toContain('pgaudit')
    expect(
      readFileSync(join(fixture.environment.MOCK_RESTORE_DIRECTORY!, 'first.txt'), 'utf8'),
    ).toBe('first blob')
    expect(
      readFileSync(join(fixture.environment.MOCK_RESTORE_DIRECTORY!, 'second.txt'), 'utf8'),
    ).toBe('second blob')
  })
})
