import { createHash } from 'node:crypto'

import { getEnvironmentBoolean } from '@/lib/env'

import { getStorageContainerClient } from './get-storage-container-client'

export function isExistingBlobError(error: unknown): boolean {
  return Boolean(
    error &&
    typeof error === 'object' &&
    (('statusCode' in error && error.statusCode === 412) ||
      ('code' in error && error.code === 'BlobAlreadyExists')),
  )
}

export async function storeImageSet(
  files: readonly { key: string; buffer: Buffer }[],
): Promise<void> {
  const container = getStorageContainerClient()
  if (getEnvironmentBoolean('AZURE_STORAGE_ALLOW_CONTAINER_CREATE')) {
    await container.createIfNotExists()
  }
  const uploaded: { key: string; etag: string }[] = []
  try {
    for (const { key, buffer } of files) {
      const blob = container.getBlockBlobClient(key)
      const sha256 = createHash('sha256').update(buffer).digest('hex')
      try {
        const result = await blob.uploadData(buffer, {
          blobHTTPHeaders: { blobContentType: 'image/webp' },
          conditions: { ifNoneMatch: '*' },
          metadata: { sha256 },
        })
        if (result.etag) uploaded.push({ key, etag: result.etag })
      } catch (error) {
        if (!isExistingBlobError(error)) {
          throw error
        }
      }
      const properties = await blob.getProperties()
      if (
        properties.contentType !== 'image/webp' ||
        properties.contentLength !== buffer.length ||
        properties.metadata?.sha256 !== sha256
      ) {
        throw new Error('Stored image does not match the encoded file.')
      }
    }
  } catch (error) {
    await Promise.allSettled(
      uploaded.map(({ key, etag }) =>
        container.getBlobClient(key).deleteIfExists({ conditions: { ifMatch: etag } }),
      ),
    )
    throw error
  }
}
