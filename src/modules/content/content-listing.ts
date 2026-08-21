import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type {
  Category,
  ContentListingItem,
  Event,
  EventCycle,
  Media,
  Page,
  Post,
  Tag,
} from '@/payload-types'
import { websiteRequestContext } from '@/modules/membership/role-permissions'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'

export const taxonomizableCollectionSlugs = ['pages', 'posts', 'events', 'event-cycles'] as const
export type TaxonomizableCollectionSlug = (typeof taxonomizableCollectionSlugs)[number]
export type TaxonomizableDocument = Event | EventCycle | Page | Post
export type ContentListingSort =
  'eventDateAscending' | 'newest' | 'oldest' | 'titleAscending' | 'titleDescending'

export type PublicContentListItem = {
  categories: Category[]
  date: null | string
  excerpt: null | string
  id: number
  image: Media | null
  kind: TaxonomizableCollectionSlug
  tags: Tag[]
  title: string
  url: string
}

export type FindPublicContentOptions = {
  categoryId?: number
  eventCycleId?: number
  eventTimeFilter?: 'all' | 'past' | 'upcoming'
  page: number
  pageSize: number
  pagination: boolean
  parentId?: number
  sort: ContentListingSort
  sources: TaxonomizableCollectionSlug[]
  tagId?: number
}

export type PublicContentResult = {
  items: PublicContentListItem[]
  page: number
  pageSize: number
  totalDocs: number
  totalPages: number
}

async function findPublicContentUncached(
  options: FindPublicContentOptions,
): Promise<PublicContentResult> {
  const payload = await getPayload({ config })
  const page = options.pagination ? Math.max(1, Math.floor(options.page)) : 1
  const pageSize = Math.min(100, Math.max(1, Math.floor(options.pageSize)))
  const result = await payload.find({
    collection: 'content-listing-items',
    context: websiteRequestContext,
    depth: 1,
    limit: pageSize,
    overrideAccess: false,
    page,
    populate: {
      categories: { name: true, slug: true },
      media: { alt: true, filename: true, height: true, url: true, width: true },
      tags: { name: true, slug: true },
    },
    select: {
      categories: true,
      excerpt: true,
      heroImage: true,
      sortDate: true,
      source: true,
      sourceDocumentId: true,
      tags: true,
      title: true,
      url: true,
    },
    sort: getPayloadSort(options.sort),
    user: null,
    where: createListingWhere(options),
  })

  return {
    items: result.docs.map(mapIndexItem),
    page,
    pageSize,
    totalDocs: result.totalDocs,
    totalPages: options.pagination ? Math.max(1, result.totalPages) : 1,
  }
}

const findPublicContentCached = cachePublicData(
  'public-content-listing',
  findPublicContentUncached,
  {
    revalidate: 300,
    tags: [publicCacheTags.contentListings],
  },
)

export function findPublicContent(options: FindPublicContentOptions): Promise<PublicContentResult> {
  return findPublicContentCached({
    categoryId: options.categoryId,
    eventCycleId: options.eventCycleId,
    eventTimeFilter: options.eventTimeFilter,
    page: Math.max(1, Math.floor(options.page)),
    pageSize: Math.min(100, Math.max(1, Math.floor(options.pageSize))),
    pagination: options.pagination,
    parentId: options.parentId,
    sort: options.sort,
    sources: [...new Set(options.sources)].sort(),
    tagId: options.tagId,
  })
}

function createListingWhere(options: FindPublicContentOptions): Where {
  const conditions: Where[] = [{ source: { in: [...new Set(options.sources)].sort() } }]
  if (options.categoryId !== undefined)
    conditions.push({ categories: { equals: options.categoryId } })
  if (options.tagId !== undefined) conditions.push({ tags: { equals: options.tagId } })
  if (options.parentId !== undefined) conditions.push({ parentPage: { equals: options.parentId } })
  if (options.eventCycleId !== undefined) {
    conditions.push({
      or: [
        { source: { not_equals: 'events' } },
        {
          and: [{ source: { equals: 'events' } }, { eventCycle: { equals: options.eventCycleId } }],
        },
      ],
    })
  }

  const now = new Date().toISOString()
  if (options.eventTimeFilter === 'upcoming') {
    conditions.push({
      or: [
        { source: { not_equals: 'events' } },
        { eventEndAt: { greater_than_equal: now } },
        { eventStartAt: { greater_than_equal: now } },
      ],
    })
  } else if (options.eventTimeFilter === 'past') {
    conditions.push({
      or: [
        { source: { not_equals: 'events' } },
        { and: [{ source: { equals: 'events' } }, { eventStartAt: { less_than: now } }] },
      ],
    })
  }
  return { and: conditions }
}

function getPayloadSort(sort: ContentListingSort): string[] {
  switch (sort) {
    case 'oldest':
    case 'eventDateAscending':
      return ['sortDate', 'title', 'source', 'sourceDocumentId']
    case 'titleAscending':
      return ['title', '-sortDate', 'source', 'sourceDocumentId']
    case 'titleDescending':
      return ['-title', '-sortDate', 'source', 'sourceDocumentId']
    default:
      return ['-sortDate', 'title', 'source', 'sourceDocumentId']
  }
}

type SelectedListingItem = Pick<
  ContentListingItem,
  | 'categories'
  | 'excerpt'
  | 'heroImage'
  | 'sortDate'
  | 'source'
  | 'sourceDocumentId'
  | 'tags'
  | 'title'
  | 'url'
>

function mapIndexItem(item: SelectedListingItem): PublicContentListItem {
  return {
    categories: populatedRelationships(item.categories),
    date: item.sortDate,
    excerpt: item.excerpt ?? null,
    id: item.sourceDocumentId,
    image: populatedRelationship(item.heroImage),
    kind: item.source,
    tags: populatedRelationships(item.tags),
    title: item.title,
    url: item.url,
  }
}

function populatedRelationship<T>(value: null | number | T | undefined): null | T {
  return value && typeof value === 'object' ? value : null
}

function populatedRelationships<T>(values: (number | T)[] | null | undefined): T[] {
  return values?.filter((value): value is T => typeof value === 'object') ?? []
}

export function createContentComparator(
  sort: ContentListingSort,
): (first: PublicContentListItem, second: PublicContentListItem) => number {
  return (first, second) => {
    const titleComparison = first.title.localeCompare(second.title, 'pl')
    const dateComparison = compareDates(first.date, second.date)
    let primaryComparison: number
    switch (sort) {
      case 'oldest':
      case 'eventDateAscending':
        primaryComparison = dateComparison
        break
      case 'titleAscending':
        primaryComparison = titleComparison
        break
      case 'titleDescending':
        primaryComparison = -titleComparison
        break
      default:
        primaryComparison = -dateComparison
    }
    if (primaryComparison !== 0) return primaryComparison
    if ((sort === 'titleAscending' || sort === 'titleDescending') && dateComparison !== 0)
      return -dateComparison
    if (titleComparison !== 0) return titleComparison
    const kindComparison = first.kind.localeCompare(second.kind, 'en')
    return kindComparison !== 0 ? kindComparison : first.id - second.id
  }
}

function compareDates(first: null | string, second: null | string): number {
  return new Date(first ?? 0).getTime() - new Date(second ?? 0).getTime()
}
