import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const listingMocks = vi.hoisted(() => ({ findPublicContent: vi.fn() }))
const mediaMocks = vi.hoisted(() => ({ findPublicMedia: vi.fn() }))

vi.mock('@/modules/content/content-listing', () => listingMocks)
vi.mock('@/modules/media/media-listing', () => mediaMocks)

import { SectionGroupRenderer } from '@/app/(frontend)/_components/ContentLayoutRenderer'
import { resolveListingBlockSection } from '@/app/(frontend)/_components/ListingBlockSection'
import { resolveMediaBlockSection } from '@/app/(frontend)/_components/MediaBlockSection'

const emptyResult = {
  items: [],
  page: 1,
  pageSize: 10,
  totalDocs: 0,
  totalPages: 1,
}

const emptyAwareBlocks = [
  {
    blockType: 'listing',
    pageSize: 10,
    pagination: false,
    selectionMode: 'filters',
    sort: 'newest',
    sources: ['pages'],
    view: 'cards',
  },
  {
    blockType: 'listing',
    pageSize: 5,
    pagination: false,
    selectionMode: 'filters',
    sort: 'newest',
    sources: ['pages'],
    view: 'carousel',
  },
  {
    blockType: 'mediaGallery',
    pageSize: 10,
    pagination: false,
    selectionMode: 'filters',
    sort: 'newest',
    view: 'grid',
  },
  {
    blockType: 'attachments',
    pageSize: 10,
    pagination: false,
    selectionMode: 'filters',
    sort: 'newest',
    view: 'list',
  },
] as const

describe('filter-capable block resolution', () => {
  beforeEach(() => {
    listingMocks.findPublicContent.mockReset().mockResolvedValue(emptyResult)
    mediaMocks.findPublicMedia.mockReset().mockResolvedValue(emptyResult)
  })

  it('reports an empty Listing while preserving its standalone empty state', async () => {
    const resolution = await resolveListingBlockSection({
      block: {
        blockType: 'listing',
        conditions: [{ field: 'significantDate', numberValue: 30, operator: 'notOlderThan' }],
        emptyMessage: 'Brak treści.',
        pageSize: 10,
        pagination: false,
        selectionMode: 'filters',
        sort: 'newest',
        sources: ['pages'],
        view: 'cards',
      } as never,
      blockPath: 'layout.0.sections.0.blocks.0',
      document: {} as never,
      pathname: '/test',
      searchParams: {},
    })

    expect(resolution.isEmpty).toBe(true)
    expect(renderToStaticMarkup(resolution.content)).toContain('Brak treści.')
    expect(listingMocks.findPublicContent).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: [{ field: 'significantDate', numberValue: 30, operator: 'notOlderThan' }],
      }),
    )
  })

  it('reports an empty Listing carousel while preserving its standalone empty state', async () => {
    const resolution = await resolveListingBlockSection({
      block: {
        blockType: 'listing',
        conditions: [{ field: 'significantDate', numberValue: 14, operator: 'notOlderThan' }],
        emptyMessage: 'Brak slajdów.',
        pageSize: 5,
        pagination: false,
        selectionMode: 'filters',
        sort: 'newest',
        sources: ['pages'],
        view: 'carousel',
      } as never,
      blockPath: 'layout.0',
      document: {} as never,
      pathname: '/test',
      searchParams: { contentPage: '9' },
    })

    expect(resolution.isEmpty).toBe(true)
    expect(renderToStaticMarkup(resolution.content)).toContain('Brak slajdów.')
    expect(listingMocks.findPublicContent).toHaveBeenCalledWith(
      expect.objectContaining({
        conditions: [{ field: 'significantDate', numberValue: 14, operator: 'notOlderThan' }],
        page: 1,
        pagination: false,
      }),
    )
  })

  it('omits an empty Listing configured with hideWhenEmpty', async () => {
    const resolution = await resolveListingBlockSection({
      block: {
        blockType: 'listing',
        hideWhenEmpty: true,
        pageSize: 100,
        pagination: false,
        selectionMode: 'manual',
        sort: 'titleAscending',
        view: 'grid',
      } as never,
      blockPath: 'layout.0',
      document: {} as never,
      pathname: '/test',
      searchParams: {},
    })

    expect(resolution.isEmpty).toBe(true)
    expect(resolution.content).toBeNull()
  })

  it.each([
    ['mediaGallery', 'Galeria nie zawiera jeszcze obrazów.'],
    ['attachments', 'Nie ma załączników.'],
  ] as const)(
    'reports an empty %s block while preserving its empty state',
    async (blockType, message) => {
      const resolution = await resolveMediaBlockSection({
        block: {
          blockType,
          pageSize: 10,
          pagination: false,
          selectionMode: 'filters',
          sort: 'newest',
          view: blockType === 'mediaGallery' ? 'grid' : 'list',
        } as never,
        blockPath: 'layout.0.sections.0.blocks.0',
        pathname: '/test',
        searchParams: {},
      })

      expect(resolution.isEmpty).toBe(true)
      expect(renderToStaticMarkup(resolution.content)).toContain(message)
    },
  )

  it.each(emptyAwareBlocks)(
    'hides a configured section group for an empty $blockType block',
    async (emptyAwareBlock) => {
      const rendered = await SectionGroupRenderer({
        block: {
          blockType: 'sectionGroup',
          emptyChildBehavior: 'hideGroup',
          sections: [{ blocks: [emptyAwareBlock] }],
        } as never,
        document: {} as never,
        path: 'layout.0',
        pathname: '/test',
        searchParams: {},
      })

      expect(rendered).toBeNull()
    },
  )

  it('propagates an empty tracked block through a column layout', async () => {
    const rendered = await SectionGroupRenderer({
      block: {
        blockType: 'sectionGroup',
        emptyChildBehavior: 'hideGroup',
        sections: [
          {
            blocks: [
              {
                blockType: 'columnLayout',
                columns: [{ blocks: [emptyAwareBlocks[0]], width: 12 }],
              },
            ],
          },
        ],
      } as never,
      document: {} as never,
      path: 'layout.0',
      pathname: '/test',
      searchParams: {},
    })

    expect(rendered).toBeNull()
  })

  it('keeps the existing empty state when the group uses the default behavior', async () => {
    const rendered = await SectionGroupRenderer({
      block: {
        blockType: 'sectionGroup',
        emptyChildBehavior: 'show',
        sections: [{ blocks: [emptyAwareBlocks[0]] }],
      } as never,
      document: {} as never,
      path: 'layout.0',
      pathname: '/test',
      searchParams: {},
    })

    expect(rendered).not.toBeNull()
    expect(renderToStaticMarkup(rendered)).toContain('Nie ma opublikowanych treści.')
  })
})
