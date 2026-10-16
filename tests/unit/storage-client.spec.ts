import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const azureMocks = vi.hoisted(() => ({
  connectionStrings: [] as string[],
  containerNames: [] as string[],
  identityClientIds: [] as string[],
  serviceURLs: [] as string[],
}))

vi.mock('@azure/identity', () => ({
  ManagedIdentityCredential: class ManagedIdentityCredential {
    constructor(clientId: string) {
      azureMocks.identityClientIds.push(clientId)
    }
  },
}))

vi.mock('@azure/storage-blob', () => ({
  BlobServiceClient: class BlobServiceClient {
    static fromConnectionString(connectionString: string): BlobServiceClient {
      azureMocks.connectionStrings.push(connectionString)
      return new BlobServiceClient('connection-string')
    }

    constructor(serviceURL: string) {
      azureMocks.serviceURLs.push(serviceURL)
    }

    getContainerClient(containerName: string): { containerName: string } {
      azureMocks.containerNames.push(containerName)
      return { containerName }
    }
  },
}))

import {
  getStorageAuthenticationMode,
  getStorageContainerClient,
  resetStorageContainerClientForTests,
} from '@/storage/get-storage-container-client'

beforeEach(() => {
  resetStorageContainerClientForTests()
  azureMocks.connectionStrings.length = 0
  azureMocks.containerNames.length = 0
  azureMocks.identityClientIds.length = 0
  azureMocks.serviceURLs.length = 0
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('Azure Blob storage client', () => {
  it('uses a connection string by default for local and staging environments', () => {
    vi.stubEnv('AZURE_STORAGE_CONNECTION_STRING', 'UseDevelopmentStorage=true')
    vi.stubEnv('AZURE_STORAGE_CONTAINER_NAME', 'media')

    getStorageContainerClient()

    expect(getStorageAuthenticationMode()).toBe('connection-string')
    expect(azureMocks.connectionStrings).toEqual(['UseDevelopmentStorage=true'])
    expect(azureMocks.containerNames).toEqual(['media'])
    expect(azureMocks.identityClientIds).toEqual([])
  })

  it('uses the configured user-assigned managed identity in production', () => {
    vi.stubEnv('AZURE_STORAGE_AUTH_MODE', 'managed-identity')
    vi.stubEnv('AZURE_STORAGE_ACCOUNT_BASE_URL', 'https://wkfprod.blob.core.windows.net')
    vi.stubEnv('AZURE_STORAGE_CONTAINER_NAME', 'media')
    vi.stubEnv('AZURE_STORAGE_IDENTITY_CLIENT_ID', 'storage-client-id')

    getStorageContainerClient()

    expect(azureMocks.connectionStrings).toEqual([])
    expect(azureMocks.identityClientIds).toEqual(['storage-client-id'])
    expect(azureMocks.serviceURLs).toEqual(['https://wkfprod.blob.core.windows.net'])
    expect(azureMocks.containerNames).toEqual(['media'])
  })

  it('rejects unknown authentication modes', () => {
    vi.stubEnv('AZURE_STORAGE_AUTH_MODE', 'shared-key')

    expect(() => getStorageAuthenticationMode()).toThrow(
      'AZURE_STORAGE_AUTH_MODE must be either "connection-string" or "managed-identity"',
    )
  })
})
