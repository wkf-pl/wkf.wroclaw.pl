import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  backupName,
  createOffsiteBackupFixture,
  runOffsiteBackupCommand,
} from '../helpers/offsite-backup'

describe('MyDevil backup archiver', () => {
  it(
    'archives signed backups as hard-linked snapshots with two physical object replicas',
    { timeout: 15_000 },
    async () => {
      const fixture = createOffsiteBackupFixture()
      const incomingDirectory = join(fixture.directory, 'remote', 'incoming')
      const repositoryDirectory = join(fixture.directory, 'repository-v3')
      const quarantineDirectory = join(fixture.directory, 'quarantine')
      mkdirSync(incomingDirectory)
      mkdirSync(quarantineDirectory)

      const backupResult = await runOffsiteBackupCommand(
        'bash',
        ['scripts/operations/backup-offsite.sh'],
        {
          ...fixture.environment,
          FTPS_REMOTE_ROOT: 'incoming',
        },
      )
      expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)

      const recentIncompleteName = 'production-20261020T024500Z'
      mkdirSync(join(incomingDirectory, recentIncompleteName))
      const staleIncompleteName = 'production-20261019T023000Z'
      const staleIncompleteDirectory = join(incomingDirectory, staleIncompleteName)
      mkdirSync(staleIncompleteDirectory)
      const staleTimestamp = new Date(Date.now() - 25 * 60 * 60 * 1000)
      utimesSync(staleIncompleteDirectory, staleTimestamp, staleTimestamp)

      const archiverResult = await runOffsiteBackupCommand(
        'sh',
        ['scripts/operations/archive-offsite-backups.sh'],
        {
          ...fixture.environment,
          WKF_BACKUP_ALLOWED_SIGNERS_FILE: fixture.environment.BACKUP_ALLOWED_SIGNERS_FILE,
          WKF_BACKUP_ARCHIVER_LOCK_FILE: join(fixture.directory, 'archiver.lock'),
          WKF_BACKUP_INCOMING_DIRECTORY: incomingDirectory,
          WKF_BACKUP_JQ_COMMAND: 'jq',
          WKF_BACKUP_LOCK_COMMAND: join(fixture.directory, 'bin', 'lockf'),
          WKF_BACKUP_QUARANTINE_DIRECTORY: quarantineDirectory,
          WKF_BACKUP_REPOSITORY_DIRECTORY: repositoryDirectory,
          WKF_BACKUP_SHA256_COMMAND: 'sha256sum',
          WKF_BACKUP_SSH_KEYGEN_COMMAND: 'ssh-keygen',
        },
      )

      expect(archiverResult.exitCode, archiverResult.stderr).toBe(0)
      const snapshotDirectory = join(repositoryDirectory, 'snapshots', backupName)
      expect(existsSync(snapshotDirectory)).toBe(true)
      expect(existsSync(join(incomingDirectory, backupName))).toBe(false)
      const snapshotValidation = await runOffsiteBackupCommand(
        'bash',
        ['scripts/operations/validate-offsite-backup.sh', snapshotDirectory],
        {
          ...fixture.environment,
          AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
        },
      )
      expect(snapshotValidation.exitCode, snapshotValidation.stderr).toBe(0)
      const storageManifest = JSON.parse(
        readFileSync(join(snapshotDirectory, 'storage-manifest.json'), 'utf8'),
      ) as { objects: Array<{ archiveFile: string; plaintextSha256: string }> }
      for (const object of storageManifest.objects) {
        const objectDirectory = join(
          repositoryDirectory,
          'objects',
          'sha256',
          object.plaintextSha256.slice(0, 2),
          object.plaintextSha256,
        )
        const replicaOne = join(objectDirectory, 'replica-1.age')
        const replicaTwo = join(objectDirectory, 'replica-2.age')
        const snapshotObject = join(snapshotDirectory, object.archiveFile)
        expect(existsSync(replicaOne)).toBe(true)
        expect(existsSync(replicaTwo)).toBe(true)
        expect(statSync(replicaOne).ino).not.toBe(statSync(replicaTwo).ino)
        expect(statSync(snapshotObject).ino).toBe(statSync(replicaOne).ino)
      }
      expect(existsSync(join(incomingDirectory, recentIncompleteName))).toBe(true)
      expect(
        readdirSync(quarantineDirectory).some((name) => name.startsWith(staleIncompleteName)),
      ).toBe(true)

      const secondBackupName = 'production-20261019T200100Z'
      const secondBackupResult = await runOffsiteBackupCommand(
        'bash',
        ['scripts/operations/backup-offsite.sh'],
        {
          ...fixture.environment,
          BACKUP_NAME: secondBackupName,
          FTPS_REMOTE_ROOT: 'incoming',
        },
      )
      expect(
        secondBackupResult.exitCode,
        `${secondBackupResult.stderr}\n${secondBackupResult.stdout}`,
      ).toBe(0)
      const secondArchiverResult = await runOffsiteBackupCommand(
        'sh',
        ['scripts/operations/archive-offsite-backups.sh'],
        {
          ...fixture.environment,
          WKF_BACKUP_ALLOWED_SIGNERS_FILE: fixture.environment.BACKUP_ALLOWED_SIGNERS_FILE,
          WKF_BACKUP_ARCHIVER_LOCK_FILE: join(fixture.directory, 'archiver.lock'),
          WKF_BACKUP_INCOMING_DIRECTORY: incomingDirectory,
          WKF_BACKUP_JQ_COMMAND: 'jq',
          WKF_BACKUP_LOCK_COMMAND: join(fixture.directory, 'bin', 'lockf'),
          WKF_BACKUP_QUARANTINE_DIRECTORY: quarantineDirectory,
          WKF_BACKUP_REPOSITORY_DIRECTORY: repositoryDirectory,
          WKF_BACKUP_SHA256_COMMAND: 'sha256sum',
          WKF_BACKUP_SSH_KEYGEN_COMMAND: 'ssh-keygen',
        },
      )
      expect(secondArchiverResult.exitCode, secondArchiverResult.stderr).toBe(0)
      const secondSnapshotDirectory = join(repositoryDirectory, 'snapshots', secondBackupName)
      expect(existsSync(secondSnapshotDirectory)).toBe(true)
      for (const object of storageManifest.objects) {
        const replicaOne = join(
          repositoryDirectory,
          'objects',
          'sha256',
          object.plaintextSha256.slice(0, 2),
          object.plaintextSha256,
          'replica-1.age',
        )
        expect(statSync(join(secondSnapshotDirectory, object.archiveFile)).ino).toBe(
          statSync(replicaOne).ino,
        )
      }

      const repositoryCheck = await runOffsiteBackupCommand(
        'sh',
        ['scripts/operations/check-offsite-backup-repository.sh'],
        {
          ...fixture.environment,
          WKF_BACKUP_JQ_COMMAND: 'jq',
          WKF_BACKUP_REPOSITORY_DIRECTORY: repositoryDirectory,
          WKF_BACKUP_SHA256_COMMAND: 'sha256sum',
        },
      )
      expect(repositoryCheck.exitCode, repositoryCheck.stderr).toBe(0)
      expect(repositoryCheck.stdout).toContain('2 snapshots, 2 unique objects')

      const damagedObject = storageManifest.objects[0]
      const damagedObjectDirectory = join(
        repositoryDirectory,
        'objects',
        'sha256',
        damagedObject.plaintextSha256.slice(0, 2),
        damagedObject.plaintextSha256,
      )
      writeFileSync(join(damagedObjectDirectory, 'replica-2.age'), 'corrupted replica')
      const failedCheck = await runOffsiteBackupCommand(
        'sh',
        ['scripts/operations/check-offsite-backup-repository.sh'],
        {
          ...fixture.environment,
          WKF_BACKUP_JQ_COMMAND: 'jq',
          WKF_BACKUP_REPOSITORY_DIRECTORY: repositoryDirectory,
          WKF_BACKUP_SHA256_COMMAND: 'sha256sum',
        },
      )
      expect(failedCheck.exitCode).not.toBe(0)
      expect(failedCheck.stderr).toContain('Replica 2 is missing or corrupt')
      const repairResult = await runOffsiteBackupCommand(
        'sh',
        ['scripts/operations/check-offsite-backup-repository.sh', '--repair'],
        {
          ...fixture.environment,
          WKF_BACKUP_JQ_COMMAND: 'jq',
          WKF_BACKUP_REPOSITORY_DIRECTORY: repositoryDirectory,
          WKF_BACKUP_SHA256_COMMAND: 'sha256sum',
        },
      )
      expect(repairResult.exitCode, repairResult.stderr).toBe(0)
      expect(repairResult.stdout).toContain('Repaired replica 2')
      expect(statSync(join(damagedObjectDirectory, 'replica-1.age')).ino).not.toBe(
        statSync(join(damagedObjectDirectory, 'replica-2.age')).ino,
      )
    },
  )

  it('leaves a completed directory in incoming when its marker names another backup', async () => {
    const fixture = createOffsiteBackupFixture()
    const incomingDirectory = join(fixture.directory, 'remote', 'incoming')
    const repositoryDirectory = join(fixture.directory, 'repository-v3')
    const quarantineDirectory = join(fixture.directory, 'quarantine')
    mkdirSync(incomingDirectory)
    mkdirSync(quarantineDirectory)
    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      {
        ...fixture.environment,
        FTPS_REMOTE_ROOT: 'incoming',
      },
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const directory = join(incomingDirectory, backupName)
    writeFileSync(
      join(directory, '.complete'),
      readFileSync(join(directory, '.complete'), 'utf8').replace(
        `backupName=${backupName}`,
        'backupName=production-20261019T210000Z',
      ),
    )

    const archiverResult = await runOffsiteBackupCommand(
      'sh',
      ['scripts/operations/archive-offsite-backups.sh'],
      {
        ...fixture.environment,
        WKF_BACKUP_ALLOWED_SIGNERS_FILE: fixture.environment.BACKUP_ALLOWED_SIGNERS_FILE,
        WKF_BACKUP_ARCHIVER_LOCK_FILE: join(fixture.directory, 'archiver.lock'),
        WKF_BACKUP_INCOMING_DIRECTORY: incomingDirectory,
        WKF_BACKUP_JQ_COMMAND: 'jq',
        WKF_BACKUP_LOCK_COMMAND: join(fixture.directory, 'bin', 'lockf'),
        WKF_BACKUP_QUARANTINE_DIRECTORY: quarantineDirectory,
        WKF_BACKUP_REPOSITORY_DIRECTORY: repositoryDirectory,
        WKF_BACKUP_SHA256_COMMAND: 'sha256sum',
        WKF_BACKUP_SSH_KEYGEN_COMMAND: 'ssh-keygen',
      },
    )

    expect(archiverResult.exitCode).not.toBe(0)
    expect(archiverResult.stderr).toContain('invalid structure or backup name')
    expect(existsSync(directory)).toBe(true)
    expect(existsSync(join(repositoryDirectory, 'snapshots', backupName))).toBe(false)
  })
})
