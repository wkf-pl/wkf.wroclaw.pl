import { describe, expect, it } from 'vitest'

import { getMediaCategoryWhere, mediaDocumentMimeTypes } from '@/modules/media/media-categories'

describe('media categories', () => {
  it('uses images as the default media category', () => {
    expect(getMediaCategoryWhere('images')).toEqual({ mimeType: { like: 'image/%' } })
  })

  it('places every image MIME type in the image tab', () => {
    expect(getMediaCategoryWhere('images')).toEqual({ mimeType: { like: 'image/%' } })
  })

  it('includes the requested and common document formats in the document tab', () => {
    const documentFilter = getMediaCategoryWhere('documents')

    expect(documentFilter).toEqual({ mimeType: { in: [...mediaDocumentMimeTypes] } })
    expect(mediaDocumentMimeTypes).toEqual(
      expect.arrayContaining([
        'application/epub+zip',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/x-mobipocket-ebook',
      ]),
    )
  })

  it('places unclassified files and records without a MIME type in the other tab', () => {
    expect(getMediaCategoryWhere('other')).toEqual({
      or: [
        { mimeType: { exists: false } },
        {
          and: [
            { mimeType: { not_like: 'image/%' } },
            { mimeType: { not_in: [...mediaDocumentMimeTypes] } },
          ],
        },
      ],
    })
  })
})
