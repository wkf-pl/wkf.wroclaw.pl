import { ManagedIdentityCredential } from '@azure/identity'
import { BlobServiceClient, type ContainerClient } from '@azure/storage-blob'

import { getOptionalEnvironmentVariable, getRequiredEnvironmentVariable } from '@/lib/env'

type StorageAuthenticationMode = 'connection-string' | 'managed-identity'

let cachedContainerClient: ContainerClient | undefined

export function getStorageContainerClient(): ContainerClient {
  if (cachedContainerClient) {
    return cachedContainerClient
  }

  const authenticationMode = getStorageAuthenticationMode()
  const containerName = getRequiredEnvironmentVariable('AZURE_STORAGE_CONTAINER_NAME')

  if (authenticationMode === 'managed-identity') {
    const accountBaseURL = getRequiredEnvironmentVariable('AZURE_STORAGE_ACCOUNT_BASE_URL')
    const identityClientId = getRequiredEnvironmentVariable('AZURE_STORAGE_IDENTITY_CLIENT_ID')
    const credential = new ManagedIdentityCredential(identityClientId)

    cachedContainerClient = new BlobServiceClient(accountBaseURL, credential).getContainerClient(
      containerName,
    )
  } else {
    const connectionString = getRequiredEnvironmentVariable('AZURE_STORAGE_CONNECTION_STRING')
    cachedContainerClient =
      BlobServiceClient.fromConnectionString(connectionString).getContainerClient(containerName)
  }

  return cachedContainerClient
}

export function getStorageAuthenticationMode(): StorageAuthenticationMode {
  const configuredMode =
    getOptionalEnvironmentVariable('AZURE_STORAGE_AUTH_MODE') ?? 'connection-string'

  if (configuredMode === 'connection-string' || configuredMode === 'managed-identity') {
    return configuredMode
  }

  throw new Error(
    'Environment variable AZURE_STORAGE_AUTH_MODE must be either "connection-string" or "managed-identity"',
  )
}

export function resetStorageContainerClientForTests(): void {
  cachedContainerClient = undefined
}
