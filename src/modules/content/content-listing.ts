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
import {
  getFormRelationshipId,
  getPopulatedRelationship,
  getPopulatedRelationships,
  type RelationshipID,
} from '@/lib/relationships'
import { normalizeListingWindow, paginateInMemory } from '@/modules/content/listing-window'
import { findCategorySubtreeIDs } from '@/modules/content/category-hierarchy'
import { publicRequestContext } from '@/modules/content/public-access'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'

export const taxonomizableCollectionSlugs = ['pages', 'posts', 'events', 'event-cycles'] as const
export type TaxonomizableCollectionSlug = (typeof taxonomizableCollectionSlugs)[number]
export type TaxonomizableDocument = Event | EventCycle | Page | Post
export type ContentListingSort =
  'eventDateAscending' | 'newest' | 'oldest' | 'titleAscending' | 'titleDescending'

export type PublicContentListItem = {
  category: Category | null
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
  manualItems?: ManualContentReference[]
  page: number
  pageSize: number
  pagination: boolean
  parentId?: number
  selectionMode?: 'filters' | 'manual'
  sort: ContentListingSort
  sources: TaxonomizableCollectionSlug[]
  tagId?: number
}

export type ManualContentReference = {
  relationTo: TaxonomizableCollectionSlug
  value: RelationshipID | TaxonomizableDocument
}

export type PublicContentResult = {
  items: PublicContentListItem[]
  page: number
  pageSize: number
  totalDocs: number
  totalPages: number
}

type CachedFindPublicContentOptions = FindPublicContentOptions & {
  categoryIds?: number[]
}

async function findPublicContentUncached(
  options: CachedFindPublicContentOptions,
): Promise<PublicContentResult> {
  const payload = await getPayload({ config })
  const { page, pageSize } = normalizeListingWindow(options)
  const result = await payload.find({
    collection: 'content-listing-items',
    context: publicRequestContext,
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
      category: true,
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

export async function findPublicContent(
  options: FindPublicContentOptions,
): Promise<PublicContentResult> {
  if (options.selectionMode === 'manual') {
    return findManualPublicContent(options)
  }

  const categoryIds =
    options.categoryId === undefined ? undefined : await findCategorySubtreeIDs(options.categoryId)

  return findPublicContentCached({
    categoryId: options.categoryId,
    categoryIds,
    eventCycleId: options.eventCycleId,
    eventTimeFilter: options.eventTimeFilter,
    ...normalizeListingWindow(options),
    parentId: options.parentId,
    sort: options.sort,
    sources: [...new Set(options.sources)].sort(),
    tagId: options.tagId,
  })
}

async function findManualPublicContent(
  options: FindPublicContentOptions,
): Promise<PublicContentResult> {
  const references = getManualContentReferences(options.manualItems)
  let items: PublicContentListItem[] = []

  if (references.length > 0) {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'content-listing-items',
      context: publicRequestContext,
      depth: 1,
      limit: references.length,
      overrideAccess: false,
      pagination: false,
      populate: {
        categories: { name: true, slug: true },
        media: { alt: true, filename: true, height: true, url: true, width: true },
        tags: { name: true, slug: true },
      },
      select: {
        category: true,
        excerpt: true,
        heroImage: true,
        sortDate: true,
        source: true,
        sourceDocumentId: true,
        tags: true,
        title: true,
        url: true,
      },
      user: null,
      where: {
        or: references.map<Where>(({ id, source }) => {
          const conditions: Where[] = [
            { source: { equals: source } },
            { sourceDocumentId: { equals: id } },
          ]
          return { and: conditions }
        }),
      },
    })

    const itemsByReference = new Map(
      result.docs.map((item) => [`${item.source}:${String(item.sourceDocumentId)}`, item]),
    )
    items = references.flatMap(({ id, source }) => {
      const item = itemsByReference.get(`${source}:${String(id)}`)
      return item ? [mapIndexItem(item)] : []
    })
  }

  return paginateInMemory(items, options)
}

function getManualContentReferences(
  values: readonly ManualContentReference[] | null | undefined,
): { id: RelationshipID; source: TaxonomizableCollectionSlug }[] {
  return (
    values?.flatMap((value) => {
      const id = getFormRelationshipId(value.value)
      return id === undefined ? [] : [{ id, source: value.relationTo }]
    }) ?? []
  )
}

function createListingWhere(options: CachedFindPublicContentOptions): Where {
  const conditions: Where[] = [{ source: { in: [...new Set(options.sources)].sort() } }]
  if (options.categoryIds !== undefined) {
    conditions.push({ category: { in: options.categoryIds } })
  }
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
  | 'category'
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
    category: getPopulatedRelationship(item.category),
    date: item.sortDate,
    excerpt: item.excerpt ?? null,
    id: item.sourceDocumentId,
    image: getPopulatedRelationship(item.heroImage),
    kind: item.source,
    tags: getPopulatedRelationships(item.tags),
    title: item.title,
    url: item.url,
  }
}
