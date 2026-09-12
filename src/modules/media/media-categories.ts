import type { Where } from 'payload'

export const mediaDocumentMimeTypes = [
  'application/epub+zip',
  'application/msword',
  'application/pdf',
  'application/rtf',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.oasis.opendocument.presentation',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/x-mobipocket-ebook',
  'application/xml',
  'text/csv',
  'text/markdown',
  'text/plain',
  'text/xml',
] as const

export const webRasterImageMimeTypes = [
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export function isWebRasterImageMimeType(value: unknown): boolean {
  return (
    typeof value === 'string' &&
    webRasterImageMimeTypes.some((mimeType) => mimeType === value)
  )
}

export const mediaCategories = ['images', 'documents', 'other'] as const

export type MediaCategory = (typeof mediaCategories)[number]

export function getMediaCategoryWhere(category: MediaCategory): Where {
  if (category === 'images') {
    return { mimeType: { in: [...webRasterImageMimeTypes] } }
  }

  if (category === 'documents') {
    return { mimeType: { in: [...mediaDocumentMimeTypes] } }
  }

  return {
    or: [
      { mimeType: { exists: false } },
      {
        and: [
          { mimeType: { not_in: [...webRasterImageMimeTypes] } },
          { mimeType: { not_in: [...mediaDocumentMimeTypes] } },
        ],
      },
    ],
  }
}
