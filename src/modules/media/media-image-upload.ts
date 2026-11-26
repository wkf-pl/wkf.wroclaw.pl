import { randomUUID } from 'node:crypto'
import { readFile, rm } from 'node:fs/promises'

import { after } from 'next/server.js'
import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type CollectionBeforeChangeHook,
  type PayloadRequest,
} from 'payload'

import type { Media } from '@/payload-types'
import { getStorageContainerClient } from '@/storage/get-storage-container-client'
import { storeImageSet } from '@/storage/store-image-set'

import { createMediaImageSet, ImageInputError } from './image-set'
import { getMediaFileURL, getOptimizedImageKey, optimizedImagePrefix, type MediaImageVariant } from './media-image-data'
import { isWebRasterImageMimeType } from './media-categories'

export function prepareMediaImageFiles(
  image: NonNullable<Awaited<ReturnType<typeof createMediaImageSet>>>,
  sourceFilename: string,
  imageID: string = randomUUID(),
) {
  const label = sourceFilename
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replaceAll('ł', 'l')
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
  const basename = label ? `${label}-image-${imageID}` : `image-${imageID}`
  const filename = `${basename}.webp`
  const files = [{ key: optimizedImagePrefix + filename, buffer: image.main.buffer }]
  const variants = image.variants.map((variant): MediaImageVariant => {
    const variantFilename = `${basename}-${variant.width}.webp`
    files.push({ key: optimizedImagePrefix + variantFilename, buffer: variant.buffer })
    return {
      filename: variantFilename,
      width: variant.width,
      height: variant.height,
      filesize: variant.buffer.length,
    }
  })

  return {
    files,
    metadata: {
      filename,
      filesize: image.main.buffer.length,
      height: image.main.height,
      imageVariants: variants,
      mimeType: 'image/webp',
      url: getMediaFileURL(filename),
      thumbnailURL: variants[0]?.filename ? null : getMediaFileURL(filename),
      width: image.main.width,
      _objectKey: null,
    },
  }
}

export function getLegacyMediaKey(media: Pick<Media, 'filename' | '_objectKey'>): string | undefined {
  if (!media.filename) return undefined
  return [media._objectKey, media.filename].filter(Boolean).join('/')
}

type RetiredImageFile = { key: string; etag?: string }
type ImageFileSet = { filename: string; files: RetiredImageFile[] }

function getOptimizedImageFiles(media?: Media): RetiredImageFile[] {
  if (!media?.imageVariants || !media.filename) return []
  return [media.filename, ...media.imageVariants.map((variant) => variant.filename)].flatMap(
    (filename) => {
      const key = getOptimizedImageKey(filename)
      return key ? [{ key }] : []
    },
  )
}

async function getRetiredLegacyFile(media?: Media): Promise<RetiredImageFile | undefined> {
  if (!media || media.imageVariants || !isWebRasterImageMimeType(media.mimeType)) return
  const key = getLegacyMediaKey(media)
  if (!key) return
  try {
    const { etag } = await getStorageContainerClient().getBlobClient(key).getProperties()
    return etag ? { key, etag } : undefined
  } catch (error) {
    if (!(error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404)) {
      throw error
    }
  }
}

function scheduleUnreferencedImageCleanup(req: PayloadRequest, sets: ImageFileSet[]): void {
  if (!sets.length || req.payloadAPI === 'local') return
  const cleanupAfterResponse = async (): Promise<void> => {
    try {
      const { docs } = await req.payload.find({
        collection: 'media',
        depth: 0,
        limit: sets.length,
        overrideAccess: true,
        pagination: false,
        select: { filename: true },
        where: { filename: { in: sets.map(({ filename }) => filename) } },
      })
      const referenced = new Set(docs.map(({ filename }) => filename))
      const container = getStorageContainerClient()
      for (const { filename, files } of sets) {
        if (referenced.has(filename)) continue
        for (const { key, etag } of files) {
          await container.getBlobClient(key).deleteIfExists({ conditions: { ifMatch: etag } })
        }
      }
    } catch (error) {
      req.payload.logger.error({ err: error, msg: 'Could not clean up a replaced media image.' })
    }
  }
  try {
    after(cleanupAfterResponse)
  } catch (error) {
    if (!(error instanceof Error && error.message.includes('outside a request scope'))) throw error
  }
}

export const cleanupReplacedMediaImage: CollectionAfterChangeHook<Media> = ({
  doc,
  previousDoc,
  req,
}) => {
  // An optimized upload schedules its cleanup even if the database write fails.
  if (doc.imageVariants || !previousDoc?.filename || doc.filename === previousDoc.filename) {
    return doc
  }
  const files = getOptimizedImageFiles(previousDoc)
  if (files.length) scheduleUnreferencedImageCleanup(req, [{ filename: previousDoc.filename, files }])

  return doc
}

export const cleanupDeletedMediaImage: CollectionAfterDeleteHook<Media> = async ({ doc, req }) => {
  const files = getOptimizedImageFiles(doc)
  if (!files.length) return doc
  const container = getStorageContainerClient()
  const results = await Promise.allSettled(
    files.map(({ key }) => container.getBlobClient(key).deleteIfExists()),
  )
  for (const result of results) {
    if (result.status === 'rejected') {
      req.payload.logger.error({ err: result.reason, msg: 'Could not remove a deleted media image.' })
    }
  }
  return doc
}

export const mediaImageConversionContext = {
  mediaImageConversion: Symbol('mediaImageConversion'),
}

export const storeUploadedMediaImage: CollectionBeforeChangeHook<Media> = async ({
  data,
  originalDoc,
  req,
}) => {
  if (req.context.mediaImageConversion === mediaImageConversionContext.mediaImageConversion) {
    return data
  }
  const removeImageMetadata = data.removeImageMetadata !== false
  delete data.removeImageMetadata
  delete data.imageVariants
  delete data.legacyImageFiles
  delete data.imageConversionSource

  const file = req.file
  if (!file) return data
  if (originalDoc?.imageConversionSource && !originalDoc.imageConversionSource.finalized) {
    throw new APIError('Konwersja tego obrazu jest w toku.', 409)
  }
  if (originalDoc?.imageConversionSource) data.imageConversionSource = null
  if (!isWebRasterImageMimeType(file.mimetype)) {
    if (originalDoc?.imageVariants) data.imageVariants = null
    return data
  }

  let delegateToNativeUpload = false
  try {
    const source = file.tempFilePath ? await readFile(file.tempFilePath) : file.data
    const image = await createMediaImageSet(source, removeImageMetadata)
    if (!image) {
      delegateToNativeUpload = true
      if (originalDoc?.imageVariants) data.imageVariants = null
      return data
    }

    const previousFilename = originalDoc?.filename
    const legacy = req.payloadAPI === 'local' ? undefined : await getRetiredLegacyFile(originalDoc)
    const retired = [...getOptimizedImageFiles(originalDoc), ...(legacy ? [legacy] : [])]
    const { files, metadata } = prepareMediaImageFiles(image, file.name)
    await storeImageSet(files)
    const cleanup: ImageFileSet[] = [{ filename: metadata.filename, files: files.map(({ key }) => ({ key })) }]
    if (previousFilename && retired.length) cleanup.push({ filename: previousFilename, files: retired })
    scheduleUnreferencedImageCleanup(req, cleanup)

    const aliases = originalDoc?.legacyImageFiles ?? []
    return {
      ...data,
      ...metadata,
      legacyImageFiles:
        previousFilename && !aliases.some(({ filename }) => filename === previousFilename)
          ? [...aliases, { filename: previousFilename }]
          : aliases,
    }
  } catch (error) {
    if (error instanceof ImageInputError) throw new APIError(error.message, 400)
    throw error
  } finally {
    if (!delegateToNativeUpload) {
      // The optimized files go to Blob Storage through the shared writer. Only animations
      // within this branch pass their original file on to Payload's native adapter.
      delete req.file
      delete req.payloadUploadSizes
      delete req.context._payloadCloudStorage
      if (file.tempFilePath) await rm(file.tempFilePath, { force: true })
    }
  }
}
