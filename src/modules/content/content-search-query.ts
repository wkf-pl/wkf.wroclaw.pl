import type { Payload, Where } from 'payload'

import { findTopicSubtreeIDs } from './topic-hierarchy'
import type { ContentSearchFilters } from './content-search-filters'
import {
  getWarsawDayAfterISOString,
  getWarsawDayStartISOString,
  normalizeListingTitle,
} from './listing-conditions'

export async function createContentSearchPredicates(
  payload: Payload,
  filters: ContentSearchFilters,
): Promise<Where[]> {
  const predicates: Where[] = []
  if (filters.phrase) {
    predicates.push({
      or: [
        { normalizedTitle: { contains: escapeLikePattern(normalizeListingTitle(filters.phrase)) } },
        { excerpt: { contains: escapeLikePattern(filters.phrase) } },
      ],
    })
  }
  if (filters.dateFrom) {
    predicates.push({
      searchDate: { greater_than_equal: getWarsawDayStartISOString(filters.dateFrom) },
    })
  }
  if (filters.dateTo) {
    predicates.push({ searchDate: { less_than: getWarsawDayAfterISOString(filters.dateTo) } })
  }
  for (const tagId of filters.tagIds ?? []) {
    predicates.push({ tagSearchIndex: { contains: `|${tagId}|` } })
  }
  const topicIds = filters.topicIds ?? (filters.topicId === undefined ? [] : [filters.topicId])
  if (topicIds.length) {
    const topics = [...new Set((await Promise.all(topicIds.map(findTopicSubtreeIDs))).flat())]
    predicates.push(topics.length ? { topics: { in: topics } } : { id: { equals: 0 } })
  }
  for (const tags of filters.tagGroups ?? []) {
    predicates.push({ or: tags.map((id) => ({ tagSearchIndex: { contains: `|${id}|` } })) })
  }
  if (filters.branch) {
    predicates.push({ ancestorSearchIndex: { contains: `|${filters.branch}|` } })
  }
  if (filters.authorId !== undefined) {
    predicates.push({ searchAuthor: { equals: filters.authorId } })
  } else if (filters.author) {
    const { docs: authors } = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 0,
      overrideAccess: true,
      pagination: false,
      select: { displayName: true },
      where: { displayName: { contains: escapeLikePattern(filters.author) } },
    })
    predicates.push(
      authors.length
        ? { searchAuthor: { in: authors.map(({ id }) => id) } }
        : { id: { equals: 0 } },
    )
  }
  if (filters.sources?.length) predicates.push({ source: { in: filters.sources } })
  return predicates
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&')
}
