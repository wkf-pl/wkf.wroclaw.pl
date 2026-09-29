import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'

import { Media } from '@/collections/Media'
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

  it('returns a document constraint when authorizing a public media file', async () => {
    const readAccess = Media.access?.read
    expect(typeof readAccess).toBe('function')
    if (typeof readAccess !== 'function') return

    const req = { context: {}, user: null } as unknown as PayloadRequest

    await expect(readAccess({ isReadingStaticFile: true, req })).resolves.toEqual({
      id: { exists: true },
    })
    await expect(readAccess({ req })).resolves.toBe(false)
  })
})
