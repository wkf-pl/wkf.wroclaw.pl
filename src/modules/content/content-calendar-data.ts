import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { Post } from '@/payload-types'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { findCategorySubtreeIDs } from '@/modules/content/category-hierarchy'
import { publicRequestContext } from '@/modules/content/public-access'
import { getCalendarMonthBounds } from '@/modules/events/calendar-presentation'

import {
  getCalendarContentDate,
  normalizeContentCalendarSources,
  postCalendarItemType,
  toCalendarContentEvent,
  toCalendarContentEventType,
  toCalendarContentPost,
  type ContentCalendarFilters,
  type ContentCalendarItem,
  type ContentCalendarMonthPayload,
} from './content-calendar-presentation'

const maximumCalendarItems = 1000
const published: Where = { _status: { equals: 'published' } }

type CachedContentCalendarFilters = ContentCalendarFilters & {
  categoryIds?: number[]
}

async function findContentCalendarMonthUncached(
  month: string,
  filters: CachedContentCalendarFilters,
): Promise<ContentCalendarMonthPayload> {
  const payload = await getPayload({ config })
  const bounds = getCalendarMonthBounds(month)
  const includesEvents = filters.sources.includes('events')
  const includesPosts = filters.sources.includes('posts')

  const [eventsResult, postsResult, eventTypesResult] = await Promise.all([
    includesEvents
      ? payload.find({
          collection: 'events',
          context: publicRequestContext,
          depth: 1,
          draft: false,
          limit: maximumCalendarItems,
          overrideAccess: false,
          select: {
            endAt: true,
            eventType: true,
            excerpt: true,
            id: true,
            location: true,
            slug: true,
            startAt: true,
            timeMode: true,
            title: true,
          },
          sort: ['startAt', 'title'],
          user: null,
          where: { and: createEventConditions(bounds, filters) },
        })
      : null,
    includesPosts
      ? payload.find({
          collection: 'posts',
          context: publicRequestContext,
          depth: 0,
          draft: false,
          limit: maximumCalendarItems,
          overrideAccess: false,
          select: {
            excerpt: true,
            id: true,
            publishedAt: true,
            slug: true,
            title: true,
          },
          sort: ['publishedAt', 'title'],
          user: null,
          where: { and: createPostConditions(bounds, filters) },
        })
      : null,
    includesEvents
      ? payload.find({
          collection: 'event-types',
          context: publicRequestContext,
          depth: 0,
          limit: 100,
          overrideAccess: false,
          pagination: false,
          select: { iconColor: true, iconName: true, id: true, name: true },
          sort: 'name',
          user: null,
        })
      : null,
  ])

  const eventItems = (eventsResult?.docs ?? [])
    .map(toCalendarContentEvent)
    .filter((item) => getCalendarContentDate(item).startsWith(month))
  const postItems = (postsResult?.docs ?? [])
    .filter(hasPublishedAt)
    .map(toCalendarContentPost)
    .filter((item) => getCalendarContentDate(item).startsWith(month))
  const allItems = [...eventItems, ...postItems].sort(compareCalendarItems)
  const itemTypes = [
    ...(eventTypesResult?.docs.map(toCalendarContentEventType) ?? []),
    ...(includesPosts ? [postCalendarItemType] : []),
  ]

  return {
    itemTypes,
    items: allItems.slice(0, maximumCalendarItems),
    truncated:
      Boolean(eventsResult?.hasNextPage || postsResult?.hasNextPage) ||
      allItems.length > maximumCalendarItems,
  }
}

const findContentCalendarMonthCached = cachePublicData(
  'content-calendar-month',
  findContentCalendarMonthUncached,
  {
    revalidate: 300,
    tags: [
      publicCacheTags.contentListings,
      publicCacheTags.events,
      publicCacheTags.eventTypes,
      publicCacheTags.posts,
    ],
  },
)

export async function findContentCalendarMonth(
  month: string,
  filters: ContentCalendarFilters,
): Promise<ContentCalendarMonthPayload> {
  const sources = normalizeContentCalendarSources(filters.sources)
  if (sources.length === 0) {
    return { itemTypes: [], items: [], truncated: false }
  }

  const categoryIds =
    filters.categoryId === undefined ? undefined : await findCategorySubtreeIDs(filters.categoryId)

  return findContentCalendarMonthCached(month, {
    ...(filters.categoryId === undefined ? {} : { categoryId: filters.categoryId }),
    ...(categoryIds === undefined ? {} : { categoryIds }),
    ...(filters.eventCycleId === undefined ? {} : { eventCycleId: filters.eventCycleId }),
    sources,
    ...(filters.tagId === undefined ? {} : { tagId: filters.tagId }),
  })
}

function createTaxonomyConditions(filters: CachedContentCalendarFilters): Where[] {
  const conditions: Where[] = []
  if (filters.categoryIds !== undefined) {
    conditions.push({ category: { in: filters.categoryIds } })
  }
  if (filters.tagId !== undefined) {
    conditions.push({ tags: { equals: filters.tagId } })
  }
  return conditions
}

function createEventConditions(
  bounds: ReturnType<typeof getCalendarMonthBounds>,
  filters: CachedContentCalendarFilters,
): Where[] {
  return [
    published,
    { eventStatus: { in: ['scheduled', 'rescheduled'] } },
    { startAt: { greater_than_equal: bounds.start } },
    { startAt: { less_than: bounds.end } },
    ...createTaxonomyConditions(filters),
    ...(filters.eventCycleId === undefined
      ? []
      : [{ cycle: { equals: filters.eventCycleId } } satisfies Where]),
  ]
}

function createPostConditions(
  bounds: ReturnType<typeof getCalendarMonthBounds>,
  filters: CachedContentCalendarFilters,
): Where[] {
  return [
    published,
    { publishedAt: { greater_than_equal: bounds.start } },
    { publishedAt: { less_than: bounds.end } },
    ...createTaxonomyConditions(filters),
  ]
}

function hasPublishedAt(post: Post): post is Post & { publishedAt: string } {
  return typeof post.publishedAt === 'string'
}

function compareCalendarItems(first: ContentCalendarItem, second: ContentCalendarItem): number {
  return (
    first.dateTime.localeCompare(second.dateTime) ||
    first.title.localeCompare(second.title, 'pl') ||
    first.id.localeCompare(second.id)
  )
}
