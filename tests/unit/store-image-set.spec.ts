import { createHash } from 'node:crypto'

import { describe, expect, it, vi } from 'vitest'

import { storeImageSet } from '@/storage/store-image-set'

const storage = vi.hoisted(() => ({
  getBlockBlobClient: vi.fn(),
  getBlobClient: vi.fn(),
}))

vi.mock('@/storage/get-storage-container-client', () => ({
  getStorageContainerClient: () => storage,
}))
vi.mock('@/lib/env', () => ({ getEnvironmentBoolean: () => false }))

describe('storing an image set', () => {
  it('removes the partially written set and keeps previously verified files available for retry', async () => {
    const buffer = Buffer.from('encoded picture')
    const getProperties = vi.fn().mockResolvedValue({
      contentType: 'image/webp',
      contentLength: buffer.length,
      metadata: { sha256: createHash('sha256').update(buffer).digest('hex') },
    })
    const deleteIfExists = vi.fn().mockResolvedValue({ succeeded: true })
    storage.getBlobClient.mockReturnValue({ deleteIfExists })
    storage.getBlockBlobClient
      .mockReturnValueOnce({
        uploadData: vi.fn().mockRejectedValue({ statusCode: 409, code: 'BlobAlreadyExists' }),
        getProperties,
      })
      .mockReturnValueOnce({
        uploadData: vi.fn().mockResolvedValue({ etag: 'new-etag' }),
        getProperties,
      })
      .mockReturnValueOnce({ uploadData: vi.fn().mockRejectedValue(new Error('Write failed')) })

    await expect(
      storeImageSet(['verified', 'written', 'failed'].map((key) => ({ key, buffer }))),
    ).rejects.toThrow('Write failed')
    expect(storage.getBlobClient).toHaveBeenCalledExactlyOnceWith('written')
    expect(deleteIfExists).toHaveBeenCalledExactlyOnceWith({ conditions: { ifMatch: 'new-etag' } })
  })
})
