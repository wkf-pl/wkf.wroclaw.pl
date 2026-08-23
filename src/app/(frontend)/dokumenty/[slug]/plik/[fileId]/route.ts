import { getStorageClient } from '@payloadcms/storage-azure'
import { getPayload } from 'payload'

import config from '@payload-config'

import { getRequiredEnvironmentVariable } from '@/lib/env'
import { publicRequestContext } from '@/modules/content/public-access'
import type { Document } from '@/payload-types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string; slug: string }> },
) {
  const { fileId, slug } = await params
  const parsedFileId = Number.parseInt(fileId, 10)
  if (!Number.isSafeInteger(parsedFileId)) return new Response(null, { status: 404 })

  const payload = await getPayload({ config })
  const documents = await payload.find({
    collection: 'documents',
    context: publicRequestContext,
    depth: 0,
    draft: false,
    limit: 1,
    overrideAccess: false,
    user: null,
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
        {
          or: [
            { primaryFile: { equals: parsedFileId } },
            { attachments: { contains: parsedFileId } },
          ],
        },
      ],
    },
  })
  const document: Document | undefined = documents.docs[0]
  if (!document) return new Response(null, { status: 404 })

  const file = await payload.findByID({
    collection: 'document-files',
    depth: 0,
    id: parsedFileId,
    overrideAccess: true,
  })
  if (!file.filename) return new Response(null, { status: 404 })

  const storageClient = getStorageClient({
    connectionString: getRequiredEnvironmentVariable('AZURE_STORAGE_CONNECTION_STRING'),
    containerName: getRequiredEnvironmentVariable('AZURE_STORAGE_CONTAINER_NAME'),
  })
  const prefix = file.prefix?.replace(/^\/+|\/+$/g, '') || 'documents'
  const blobClient = storageClient.getBlockBlobClient(`${prefix}/${file.filename}`)

  try {
    const properties = await blobClient.getProperties()
    const fileSize = properties.contentLength
    if (!fileSize) return new Response(null, { status: 404 })

    const range = parseRange(request.headers.get('range'), fileSize)
    if (range === false) {
      return new Response(null, {
        headers: { 'Content-Range': `bytes */${fileSize}` },
        status: 416,
      })
    }

    const download = range
      ? await blobClient.download(range.start, range.end - range.start + 1)
      : await blobClient.download()
    if (!download.readableStreamBody) return new Response(null, { status: 500 })

    const responseHeaders = new Headers({
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      'Content-Length': `${range ? range.end - range.start + 1 : fileSize}`,
      'Content-Type': properties.contentType || 'application/pdf',
    })
    if (properties.etag) responseHeaders.set('ETag', properties.etag)
    if (range) responseHeaders.set('Content-Range', `bytes ${range.start}-${range.end}/${fileSize}`)

    return new Response(download.readableStreamBody as never, {
      headers: responseHeaders,
      status: range ? 206 : 200,
    })
  } catch {
    return new Response(null, { status: 404 })
  }
}

function parseRange(
  value: null | string,
  fileSize: number,
): false | null | { end: number; start: number } {
  if (!value) return null
  const match = /^bytes=(\d+)-(\d*)$/.exec(value)
  if (!match) return false
  const start = Number.parseInt(match[1], 10)
  const requestedEnd = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1
  const end = Math.min(requestedEnd, fileSize - 1)
  return start <= end && start < fileSize ? { end, start } : false
}
