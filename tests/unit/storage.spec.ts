import { afterEach, describe, expect, it, vi } from 'vitest'

import { createStoragePlugins } from '@/storage/create-storage-plugins'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('storage configuration', () => {
  it('always configures the Azure storage adapter', () => {
    vi.stubEnv('AZURE_STORAGE_ACCOUNT_BASE_URL', 'http://127.0.0.1:10000/devstoreaccount1')
    vi.stubEnv('AZURE_STORAGE_CONNECTION_STRING', 'UseDevelopmentStorage=true')
    vi.stubEnv('AZURE_STORAGE_CONTAINER_NAME', 'media')

    expect(createStoragePlugins()).toHaveLength(1)
  })

  it('requires Azure storage configuration', () => {
    vi.stubEnv('AZURE_STORAGE_ACCOUNT_BASE_URL', '')

    expect(() => createStoragePlugins()).toThrow(
      'Missing required environment variable: AZURE_STORAGE_ACCOUNT_BASE_URL',
    )
  })
})
