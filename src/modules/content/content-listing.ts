import { getPayload, type Payload, type Where } from 'payload'

import config from '@payload-config'

import type { ContentListingItem, Event, EventCycle, Page, Post } from '@/payload-types'
import { getFormRelationshipId, type RelationshipID } from '@/lib/relationships'
import { normalizeListingWindow, paginateInMemory } from '@/modules/content/listing-window'
import { findCategorySubtreeIDs } from '@/modules/content/category-hierarchy'
import { publicRequestContext } from '@/modules/content/public-access'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'

export const taxonomizableCollectionSlugs = ['pages', 'posts', 'events', 'event-cycles'] as const
export type TaxonomizableCollectionSlug = (typeof taxonomizableCollectionSlugs)[number]
export type TaxonomizableDocument = Event | EventCycle | Page | Post
export type ContentListingSort =
  'eventDateAscending' | 'newest' | 'oldest' | 'titleAscending' | 'titleDescending'

export type PublicContentListItem =
  | { document: EventCycle; kind: 'event-cycles'; url: string }
  | { document: Event; kind: 'events'; url: string }
  | { document: Page; kind: 'pages'; url: string }
  | { document: Post; kind: 'posts'; url: string }

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
    select: {
      source: true,
      sourceDocumentId: true,
      url: true,
    },
    sort: getPayloadSort(options.sort),
    user: null,
    where: createListingWhere(options),
  })

  return {
    items: await hydratePublicContentItems(payload, result.docs),
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
  let selectedItems: SelectedListingItem[] = []

  if (references.length > 0) {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'content-listing-items',
      context: publicRequestContext,
      depth: 1,
      limit: references.length,
      overrideAccess: false,
      pagination: false,
      select: {
        source: true,
        sourceDocumentId: true,
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
    selectedItems = references.flatMap(({ id, source }) => {
      const item = itemsByReference.get(`${source}:${String(id)}`)
      return item ? [item] : []
    })
  }

  const paginatedItems = paginateInMemory(selectedItems, options)

  return {
    ...paginatedItems,
    items: await hydratePublicContentItems(await getPayload({ config }), paginatedItems.items),
  }
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

type SelectedListingItem = Pick<ContentListingItem, 'source' | 'sourceDocumentId' | 'url'>

async function hydratePublicContentItems(
  payload: Payload,
  selectedItems: readonly SelectedListingItem[],
): Promise<PublicContentListItem[]> {
  const idsBySource: Record<TaxonomizableCollectionSlug, number[]> = {
    'event-cycles': [],
    events: [],
    pages: [],
    posts: [],
  }

  for (const item of selectedItems) {
    idsBySource[item.source].push(item.sourceDocumentId)
  }

  const [eventCycles, events, pages, posts] = await Promise.all([
    findPublishedEventCycles(payload, idsBySource['event-cycles']),
    findPublishedEvents(payload, idsBySource.events),
    findPublishedPages(payload, idsBySource.pages),
    findPublishedPosts(payload, idsBySource.posts),
  ])
  const documentsByReference = new Map<string, TaxonomizableDocument>([
    ...eventCycles.map((document) => [`event-cycles:${document.id}`, document] as const),
    ...events.map((document) => [`events:${document.id}`, document] as const),
    ...pages.map((document) => [`pages:${document.id}`, document] as const),
    ...posts.map((document) => [`posts:${document.id}`, document] as const),
  ])

  return selectedItems.flatMap((item): PublicContentListItem[] => {
    const document = documentsByReference.get(`${item.source}:${item.sourceDocumentId}`)
    if (!document) return []

    switch (item.source) {
      case 'event-cycles':
        return [{ document: document as EventCycle, kind: item.source, url: item.url }]
      case 'events':
        return [{ document: document as Event, kind: item.source, url: item.url }]
      case 'pages':
        return [{ document: document as Page, kind: item.source, url: item.url }]
      case 'posts':
        return [{ document: document as Post, kind: item.source, url: item.url }]
    }
  })
}

function uniqueIds(ids: readonly number[]): number[] {
  return [...new Set(ids)]
}

async function findPublishedEventCycles(
  payload: Payload,
  ids: readonly number[],
): Promise<EventCycle[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'event-cycles',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    user: null,
    where: { id: { in: uniqueIds(ids) } },
  })
  return result.docs
}

async function findPublishedEvents(payload: Payload, ids: readonly number[]): Promise<Event[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'events',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    user: null,
    where: { id: { in: uniqueIds(ids) } },
  })
  return result.docs
}

async function findPublishedPages(payload: Payload, ids: readonly number[]): Promise<Page[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'pages',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    user: null,
    where: { id: { in: uniqueIds(ids) } },
  })
  return result.docs
}

async function findPublishedPosts(payload: Payload, ids: readonly number[]): Promise<Post[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'posts',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    user: null,
    where: { id: { in: uniqueIds(ids) } },
  })
  return result.docs
}
