import { describe, expect, it } from 'vitest'

import {
  createContentComparator,
  type PublicContentListItem,
} from '@/modules/content/content-listing'
import {
  extractFirstRichTextParagraph,
  populateListingExcerptOnPublish,
} from '@/modules/content/listing-excerpt'
import {
  createPaginatedURL,
  getRequestedPage,
} from '@/app/(frontend)/_components/ContentPagination'
import { ContentListingItems } from '@/collections/ContentListingItems'

function createItem(overrides: Partial<PublicContentListItem> = {}): PublicContentListItem {
  return {
    categories: [],
    date: '2026-01-01T00:00:00.000Z',
    excerpt: null,
    id: 1,
    image: null,
    kind: 'pages',
    tags: [],
    title: 'Alfa',
    url: '/alfa',
    ...overrides,
  }
}

describe('content listing', () => {
  it('keeps the listing index internal and unavailable through generated APIs', () => {
    expect(ContentListingItems.admin).toMatchObject({ hidden: true })
    expect(ContentListingItems.endpoints).toBe(false)
    expect(ContentListingItems.graphQL).toBe(false)
    expect(ContentListingItems.access?.create?.({} as never)).toBe(false)
    expect(ContentListingItems.access?.update?.({} as never)).toBe(false)
    expect(ContentListingItems.access?.delete?.({} as never)).toBe(false)
    expect(
      ContentListingItems.fields.some((field) => 'name' in field && field.name === 'layout'),
    ).toBe(false)
  })

  it('extracts the first non-empty paragraph from the first rich-text block', () => {
    const layout = [
      { blockType: 'mediaGallery' },
      {
        blockType: 'richText',
        content: {
          root: {
            children: [
              { children: [{ text: 'Nagłówek' }], type: 'heading' },
              { children: [], type: 'paragraph' },
              {
                children: [
                  { text: 'Pierwszy ' },
                  { children: [{ text: 'opis' }], type: 'link' },
                  { text: ' strony' },
                ],
                type: 'paragraph',
              },
            ],
          },
        },
      },
      {
        blockType: 'richText',
        content: {
          root: { children: [{ children: [{ text: 'Drugi blok' }], type: 'paragraph' }] },
        },
      },
    ]

    expect(extractFirstRichTextParagraph(layout)).toBe('Pierwszy opis strony')
  })

  it('limits generated excerpts to 500 characters at a word boundary', () => {
    const paragraph = `${'słowo '.repeat(100)}koniec`
    const excerpt = extractFirstRichTextParagraph([
      {
        blockType: 'richText',
        content: { root: { children: [{ children: [{ text: paragraph }], type: 'paragraph' }] } },
      },
    ])

    expect(excerpt?.length).toBeLessThanOrEqual(500)
    expect(excerpt).not.toMatch(/\s$/)
  })

  it('fills a blank excerpt only when publishing', () => {
    const layout = [
      {
        blockType: 'richText',
        content: {
          root: {
            children: [
              {
                children: [{ text: 'Pierwszy opis strony', type: 'text', version: 1 }],
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: null,
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
      },
    ]

    expect(
      populateListingExcerptOnPublish({
        data: { _status: 'published', layout, listingExcerpt: '  ' },
        originalDoc: {},
      } as never),
    ).toMatchObject({ listingExcerpt: 'Pierwszy opis strony' })
    expect(
      populateListingExcerptOnPublish({
        data: { _status: 'draft', layout, listingExcerpt: null },
        originalDoc: {},
      } as never),
    ).not.toHaveProperty('listingExcerpt', 'Pierwszy opis strony')
    expect(
      populateListingExcerptOnPublish({
        data: { _status: 'published', layout, listingExcerpt: 'Ręczne streszczenie' },
        originalDoc: {},
      } as never),
    ).toMatchObject({ listingExcerpt: 'Ręczne streszczenie' })
    expect(
      populateListingExcerptOnPublish({
        data: { _status: 'published', layout, listingExcerpt: null },
        originalDoc: { listingExcerpt: 'Stare ręczne streszczenie' },
      } as never),
    ).toMatchObject({ listingExcerpt: 'Pierwszy opis strony' })
  })

  it('sorts mixed content deterministically by date, title, kind and ID', () => {
    const items = [
      createItem({ id: 2, kind: 'posts', title: 'Beta' }),
      createItem({ id: 3, kind: 'pages', title: 'Beta' }),
      createItem({ date: '2026-02-01T00:00:00.000Z', id: 4, title: 'Najnowsza' }),
      createItem({ id: 1, kind: 'pages', title: 'Alfa' }),
    ]

    expect(items.sort(createContentComparator('newest')).map(({ id }) => id)).toEqual([4, 1, 3, 2])
  })

  it('normalizes page numbers and preserves other listing parameters', () => {
    expect(getRequestedPage('0')).toBe(1)
    expect(getRequestedPage('abc')).toBe(1)
    expect(getRequestedPage(['3', '4'])).toBe(3)
    expect(
      createPaginatedURL('/blog', { listing_first: '2', listing_second: '4' }, 'listing_first', 3),
    ).toBe('/blog?listing_second=4&listing_first=3')
  })
})
