import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'

import { describe, expect, it, vi } from 'vitest'

import {
  buildDashboardLines,
  createInitialValidationStages,
  executeValidationStages,
  extractAffectedFileNames,
  extractPlaywrightFailureNames,
  extractVitestFailureNames,
  formatDuration,
  formatValidationFailureDetails,
  getFailedValidationStages,
  replaceReusableEndToEndRuntime,
  validationStageOrder,
  type CommandResult,
  type ValidationStageExecutor,
  type ValidationStageKey,
} from '../../scripts/pre-push'

describe('pre-push validation', () => {
  it('replaces a stale reusable E2E runtime with the runtime used by pre-push', async () => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'wkf-pre-push-runtime-test-'))
    const sourceDirectory = join(temporaryDirectory, 'source')
    const reusableDirectory = join(temporaryDirectory, 'reusable')

    try {
      await mkdir(sourceDirectory)
      await mkdir(reusableDirectory)
      await writeFile(join(sourceDirectory, 'server.js'), 'current runtime')
      await writeFile(join(reusableDirectory, 'server.js'), 'stale runtime')
      await writeFile(join(reusableDirectory, 'stale.txt'), 'remove me')

      await replaceReusableEndToEndRuntime(sourceDirectory, reusableDirectory)

      await expect(readFile(join(reusableDirectory, 'server.js'), 'utf8')).resolves.toBe(
        'current runtime',
      )
      await expect(readFile(join(reusableDirectory, 'stale.txt'), 'utf8')).rejects.toMatchObject({
        code: 'ENOENT',
      })
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true })
    }
  })

  it('runs static checks concurrently and resource-heavy test suites sequentially', async () => {
    const controlledExecutor = createControlledExecutor()
    const stages = createInitialValidationStages()
    const execution = executeValidationStages(stages, controlledExecutor.execute)

    await expectStartedStages(controlledExecutor.started, ['format', 'lint', 'typecheck'])
    expect(controlledExecutor.started).toEqual(['format', 'lint', 'typecheck'])

    controlledExecutor.complete('format')
    controlledExecutor.complete('lint')
    controlledExecutor.complete('typecheck')
    await expectStartedStages(controlledExecutor.started, ['format', 'lint', 'typecheck', 'unit'])

    controlledExecutor.complete('unit')
    await expectStartedStages(controlledExecutor.started, [
      'format',
      'lint',
      'typecheck',
      'unit',
      'integration',
    ])

    controlledExecutor.complete('integration')
    await expectStartedStages(controlledExecutor.started, [
      'format',
      'lint',
      'typecheck',
      'unit',
      'integration',
      'build',
    ])

    controlledExecutor.complete('build')
    await expectStartedStages(controlledExecutor.started, validationStageOrder)
    controlledExecutor.complete('endToEnd')
    await execution

    expect(validationStageOrder.map((stageKey) => stages[stageKey].status)).toEqual(
      validationStageOrder.map(() => 'success'),
    )
  })

  it('continues after static validation failures', async () => {
    const invokedStages: ValidationStageKey[] = []
    const stages = createInitialValidationStages()

    await executeValidationStages(stages, async (stageKey) => {
      invokedStages.push(stageKey)
      return stageKey === 'lint' ? failureResult('/project/src/example.ts') : successResult()
    })

    expect(invokedStages).toEqual(validationStageOrder)
    expect(getFailedValidationStages(stages).map((stage) => stage.key)).toEqual(['lint'])
    expect(stages.build.status).toBe('success')
    expect(stages.endToEnd.status).toBe('success')
  })

  it('stops before the build when unit or integration tests fail', async () => {
    const invokedStages: ValidationStageKey[] = []
    const stages = createInitialValidationStages()

    await executeValidationStages(stages, async (stageKey) => {
      invokedStages.push(stageKey)
      return stageKey === 'integration' ? failureResult('FAIL integration') : successResult()
    })

    expect(invokedStages).not.toContain('build')
    expect(invokedStages).not.toContain('endToEnd')
    expect(stages.build.status).toBe('skipped')
    expect(stages.endToEnd.status).toBe('skipped')
  })

  it('stops before browser tests when the production build fails', async () => {
    const invokedStages: ValidationStageKey[] = []
    const stages = createInitialValidationStages()

    await executeValidationStages(stages, async (stageKey) => {
      invokedStages.push(stageKey)
      return stageKey === 'build' ? failureResult('Build failed') : successResult()
    })

    expect(invokedStages).toContain('build')
    expect(invokedStages).not.toContain('endToEnd')
    expect(stages.endToEnd.status).toBe('skipped')
  })

  it('extracts only affected file names from static-check output', () => {
    const absoluteSourcePath = join(process.cwd(), 'src/example.ts')
    const output = [
      '[warn] scripts/pre-push.ts',
      absoluteSourcePath,
      'src/other.ts(12,4): error TS2322: Type mismatch.',
      '[warn] scripts/pre-push.ts',
      '✖ 2 problems (2 errors, 0 warnings)',
    ].join('\n')

    expect(extractAffectedFileNames(output)).toEqual([
      'scripts/pre-push.ts',
      'src/example.ts',
      'src/other.ts',
    ])
  })

  it('extracts failing test names independently for Vitest and Playwright', () => {
    const vitestOutput = [
      'FAIL  tests/unit/parser.spec.ts > parser > rejects invalid input',
      'FAIL  tests/unit/parser.spec.ts > parser > rejects invalid input',
    ].join('\n')
    const playwrightOutput = [
      '1) [chromium] › tests/e2e/navigation.e2e.spec.ts:12:3 › navigation › opens the page ───',
    ].join('\n')

    expect(extractVitestFailureNames(vitestOutput)).toEqual(['parser > rejects invalid input'])
    expect(extractPlaywrightFailureNames(playwrightOutput)).toEqual(['navigation › opens the page'])
  })

  it('shows command output when browser setup fails before Playwright reports a test', () => {
    const stages = createInitialValidationStages()
    stages.endToEnd.status = 'failure'
    stages.endToEnd.output = [
      '$ pnpm prepare:e2e',
      'ValidationError: To pole jest nieprawidłowe: Logo',
      '[ELIFECYCLE] Command failed with exit code 1.',
    ].join('\n')

    expect(formatValidationFailureDetails(stages.endToEnd)).toContain(
      'ValidationError: To pole jest nieprawidłowe: Logo',
    )
  })

  it('renders stage status and readable durations in the dashboard', () => {
    const stages = createInitialValidationStages()
    stages.format.status = 'success'
    stages.format.durationMilliseconds = 5400
    stages.integration.status = 'running'

    const dashboard = buildDashboardLines(stages).join('\n')

    expect(dashboard).toContain('Phase 1')
    expect(dashboard).toContain('OK  Formatting  5.4s')
    expect(dashboard).toContain('RUNNING  Integration Tests')
    expect(formatDuration(122_200)).toBe('2m 2.2s')
  })
})

function createControlledExecutor(): {
  execute: ValidationStageExecutor
  started: ValidationStageKey[]
  complete: (stageKey: ValidationStageKey) => void
} {
  const started: ValidationStageKey[] = []
  const resolvers = new Map<ValidationStageKey, (result: CommandResult) => void>()

  return {
    started,
    execute: (stageKey) => {
      started.push(stageKey)
      return new Promise((resolveResult) => {
        resolvers.set(stageKey, resolveResult)
      })
    },
    complete: (stageKey) => {
      const resolveResult = resolvers.get(stageKey)
      if (!resolveResult) {
        throw new Error(`Stage ${stageKey} has not started.`)
      }
      resolveResult(successResult())
    },
  }
}

async function expectStartedStages(
  startedStages: readonly ValidationStageKey[],
  expectedStages: readonly ValidationStageKey[],
): Promise<void> {
  await vi.waitFor(() => {
    expect(startedStages).toEqual(expectedStages)
  })
}

function successResult(): CommandResult {
  return { code: 0, output: '' }
}

function failureResult(output: string): CommandResult {
  return { code: 1, output }
}
