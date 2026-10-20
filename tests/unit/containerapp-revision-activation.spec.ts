import { spawnSync } from 'node:child_process'
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

const temporaryDirectories: string[] = []

function writeExecutable(path: string, content: string): void {
  writeFileSync(path, content)
  chmodSync(path, 0o755)
}

function prepareFixture(
  initialState: 'true' | 'false',
  activationMode: string,
): {
  environment: NodeJS.ProcessEnv
  logPath: string
  statePath: string
} {
  const directory = mkdtempSync(join(tmpdir(), 'wkf-revision-activation-'))
  temporaryDirectories.push(directory)
  const binaryDirectory = join(directory, 'bin')
  const logPath = join(directory, 'az.log')
  const statePath = join(directory, 'state')
  mkdirSync(binaryDirectory)
  writeFileSync(statePath, initialState)
  writeExecutable(
    join(binaryDirectory, 'az'),
    `#!/bin/sh
set -eu
printf '%s\n' "$*" >>"$MOCK_AZ_LOG"
case "$*" in
  *'revision show'*)
    cat "$MOCK_REVISION_STATE"
    ;;
  *'revision activate'*)
    case "$MOCK_ACTIVATION_MODE" in
      success)
        printf 'true\n' >"$MOCK_REVISION_STATE"
        ;;
      applied-with-error)
        printf 'true\n' >"$MOCK_REVISION_STATE"
        echo 'RevisionAlreadyInRequestedState' >&2
        exit 1
        ;;
      failure)
        echo 'activation failed' >&2
        exit 1
        ;;
    esac
    ;;
  *) exit 2 ;;
esac
`,
  )

  return {
    environment: {
      ...process.env,
      MOCK_ACTIVATION_MODE: activationMode,
      MOCK_AZ_LOG: logPath,
      MOCK_REVISION_STATE: statePath,
      PATH: `${binaryDirectory}:${process.env.PATH}`,
      REVISION_ACTIVATION_RETRY_DELAY_SECONDS: '0',
    },
    logPath,
    statePath,
  }
}

function runHelper(environment: NodeJS.ProcessEnv) {
  return spawnSync(
    'bash',
    ['scripts/ensure-containerapp-revision-active.sh', 'rg-wkf-prod', 'wkf-prod', 'revision'],
    { encoding: 'utf8', env: environment },
  )
}

afterEach(() => {
  while (temporaryDirectories.length > 0) {
    rmSync(temporaryDirectories.pop()!, { force: true, recursive: true })
  }
})

describe('Container Apps revision activation', () => {
  it('returns success without activating a revision that is already active', () => {
    const fixture = prepareFixture('true', 'failure')

    const result = runHelper(fixture.environment)

    expect(result.status).toBe(0)
    expect(readFileSync(fixture.logPath, 'utf8')).toContain('revision show')
    expect(readFileSync(fixture.logPath, 'utf8')).not.toContain('revision activate')
  })

  it('accepts an activation error when Azure reports the revision as active afterwards', () => {
    const fixture = prepareFixture('false', 'applied-with-error')

    const result = runHelper(fixture.environment)

    expect(result.status).toBe(0)
    expect(result.stderr).toBe('')
    expect(readFileSync(fixture.statePath, 'utf8').trim()).toBe('true')
  })

  it('fails after three attempts when the revision remains inactive', () => {
    const fixture = prepareFixture('false', 'failure')

    const result = runHelper(fixture.environment)

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Could not ensure that revision revision was active')
    expect(readFileSync(fixture.logPath, 'utf8').match(/revision activate/g)).toHaveLength(3)
  })
})
