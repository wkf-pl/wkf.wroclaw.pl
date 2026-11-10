import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import { getFormRelationshipId, type RelationshipID } from '@/lib/relationships'
import { normalizeListingWindow, paginateInMemory } from '@/modules/content/listing-window'
import { findCategorySubtreeIDs } from '@/modules/content/category-hierarchy'
import { publicRequestContext } from '@/modules/content/public-access'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import type { PartnerRole } from '@/modules/events/constants'
import {
  getWarsawDayAfterISOString,
  getWarsawDayStartISOString,
  getWarsawDaysAgoStartISOString,
  getListingConditionRelationshipCollection,
  isCalendarDate,
  isListingConditionField,
  isListingConditionOperator,
  isListingRelatedTargetMode,
  isListingSource,
  listingConditionOperatorsByField,
  listingConditionSupportedSources,
  allListingSources,
  normalizeListingTitle,
  type ContentListingSource,
  type ContentListingReference,
  type ListingConditionField,
  type ListingConditionInput,
  type ListingConditionOperator,
  type ListingEventTimeValue,
} from '@/modules/content/listing-conditions'
import {
  createRelatedTargetSearchIndex,
  hydrateContentListingItems,
  type ContentListingDocument,
  type PublicContentListItem,
  type SelectedContentListingItem,
} from '@/modules/content/content-listing-sources'

export type ContentListingSort = 'newest' | 'oldest' | 'titleAscending' | 'titleDescending'
export type { ContentListingDocument, ContentListingSource, PublicContentListItem }

export type FindPublicContentOptions = {
  conditions?: ListingConditionInput[] | null
  currentTarget?: ContentListingReference
  manualItems?: ManualContentReference[]
  page: number
  pageSize: number
  pagination: boolean
  selectionMode?: 'filters' | 'manual'
  sort: ContentListingSort
  sources: ContentListingSource[]
}

export type ManualContentReference = {
  contextLabel?: null | string
  partnerRoles?: readonly PartnerRole[]
  relationTo: ContentListingSource
  value: ContentListingDocument | RelationshipID
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
  relatedTarget?: {
    relationTo: ContentListingSource
    value: number
  }
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
    items: await hydrateContentListingItems(payload, result.docs),
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

  const conditions = await prepareListingConditions(options.conditions ?? [], options.currentTarget)
  const { page, pageSize } = normalizeListingWindow(options)
  return findPublicContentCached({
    conditions,
    manualItems: options.manualItems,
    page,
    pageSize,
    pagination: options.pagination,
    selectionMode: options.selectionMode,
    sort: options.sort,
    sources: [...new Set(options.sources)].sort(),
  })
}

async function findManualPublicContent(
  options: FindPublicContentOptions,
): Promise<PublicContentResult> {
  const references = getManualContentReferences(options.manualItems)
  let selectedItems: SelectedContentListingItem[] = []

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
    selectedItems = references.flatMap(({ contextLabel, id, partnerRoles, source }) => {
      const item = itemsByReference.get(`${source}:${String(id)}`)
      return item ? [{ ...item, contextLabel, partnerRoles }] : []
    })
  }

  const paginatedItems = paginateInMemory(selectedItems, options)

  return {
    ...paginatedItems,
    items: await hydrateContentListingItems(await getPayload({ config }), paginatedItems.items),
  }
}

function getManualContentReferences(values: readonly ManualContentReference[] | null | undefined): {
  contextLabel?: null | string
  id: RelationshipID
  partnerRoles?: readonly PartnerRole[]
  source: ContentListingSource
}[] {
  return (
    values?.flatMap((value) => {
      const id = getFormRelationshipId(value.value)
      return id === undefined
        ? []
        : [
            {
              contextLabel: value.contextLabel?.trim() || null,
              id,
              partnerRoles: value.partnerRoles,
              source: value.relationTo,
            },
          ]
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
  if (supportedSources.length === allListingSources.length) return predicate
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
    case 'relatedTo':
      return condition.relatedTarget
        ? {
            relatedTargetSearchIndex: {
              contains: createRelatedTargetSearchIndex([condition.relatedTarget]),
            },
          }
        : { relatedTargetSearchIndex: { equals: '__missing-current-target__' } }
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
  currentTarget?: ContentListingReference,
): Promise<PreparedListingCondition[]> {
  const conditions = await Promise.all(
    values.map((value) => prepareListingCondition(value, currentTarget)),
  )
  return conditions.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
}

async function prepareListingCondition(
  value: ListingConditionInput,
  currentTarget?: ContentListingReference,
): Promise<PreparedListingCondition> {
  if (
    !isListingConditionField(value.field) ||
    !isListingConditionOperator(value.operator) ||
    !listingConditionOperatorsByField[value.field].includes(value.operator)
  ) {
    throw new Error('Invalid content listing condition.')
  }
  if (value.field === 'relatedTo' && !isListingRelatedTargetMode(value.relatedTargetMode)) {
    throw new Error('Invalid content listing related-target mode.')
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
    case 'relatedTo': {
      const reference =
        value.relatedTargetMode === 'selected' ? value.relatedTargetValue : currentTarget
      if (value.relatedTargetMode === 'selected' && !reference) {
        throw new Error('Invalid content listing related target.')
      }
      const targetID = reference ? getFormRelationshipId(reference.value) : undefined
      if (reference && (!isListingSource(reference.relationTo) || targetID === undefined)) {
        throw new Error('Invalid content listing related target.')
      }
      if (reference) {
        const numericTargetID = Number(targetID)
        if (!Number.isInteger(numericTargetID) || numericTargetID < 1) {
          throw new Error('Invalid content listing related target.')
        }
        condition.relatedTarget = {
          relationTo: reference.relationTo,
          value: numericTargetID,
        }
      }
      break
    }
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
