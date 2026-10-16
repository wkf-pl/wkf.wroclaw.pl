import { azureStorage } from '@payloadcms/storage-azure'
import type { Plugin } from 'payload'

import { getEnvironmentBoolean, getRequiredEnvironmentVariable } from '@/lib/env'

import { getStorageContainerClient } from './get-storage-container-client'

export function createStoragePlugins(): Plugin[] {
  return [
    azureStorage({
      allowContainerCreate: getEnvironmentBoolean('AZURE_STORAGE_ALLOW_CONTAINER_CREATE'),
      baseURL: getRequiredEnvironmentVariable('AZURE_STORAGE_ACCOUNT_BASE_URL'),
      collections: {
        'document-files': { prefix: 'documents' },
        'member-profile-images': { prefix: 'member-profiles' },
        media: true,
      },
      containerName: getRequiredEnvironmentVariable('AZURE_STORAGE_CONTAINER_NAME'),
      getStorageClient: getStorageContainerClient,
    }),
  ]
}
