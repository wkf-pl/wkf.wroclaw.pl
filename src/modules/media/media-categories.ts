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

export const mediaCategories = ['images', 'documents', 'other'] as const

export type MediaCategory = (typeof mediaCategories)[number]

export function getMediaCategoryWhere(category: MediaCategory): Where {
  if (category === 'images') {
    return { mimeType: { like: 'image/%' } }
  }

  if (category === 'documents') {
    return { mimeType: { in: [...mediaDocumentMimeTypes] } }
  }

  return {
    or: [
      { mimeType: { exists: false } },
      {
        and: [
          { mimeType: { not_like: 'image/%' } },
          { mimeType: { not_in: [...mediaDocumentMimeTypes] } },
        ],
      },
    ],
  }
}
