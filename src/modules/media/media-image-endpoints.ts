import { Readable } from 'node:stream'

import type { Endpoint, PayloadRequest, UploadConfig } from 'payload'

import { publicRequestContext } from '@/modules/content/public-access'
import { getStorageContainerClient } from '@/storage/get-storage-container-client'
import { parseHTTPRange } from '@/storage/parse-http-range'

import { getMediaFileURL, getOptimizedImageKey } from './media-image-data'

async function serveImage(req: PayloadRequest, filename: string, filesize: number): Promise<Response> {
  const key = getOptimizedImageKey(filename)
  if (!key || !Number.isSafeInteger(filesize) || filesize <= 0) {
    return new Response(null, { status: 404 })
  }
  const etag = `"${filename}"`
  const headers = new Headers({
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=300',
    'Content-Type': 'image/webp',
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
  })
  const ifNoneMatch = req.headers.get('if-none-match')
  if (ifNoneMatch?.split(',').some((value) => value.trim().replace(/^W\//, '') === etag || value.trim() === '*')) {
    return new Response(null, { status: 304, headers })
  }
  const ifRange = req.headers.get('if-range')
  const range = !ifRange || ifRange === etag ? parseHTTPRange(req.headers.get('range'), filesize) : null
  if (range === false) {
    headers.set('Content-Range', `bytes */${filesize}`)
    return new Response(null, { status: 416, headers })
  }
  const length = range ? range.end - range.start + 1 : filesize
  if (range) headers.set('Content-Range', `bytes ${range.start}-${range.end}/${filesize}`)
  headers.set('Content-Length', String(length))
  const blob = getStorageContainerClient().getBlobClient(key)

  try {
    if (req.method === 'HEAD') {
      await blob.getProperties({ abortSignal: req.signal })
      return new Response(null, { status: range ? 206 : 200, headers })
    }
    const response = await blob.download(range?.start ?? 0, range ? length : undefined, {
      abortSignal: req.signal,
    })
    if (!(response.readableStreamBody instanceof Readable)) {
      throw new Error('Azure returned a non-readable image stream.')
    }
    const stream = Readable.toWeb(response.readableStreamBody) as ReadableStream<Uint8Array>
    return new Response(stream, { status: range ? 206 : 200, headers })
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 404) {
      return new Response(null, { status: 404 })
    }
    throw error
  }
}

export const serveOptimizedMediaFile: NonNullable<UploadConfig['handlers']>[number] = (req, { doc, params }) => {
  if (
    'imageVariants' in doc &&
    Array.isArray(doc.imageVariants) &&
    'filename' in doc &&
    doc.filename === params.filename &&
    'filesize' in doc &&
    typeof doc.filesize === 'number'
  ) {
    return serveImage(req, params.filename, doc.filesize)
  }
}

export const mediaImageVariantEndpoint: Endpoint = {
  method: 'get',
  path: '/:id/image/:filename',
  handler: async (req) => {
    const { id, filename } = req.routeParams ?? {}
    if (typeof id !== 'string' || !/^\d+$/.test(id) ||
      typeof filename !== 'string' || !getOptimizedImageKey(filename)) {
      return new Response(null, { status: 404 })
    }
    const { docs } = await req.payload.find({
      collection: 'media',
      context: publicRequestContext,
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      req,
      select: { imageVariants: true },
      where: { id: { equals: id } },
    })
    const variant = docs[0]?.imageVariants?.find((image) => image.filename === filename)
    return variant
      ? serveImage(req, filename, variant.filesize)
      : new Response(null, { status: 404 })
  },
}

export async function resolveLegacyMediaFile(
  req: PayloadRequest,
  filename: string,
): Promise<Response | undefined> {
  if (!filename || filename.includes('/') || filename.includes('\\')) return
  const { docs } = await req.payload.find({
    collection: 'media',
    context: publicRequestContext,
    depth: 0,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    req,
    select: { filename: true },
    where: { 'legacyImageFiles.filename': { equals: filename } },
  })
  const currentFilename = docs[0]?.filename
  if (currentFilename && currentFilename !== filename) {
    const target = new URL(getMediaFileURL(currentFilename), req.url)
    return new Response(null, {
      status: 307,
      headers: { 'Cache-Control': 'no-store', Location: target.pathname },
    })
  }
}
