import { BlobServiceClient } from '@azure/storage-blob'
import { getPayload, type PaginatedDocs } from 'payload'
import sharp from 'sharp'

import config from '@payload-config'

import type { Media } from '@/payload-types'

const svgMimeType = 'image/svg+xml'
const pngMimeType = 'image/png'
const backupPrefix = '_migration-checkpoints/svg-media'

function getRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function createPngFilename(filename: string): string {
  return /\.svg$/i.test(filename) ? filename.replace(/\.svg$/i, '.png') : `${filename}.png`
}

async function findSvgMedia(): Promise<Media[]> {
  const payload = await getPayload({ config })
  const documents: Media[] = []
  let page = 1
  let result: PaginatedDocs<Media>

  do {
    result = await payload.find({
      collection: 'media',
      depth: 0,
      limit: 100,
      overrideAccess: true,
      page,
      where: { mimeType: { equals: svgMimeType } },
    })
    documents.push(...result.docs)
    page += 1
  } while (result.hasNextPage)

  return documents
}

async function rasterizeMedia(document: Media): Promise<void> {
  if (!document.filename) {
    throw new Error(`Media #${document.id} has no filename.`)
  }

  const connectionString = getRequiredEnvironmentVariable('AZURE_STORAGE_CONNECTION_STRING')
  const containerName = getRequiredEnvironmentVariable('AZURE_STORAGE_CONTAINER_NAME')
  const containerClient =
    BlobServiceClient.fromConnectionString(connectionString).getContainerClient(containerName)
  const sourceBlob = containerClient.getBlobClient(document.filename)
  const sourceBuffer = await sourceBlob.downloadToBuffer()
  const backupBlobName = `${backupPrefix}/${document.id}/${document.filename}`
  const backupBlob = containerClient.getBlockBlobClient(backupBlobName)

  if (!(await backupBlob.exists())) {
    await backupBlob.uploadData(sourceBuffer, {
      blobHTTPHeaders: { blobContentType: svgMimeType },
      metadata: { mediaId: String(document.id), originalFilename: document.filename },
    })
  }

  const pngBuffer = await sharp(sourceBuffer, { density: 192 })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer()
  const payload = await getPayload({ config })

  await payload.update({
    collection: 'media',
    data: {},
    file: {
      data: pngBuffer,
      mimetype: pngMimeType,
      name: createPngFilename(document.filename),
      size: pngBuffer.length,
    },
    id: document.id,
    overrideAccess: true,
  })

  process.stdout.write(`Rasterized Media #${document.id}: ${document.filename}\n`)
}

async function main(): Promise<void> {
  const payload = await getPayload({ config })

  try {
    const documents = await findSvgMedia()

    if (documents.length === 0) {
      process.stdout.write('No SVG Media records found.\n')
      return
    }

    process.stdout.write(`Found ${documents.length} SVG Media record(s).\n`)
    for (const document of documents) {
      await rasterizeMedia(document)
    }

    const remainingDocuments = await findSvgMedia()
    if (remainingDocuments.length > 0) {
      throw new Error(
        `SVG Media verification failed. Remaining IDs: ${remainingDocuments
          .map(({ id }) => id)
          .join(', ')}`,
      )
    }

    process.stdout.write('SVG Media rasterization verified: no image/svg+xml records remain.\n')
  } finally {
    await payload.destroy()
  }
}

await main()
process.exit(0)
