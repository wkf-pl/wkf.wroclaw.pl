import { describe, expect, it, vi } from 'vitest'

import {
  AttachmentsBlock,
  MediaGalleryBlock,
  validateManualMediaItems,
} from '@/blocks/MediaListing'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'

function getNamedField(name: string) {
  const field = MediaGalleryBlock.fields.find(
    (candidate) => 'name' in candidate && candidate.name === name,
  )

  if (!field || !('name' in field)) {
    throw new Error(`Missing media block field: ${name}`)
  }

  return field
}

function describeFieldOrder(): (string | string[])[] {
  return MediaGalleryBlock.fields.map((field) => {
    if (field.type === 'row') {
      return field.fields.map((rowField) => ('name' in rowField ? rowField.name : ''))
    }

    return 'name' in field ? field.name : ''
  })
}

describe('media blocks', () => {
  it('registers two separate blocks with the shared requested field order', () => {
    expect(MediaGalleryBlock.slug).toBe('mediaGallery')
    expect(AttachmentsBlock.slug).toBe('attachments')
    expect(describeFieldOrder()).toEqual([
      'heading',
      'selectionMode',
      'items',
      ['category', 'tag'],
      ['sort', 'view'],
      ['pageSize', 'pagination'],
      'emptyMessage',
    ])

    const layoutField = Pages.fields.find(
      (field) => 'name' in field && field.name === 'layout' && field.type === 'blocks',
    )
    expect(layoutField).toMatchObject({
      blocks: expect.arrayContaining([
        expect.objectContaining({ slug: 'mediaGallery' }),
        expect.objectContaining({ slug: 'attachments' }),
      ]),
    })
  })

  it('shows source-specific controls and restricts gallery choices to images', () => {
    const items = getNamedField('items')
    expect(items.admin?.condition?.({}, { selectionMode: 'manual' }, {} as never)).toBe(true)
    expect(items.admin?.condition?.({}, { selectionMode: 'filters' }, {} as never)).toBe(false)

    if (items.type !== 'array') {
      throw new Error('Expected items to be an array field.')
    }

    expect(items.fields[0]).toMatchObject({
      filterOptions: { mimeType: { like: 'image/%' } },
      name: 'media',
      type: 'upload',
    })
  })

  it('requires manual files and rejects duplicate selections', () => {
    expect(
      validateManualMediaItems([], {
        siblingData: { selectionMode: 'manual' },
      } as never),
    ).toBeTypeOf('string')
    expect(
      validateManualMediaItems([{ media: 7 }, { media: { id: 7 } }], {
        siblingData: { selectionMode: 'manual' },
      } as never),
    ).toBeTypeOf('string')
    expect(
      validateManualMediaItems([{ media: 7 }, { media: 8 }], {
        siblingData: { selectionMode: 'manual' },
      } as never),
    ).toBe(true)
    expect(
      validateManualMediaItems([], {
        siblingData: { selectionMode: 'filters' },
      } as never),
    ).toBe(true)
  })

  it('configures Media list columns, formatters, description and shared taxonomy', () => {
    const names = Media.fields.flatMap((field) =>
      field.type === 'row'
        ? field.fields.map((rowField) => ('name' in rowField ? rowField.name : ''))
        : 'name' in field
          ? [field.name]
          : [],
    )

    expect(names).toEqual([
      'filesize',
      'width',
      'height',
      'url',
      'thumbnailURL',
      'alt',
      'description',
      'categories',
      'tags',
      'uploadedBy',
    ])
    expect(Media.admin?.defaultColumns).toEqual([
      'filename',
      'description',
      'filesize',
      'width',
      'height',
      'url',
      'thumbnailURL',
      'categories',
      'tags',
      'uploadedBy',
    ])
  })

  it('rejects non-image files in a manual gallery on the server', async () => {
    const findByID = vi.fn().mockResolvedValue({ id: 9, mimeType: 'application/pdf' })

    await expect(
      validateMediaBlocks({
        data: {
          layout: [
            {
              blockType: 'mediaGallery',
              items: [{ media: 9 }],
              selectionMode: 'manual',
            },
          ],
        },
        req: { payload: { findByID } },
      } as never),
    ).rejects.toMatchObject({ status: 400 })
    expect(findByID).toHaveBeenCalledWith(expect.objectContaining({ collection: 'media', id: 9 }))
  })
})
