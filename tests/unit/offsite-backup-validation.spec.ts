import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

const backupName = 'production-20261019T200000Z'
const sourceSHA = 'a'.repeat(40)
const imageReference = `wkf.azurecr.io/wkf@sha256:${'b'.repeat(64)}`
const temporaryDirectories: string[] = []

type CommandResult = {
  exitCode: number
  stderr: string
  stdout: string
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function writeExecutable(path: string, content: string): void {
  writeFileSync(path, content)
  chmodSync(path, 0o755)
}

function prepareMockCommands(directory: string): void {
  const binaryDirectory = join(directory, 'bin')
  mkdirSync(binaryDirectory)

  writeExecutable(
    join(binaryDirectory, 'age'),
    `#!/bin/sh
set -eu
output=''
input=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    --output) output="$2"; shift 2 ;;
    --recipient | --identity) shift 2 ;;
    --decrypt) shift ;;
    *) input="$1"; shift ;;
  esac
done
cp "$input" "$output"
`,
  )
  writeExecutable(
    join(binaryDirectory, 'age-keygen'),
    `#!/bin/sh
set -eu
case "$1" in
  -o | --output)
    printf '%s\n' 'AGE-SECRET-KEY-RESTORE-DRILL' >"$2"
    printf '%s\n' 'Public key: age1restoretest' >&2
    ;;
  -y)
    printf '%s\n' 'age1restoretest'
    ;;
  *) exit 2 ;;
esac
`,
  )
  writeExecutable(
    join(binaryDirectory, 'azcopy'),
    `#!/bin/sh
set -eu
case "$1" in
  list)
    printf '%s\n' \
      '{"MessageType":"ListObject","MessageContent":"{\\"Path\\":\\"first.txt\\"}"}' \
      '{"MessageType":"ListObject","MessageContent":"{\\"Path\\":\\"second.txt\\"}"}'
    ;;
  copy)
    cat >/dev/null
    if [ -f "$2" ]; then
      blob_name="\${3##*/}"
      cp "$2" "$MOCK_RESTORE_DIRECTORY/$blob_name"
    else
      blob_name="\${2##*/}"
      cp "$MOCK_BLOB_DIRECTORY/$blob_name" "$3"
    fi
    ;;
  remove)
    touch "$MOCK_REMOVE_MARKER"
    rm -f "$MOCK_RESTORE_DIRECTORY"/*
    ;;
  *) exit 3 ;;
esac
`,
  )
  writeExecutable(
    join(binaryDirectory, 'pg_dump'),
    `#!/bin/sh
set -eu
output=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    --file) output="$2"; shift 2 ;;
    *) shift ;;
  esac
done
printf 'valid-custom-dump-fixture' >"$output"
`,
  )
  writeExecutable(
    join(binaryDirectory, 'pg_restore'),
    `#!/bin/sh
set -eu
case " $* " in
  *" --list "*)
    printf '%s\n' \
      '8; 2615 2200 SCHEMA - public wkf_migrator' \
      '2; 3079 24769 EXTENSION - pgaudit ' \
      '13675; 0 0 COMMENT - EXTENSION pgaudit ' \
      '1498; 1247 124196 TYPE public appearance wkf_migrator'
    ;;
  *)
    restore_list=''
    single_transaction=false
    while [ "$#" -gt 0 ]; do
      case "$1" in
        --use-list) restore_list="$2"; shift 2 ;;
        --single-transaction) single_transaction=true; shift ;;
        *) shift ;;
      esac
    done
    if [ -n "$restore_list" ]; then
      if [ "$single_transaction" != 'true' ]; then
        printf '%s\n' 'restore must be atomic' >&2
        exit 14
      fi
      cp "$restore_list" "$MOCK_PG_RESTORE_LIST"
      if grep --quiet 'pgaudit' "$restore_list"; then
        printf '%s\n' 'restore list still contains administrator-owned pgaudit entries' >&2
        exit 13
      fi
    fi
    ;;
esac
`,
  )
  writeExecutable(
    join(binaryDirectory, 'psql'),
    `#!/bin/sh
printf '%s\n' '[{"id":1,"name":"20261019_test","batch":1,"createdAt":"2026-10-19T19:00:00Z","updatedAt":"2026-10-19T19:00:00Z"}]'
`,
  )
  writeExecutable(
    join(binaryDirectory, 'curl'),
    `#!/bin/sh
set -eu
upload_file=''
output_file=''
remote_url=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    --config | --connect-timeout | --max-time | --proto | --retry | --retry-delay)
      shift 2
      ;;
    --upload-file)
      upload_file="$2"
      shift 2
      ;;
    --output)
      output_file="$2"
      shift 2
      ;;
    ftp://*)
      remote_url="$1"
      shift
      ;;
    *) shift ;;
  esac
done
remote_path="\${remote_url#ftp://}"
remote_path="\${remote_path#*/}"
if [ -z "$remote_url" ]; then
  exit 4
fi
if [ -n "\${MOCK_FTPS_FAIL_PATTERN:-}" ] && printf '%s' "$remote_path" | grep --quiet "$MOCK_FTPS_FAIL_PATTERN"; then
  exit 12
fi
remote_file="$MOCK_FTPS_DIRECTORY/$remote_path"
if [ -n "$upload_file" ]; then
  mkdir -p "$(dirname "$remote_file")"
  cp "$upload_file" "$remote_file"
elif [ -n "$output_file" ]; then
  mkdir -p "$(dirname "$output_file")"
  cp "$remote_file" "$output_file"
else
  exit 5
fi
`,
  )
  writeExecutable(
    join(binaryDirectory, 'lockf'),
    `#!/bin/sh
set -eu
if [ "$1" = '-t' ]; then
  shift 3
fi
exec "$@"
`,
  )
}

function setup(): {
  directory: string
  environment: NodeJS.ProcessEnv
  remoteRoot: string
} {
  const directory = mkdtempSync(join(tmpdir(), 'wkf-offsite-backup-'))
  temporaryDirectories.push(directory)
  const blobDirectory = join(directory, 'blobs')
  const remoteDirectory = join(directory, 'remote')
  const remoteRoot = join(remoteDirectory, 'backups')
  const restoreDirectory = join(directory, 'restored')
  mkdirSync(blobDirectory)
  mkdirSync(remoteDirectory)
  mkdirSync(remoteRoot)
  mkdirSync(restoreDirectory)
  writeFileSync(join(blobDirectory, 'first.txt'), 'first blob')
  writeFileSync(join(blobDirectory, 'second.txt'), 'second blob')
  const signingKeyPath = join(directory, 'private-key')
  const keyGeneration = spawnSync('ssh-keygen', [
    '-q',
    '-t',
    'ed25519',
    '-N',
    '',
    '-f',
    signingKeyPath,
  ])
  if (keyGeneration.status !== 0) {
    throw new Error(keyGeneration.stderr.toString())
  }
  writeFileSync(join(directory, 'identity.txt'), 'AGE-SECRET-KEY-TEST')
  writeFileSync(
    join(directory, 'allowed-signers'),
    `wkf-production-backup ${readFileSync(`${signingKeyPath}.pub`, 'utf8').trim()}\n`,
  )
  prepareMockCommands(directory)

  return {
    directory,
    remoteRoot,
    environment: {
      ...process.env,
      AGE_RECIPIENT: 'age1test',
      AZURE_STORAGE_IDENTITY_CLIENT_ID: 'test-identity',
      BACKUP_ALLOWED_SIGNERS_FILE: join(directory, 'allowed-signers'),
      BACKUP_NAME: backupName,
      BACKUP_SIGNING_PRIVATE_KEY_FILE: signingKeyPath,
      BACKUP_SIGNING_PUBLIC_KEY_FILE: `${signingKeyPath}.pub`,
      DEPLOYED_SOURCE_SHA: sourceSHA,
      FTPS_HOST: 'backup.example',
      FTPS_PASSWORD: 'test-password',
      FTPS_PORT: '21',
      FTPS_REMOTE_ROOT: 'backups',
      FTPS_USER: 'wkf-backup',
      MOCK_BLOB_DIRECTORY: blobDirectory,
      MOCK_FTPS_DIRECTORY: remoteDirectory,
      MOCK_PG_RESTORE_LIST: join(directory, 'pg-restore.list'),
      MOCK_REMOVE_MARKER: join(directory, 'destructive-remove-started'),
      MOCK_RESTORE_DIRECTORY: restoreDirectory,
      OPERATIONS_IMAGE_REFERENCE: `wkf.azurecr.io/wkf-operations@sha256:${'c'.repeat(64)}`,
      PATH: `${join(directory, 'bin')}:${process.env.PATH}`,
      POSTGRES_BACKUP_URL: 'postgresql://unused',
      POSTGRES_MIGRATOR_URL: 'postgresql://unused',
      PRODUCTION_IMAGE_REFERENCE: imageReference,
      PRODUCTION_MEDIA_CONTAINER_URL: 'https://production.example/media',
    },
  }
}

function run(
  command: string,
  arguments_: string[],
  environment: NodeJS.ProcessEnv,
): Promise<CommandResult> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, arguments_, {
      env: environment,
      stdio: ['ignore', 'pipe', 'pipe'],
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
  })
}

afterEach(() => {
  while (temporaryDirectories.length > 0) {
    rmSync(temporaryDirectories.pop()!, { force: true, recursive: true })
  }
})

describe('off-site production backup', () => {
  it('runs local validation with a container identity that exists in the image', async () => {
    const fixture = setup()
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

    const validationResult = await run(
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
    const fixture = setup()

    const backupResult = await run(
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
      formatVersion: 2,
      imageReference,
      operationsImageReference: `wkf.azurecr.io/wkf-operations@sha256:${'c'.repeat(64)}`,
      signingKeyFingerprint: expect.stringMatching(/^SHA256:/),
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

    const validationResult = await run(
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

  it('re-encrypts a validated backup with dedicated restore keys and a signed descriptor', async () => {
    const fixture = setup()
    const reboundOperationsImageReference = `wkf.azurecr.io/wkf-operations@sha256:${'d'.repeat(64)}`
    const backupResult = await run(
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

    const preparationResult = await run(
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

    const validationResult = await run(
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
    const descriptorValidationResult = await run(
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
    const fixture = setup()
    const backupResult = await run(
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
    const preparationResult = await run(
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
    const descriptorDownloadResult = await run(
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

    const downloadResult = await run(
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
    const fixture = setup()
    const backupResult = await run(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)
    const extractionDirectory = join(fixture.directory, 'extracted')

    const extractionResult = await run(
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

  it('does not publish the completion marker after an incomplete upload', async () => {
    const fixture = setup()

    const backupResult = await run('bash', ['scripts/operations/backup-offsite.sh'], {
      ...fixture.environment,
      MOCK_FTPS_FAIL_PATTERN: '/blobs/',
    })

    expect(backupResult.exitCode).not.toBe(0)
    expect(existsSync(join(fixture.remoteRoot, backupName))).toBe(true)
    expect(existsSync(join(fixture.remoteRoot, backupName, '.complete'))).toBe(false)
  })

  it('rejects a backup whose completion marker does not authenticate the manifest', async () => {
    const fixture = setup()
    const backupResult = await run(
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

    const validationResult = await run(
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
    const fixture = setup()
    const backupResult = await run(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)
    const manifest = JSON.parse(readFileSync(join(backupDirectory, 'manifest.json.age'), 'utf8'))
    writeFileSync(join(backupDirectory, manifest.blobs[0].archiveFile), 'corrupted')

    const validationResult = await run(
      'bash',
      ['scripts/operations/validate-offsite-backup.sh', backupDirectory],
      {
        ...fixture.environment,
        AGE_IDENTITY_FILE: join(fixture.directory, 'identity.txt'),
      },
    )

    expect(validationResult.exitCode).not.toBe(0)
    expect(validationResult.stderr).toContain('Blob validation failed: first.txt')
  })

  it('rejects an encrypted manifest that was replaced without the signing key', async () => {
    const fixture = setup()
    const backupResult = await run(
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

    const validationResult = await run(
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

  it('requires explicit confirmation before destructive restore work', async () => {
    const fixture = setup()
    const backupResult = await run(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)

    const restoreResult = await run(
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
    const fixture = setup()
    const backupResult = await run(
      'bash',
      ['scripts/operations/backup-offsite.sh'],
      fixture.environment,
    )
    expect(backupResult.exitCode, `${backupResult.stderr}\n${backupResult.stdout}`).toBe(0)
    const backupDirectory = join(fixture.remoteRoot, backupName)

    const restoreResult = await run(
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

describe('MyDevil backup archiver', () => {
  it('archives complete backups and quarantines only stale incomplete transfers', async () => {
    const fixture = setup()
    const incomingDirectory = join(fixture.directory, 'incoming')
    const archiveDirectory = join(fixture.directory, 'archive')
    const quarantineDirectory = join(fixture.directory, 'quarantine')
    mkdirSync(incomingDirectory)
    mkdirSync(archiveDirectory)
    mkdirSync(quarantineDirectory)

    const completeName = 'production-20261020T023000Z'
    const completeDirectory = join(incomingDirectory, completeName)
    mkdirSync(completeDirectory)
    writeFileSync(
      join(completeDirectory, '.complete'),
      `formatVersion=1\nbackupName=${completeName}\n`,
    )

    const recentIncompleteName = 'production-20261020T024500Z'
    mkdirSync(join(incomingDirectory, recentIncompleteName))
    const staleIncompleteName = 'production-20261019T023000Z'
    const staleIncompleteDirectory = join(incomingDirectory, staleIncompleteName)
    mkdirSync(staleIncompleteDirectory)
    const staleTimestamp = new Date(Date.now() - 25 * 60 * 60 * 1000)
    utimesSync(staleIncompleteDirectory, staleTimestamp, staleTimestamp)

    const archiverResult = await run('sh', ['scripts/operations/archive-offsite-backups.sh'], {
      ...fixture.environment,
      WKF_BACKUP_ARCHIVE_DIRECTORY: archiveDirectory,
      WKF_BACKUP_ARCHIVER_LOCK_FILE: join(fixture.directory, 'archiver.lock'),
      WKF_BACKUP_INCOMING_DIRECTORY: incomingDirectory,
      WKF_BACKUP_LOCK_COMMAND: join(fixture.directory, 'bin', 'lockf'),
      WKF_BACKUP_QUARANTINE_DIRECTORY: quarantineDirectory,
    })

    expect(archiverResult.exitCode, archiverResult.stderr).toBe(0)
    expect(existsSync(join(archiveDirectory, completeName))).toBe(true)
    expect(existsSync(join(incomingDirectory, recentIncompleteName))).toBe(true)
    expect(
      readdirSync(quarantineDirectory).some((name) => name.startsWith(staleIncompleteName)),
    ).toBe(true)
  })

  it('leaves a completed directory in incoming when its marker names another backup', async () => {
    const fixture = setup()
    const incomingDirectory = join(fixture.directory, 'incoming')
    const archiveDirectory = join(fixture.directory, 'archive')
    const quarantineDirectory = join(fixture.directory, 'quarantine')
    mkdirSync(incomingDirectory)
    mkdirSync(archiveDirectory)
    mkdirSync(quarantineDirectory)
    const directory = join(incomingDirectory, backupName)
    mkdirSync(directory)
    writeFileSync(
      join(directory, '.complete'),
      'formatVersion=1\nbackupName=production-20261019T210000Z\n',
    )

    const archiverResult = await run('sh', ['scripts/operations/archive-offsite-backups.sh'], {
      ...fixture.environment,
      WKF_BACKUP_ARCHIVE_DIRECTORY: archiveDirectory,
      WKF_BACKUP_ARCHIVER_LOCK_FILE: join(fixture.directory, 'archiver.lock'),
      WKF_BACKUP_INCOMING_DIRECTORY: incomingDirectory,
      WKF_BACKUP_LOCK_COMMAND: join(fixture.directory, 'bin', 'lockf'),
      WKF_BACKUP_QUARANTINE_DIRECTORY: quarantineDirectory,
    })

    expect(archiverResult.exitCode).toBe(0)
    expect(archiverResult.stderr).toContain('Completion marker does not match')
    expect(existsSync(directory)).toBe(true)
    expect(readdirSync(archiveDirectory)).toHaveLength(0)
  })
})
