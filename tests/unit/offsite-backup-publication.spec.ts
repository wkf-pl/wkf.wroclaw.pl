import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  backupName,
  createOffsiteBackupFixture,
  imageReference,
  runOffsiteBackupCommand,
  sha256,
  sourceSHA,
  writeExecutable,
} from '../helpers/offsite-backup'

describe('off-site backup publication', () => {
  it('runs local validation with a container identity that exists in the image', async () => {
    const fixture = createOffsiteBackupFixture()
    const backupDirectory = join(fixture.directory, backupName)
    const identityPath = join(fixture.directory, 'identity.txt')
    const dockerArgumentsPath = join(fixture.directory, 'docker-arguments')
    mkdirSync(backupDirectory)
    writeExecutable(
      join(fixture.directory, 'bin', 'docker'),
      `#!/bin/sh
set -eu
printf '%s\n' "$@" >"$MOCK_DOCKER_ARGUMENTS"
`,
    )

    const validationResult = await runOffsiteBackupCommand(
      'bash',
      [
        'scripts/operations/validate-offsite-backup-local.sh',
        backupDirectory,
        identityPath,
        'wkf-operations:test',
      ],
      {
        ...fixture.environment,
        MOCK_DOCKER_ARGUMENTS: dockerArgumentsPath,
      },
    )

    expect(validationResult.exitCode, validationResult.stderr).toBe(0)
    const dockerArguments = readFileSync(dockerArgumentsPath, 'utf8').split('\n')
    expect(dockerArguments).toContain('--network')
    expect(dockerArguments).toContain('none')
    expect(dockerArguments).toContain('--read-only')
    expect(dockerArguments).toContain('--cap-drop')
    expect(dockerArguments).toContain('ALL')
    expect(dockerArguments).toContain('--cap-add')
    expect(dockerArguments).toContain('DAC_READ_SEARCH')
    expect(dockerArguments).toContain('--user')
    expect(dockerArguments).toContain('0:0')
    expect(dockerArguments).toContain(`${backupDirectory}:/backup:ro`)
    expect(dockerArguments).toContain(`${identityPath}:/run/age/identity.txt:ro`)
  })

  it('backs up every blob and publishes a verifiable encrypted manifest', async () => {
    const fixture = createOffsiteBackupFixture()

    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )

    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    expect(backupResult.stderr).toBe('')
    const backupDirectory = join(fixture.remoteRoot, backupName)
    expect(existsSync(backupDirectory)).toBe(true)
    expect(existsSync(join(backupDirectory, '.complete'))).toBe(true)

    const manifest = JSON.parse(readFileSync(join(backupDirectory, 'manifest.json.age'), 'utf8'))
    expect(manifest).toMatchObject({
      backupName,
      blobCount: 2,
      deployedSourceSha: sourceSHA,
      formatVersion: 3,
      imageReference,
      operationsImageReference: `wkf.azurecr.io/wkf-operations@sha256:${'c'.repeat(64)}`,
      signingKeyFingerprint: expect.stringMatching(/^SHA256:/),
      uniqueBlobCount: 2,
    })
    expect(manifest.migrationState).toEqual([
      expect.objectContaining({ batch: 1, name: '20261019_test' }),
    ])
    expect(manifest.blobs).toHaveLength(2)
    expect(manifest.blobs.map((entry: { name: string }) => entry.name)).toEqual([
      'first.txt',
      'second.txt',
    ])
    expect(manifest.blobs[0]).toMatchObject({ sha256: sha256('first blob'), size: 10 })
    expect(readdirSync(join(backupDirectory, 'blobs'))).toHaveLength(2)
    const storageManifest = JSON.parse(
      readFileSync(join(backupDirectory, 'storage-manifest.json'), 'utf8'),
    )
    expect(storageManifest).toMatchObject({
      backupName,
      formatVersion: 1,
      objectCount: 2,
    })
    expect(storageManifest.objects).toHaveLength(2)
    expect(existsSync(join(backupDirectory, 'storage-manifest.json.sig'))).toBe(true)

    const validationResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/validate-offsite-backup.sh', backupDirectory],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
      },
    )

    expect(validationResult.exitCode).toBe(0)
    expect(validationResult.stdout).toContain(
      `Backup validation succeeded: ${backupName} (2 blobs)`,
    )
  })

  it('uploads one encrypted object for content shared by multiple blob names', async () => {
    const fixture = createOffsiteBackupFixture()
    writeFileSync(join(fixture.environment.MOCK_BLOB_DIRECTORY!, 'second.txt'), 'first blob')

    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )

    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)
    const manifest = JSON.parse(readFileSync(join(backupDirectory, 'manifest.json.age'), 'utf8'))
    expect(manifest).toMatchObject({ blobCount: 2, uniqueBlobCount: 1 })
    expect(
      new Set(manifest.blobs.map((entry: { archiveFile: string }) => entry.archiveFile)),
    ).toEqual(new Set([`blobs/${sha256('first blob')}.age`]))
    expect(readdirSync(join(backupDirectory, 'blobs'))).toHaveLength(1)

    const validationResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/validate-offsite-backup.sh', backupDirectory],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
      },
    )
    expect(validationResult.exitCode, validationResult.stderr).toBe(0)
  })

  it('does not publish the completion marker after an incomplete upload', async () => {
    const fixture = createOffsiteBackupFixture()

    const backupResult = await runOffsiteBackupCommand(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      {
        ...fixture.environment,
        MOCK_FTPS_FAIL_PATTERN: '/blobs/',
      },
    )

    expect(backupResult.exitCode).not.toBe(0)
    expect(existsSync(join(fixture.remoteRoot, backupName))).toBe(true)
    expect(existsSync(join(fixture.remoteRoot, backupName, '.complete'))).toBe(false)
  })
})
