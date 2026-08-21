import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '@/payload.config'
import { findPublicMedia } from '@/modules/media/media-listing'
import type { Category, Media, Tag } from '@/payload-types'

const categorySlug = 'integration-media-category'
const tagSlug = 'integration-media-tag'
const filenames = [
  'integration-media-a.png',
  'integration-media-b.png',
  'integration-media-c.pdf',
  'integration-media-outside.png',
]
const testPDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\n0000000000 65535 f\n%%EOF\n',
)

let payload: Payload
let category: Category
let tag: Tag
let firstImage: Media
let secondImage: Media
let documentFile: Media

beforeAll(async () => {
  payload = await getPayload({ config })
  await payload.delete({
    collection: 'media',
    overrideAccess: true,
    where: { filename: { in: filenames } },
  })
  await Promise.all([
    payload.delete({
      collection: 'categories',
      overrideAccess: true,
      where: { slug: { equals: categorySlug } },
    }),
    payload.delete({
      collection: 'tags',
      overrideAccess: true,
      where: { slug: { equals: tagSlug } },
    }),
  ])

  ;[category, tag] = await Promise.all([
    payload.create({
      collection: 'categories',
      data: { name: 'Integration media category', slug: categorySlug },
      overrideAccess: true,
    }),
    payload.create({
      collection: 'tags',
      data: { name: 'Integration media tag', slug: tagSlug },
      overrideAccess: true,
    }),
  ])

  const firstImageData = await sharp({
    create: { background: '#203a54', channels: 4, height: 24, width: 32 },
  })
    .png()
    .toBuffer()
  const secondImageData = await sharp({
    create: { background: '#d69524', channels: 4, height: 32, width: 24 },
  })
    .png()
    .toBuffer()

  firstImage = await createMedia({
    data: firstImageData,
    description: 'Pierwszy opis',
    filename: filenames[0],
    mimeType: 'image/png',
  })
  secondImage = await createMedia({
    data: secondImageData,
    description: 'Drugi opis',
    filename: filenames[1],
    mimeType: 'image/png',
  })
  documentFile = await createMedia({
    data: testPDF,
    description: 'Opis dokumentu',
    filename: filenames[2],
    mimeType: 'application/pdf',
  })

  await payload.create({
    collection: 'media',
    data: { alt: 'Outside image', categories: [category.id] },
    file: {
      data: firstImageData,
      mimetype: 'image/png',
      name: filenames[3],
      size: firstImageData.length,
    },
    overrideAccess: true,
  })
}, 20_000)

afterAll(async () => {
  if (!payload) {
    return
  }

  await payload.delete({
    collection: 'media',
    overrideAccess: true,
    where: { filename: { in: filenames } },
  })
  await Promise.all([
    payload.delete({ collection: 'categories', id: category.id, overrideAccess: true }),
    payload.delete({ collection: 'tags', id: tag.id, overrideAccess: true }),
  ])
})

describe('public media listing', () => {
  it('combines category and tag filters and limits galleries to images', async () => {
    const gallery = await findPublicMedia({
      categoryId: category.id,
      kind: 'mediaGallery',
      page: 1,
      pageSize: 12,
      pagination: true,
      selectionMode: 'filters',
      sort: 'nameAscending',
      tagId: tag.id,
    })
    const attachments = await findPublicMedia({
      categoryId: category.id,
      kind: 'attachments',
      page: 1,
      pageSize: 12,
      pagination: true,
      selectionMode: 'filters',
      sort: 'nameAscending',
      tagId: tag.id,
    })

    expect(gallery.items.map((item) => item.filename)).toEqual(filenames.slice(0, 2))
    expect(attachments.items.map((item) => item.filename)).toEqual(filenames.slice(0, 3))
  })

  it('supports all filtered sort modes', async () => {
    const results = await Promise.all(
      (['nameAscending', 'nameDescending', 'newest', 'oldest'] as const).map((sort) =>
        findPublicMedia({
          categoryId: category.id,
          kind: 'attachments',
          page: 1,
          pageSize: 12,
          pagination: true,
          selectionMode: 'filters',
          sort,
          tagId: tag.id,
        }),
      ),
    )

    expect(results[0].items.map((item) => item.filename)).toEqual(filenames.slice(0, 3))
    expect(results[1].items.map((item) => item.filename)).toEqual(filenames.slice(0, 3).reverse())
    expect(results[2].items.map((item) => Date.parse(item.createdAt))).toEqual(
      [...results[2].items]
        .map((item) => Date.parse(item.createdAt))
        .sort((first, second) => second - first),
    )
    expect(results[3].items.map((item) => Date.parse(item.createdAt))).toEqual(
      [...results[3].items]
        .map((item) => Date.parse(item.createdAt))
        .sort((first, second) => first - second),
    )
  })

  it('preserves manual order and paginates the selected files', async () => {
    const findSpy = vi.spyOn(payload, 'find')
    try {
      const result = await findPublicMedia({
        kind: 'attachments',
        manualMedia: [documentFile.id, secondImage.id, firstImage.id],
        page: 2,
        pageSize: 2,
        pagination: true,
        selectionMode: 'manual',
        sort: 'newest',
      })

      expect(result.totalDocs).toBe(3)
      expect(result.totalPages).toBe(2)
      expect(result.items.map((item) => item.filename)).toEqual([filenames[0]])
      expect(
        findSpy.mock.calls.filter(([arguments_]) => arguments_.collection === 'media'),
      ).toHaveLength(1)
    } finally {
      findSpy.mockRestore()
    }
  })

  it('applies page size as a limit when pagination is disabled', async () => {
    const result = await findPublicMedia({
      kind: 'attachments',
      manualMedia: [documentFile.id, secondImage.id, firstImage.id],
      page: 1,
      pageSize: 2,
      pagination: false,
      selectionMode: 'manual',
      sort: 'newest',
    })

    expect(result.totalPages).toBe(1)
    expect(result.items.map((item) => item.filename)).toEqual(filenames.slice(1, 3).reverse())
  })
})

async function createMedia({
  data,
  description,
  filename,
  mimeType,
}: {
  data: Buffer
  description: string
  filename: string
  mimeType: string
}): Promise<Media> {
  return payload.create({
    collection: 'media',
    data: {
      alt: filename,
      categories: [category.id],
      description,
      tags: [tag.id],
    },
    file: { data, mimetype: mimeType, name: filename, size: data.length },
    overrideAccess: true,
  })
}
