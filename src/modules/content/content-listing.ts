import { getPayload, type Payload, type Where } from 'payload'

import config from '@payload-config'

import type { ContentListingItem, Document, Event, EventCycle, Page, Post } from '@/payload-types'
import { getFormRelationshipId, type RelationshipID } from '@/lib/relationships'
import { normalizeListingWindow, paginateInMemory } from '@/modules/content/listing-window'
import { findCategorySubtreeIDs } from '@/modules/content/category-hierarchy'
import { publicRequestContext } from '@/modules/content/public-access'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import {
  getWarsawDayAfterISOString,
  getWarsawDayStartISOString,
  getWarsawDaysAgoStartISOString,
  getListingConditionRelationshipCollection,
  isCalendarDate,
  isListingConditionField,
  isListingConditionOperator,
  listingConditionOperatorsByField,
  listingConditionSupportedSources,
  listingSources,
  normalizeListingTitle,
  type ListingConditionField,
  type ListingConditionInput,
  type ListingConditionOperator,
  type ListingEventTimeValue,
  type ListingSource,
} from '@/modules/content/listing-conditions'

export const taxonomizableCollectionSlugs = listingSources
export type TaxonomizableCollectionSlug = ListingSource
export type TaxonomizableDocument = Document | Event | EventCycle | Page | Post
export type ContentListingSort = 'newest' | 'oldest' | 'titleAscending' | 'titleDescending'

export type PublicContentListItem =
  | { document: Document; kind: 'documents'; url: string }
  | { document: EventCycle; kind: 'event-cycles'; url: string }
  | { document: Event; kind: 'events'; url: string }
  | { document: Page; kind: 'pages'; url: string }
  | { document: Post; kind: 'posts'; url: string }

export type FindPublicContentOptions = {
  conditions?: ListingConditionInput[] | null
  manualItems?: ManualContentReference[]
  page: number
  pageSize: number
  pagination: boolean
  selectionMode?: 'filters' | 'manual'
  sort: ContentListingSort
  sources: TaxonomizableCollectionSlug[]
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

export type PreparedListingCondition = {
  dateValue?: string
  endDateValue?: string
  eventTimeValue?: ListingEventTimeValue
  field: ListingConditionField
  numberValue?: number
  operator: ListingConditionOperator
  relationshipId?: number
  relationshipIds?: number[]
  textValue?: string
}

type CachedFindPublicContentOptions = Omit<FindPublicContentOptions, 'conditions'> & {
  conditions: PreparedListingCondition[]
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

  return findPublicContentCached({
    conditions: await prepareListingConditions(options.conditions ?? []),
    ...normalizeListingWindow(options),
    sort: options.sort,
    sources: [...new Set(options.sources)].sort(),
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
  conditions.push(...options.conditions.map(compileListingConditionWhere))
  return { and: conditions }
}

export function compileListingConditionWhere(condition: PreparedListingCondition): Where {
  const predicate = createConditionPredicate(condition)
  const supportedSources = listingConditionSupportedSources[condition.field]
  if (supportedSources.length === listingSources.length) return predicate
  return { or: [{ source: { not_in: [...supportedSources] } }, predicate] }
}

function createConditionPredicate(condition: PreparedListingCondition): Where {
  switch (condition.field) {
    case 'title':
      return condition.operator === 'equals'
        ? { normalizedTitle: { equals: condition.textValue } }
        : { normalizedTitle: { contains: condition.textValue } }
    case 'category':
      return condition.operator === 'inSubtree'
        ? { category: { in: condition.relationshipIds ?? [] } }
        : { category: { equals: condition.relationshipId } }
    case 'tag':
      return { tagSearchIndex: { contains: `|${condition.relationshipId}|` } }
    case 'parentPage':
      return { parentPage: { equals: condition.relationshipId } }
    case 'eventCycle':
      return { eventCycle: { equals: condition.relationshipId } }
    case 'eventTime': {
      const now = new Date().toISOString()
      return condition.eventTimeValue === 'upcoming'
        ? {
            or: [
              { eventEndAt: { greater_than_equal: now } },
              { eventStartAt: { greater_than_equal: now } },
            ],
          }
        : {
            or: [
              { eventEndAt: { less_than: now } },
              {
                and: [{ eventEndAt: { exists: false } }, { eventStartAt: { less_than: now } }],
              },
            ],
          }
    }
    case 'significantDate':
      return createSignificantDateWhere(condition)
  }
}

function createSignificantDateWhere(condition: PreparedListingCondition): Where {
  switch (condition.operator) {
    case 'notOlderThan':
      return {
        significantDate: {
          greater_than_equal: getWarsawDaysAgoStartISOString(condition.numberValue ?? 0),
        },
      }
    case 'before':
      return {
        significantDate: { less_than: getWarsawDayStartISOString(condition.dateValue ?? '') },
      }
    case 'after':
      return {
        significantDate: {
          greater_than_equal: getWarsawDayAfterISOString(condition.dateValue ?? ''),
        },
      }
    case 'between':
      return {
        and: [
          {
            significantDate: {
              greater_than_equal: getWarsawDayStartISOString(condition.dateValue ?? ''),
            },
          },
          {
            significantDate: {
              less_than: getWarsawDayAfterISOString(condition.endDateValue ?? ''),
            },
          },
        ],
      }
    default:
      throw new Error(`Unsupported significant-date operator: ${condition.operator}`)
  }
}

async function prepareListingConditions(
  values: readonly ListingConditionInput[],
): Promise<PreparedListingCondition[]> {
  const conditions = await Promise.all(values.map(prepareListingCondition))
  return conditions.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
}

async function prepareListingCondition(
  value: ListingConditionInput,
): Promise<PreparedListingCondition> {
  if (
    !isListingConditionField(value.field) ||
    !isListingConditionOperator(value.operator) ||
    !listingConditionOperatorsByField[value.field].includes(value.operator)
  ) {
    throw new Error('Invalid content listing condition.')
  }

  const relationshipCollection = getListingConditionRelationshipCollection(value.field)
  if (relationshipCollection && value.relationshipValue?.relationTo !== relationshipCollection) {
    throw new Error('Invalid content listing relationship value.')
  }
  const relationshipIdValue = value.relationshipValue
    ? getFormRelationshipId(value.relationshipValue.value)
    : undefined
  const relationshipId = relationshipIdValue === undefined ? undefined : Number(relationshipIdValue)
  if (relationshipCollection && (!Number.isInteger(relationshipId) || relationshipId! < 1)) {
    throw new Error('Invalid content listing relationship value.')
  }
  if (value.field === 'title' && !value.textValue?.trim()) {
    throw new Error('Invalid content listing text value.')
  }
  if (
    value.field === 'eventTime' &&
    value.eventTimeValue !== 'past' &&
    value.eventTimeValue !== 'upcoming'
  ) {
    throw new Error('Invalid content listing event-time value.')
  }
  if (value.field === 'significantDate') {
    if (value.operator === 'notOlderThan') {
      if (
        !Number.isInteger(value.numberValue) ||
        value.numberValue! < 1 ||
        value.numberValue! > 366
      ) {
        throw new Error('Invalid content listing day count.')
      }
    } else if (
      !isCalendarDate(value.dateValue) ||
      (value.operator === 'between' &&
        (!isCalendarDate(value.endDateValue) || value.dateValue > value.endDateValue))
    ) {
      throw new Error('Invalid content listing date range.')
    }
  }

  const condition: PreparedListingCondition = { field: value.field, operator: value.operator }
  switch (value.field) {
    case 'title':
      condition.textValue = normalizeListingTitle(value.textValue!)
      break
    case 'category':
      condition.relationshipId = relationshipId
      if (value.operator === 'inSubtree') {
        condition.relationshipIds = await findCategorySubtreeIDs(relationshipId!)
      }
      break
    case 'tag':
    case 'parentPage':
    case 'eventCycle':
      condition.relationshipId = relationshipId
      break
    case 'eventTime':
      condition.eventTimeValue = value.eventTimeValue!
      break
    case 'significantDate':
      if (value.operator === 'notOlderThan') {
        condition.numberValue = value.numberValue!
      } else {
        condition.dateValue = value.dateValue!
        if (value.operator === 'between') condition.endDateValue = value.endDateValue!
      }
  }
  return condition
}

function getPayloadSort(sort: ContentListingSort): string[] {
  switch (sort) {
    case 'oldest':
      return ['-hasSignificantDate', 'significantDate', 'title', 'source', 'sourceDocumentId']
    case 'titleAscending':
      return ['title', '-significantDate', 'source', 'sourceDocumentId']
    case 'titleDescending':
      return ['-title', '-significantDate', 'source', 'sourceDocumentId']
    default:
      return ['-hasSignificantDate', '-significantDate', 'title', 'source', 'sourceDocumentId']
  }
}

type SelectedListingItem = Pick<ContentListingItem, 'source' | 'sourceDocumentId' | 'url'>

async function hydratePublicContentItems(
  payload: Payload,
  selectedItems: readonly SelectedListingItem[],
): Promise<PublicContentListItem[]> {
  const idsBySource: Record<TaxonomizableCollectionSlug, number[]> = {
    documents: [],
    'event-cycles': [],
    events: [],
    pages: [],
    posts: [],
  }

  for (const item of selectedItems) {
    idsBySource[item.source].push(item.sourceDocumentId)
  }

  const [documents, eventCycles, events, pages, posts] = await Promise.all([
    findPublishedDocuments(payload, idsBySource.documents),
    findPublishedEventCycles(payload, idsBySource['event-cycles']),
    findPublishedEvents(payload, idsBySource.events),
    findPublishedPages(payload, idsBySource.pages),
    findPublishedPosts(payload, idsBySource.posts),
  ])
  const documentsByReference = new Map<string, TaxonomizableDocument>([
    ...documents.map((document) => [`documents:${document.id}`, document] as const),
    ...eventCycles.map((document) => [`event-cycles:${document.id}`, document] as const),
    ...events.map((document) => [`events:${document.id}`, document] as const),
    ...pages.map((document) => [`pages:${document.id}`, document] as const),
    ...posts.map((document) => [`posts:${document.id}`, document] as const),
  ])

  return selectedItems.flatMap((item): PublicContentListItem[] => {
    const document = documentsByReference.get(`${item.source}:${item.sourceDocumentId}`)
    if (!document) return []

    switch (item.source) {
      case 'documents':
        return [{ document: document as Document, kind: item.source, url: item.url }]
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

async function findPublishedDocuments(
  payload: Payload,
  ids: readonly number[],
): Promise<Document[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'documents',
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
