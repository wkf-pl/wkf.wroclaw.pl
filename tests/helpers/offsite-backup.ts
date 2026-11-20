import { spawn, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { onTestFinished } from 'vitest'

export const backupName = 'production-20261019T200000Z'
export const sourceSHA = 'a'.repeat(40)
export const imageReference = `wkf.azurecr.io/wkf@sha256:${'b'.repeat(64)}`

type CommandResult = {
  exitCode: number
  stderr: string
  stdout: string
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function writeExecutable(path: string, content: string): void {
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

export function createOffsiteBackupFixture(): {
  directory: string
  environment: NodeJS.ProcessEnv
  remoteRoot: string
} {
  const directory = mkdtempSync(join(tmpdir(), 'wkf-offsite-backup-'))
  onTestFinished(() => rmSync(directory, { force: true, recursive: true }))
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
    [
      `wkf-production-backup ${readFileSync(`${signingKeyPath}.pub`, 'utf8').trim()}`,
      `wkf-production-backup-storage ${readFileSync(`${signingKeyPath}.pub`, 'utf8').trim()}`,
      '',
    ].join('\n'),
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

export function runOffsiteBackupCommand(
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
