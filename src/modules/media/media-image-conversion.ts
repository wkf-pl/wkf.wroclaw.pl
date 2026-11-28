import { createHash } from 'node:crypto'

import type { Payload } from 'payload'

import type { Media } from '@/payload-types'
import { getStorageContainerClient } from '@/storage/get-storage-container-client'
import { storeImageSet } from '@/storage/store-image-set'

import { createMediaImageSet } from './image-set'
import { getOptimizedImageKey, optimizedImagePrefix } from './media-image-data'
import { getLegacyMediaKey, mediaImageConversionContext, prepareMediaImageFiles } from './media-image-upload'
import { isWebRasterImageMimeType } from './media-categories'

const conversionRevision = 'webp-full-resolution-v1'

export type MediaConversionMode =
  | 'inspect'
  | 'apply'
  | 'verify'
  | 'finalize'
  | 'rollback'
  | 'prune'

type Source = NonNullable<Media['imageConversionSource']>

type ConversionReport = {
  mode: MediaConversionMode
  converted: number
  resumed: number
  remaining: number
  missingSources: number
  skipped: number
  deleted: number
  sourceBytes: number
  optimizedBytes: number
  sourceFiles: number
  optimizedFiles: number
}

function deterministicImageID(mediaID: number, etag: string): string {
  const checksum = createHash('sha256')
    .update(JSON.stringify([conversionRevision, mediaID, etag]))
    .digest('hex')
  return [checksum.slice(0, 8), checksum.slice(8, 12), checksum.slice(12, 16),
    checksum.slice(16, 20), checksum.slice(20, 32)].join('-')
}

async function* iterateMedia(payload: Payload) {
  let lastID = 0
  while (true) {
    const { docs } = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 25,
      overrideAccess: true,
      pagination: false,
      showHiddenFields: true,
      sort: 'id',
      where: { id: { greater_than: lastID } },
    })
    if (!docs.length) return
    for (const doc of docs) yield doc
    lastID = docs[docs.length - 1].id
  }
}

function getStoredFiles(media: Media) {
  if (!media.filename || !media.imageVariants || !media.filesize) {
    throw new Error(`Media record ${media.id} has no complete optimized image.`)
  }
  return [{ filename: media.filename, filesize: media.filesize }, ...media.imageVariants].map(
    ({ filename, filesize }) => {
      const key = getOptimizedImageKey(filename)
      if (!key) throw new Error(`Unexpected optimized image filename in media record ${media.id}.`)
      return { key, filesize }
    },
  )
}

async function verifyFiles(media: Media) {
  const container = getStorageContainerClient()
  for (const file of getStoredFiles(media)) {
    const blob = container.getBlobClient(file.key)
    const properties = await blob.getProperties()
    if (properties.contentLength !== file.filesize || properties.contentType !== 'image/webp' ||
      !properties.metadata?.sha256) {
      throw new Error(`Stored image verification failed for media record ${media.id}.`)
    }
    const buffer = await blob.downloadToBuffer()
    if (createHash('sha256').update(buffer).digest('hex') !== properties.metadata.sha256) {
      throw new Error(`Stored image checksum mismatch for media record ${media.id}.`)
    }
  }
}

async function updateImageRecord(payload: Payload, media: Media, data: Partial<Media>) {
  const current = await payload.findByID({
    collection: 'media',
    id: media.id,
    depth: 0,
    overrideAccess: true,
    showHiddenFields: true,
  })
  if (current.filename !== media.filename || current.updatedAt !== media.updatedAt) {
    throw new Error(`Media record ${media.id} changed during image conversion.`)
  }

  await payload.update({
    collection: 'media',
    depth: 0,
    id: media.id,
    context: mediaImageConversionContext,
    overrideAccess: true,
    overrideLock: true,
    data,
  })
}

function trackBytes(
  report: ConversionReport,
  source: Pick<Source, 'filesize'>,
  output: readonly { filesize: number }[],
) {
  report.sourceFiles += 1
  report.optimizedFiles += output.length
  report.sourceBytes += source.filesize
  report.optimizedBytes += output.reduce((sum, file) => sum + file.filesize, 0)
}

export async function runMediaImageConversion(
  payload: Payload,
  mode: MediaConversionMode,
  {
    onProgress = () => {},
    checkLease = () => {},
  }: {
    onProgress?: (event: { id: number; status: string }) => void
    checkLease?: () => void
  } = {},
): Promise<ConversionReport> {
  const container = getStorageContainerClient()
  const report = {
    mode, converted: 0, resumed: 0, remaining: 0, missingSources: 0, skipped: 0, deleted: 0,
    sourceBytes: 0, optimizedBytes: 0, sourceFiles: 0, optimizedFiles: 0,
  }
  const pending: Media[] = []

  for await (const media of iterateMedia(payload)) {
    checkLease()
    const recordedSource = media.imageConversionSource
    if (recordedSource) {
      if (mode === 'rollback') {
        if (recordedSource.finalized) throw new Error('Restore the pre-conversion backup to reverse a finalized conversion.')
        const source = container.getBlobClient(recordedSource.key)
        await source.getProperties({ conditions: { ifMatch: recordedSource.etag } })
        pending.push(media)
      } else {
        await verifyFiles(media)
        trackBytes(report, recordedSource, getStoredFiles(media))
        if (!recordedSource.finalized) pending.push(media)
      }
      report.resumed += 1
      onProgress({ id: media.id, status: 'verified checkpoint' })
      continue
    }
    if (mode === 'rollback' || mode === 'prune' ||
      media.imageVariants || !media.filename || !isWebRasterImageMimeType(media.mimeType)) {
      report.skipped += 1
      continue
    }
    if (media.mimeType === 'image/avif' || media.mimeType === 'image/gif') {
      report.skipped += 1
      continue
    }

    const key = getLegacyMediaKey(media)
    if (!key) throw new Error(`Missing source path for media record ${media.id}.`)
    const blob = container.getBlobClient(key)
    const properties = await blob.getProperties().catch((error: unknown) => {
      if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
        return null
      }
      throw error
    })
    if (!properties) {
      report.missingSources += 1
      onProgress({ id: media.id, status: 'missing source blob' })
      continue
    }
    const { etag, contentLength } = properties
    if (!etag || !contentLength) throw new Error(`Missing source properties for media record ${media.id}.`)
    const buffer = await blob.downloadToBuffer(0, undefined, { conditions: { ifMatch: etag } })
    const image = await createMediaImageSet(buffer)
    if (!image) {
      report.skipped += 1
      continue
    }
    const { files, metadata } = prepareMediaImageFiles(image, media.filename, deterministicImageID(media.id, etag))
    const source: Source = {
      etag,
      filename: media.filename,
      filesize: contentLength,
      key,
      originalDocument: {
        _objectKey: media._objectKey ?? null,
        height: media.height ?? null,
        mimeType: media.mimeType ?? null,
        thumbnailURL: media.thumbnailURL ?? null,
        url: media.url ?? null,
        width: media.width ?? null,
      },
    }
    trackBytes(report, source, [
      { filesize: metadata.filesize }, ...metadata.imageVariants,
    ])

    if (mode === 'apply') {
      await storeImageSet(files)
      checkLease()
      await updateImageRecord(payload, media, {
        ...metadata,
        imageConversionSource: source,
        legacyImageFiles: [...(media.legacyImageFiles ?? []), { filename: source.filename }],
      })
      report.converted += 1
    } else {
      report.remaining += 1
    }
    onProgress({ id: media.id, status: mode === 'apply' ? 'converted' : 'estimated' })
  }

  if (mode === 'rollback') {
    for (const media of pending) {
      const source = media.imageConversionSource!
      checkLease()
      await updateImageRecord(payload, media, {
        ...source.originalDocument,
        filename: source.filename,
        filesize: source.filesize,
        imageVariants: null,
        imageConversionSource: null,
        legacyImageFiles: media.legacyImageFiles?.filter(({ filename }) => filename !== source.filename) ?? [],
      })
      for (const file of getStoredFiles(media)) {
        await container.getBlobClient(file.key).deleteIfExists()
      }
      report.converted += 1
      onProgress({ id: media.id, status: 'restored original' })
    }
  }

  if (mode === 'prune') {
    const referenced = new Set<string>()
    for await (const media of iterateMedia(payload)) {
      if (media.imageVariants) {
        for (const { key } of getStoredFiles(media)) referenced.add(key)
      }
    }
    for await (const blob of container.listBlobsFlat({ prefix: optimizedImagePrefix })) {
      if (!getOptimizedImageKey(blob.name.slice(optimizedImagePrefix.length)) ||
        referenced.has(blob.name)) continue
      checkLease()
      const result = await container.getBlobClient(blob.name).deleteIfExists({
        conditions: { ifMatch: blob.properties.etag },
      })
      if (result.succeeded) report.deleted += 1
    }
  }

  if (mode === 'finalize') {
    // Verify the entire library before removing the first original.
    if (report.remaining || report.missingSources || report.optimizedBytes > report.sourceBytes) return report
    for (const media of pending) {
      const source = media.imageConversionSource!
      checkLease()
      const result = await container.getBlobClient(source.key).deleteIfExists({
        conditions: { ifMatch: source.etag },
      })
      if (result.succeeded) report.deleted += 1
      await updateImageRecord(payload, media, {
        imageConversionSource: { ...source, finalized: true },
      })
      onProgress({ id: media.id, status: 'finalized' })
    }
  }

  return report
}
