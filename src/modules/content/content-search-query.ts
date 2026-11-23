import type { Payload, Where } from 'payload'

import { collectPayloadPages } from '@/lib/payload-pagination'

import { findTopicSubtreeIDs } from './topic-hierarchy'
import type { ContentSearchFilters } from './content-search-filters'
import {
  getWarsawDayAfterISOString,
  getWarsawDayStartISOString,
  normalizeListingTitle,
} from './listing-conditions'
import { publicRequestContext } from './public-access'

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
  if (filters.author) {
    const name = escapeLikePattern(filters.author)
    const groups = await collectPayloadPages((page) =>
      payload.find({
        collection: 'user-groups',
        context: publicRequestContext,
        depth: 0,
        limit: 100,
        overrideAccess: false,
        page,
        select: { name: true },
        where: { name: { contains: name } },
      }),
    )
    const signature = { searchAuthorSignature: { contains: name } }
    predicates.push(
      groups.length
        ? { or: [signature, { searchAuthorGroup: { in: groups.map(({ id }) => id) } }] }
        : signature,
    )
  }
  if (filters.sources?.length) predicates.push({ source: { in: filters.sources } })
  return predicates
}

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&')
}
