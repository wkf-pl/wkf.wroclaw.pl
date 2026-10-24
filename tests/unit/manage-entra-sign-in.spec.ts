import { spawnSync } from 'node:child_process'
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const temporaryDirectories: string[] = []

interface ScriptResult {
  calls: string[]
  status: number | null
  stderr: string
}

function runScript(arguments_: string[]): ScriptResult {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'wkf-entra-sign-in-'))
  temporaryDirectories.push(temporaryDirectory)

  const binaryDirectory = join(temporaryDirectory, 'bin')
  const callsFile = join(temporaryDirectory, 'az-calls')
  const azureFixture = join(binaryDirectory, 'az')

  mkdirSync(binaryDirectory)
  writeFileSync(callsFile, '')
  writeFileSync(
    azureFixture,
    `#!/usr/bin/env bash
printf '%s|' "$@" >> "$AZURE_CALLS_FILE"
printf '\n' >> "$AZURE_CALLS_FILE"
if [[ "$1 $2 $3" == 'containerapp auth show' ]]; then
  printf 'enabled: true\naction: AllowAnonymous\n'
fi
`,
  )
  chmodSync(azureFixture, 0o755)

  const result = spawnSync('bash', ['scripts/manage-entra-sign-in.sh', ...arguments_], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      AZURE_CALLS_FILE: callsFile,
      PATH: `${binaryDirectory}:${process.env.PATH}`,
    },
  })

  const calls = readFileSync(callsFile, 'utf8').trim().split('\n').filter(Boolean)

  return {
    calls,
    status: result.status,
    stderr: result.stderr,
  }
}

afterEach(() => {
  for (const temporaryDirectory of temporaryDirectories.splice(0)) {
    rmSync(temporaryDirectory, { force: true, recursive: true })
  }
})

describe('manage Entra sign-in script', () => {
  it('shows the current production state when state is omitted', () => {
    const result = runScript([])

    expect(result.status).toBe(0)
    expect(result.calls).toEqual([
      'containerapp|auth|show|--resource-group|rg-wkf-prod|--name|wkf-prod|--query|{enabled:platform.enabled,action:globalValidation.unauthenticatedClientAction,excludedPaths:globalValidation.excludedPaths,microsoft:identityProviders.azureActiveDirectory.enabled}|--output|yaml|',
    ])
  })

  it('requires sign-in and then shows the resulting production state', () => {
    const result = runScript(['on'])

    expect(result.status).toBe(0)
    expect(result.calls).toEqual([
      'containerapp|auth|update|--resource-group|rg-wkf-prod|--name|wkf-prod|--enabled|true|--unauthenticated-client-action|Return401|--excluded-paths|/api/health|/api/health/live|--yes|--output|none|',
      'containerapp|auth|show|--resource-group|rg-wkf-prod|--name|wkf-prod|--query|{enabled:platform.enabled,action:globalValidation.unauthenticatedClientAction,excludedPaths:globalValidation.excludedPaths,microsoft:identityProviders.azureActiveDirectory.enabled}|--output|yaml|',
    ])
  })

  it('allows anonymous access and then shows the resulting production state', () => {
    const result = runScript(['off'])

    expect(result.status).toBe(0)
    expect(result.calls).toEqual([
      'containerapp|auth|update|--resource-group|rg-wkf-prod|--name|wkf-prod|--enabled|true|--unauthenticated-client-action|AllowAnonymous|--yes|--output|none|',
      'containerapp|auth|show|--resource-group|rg-wkf-prod|--name|wkf-prod|--query|{enabled:platform.enabled,action:globalValidation.unauthenticatedClientAction,excludedPaths:globalValidation.excludedPaths,microsoft:identityProviders.azureActiveDirectory.enabled}|--output|yaml|',
    ])
  })

  it.each([
    { arguments_: ['invalid'], message: 'State must be on or off when provided.' },
    { arguments_: ['on', 'extra'], message: 'Usage: pnpm entra:sign-in' },
  ])('rejects invalid arguments: $arguments_', ({ arguments_, message }) => {
    const result = runScript(arguments_)

    expect(result.status).toBe(1)
    expect(result.stderr).toContain(message)
    expect(result.calls).toEqual([])
  })

  it('exposes the script through pnpm', () => {
    const packageConfiguration = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }

    expect(packageConfiguration.scripts['entra:sign-in']).toBe(
      'bash scripts/manage-entra-sign-in.sh',
    )
  })
})
