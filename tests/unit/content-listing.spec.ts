import { describe, expect, it } from 'vitest'

import type { Page } from '@/payload-types'
import {
  createContentComparator,
  extractPageExcerpt,
  type PublicContentListItem,
} from '@/modules/content/content-listing'
import {
  createPaginatedURL,
  getRequestedPage,
} from '@/app/(frontend)/_components/ContentPagination'

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
  it('extracts and truncates the first rich-text block as a page excerpt', () => {
    const page = {
      layout: [
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
      ],
    } as unknown as Page

    expect(extractPageExcerpt(page)).toBe('Pierwszy opis strony')
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
