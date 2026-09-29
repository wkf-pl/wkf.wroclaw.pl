import { spawn } from 'node:child_process'
import { rmSync } from 'node:fs'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { performance } from 'node:perf_hooks'
import process from 'node:process'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'
import { stripVTControlCharacters } from 'node:util'

export type ValidationStageKey =
  'format' | 'lint' | 'typecheck' | 'unit' | 'integration' | 'build' | 'endToEnd'

export type ValidationStatus = 'waiting' | 'running' | 'success' | 'failure' | 'skipped'

export interface ValidationStage {
  key: ValidationStageKey
  label: string
  status: ValidationStatus
  durationMilliseconds?: number
  output: string
  skipReason?: string
}

export type ValidationStages = Record<ValidationStageKey, ValidationStage>

export interface CommandResult {
  code: number
  output: string
}

export type ValidationStageExecutor = (stageKey: ValidationStageKey) => Promise<CommandResult>

export const validationStageOrder: readonly ValidationStageKey[] = [
  'format',
  'lint',
  'typecheck',
  'unit',
  'integration',
  'build',
  'endToEnd',
]

export const validationStageGroups = [
  ['format', 'lint', 'typecheck'],
  ['unit', 'integration'],
  ['build'],
  ['endToEnd'],
] as const satisfies readonly (readonly ValidationStageKey[])[]

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const staticValidationStageKeys = new Set<ValidationStageKey>(['format', 'lint', 'typecheck'])
const testValidationStageKeys = new Set<ValidationStageKey>(['unit', 'integration'])

export function createInitialValidationStages(): ValidationStages {
  return {
    format: createValidationStage('format', 'Formatting'),
    lint: createValidationStage('lint', 'Lint'),
    typecheck: createValidationStage('typecheck', 'Typecheck'),
    unit: createValidationStage('unit', 'Unit Tests'),
    integration: createValidationStage('integration', 'Integration Tests'),
    build: createValidationStage('build', 'Production Build'),
    endToEnd: createValidationStage('endToEnd', 'Browser E2E'),
  }
}

export async function executeValidationStages(
  stages: ValidationStages,
  executor: ValidationStageExecutor,
  onUpdate: (stages: ValidationStages) => void = () => undefined,
): Promise<ValidationStages> {
  await executeValidationStageGroup(validationStageGroups[0], stages, executor, onUpdate)
  await executeValidationStageGroup(validationStageGroups[1], stages, executor, onUpdate)

  if (validationStageGroups[1].some((stageKey) => stages[stageKey].status === 'failure')) {
    markStageSkipped(stages.build, 'Unit or integration tests failed.')
    markStageSkipped(stages.endToEnd, 'Unit or integration tests failed.')
    onUpdate(stages)
    return stages
  }

  await executeValidationStage('build', stages, executor, onUpdate)

  if (stages.build.status === 'failure') {
    markStageSkipped(stages.endToEnd, 'Production build failed.')
    onUpdate(stages)
    return stages
  }

  await executeValidationStage('endToEnd', stages, executor, onUpdate)
  return stages
}

export function getFailedValidationStages(stages: ValidationStages): ValidationStage[] {
  return validationStageOrder
    .map((stageKey) => stages[stageKey])
    .filter((stage) => stage.status === 'failure')
}

export function formatDuration(durationMilliseconds?: number): string {
  if (durationMilliseconds === undefined) {
    return ''
  }

  if (durationMilliseconds < 1000) {
    return `${Math.round(durationMilliseconds)}ms`
  }

  const durationSeconds = durationMilliseconds / 1000
  if (durationSeconds < 60) {
    return `${durationSeconds.toFixed(1)}s`
  }

  const minutes = Math.floor(durationSeconds / 60)
  const seconds = durationSeconds - minutes * 60
  return `${minutes}m ${seconds.toFixed(1)}s`
}

export function buildDashboardLines(stages: ValidationStages): string[] {
  const lines = ['Pre-push validation', '']

  for (const [groupIndex, stageGroup] of validationStageGroups.entries()) {
    lines.push(`Phase ${groupIndex + 1}`)
    for (const stageKey of stageGroup) {
      const stage = stages[stageKey]
      const duration = formatDuration(stage.durationMilliseconds)
      const suffix = duration ? `  ${duration}` : ''
      lines.push(`  ${formatStatus(stage.status)}  ${stage.label}${suffix}`)
    }
    if (groupIndex < validationStageGroups.length - 1) {
      lines.push('')
    }
  }

  return lines
}

export function extractAffectedFileNames(output: string): string[] {
  const fileNames: string[] = []
  const fileExtensionPattern = '(?:[cm]?[jt]sx?|json|md|ya?ml|s?css|html)'
  const prettierPattern = new RegExp(`^\\[warn\\] (.+\\.${fileExtensionPattern})$`)
  const typeScriptPattern = new RegExp(`^(.+\\.${fileExtensionPattern})\\(\\d+,\\d+\\): error`)
  const standalonePathPattern = new RegExp(`^(.+\\.${fileExtensionPattern})$`)

  for (const rawLine of cleanOutput(output).split('\n')) {
    const line = rawLine.trim()
    const prettierMatch = line.match(prettierPattern)
    const typeScriptMatch = line.match(typeScriptPattern)
    const standalonePathMatch = line.match(standalonePathPattern)
    const fileName = prettierMatch?.[1] ?? typeScriptMatch?.[1] ?? standalonePathMatch?.[1]

    if (fileName) {
      fileNames.push(normalizeFileName(fileName))
    }
  }

  return uniqueValues(fileNames)
}

export function extractVitestFailureNames(output: string): string[] {
  const failureNames: string[] = []

  for (const rawLine of cleanOutput(output).split('\n')) {
    const match = rawLine.trim().match(/^FAIL\s+(.+)$/)
    if (!match) {
      continue
    }

    const parts = match[1].split(/\s+>\s+/)
    const failureName = parts.length > 1 ? parts.slice(1).join(' > ') : parts[0]
    failureNames.push(failureName.trim())
  }

  return uniqueValues(failureNames)
}

export function extractPlaywrightFailureNames(output: string): string[] {
  const failureNames: string[] = []

  for (const rawLine of cleanOutput(output).split('\n')) {
    const match = rawLine.trim().match(/^\d+\)\s+(.+)$/)
    if (!match) {
      continue
    }

    const parts = match[1].split(/\s+›\s+/)
    const firstTestNamePart = parts[0].startsWith('[') ? 2 : 1
    const failureName =
      parts.length > firstTestNamePart
        ? parts.slice(firstTestNamePart).join(' › ')
        : parts.at(-1) || parts[0]
    failureNames.push(failureName.replace(/\s+─+$/, '').trim())
  }

  return uniqueValues(failureNames)
}

async function runPrePush(): Promise<void> {
  const stages = createInitialValidationStages()
  const dashboard = createDashboard(stages)

  try {
    await executeValidationStages(stages, executeRealStage, dashboard.update)
  } finally {
    dashboard.done(stages)
  }

  const failedStages = getFailedValidationStages(stages)
  if (failedStages.length > 0) {
    printFailureOutput(failedStages)
    process.exitCode = 1
  }
}

async function executeValidationStageGroup(
  stageKeys: readonly ValidationStageKey[],
  stages: ValidationStages,
  executor: ValidationStageExecutor,
  onUpdate: (stages: ValidationStages) => void,
): Promise<void> {
  await Promise.all(
    stageKeys.map((stageKey) => executeValidationStage(stageKey, stages, executor, onUpdate)),
  )
}

async function executeValidationStage(
  stageKey: ValidationStageKey,
  stages: ValidationStages,
  executor: ValidationStageExecutor,
  onUpdate: (stages: ValidationStages) => void,
): Promise<void> {
  const stage = stages[stageKey]
  const startedAt = performance.now()
  stage.status = 'running'
  onUpdate(stages)

  const progressTimer = setInterval(() => {
    stage.durationMilliseconds = performance.now() - startedAt
    onUpdate(stages)
  }, 250)

  try {
    const result = await executor(stageKey)
    stage.output = result.output
    stage.status = result.code === 0 ? 'success' : 'failure'
  } catch (error) {
    stage.output = error instanceof Error ? error.stack || error.message : String(error)
    stage.status = 'failure'
  } finally {
    clearInterval(progressTimer)
    stage.durationMilliseconds = performance.now() - startedAt
    onUpdate(stages)
  }
}

async function executeRealStage(stageKey: ValidationStageKey): Promise<CommandResult> {
  switch (stageKey) {
    case 'format':
      return runPackageScript('format:check')
    case 'lint':
      return runPackageScript('lint')
    case 'typecheck':
      return runPackageScript('typecheck')
    case 'unit':
      return runPackageScript('test:unit')
    case 'integration':
      return runPackageScript('test:integration')
    case 'build':
      return runPackageScript('build')
    case 'endToEnd':
      return runProductionEndToEndTests()
  }
}

async function runProductionEndToEndTests(): Promise<CommandResult> {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'wkf-pre-push-'))
  const archivePath = join(temporaryDirectory, 'wkf-next-runtime.tar.gz')
  const runtimeDirectory = join(temporaryDirectory, 'runtime')
  const cleanupOnExit = (): void => {
    rmSync(temporaryDirectory, { force: true, recursive: true })
  }

  process.once('exit', cleanupOnExit)

  try {
    const packagingResult = await runCommand('bash', [
      join(projectRoot, 'scripts/package-e2e-runtime.sh'),
      archivePath,
    ])
    if (packagingResult.code !== 0) {
      return packagingResult
    }

    await mkdir(runtimeDirectory)
    const extractionResult = await runCommand('tar', ['-xzf', archivePath, '-C', runtimeDirectory])
    if (extractionResult.code !== 0) {
      return {
        code: extractionResult.code,
        output: `${packagingResult.output}\n${extractionResult.output}`,
      }
    }

    const testResult = await runPackageScript('test:e2e:ci', {
      CI: '1',
      WKF_E2E_RUNTIME_DIRECTORY: runtimeDirectory,
    })
    return {
      code: testResult.code,
      output: `${packagingResult.output}\n${extractionResult.output}\n${testResult.output}`,
    }
  } finally {
    process.removeListener('exit', cleanupOnExit)
    await rm(temporaryDirectory, { force: true, recursive: true })
  }
}

function runPackageScript(
  scriptName: string,
  environment: Partial<NodeJS.ProcessEnv> = {},
): Promise<CommandResult> {
  return runCommand('pnpm', [scriptName], environment)
}

function runCommand(
  command: string,
  arguments_: readonly string[],
  environment: Partial<NodeJS.ProcessEnv> = {},
): Promise<CommandResult> {
  return new Promise((resolveResult) => {
    const childProcess = spawn(command, arguments_, {
      cwd: projectRoot,
      env: {
        ...process.env,
        ...environment,
        FORCE_COLOR: '0',
        NO_COLOR: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let output = ''
    let settled = false

    childProcess.stdout.on('data', (chunk: Buffer | string) => {
      output += chunk.toString()
    })
    childProcess.stderr.on('data', (chunk: Buffer | string) => {
      output += chunk.toString()
    })
    childProcess.on('error', (error) => {
      if (!settled) {
        settled = true
        resolveResult({ code: 1, output: `${output}\n${error.stack || error.message}` })
      }
    })
    childProcess.on('close', (code) => {
      if (!settled) {
        settled = true
        resolveResult({ code: code ?? 1, output })
      }
    })
  })
}

function printFailureOutput(failedStages: readonly ValidationStage[]): void {
  process.stderr.write('\nValidation errors\n')

  for (const stage of failedStages) {
    process.stderr.write(`\n${stage.label}\n`)

    if (staticValidationStageKeys.has(stage.key)) {
      printFailureItems(
        extractAffectedFileNames(stage.output),
        'No affected file name was reported.',
      )
      continue
    }

    if (testValidationStageKeys.has(stage.key)) {
      printFailureItems(
        extractVitestFailureNames(stage.output),
        'No failing test name was reported.',
      )
      continue
    }

    if (stage.key === 'endToEnd') {
      printFailureItems(
        extractPlaywrightFailureNames(stage.output),
        'No failing browser test name was reported.',
      )
      continue
    }

    process.stderr.write(`${formatCommandOutput(stage.output)}\n`)
  }
}

function printFailureItems(items: readonly string[], fallback: string): void {
  if (items.length === 0) {
    process.stderr.write(`  ${fallback}\n`)
    return
  }

  for (const item of items) {
    process.stderr.write(`  - ${item}\n`)
  }
}

function createDashboard(initialStages: ValidationStages): {
  update: (stages: ValidationStages) => void
  done: (stages: ValidationStages) => void
} {
  const dynamic = shouldUseDynamicDashboard()
  let renderedLineCount = 0
  const staticStatuses = new Map(
    validationStageOrder.map((stageKey) => [stageKey, initialStages[stageKey].status]),
  )

  if (dynamic) {
    process.stdout.write('\u001B[?1049h\u001B[?25l')
  }

  const render = (stages: ValidationStages): void => {
    const lines = buildDashboardLines(stages)
    if (dynamic) {
      if (renderedLineCount > 0) {
        readline.moveCursor(process.stdout, 0, -renderedLineCount)
      }
      readline.cursorTo(process.stdout, 0)
      readline.clearScreenDown(process.stdout)
      process.stdout.write(`${lines.join('\n')}\n`)
      renderedLineCount = lines.length
      return
    }

    for (const stageKey of validationStageOrder) {
      const stage = stages[stageKey]
      if (staticStatuses.get(stageKey) === stage.status) {
        continue
      }

      staticStatuses.set(stageKey, stage.status)
      process.stdout.write(
        `${formatStatus(stage.status)}  ${stage.label}  ${formatDuration(stage.durationMilliseconds)}\n`,
      )
    }
  }

  if (dynamic) {
    render(initialStages)
  } else {
    process.stdout.write('Pre-push validation\n')
  }

  return {
    update: render,
    done: (stages) => {
      if (dynamic) {
        render(stages)
        process.stdout.write('\u001B[?25h\u001B[?1049l')
      } else {
        process.stdout.write(`${buildDashboardLines(stages).join('\n')}\n`)
      }
    },
  }
}

function shouldUseDynamicDashboard(): boolean {
  return Boolean(process.stdout.isTTY) && process.env.WKF_PRE_PUSH_STATIC !== '1'
}

function createValidationStage(key: ValidationStageKey, label: string): ValidationStage {
  return { key, label, status: 'waiting', output: '' }
}

function markStageSkipped(stage: ValidationStage, reason: string): void {
  stage.status = 'skipped'
  stage.skipReason = reason
  stage.durationMilliseconds = 0
}

function formatStatus(status: ValidationStatus): string {
  switch (status) {
    case 'waiting':
      return 'WAITING'
    case 'running':
      return 'RUNNING'
    case 'success':
      return 'OK'
    case 'failure':
      return 'ERROR'
    case 'skipped':
      return 'SKIPPED'
  }
}

function formatCommandOutput(output: string): string {
  const cleanedOutput = cleanOutput(output).trim()
  return cleanedOutput || '  No error output was captured.'
}

function cleanOutput(output: string): string {
  return stripVTControlCharacters(output).replace(/\r/g, '')
}

function normalizeFileName(fileName: string): string {
  const normalizedFileName = fileName.trim().replace(/^['"]|['"]$/g, '')
  const absoluteFileName = resolve(projectRoot, normalizedFileName)
  const relativeFileName = relative(projectRoot, absoluteFileName)

  if (relativeFileName && !relativeFileName.startsWith(`..${sep}`) && relativeFileName !== '..') {
    return relativeFileName.split(sep).join('/')
  }

  return normalizedFileName
}

function uniqueValues(values: readonly string[]): string[] {
  return [...new Set(values)]
}

const scriptPath = fileURLToPath(import.meta.url)
if (process.argv[1] && resolve(process.argv[1]) === resolve(scriptPath)) {
  await runPrePush()
}
