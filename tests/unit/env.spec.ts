import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getEnvironmentBoolean,
  getEnvironmentInteger,
  getRequiredEnvironmentVariable,
} from '@/lib/env'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('environment configuration', () => {
  it('reads and trims required values', () => {
    vi.stubEnv('TEST_REQUIRED_VALUE', '  configured  ')

    expect(getRequiredEnvironmentVariable('TEST_REQUIRED_VALUE')).toBe('configured')
  })

  it('rejects missing required values', () => {
    vi.stubEnv('TEST_REQUIRED_VALUE', '')

    expect(() => getRequiredEnvironmentVariable('TEST_REQUIRED_VALUE')).toThrow(
      'Missing required environment variable: TEST_REQUIRED_VALUE',
    )
  })

  it('parses explicit booleans', () => {
    vi.stubEnv('TEST_BOOLEAN_VALUE', 'true')

    expect(getEnvironmentBoolean('TEST_BOOLEAN_VALUE')).toBe(true)
  })

  it('rejects ambiguous booleans', () => {
    vi.stubEnv('TEST_BOOLEAN_VALUE', 'yes')

    expect(() => getEnvironmentBoolean('TEST_BOOLEAN_VALUE')).toThrow(
      'Environment variable TEST_BOOLEAN_VALUE must be either "true" or "false"',
    )
  })

  it('parses integer values without accepting partial numbers', () => {
    vi.stubEnv('TEST_INTEGER_VALUE', '1025')

    expect(getEnvironmentInteger('TEST_INTEGER_VALUE', 25)).toBe(1025)

    vi.stubEnv('TEST_INTEGER_VALUE', '1025smtp')

    expect(() => getEnvironmentInteger('TEST_INTEGER_VALUE', 25)).toThrow(
      'Environment variable TEST_INTEGER_VALUE must be an integer',
    )
  })
})
