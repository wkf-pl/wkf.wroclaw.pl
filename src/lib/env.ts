export function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function getOptionalEnvironmentVariable(name: string): string | undefined {
  const value = process.env[name]?.trim()

  return value || undefined
}

export function getEnvironmentBoolean(name: string, fallback = false): boolean {
  const value = getOptionalEnvironmentVariable(name)

  if (value === undefined) {
    return fallback
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  throw new Error(`Environment variable ${name} must be either "true" or "false"`)
}

export function getEnvironmentInteger(name: string, fallback: number): number {
  const value = getOptionalEnvironmentVariable(name)

  if (value === undefined) {
    return fallback
  }

  const parsedValue = Number.parseInt(value, 10)

  if (!Number.isSafeInteger(parsedValue) || `${parsedValue}` !== value) {
    throw new Error(`Environment variable ${name} must be an integer`)
  }

  return parsedValue
}
