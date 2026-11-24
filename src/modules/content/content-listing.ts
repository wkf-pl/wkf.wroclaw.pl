import { contentParentKey } from './content-parent'
import { collectPayloadPages } from '@/lib/payload-pagination'
import type { ContentSearchFilters } from './content-search-filters'
import { createContentSearchPredicates } from './content-search-query'

import { getPayload, type Payload, type Where } from 'payload'

import config from '@payload-config'

import { getFormRelationshipId, getRelationshipId, type RelationshipID } from '@/lib/relationships'
import { normalizeListingWindow, paginateInMemory } from '@/modules/content/listing-window'
import { findTopicSubtreeIDs } from '@/modules/content/topic-hierarchy'
import { publicRequestContext } from '@/modules/content/public-access'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import type { PartnerRole } from '@/modules/events/constants'
import { createEventTimeWhere } from '@/modules/events/events-index-time'
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
  createListingTagSearchIndex,
  normalizeListingTitle,
  type ContentListingSource,
  type CurrentListingTarget,
  type ListingConditionField,
  type ListingConditionInput,
  type ListingConditionOperator,
  type ListingEventTimeValue,
} from '@/modules/content/listing-conditions'
import { createRelatedTargetSearchIndex } from '@/modules/content/content-listing-index-data'
import {
  hydrateContentListingItems,
  type ContentListingDocument,
  type PublicContentListItem,
  type SelectedContentListingItem,
} from '@/modules/content/content-listing-sources'

export type ContentListingSort = 'newest' | 'oldest' | 'titleAscending' | 'titleDescending'
export type { ContentListingDocument, ContentListingSource, PublicContentListItem }

export type FindPublicContentOptions = {
  conditions?: ListingConditionInput[] | null
  currentTarget?: CurrentListingTarget
  manualItems?: ManualContentReference[]
  page: number
  includeInactiveLocations?: boolean
  pageSize: number
  pagination: boolean
  searchFilters?: ContentSearchFilters
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
  totalDocs: number | null
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
  parentKey?: string
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
    pagination: options.pagination,
    select: {
      source: true,
      sourceDocumentId: true,
      url: true,
    },
    sort: getPayloadSort(options.sort),
    user: null,
    where: await createListingWhere(payload, options),
  })

  return {
    items: await hydrateContentListingItems(payload, result.docs),
    page,
    pageSize,
    totalDocs: options.pagination ? result.totalDocs : null,
    totalPages: options.pagination ? Math.max(1, result.totalPages) : 1,
  }
}

const findPublicContentCached = cachePublicData(
  'public-content-listing-v3',
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
  const query = {
    conditions,
    manualItems: options.manualItems,
    includeInactiveLocations: options.includeInactiveLocations,
    page,
    pageSize,
    pagination: options.pagination,
    selectionMode: options.selectionMode,
    sort: options.sort,
    sources: [...new Set(options.sources)].sort(),
  }
  return options.searchFilters
    ? findPublicContentUncached({ ...query, searchFilters: options.searchFilters })
    : findPublicContentCached(query)
}

async function findManualPublicContent(
  options: FindPublicContentOptions,
): Promise<PublicContentResult> {
  const references = getManualContentReferences(options.manualItems)
  if (!references.length) return paginateInMemory([], options)

  const idsBySource = new Map<ContentListingSource, Set<RelationshipID>>()
  for (const { id, source } of references) {
    const ids = idsBySource.get(source) ?? new Set<RelationshipID>()
    ids.add(id)
    idsBySource.set(source, ids)
  }

  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'content-listing-items',
    context: publicRequestContext,
    depth: 0,
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
      or: Array.from(idsBySource, ([source, ids]): Where => ({
        and: [{ source: { equals: source } }, { sourceDocumentId: { in: [...ids] } }],
      })),
    },
  })

  const itemsByReference = new Map(
    result.docs.map((item) => [`${item.source}:${item.sourceDocumentId}`, item]),
  )
  const selectedItems = references.flatMap<SelectedContentListingItem>(
    ({ contextLabel, id, partnerRoles, source }) => {
      const item = itemsByReference.get(`${source}:${id}`)
      return item ? [{ ...item, contextLabel, partnerRoles }] : []
    },
  )
  const paginatedItems = paginateInMemory(selectedItems, options)

  return {
    ...paginatedItems,
    items: await hydrateContentListingItems(payload, paginatedItems.items),
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

async function createListingWhere(
  payload: Payload,
  options: Pick<
    CachedFindPublicContentOptions,
    'conditions' | 'includeInactiveLocations' | 'searchFilters' | 'sources'
  >,
): Promise<Where> {
  const now = new Date()
  const predicates = await Promise.all(
    options.conditions.map(async (condition): Promise<Where> => {
      const predicate = compileListingConditionWhere(condition, now)
      if (
        !options.sources.includes('locations') ||
        condition.field !== 'relatedTo' ||
        condition.relatedTarget?.relationTo !== 'partners'
      )
        return predicate
      const result = await payload.find({
        collection: 'partners',
        depth: 0,
        draft: false,
        context: publicRequestContext,
        overrideAccess: false,
        user: null,
        limit: 1,
        select: { locations: true },
        where: { id: { equals: condition.relatedTarget.value } },
      })
      const locationIDs = (result.docs[0]?.locations ?? []).map((location) =>
        getRelationshipId(location),
      )
      return {
        or: [
          { and: [{ source: { not_equals: 'locations' } }, predicate] },
          { and: [{ source: { equals: 'locations' } }, { sourceDocumentId: { in: locationIDs } }] },
        ],
      }
    }),
  )
  return {
    and: [
      { source: { in: [...new Set(options.sources)].sort() } },
      ...predicates,
      ...(options.searchFilters
        ? await createContentSearchPredicates(payload, options.searchFilters)
        : []),
      ...(options.includeInactiveLocations ? [] : [{ isInactiveLocation: { not_equals: true } }]),
    ],
  }
}

export function compileListingConditionWhere(
  condition: PreparedListingCondition,
  now = new Date(),
): Where {
  const predicate = createConditionPredicate(condition, now)
  const supportedSources = listingConditionSupportedSources[condition.field]
  if (supportedSources.length === allListingSources.length) return predicate
  return { or: [{ source: { not_in: [...supportedSources] } }, predicate] }
}

function createConditionPredicate(condition: PreparedListingCondition, now: Date): Where {
  switch (condition.field) {
    case 'title':
      return condition.operator === 'equals'
        ? { normalizedTitle: { equals: condition.textValue } }
        : { normalizedTitle: { contains: condition.textValue } }
    case 'topic':
      if (condition.operator === 'isEmpty') return { topicSearchIndex: { equals: '|' } }
      return condition.operator === 'inSubtree'
        ? { topics: { in: condition.relationshipIds ?? [] } }
        : { topics: { equals: condition.relationshipId } }
    case 'tag':
      return condition.operator === 'isEmpty'
        ? { tagSearchIndex: { equals: createListingTagSearchIndex([]) } }
        : { tagSearchIndex: { contains: `|${condition.relationshipId}|` } }
    case 'tagGroup':
      return condition.relationshipIds?.length
        ? {
            or: condition.relationshipIds.map((id) => ({
              tagSearchIndex: { contains: `|${id}|` },
            })),
          }
        : { id: { equals: 0 } }
    case 'contentParent':
      if (condition.operator === 'isEmpty') return { contentParent: { exists: false } }
      if (!condition.parentKey) return { id: { equals: 0 } }
      return condition.operator === 'inSubtree'
        ? { ancestorSearchIndex: { contains: `|${condition.parentKey}|` } }
        : { contentParent: { equals: condition.parentKey } }
    case 'parentPage':
      // Existing conditions only inspect the immediate parent of Pages.
      return condition.operator === 'isEmpty'
        ? { parentPage: { exists: false } }
        : { parentPage: { equals: condition.relationshipId } }
    case 'eventCycle':
      return condition.operator === 'isEmpty'
        ? { eventCycle: { exists: false } }
        : { eventCycle: { equals: condition.relationshipId } }
    case 'eventTime':
      return createEventTimeWhere(condition.eventTimeValue ?? 'past', now, {
        start: 'eventStartAt',
        end: 'eventEndAt',
      })
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
  currentTarget?: CurrentListingTarget,
): Promise<PreparedListingCondition[]> {
  const conditions = await Promise.all(
    values.map((value) => prepareListingCondition(value, currentTarget)),
  )
  return conditions.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))
}

async function prepareListingCondition(
  value: ListingConditionInput,
  currentTarget?: CurrentListingTarget,
): Promise<PreparedListingCondition> {
  if (
    !isListingConditionField(value.field) ||
    !isListingConditionOperator(value.operator) ||
    !listingConditionOperatorsByField[value.field].includes(value.operator)
  ) {
    throw new Error('Invalid content listing condition.')
  }
  if (value.operator === 'isEmpty') return { field: value.field, operator: value.operator }

  if (
    (value.field === 'relatedTo' || value.field === 'contentParent') &&
    !isListingRelatedTargetMode(value.relatedTargetMode)
  ) {
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

  if (value.field === 'relatedTo' && value.relatedTargetMode === 'current' && currentTarget) {
    if (currentTarget.relationTo === 'topics') {
      return prepareListingCondition({
        field: 'topic',
        operator: 'inSubtree',
        relationshipValue: currentTarget,
      })
    }
    if (currentTarget.relationTo === 'tags') {
      return prepareListingCondition({
        field: 'tag',
        operator: 'contains',
        relationshipValue: currentTarget,
      })
    }
  }

  const condition: PreparedListingCondition = { field: value.field, operator: value.operator }
  switch (value.field) {
    case 'title':
      condition.textValue = normalizeListingTitle(value.textValue!)
      break
    case 'topic':
      condition.relationshipId = relationshipId
      if (value.operator === 'inSubtree') {
        condition.relationshipIds = await findTopicSubtreeIDs(relationshipId!)
      }
      break
    case 'tagGroup': {
      const payload = await getPayload({ config })
      const tags = await collectPayloadPages((page) =>
        payload.find({
          collection: 'tags',
          depth: 0,
          limit: 100,
          page,
          overrideAccess: false,
          context: publicRequestContext,
          select: { name: true },
          where: { group: { equals: relationshipId } },
        }),
      )
      condition.relationshipIds = tags.map(({ id }) => id)
      break
    }
    case 'contentParent': {
      const parent =
        value.relatedTargetMode === 'current' ? currentTarget : value.relatedTargetValue
      if (parent?.relationTo === 'pages' || parent?.relationTo === 'event-cycles') {
        const id = getFormRelationshipId(parent.value)
        if (id !== undefined)
          condition.parentKey = contentParentKey({ relationTo: parent.relationTo, value: id })
      }
      break
    }
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
      if (reference) {
        const targetID = getFormRelationshipId(reference.value)
        if (!isListingSource(reference.relationTo) || targetID === undefined) {
          throw new Error('Invalid content listing related target.')
        }
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

export type ContentSearchOption = { id: number; label: string; groupIcon?: string }

export type ContentSearchOptions = {
  topics: ContentSearchOption[]
  tags: ContentSearchOption[]
  authors?: ContentSearchOption[]
  tagGroups?: { id: number; label: string; tags: ContentSearchOption[] }[]
  branches?: { value: string; label: string }[]
  sources?: ContentListingSource[]
}

type SearchOptionsEnabled = {
  topics: boolean
  tags: boolean
  author?: boolean
  branches?: boolean
  contentType?: boolean
  groups?: number[]
}

type ContentSearchOptionsScope = Pick<
  FindPublicContentOptions,
  'conditions' | 'currentTarget' | 'includeInactiveLocations' | 'sources'
>

const loadContentSearchOptions = cachePublicData(
  'public-content-search-options-v2',
  async (
    scope: Pick<
      CachedFindPublicContentOptions,
      'conditions' | 'includeInactiveLocations' | 'sources'
    >,
    enabled: SearchOptionsEnabled,
  ): Promise<ContentSearchOptions> => {
    const payload = await getPayload({ config })
    const where = await createListingWhere(payload, scope)
    const distinctQuery = {
      collection: 'content-listing-items' as const,
      context: publicRequestContext,
      depth: 0,
      overrideAccess: false,
      where,
    }
    const [topicMatches, tagMatches, branchMatches, sourceMatches, authorMatches] =
      await Promise.all([
        enabled.topics
          ? payload.findDistinct({ ...distinctQuery, field: 'topicSearchIndex' })
          : null,
        enabled.tags || enabled.groups?.length
          ? payload.findDistinct({ ...distinctQuery, field: 'tagSearchIndex' })
          : null,
        enabled.branches
          ? payload.findDistinct({ ...distinctQuery, field: 'ancestorSearchIndex' })
          : null,
        enabled.contentType ? payload.findDistinct({ ...distinctQuery, field: 'source' }) : null,
        enabled.author ? payload.findDistinct({ ...distinctQuery, field: 'searchAuthor' }) : null,
      ])

    const topicIds = [
      ...new Set(
        (topicMatches?.values ?? []).flatMap(
          ({ topicSearchIndex }) => topicSearchIndex?.split('|').filter(Boolean).map(Number) ?? [],
        ),
      ),
    ]
    const tagIds = [
      ...new Set(
        (tagMatches?.values ?? []).flatMap(({ tagSearchIndex }) =>
          tagSearchIndex.split('|').filter(Boolean).map(Number),
        ),
      ),
    ]
    const authorIds = (authorMatches?.values ?? []).flatMap(({ searchAuthor }) => {
      const id = getRelationshipId(searchAuthor)
      return typeof id === 'number' ? [id] : []
    })
    const [topics, tags, groups, branches, authors] = await Promise.all([
      loadSearchTopics(payload, topicIds),
      tagIds.length
        ? collectPayloadPages((page) =>
            payload.find({
              collection: 'tags',
              context: publicRequestContext,
              depth: 0,
              joins: false,
              limit: 100,
              overrideAccess: false,
              page,
              select: { name: true, group: true, groupIcon: true },
              sort: 'id',
              where: { id: { in: tagIds } },
            }),
          )
        : [],
      enabled.groups?.length
        ? payload.find({
            collection: 'tag-groups',
            depth: 0,
            pagination: false,
            overrideAccess: false,
            select: { name: true },
            where: { id: { in: enabled.groups } },
          })
        : undefined,
      branchMatches
        ? loadSearchBranches(
            payload,
            branchMatches.values.flatMap(
              ({ ancestorSearchIndex }) => ancestorSearchIndex?.split('|').filter(Boolean) ?? [],
            ),
          )
        : undefined,
      authorIds.length
        ? payload.find({
            collection: 'users',
            depth: 0,
            limit: 0,
            pagination: false,
            overrideAccess: true,
            select: { displayName: true },
            where: { id: { in: authorIds } },
          })
        : undefined,
    ])
    const sortedTags = tags
      .map(({ id, name, group, groupIcon }) => ({
        id,
        label: name,
        group: getRelationshipId(group),
        ...(groupIcon ? { groupIcon } : {}),
      }))
      .sort(compareSearchOptions)
    return {
      topics,
      authors: authors?.docs
        .map(({ id, displayName }) => ({ id, label: displayName }))
        .sort(compareSearchOptions),
      tags: enabled.tags ? sortedTags.map(({ group: _group, ...tag }) => tag) : [],
      tagGroups: groups?.docs.flatMap(({ id, name }) => {
        const choices = sortedTags.filter(({ group }) => group === id)
        return choices.length ? [{ id, label: name, tags: choices }] : []
      }),
      branches,
      sources: sourceMatches?.values.map(({ source }) => source).filter(isListingSource),
    }
  },
  { revalidate: 300, tags: [publicCacheTags.contentListings] },
)

export async function findContentSearchOptions(
  scope: ContentSearchOptionsScope,
  enabled: SearchOptionsEnabled,
): Promise<ContentSearchOptions> {
  if (
    !enabled.topics &&
    !enabled.tags &&
    !enabled.author &&
    !enabled.branches &&
    !enabled.groups?.length &&
    !enabled.contentType
  )
    return { topics: [], tags: [] }
  return loadContentSearchOptions(
    {
      conditions: await prepareListingConditions(scope.conditions ?? [], scope.currentTarget),
      includeInactiveLocations: scope.includeInactiveLocations,
      sources: [...new Set(scope.sources)].sort(),
    },
    enabled,
  )
}

async function loadSearchBranches(payload: Payload, keys: string[]) {
  const references = new Set(keys)
  const pageIDs = [...references]
    .filter((key) => key.startsWith('pages:'))
    .map((key) => Number(key.slice(6)))
  const cycleIDs = [...references]
    .filter((key) => key.startsWith('event-cycles:'))
    .map((key) => Number(key.slice(13)))
  const [pages, cycles] = await Promise.all([
    pageIDs.length
      ? payload.find({
          collection: 'pages',
          depth: 0,
          pagination: false,
          overrideAccess: false,
          context: publicRequestContext,
          where: { id: { in: pageIDs } },
          select: { title: true, fullTitle: true },
        })
      : undefined,
    cycleIDs.length
      ? payload.find({
          collection: 'event-cycles',
          depth: 1,
          pagination: false,
          overrideAccess: false,
          context: publicRequestContext,
          where: { id: { in: cycleIDs } },
          select: { title: true, parent: true },
        })
      : undefined,
  ])
  return [
    ...(pages?.docs.map(({ id, title, fullTitle }) => ({
      value: `pages:${id}`,
      label: fullTitle || title,
    })) ?? []),
    ...(cycles?.docs.map(({ id, title, parent }) => ({
      value: `event-cycles:${id}`,
      label:
        parent && typeof parent === 'object'
          ? `${parent.fullTitle || parent.title} › ${title}`
          : title,
    })) ?? []),
  ].sort((left, right) => left.label.localeCompare(right.label, 'pl'))
}

async function loadSearchTopics(
  payload: Payload,
  topicIds: number[],
): Promise<ContentSearchOption[]> {
  if (!topicIds.length) return []

  const findTopics = (ids: number[]) =>
    collectPayloadPages((page) =>
      payload.find({
        collection: 'topics',
        context: publicRequestContext,
        depth: 0,
        joins: false,
        limit: 100,
        overrideAccess: false,
        page,
        select: { name: true, breadcrumbs: true },
        sort: 'id',
        where: { id: { in: ids } },
      }),
    )
  const matching = await findTopics(topicIds)
  const matchedIds = new Set(matching.map(({ id }) => id))
  const ancestorIds = new Set<number>()
  for (const topic of matching) {
    for (const breadcrumb of topic.breadcrumbs ?? []) {
      const id = getRelationshipId(breadcrumb.doc)
      if (typeof id === 'number' && !matchedIds.has(id)) ancestorIds.add(id)
    }
  }
  const ancestors = ancestorIds.size ? await findTopics([...ancestorIds]) : []
  const topics = [...matching, ...ancestors]
  const names = new Map(topics.map(({ id, name }) => [id, name]))
  return topics
    .map(({ id, name, breadcrumbs }) => {
      const path = (breadcrumbs ?? []).flatMap(({ doc }) => {
        const ancestorId = getRelationshipId(doc)
        const ancestorName =
          typeof ancestorId === 'number' && ancestorId !== id ? names.get(ancestorId) : undefined
        return ancestorName ? [ancestorName] : []
      })
      return { id, label: [...path, name].join(' / ') }
    })
    .sort(compareSearchOptions)
}

function compareSearchOptions(left: ContentSearchOption, right: ContentSearchOption): number {
  return left.label.localeCompare(right.label, 'pl') || left.id - right.id
}
