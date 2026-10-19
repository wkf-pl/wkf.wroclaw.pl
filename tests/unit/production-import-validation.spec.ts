import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { chmodSync, existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

const sourceSHA = 'a'.repeat(40)
const checkpointName = 'prod-initial-test'
const temporaryDirectories: string[] = []

type ImportFixture = {
  databaseChecksum?: string
  mediaEntries?: Array<{ name: string; sha256: string; size: number }>
  mediaManifestCount?: number
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function prepareMockCommands(directory: string): void {
  const binaryDirectory = join(directory, 'bin')
  const azcopyPath = join(binaryDirectory, 'azcopy')
  const pgRestorePath = join(binaryDirectory, 'pg_restore')
  const psqlPath = join(binaryDirectory, 'psql')

  writeFileSync(
    azcopyPath,
    `#!/bin/sh
set -eu
case "$1" in
  login) exit 0 ;;
  copy)
    cat >/dev/null
    source_name="\${2##*/}"
    case "$3" in
      http*) exit 0 ;;
    esac
    if [ ! -f "$MOCK_CHECKPOINT_DIRECTORY/$source_name" ]; then
      exit 2
    fi
    cp "$MOCK_CHECKPOINT_DIRECTORY/$source_name" "$3"
    ;;
  remove)
    touch "$MOCK_REMOVE_MARKER"
    ;;
  *) exit 3 ;;
esac
`,
  )
  writeFileSync(pgRestorePath, '#!/bin/sh\nexit 0\n')
  writeFileSync(psqlPath, '#!/bin/sh\ncat >/dev/null\nexit 0\n')
  chmodSync(azcopyPath, 0o755)
  chmodSync(pgRestorePath, 0o755)
  chmodSync(psqlPath, 0o755)
}

function prepareCheckpoint(directory: string, fixture: ImportFixture): void {
  const databaseDump = 'valid-custom-dump-fixture'
  const mediaEntries = fixture.mediaEntries ?? []
  const mediaManifest = mediaEntries.map((entry) => JSON.stringify(entry)).join('\n')
  const serializedMediaManifest = mediaManifest ? `${mediaManifest}\n` : ''

  writeFileSync(join(directory, 'database.dump'), databaseDump)
  writeFileSync(
    join(directory, 'database.sha256'),
    `${fixture.databaseChecksum ?? sha256(databaseDump)}  database.dump\n`,
  )
  writeFileSync(join(directory, 'media-manifest.jsonl'), serializedMediaManifest)
  writeFileSync(
    join(directory, 'manifest.json'),
    JSON.stringify({
      checkpointName,
      deployedSourceSha: sourceSHA,
      mediaBlobCount: fixture.mediaManifestCount ?? mediaEntries.length,
      mediaManifestSha256: sha256(serializedMediaManifest),
    }),
  )
}

function runImport(
  directory: string,
  confirmation = 'IMPORT',
): Promise<{
  exitCode: number
  stderr: string
}> {
  return new Promise((resolvePromise, reject) => {
    const child = spawn('bash', ['scripts/operations/import-production-checkpoint.sh'], {
      env: {
        ...process.env,
        AZURE_STORAGE_IDENTITY_CLIENT_ID: 'test-identity',
        CHECKPOINT_NAME: checkpointName,
        EXPECTED_SOURCE_SHA: sourceSHA,
        IMPORT_CONFIRMATION: confirmation,
        MOCK_CHECKPOINT_DIRECTORY: directory,
        MOCK_REMOVE_MARKER: join(directory, 'destructive-remove-started'),
        PATH: `${join(directory, 'bin')}:${process.env.PATH}`,
        POSTGRES_MIGRATOR_URL: 'postgresql://unused',
        PRODUCTION_MEDIA_CONTAINER_URL: 'https://production.example/media',
        STAGING_CHECKPOINT_CONTAINER_URL: 'https://staging.example/checkpoints',
      },
      stdio: ['ignore', 'ignore', 'pipe'],
    })
    let stderr = ''
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString()
    })
    child.on('error', reject)
    child.on('close', (exitCode) => {
      resolvePromise({ exitCode: exitCode ?? -1, stderr })
    })
  })
}

afterEach(() => {
  while (temporaryDirectories.length > 0) {
    rmSync(temporaryDirectories.pop()!, { force: true, recursive: true })
  }
})

describe('production checkpoint import validation', () => {
  function setup(fixture: ImportFixture): string {
    const directory = mkdtempSync(join(tmpdir(), 'wkf-import-validation-'))
    temporaryDirectories.push(directory)
    const binaryDirectory = join(directory, 'bin')
    mkdirSync(binaryDirectory)
    prepareMockCommands(directory)
    prepareCheckpoint(directory, fixture)
    return directory
  }

  it('rejects a missing IMPORT confirmation before destructive work', async () => {
    const directory = setup({})
    const result = await runImport(directory, 'NO')

    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('exact confirmation value IMPORT')
    expect(existsSync(join(directory, 'destructive-remove-started'))).toBe(false)
  })

  it('rejects an invalid database checksum before destructive work', async () => {
    const directory = setup({ databaseChecksum: '0'.repeat(64) })
    const result = await runImport(directory)

    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('database checksum does not match')
    expect(existsSync(join(directory, 'destructive-remove-started'))).toBe(false)
  })

  it('rejects a media manifest count mismatch before destructive work', async () => {
    const directory = setup({ mediaManifestCount: 1 })
    const result = await runImport(directory)

    expect(result.exitCode).not.toBe(0)
    expect(result.stderr).toContain('media count does not match')
    expect(existsSync(join(directory, 'destructive-remove-started'))).toBe(false)
  })

  it('rejects a missing checkpoint blob before destructive work', async () => {
    const directory = setup({
      mediaEntries: [{ name: 'missing.pdf', sha256: sha256('missing'), size: 7 }],
    })
    const result = await runImport(directory)

    expect(result.exitCode).not.toBe(0)
    expect(existsSync(join(directory, 'destructive-remove-started'))).toBe(false)
  })

  it('processes every media entry when AzCopy consumes its standard input', async () => {
    const firstMediaContent = 'first-media'
    const secondMediaContent = 'second-media'
    const directory = setup({
      mediaEntries: [
        {
          name: 'first-media.txt',
          sha256: sha256(firstMediaContent),
          size: Buffer.byteLength(firstMediaContent),
        },
        {
          name: 'second-media.txt',
          sha256: sha256(secondMediaContent),
          size: Buffer.byteLength(secondMediaContent),
        },
      ],
    })
    writeFileSync(join(directory, 'first-media.txt'), firstMediaContent)
    writeFileSync(join(directory, 'second-media.txt'), secondMediaContent)

    const result = await runImport(directory)

    expect(result.exitCode).toBe(0)
    expect(result.stderr).toBe('')
    expect(existsSync(join(directory, 'destructive-remove-started'))).toBe(true)
  })
})
