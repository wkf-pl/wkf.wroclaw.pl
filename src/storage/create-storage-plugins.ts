import { azureStorage } from '@payloadcms/storage-azure'
import type { Plugin } from 'payload'

import { getEnvironmentBoolean, getRequiredEnvironmentVariable, getStorageAdapter } from '@/lib/env'

export function createStoragePlugins(): Plugin[] {
  if (getStorageAdapter() === 'local') {
    return []
  }

  return [
    azureStorage({
      allowContainerCreate: getEnvironmentBoolean('AZURE_STORAGE_ALLOW_CONTAINER_CREATE'),
      baseURL: getRequiredEnvironmentVariable('AZURE_STORAGE_ACCOUNT_BASE_URL'),
      collections: {
        media: true,
      },
      connectionString: getRequiredEnvironmentVariable('AZURE_STORAGE_CONNECTION_STRING'),
      containerName: getRequiredEnvironmentVariable('AZURE_STORAGE_CONTAINER_NAME'),
    }),
  ]
}
