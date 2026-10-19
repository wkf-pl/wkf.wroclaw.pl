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
  writeExecutable(join(binaryDirectory, 'pg_restore'), '#!/bin/sh\nexit 0\n')
  writeExecutable(
    join(binaryDirectory, 'psql'),
    `#!/bin/sh
printf '%s\n' '[{"id":1,"name":"20261019_test","batch":1,"createdAt":"2026-10-19T19:00:00Z","updatedAt":"2026-10-19T19:00:00Z"}]'
`,
  )
  writeExecutable(
    join(binaryDirectory, 'sftp'),
    `#!/bin/sh
set -eu
while IFS= read -r command; do
  set -- $command
  case "$1" in
    mkdir)
      mkdir "$MOCK_SFTP_DIRECTORY/\${2#/}"
      ;;
    put)
      if [ -n "\${MOCK_SFTP_FAIL_PATTERN:-}" ] && printf '%s' "$3" | grep --quiet "$MOCK_SFTP_FAIL_PATTERN"; then
        exit 12
      fi
      cp "$2" "$MOCK_SFTP_DIRECTORY/\${3#/}"
      ;;
    rename)
      mv "$MOCK_SFTP_DIRECTORY/\${2#/}" "$MOCK_SFTP_DIRECTORY/\${3#/}"
      ;;
    ls)
      test -f "$MOCK_SFTP_DIRECTORY/\${2#/}"
      ;;
    *) exit 4 ;;
  esac
done
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
  writeFileSync(join(directory, 'known-hosts'), 'backup.example ssh-ed25519 test-key\n')
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
      DEPLOYED_SOURCE_SHA: sourceSHA,
      MOCK_BLOB_DIRECTORY: blobDirectory,
      MOCK_REMOVE_MARKER: join(directory, 'destructive-remove-started'),
      MOCK_RESTORE_DIRECTORY: restoreDirectory,
      MOCK_SFTP_DIRECTORY: remoteDirectory,
      OPERATIONS_IMAGE_REFERENCE: `wkf.azurecr.io/wkf-operations@sha256:${'c'.repeat(64)}`,
      PATH: `${join(directory, 'bin')}:${process.env.PATH}`,
      POSTGRES_BACKUP_URL: 'postgresql://unused',
      POSTGRES_MIGRATOR_URL: 'postgresql://unused',
      PRODUCTION_IMAGE_REFERENCE: imageReference,
      PRODUCTION_MEDIA_CONTAINER_URL: 'https://production.example/media',
      SFTP_HOST: 'backup.example',
      SFTP_KNOWN_HOSTS_FILE: join(directory, 'known-hosts'),
      SFTP_PORT: '22',
      SFTP_PRIVATE_KEY_FILE: join(directory, 'private-key'),
      SFTP_REMOTE_ROOT: 'backups',
      SFTP_USER: 'wkf-backup',
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
    expect(existsSync(join(fixture.remoteRoot, `.${backupName}.partial`))).toBe(false)

    const manifest = JSON.parse(readFileSync(join(backupDirectory, 'manifest.json.age'), 'utf8'))
    expect(manifest).toMatchObject({
      backupName,
      blobCount: 2,
      deployedSourceSha: sourceSHA,
      formatVersion: 1,
      imageReference,
      operationsImageReference: `wkf.azurecr.io/wkf-operations@sha256:${'c'.repeat(64)}`,
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

  it('does not publish a final directory after an incomplete upload', async () => {
    const fixture = setup()

    const backupResult = await run('bash', ['scripts/operations/backup-offsite.sh'], {
      ...fixture.environment,
      MOCK_SFTP_FAIL_PATTERN: '/blobs/',
    })

    expect(backupResult.exitCode).not.toBe(0)
    expect(existsSync(join(fixture.remoteRoot, backupName))).toBe(false)
    expect(existsSync(join(fixture.remoteRoot, `.${backupName}.partial`))).toBe(true)
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
    expect(
      readFileSync(join(fixture.environment.MOCK_RESTORE_DIRECTORY!, 'first.txt'), 'utf8'),
    ).toBe('first blob')
    expect(
      readFileSync(join(fixture.environment.MOCK_RESTORE_DIRECTORY!, 'second.txt'), 'utf8'),
    ).toBe('second blob')
  })
})
