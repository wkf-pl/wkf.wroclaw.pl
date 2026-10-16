import { getPayload } from 'payload'

import config from '@payload-config'

import { publicRequestContext } from '@/modules/content/public-access'
import type { Document } from '@/payload-types'
import { getStorageContainerClient } from '@/storage/get-storage-container-client'
import { parseHTTPRange } from '@/storage/parse-http-range'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string; slug: string }> },
) {
  const shouldDownload = new URL(request.url).searchParams.get('download') === '1'
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

  const storageClient = getStorageContainerClient()
  const prefix = file.prefix?.replace(/^\/+|\/+$/g, '') || 'documents'
  const blobClient = storageClient.getBlockBlobClient(`${prefix}/${file.filename}`)

  try {
    const properties = await blobClient.getProperties()
    const fileSize = properties.contentLength
    if (!fileSize) return new Response(null, { status: 404 })

    const range = parseHTTPRange(request.headers.get('range'), fileSize)
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
      'Content-Disposition': `${shouldDownload ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
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
