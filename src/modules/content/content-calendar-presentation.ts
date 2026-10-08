import type { Event, Post } from '@/payload-types'
import {
  getCalendarEventDate,
  isValidCalendarMonth,
  toCalendarEventType,
  type CalendarEventType,
} from '@/modules/events/calendar-presentation'

export const contentCalendarSources = ['events', 'posts'] as const
export type ContentCalendarSource = (typeof contentCalendarSources)[number]

export type ContentCalendarItemType = Omit<CalendarEventType, 'id'> & { id: string }

type ContentCalendarBaseItem = {
  dateTime: string
  id: string
  summary: { kind: 'richText'; value: Event['excerpt'] } | { kind: 'text'; value: string }
  title: string
  type: ContentCalendarItemType
  url: string
}

export type ContentCalendarEventItem = ContentCalendarBaseItem & {
  endAt: null | string
  kind: 'events'
  location: Pick<Event['location'], 'venueName' | 'venueWebsite'>
  summary: { kind: 'richText'; value: Event['excerpt'] }
  timeMode: Event['timeMode']
}

export type ContentCalendarPostItem = ContentCalendarBaseItem & {
  kind: 'posts'
  summary: { kind: 'text'; value: string }
}

export type ContentCalendarItem = ContentCalendarEventItem | ContentCalendarPostItem

export type ContentCalendarMonthPayload = {
  itemTypes: ContentCalendarItemType[]
  items: ContentCalendarItem[]
  truncated: boolean
}

export type ContentCalendarFilters = {
  categoryId?: number
  eventCycleId?: number
  sources: ContentCalendarSource[]
  tagId?: number
}

export type ParsedContentCalendarRequest = {
  filters: ContentCalendarFilters
  month: string
}

export const postCalendarItemType: ContentCalendarItemType = {
  iconColor: 'mist-silver',
  iconName: 'book',
  id: 'posts',
  name: 'Wpisy',
}

export function toCalendarContentEventType(
  eventType: Parameters<typeof toCalendarEventType>[0],
): ContentCalendarItemType {
  const normalizedEventType = toCalendarEventType(eventType)
  return { ...normalizedEventType, id: `event-type:${normalizedEventType.id}` }
}

export function toCalendarContentEvent(
  event: Pick<
    Event,
    'endAt' | 'eventType' | 'excerpt' | 'id' | 'slug' | 'startAt' | 'timeMode' | 'title'
  > & {
    location: Pick<Event['location'], 'venueName' | 'venueWebsite'>
  },
): ContentCalendarEventItem {
  const eventType =
    event.eventType && typeof event.eventType === 'object'
      ? toCalendarContentEventType(event.eventType)
      : {
          iconColor: 'parchment-ivory' as const,
          iconName: 'event' as const,
          id: 'event-type:0',
          name: 'Wydarzenie',
        }

  return {
    dateTime: event.startAt,
    endAt: event.endAt ?? null,
    id: `events:${event.id}`,
    kind: 'events',
    location: {
      venueName: event.location.venueName,
      venueWebsite: event.location.venueWebsite,
    },
    summary: { kind: 'richText', value: event.excerpt },
    timeMode: event.timeMode,
    title: event.title,
    type: eventType,
    url: `/events/${event.slug}`,
  }
}

export function toCalendarContentPost(
  post: Pick<Post, 'excerpt' | 'id' | 'slug' | 'title'> & { publishedAt: string },
): ContentCalendarPostItem {
  return {
    dateTime: post.publishedAt,
    id: `posts:${post.id}`,
    kind: 'posts',
    summary: { kind: 'text', value: post.excerpt },
    title: post.title,
    type: postCalendarItemType,
    url: `/blog/${post.slug}`,
  }
}

export function getCalendarContentDate(item: Pick<ContentCalendarItem, 'dateTime'>): string {
  return getCalendarEventDate({ startAt: item.dateTime })
}

export function normalizeContentCalendarSources(
  values: readonly unknown[],
): ContentCalendarSource[] {
  const selectedSources = new Set(
    values.filter((value): value is ContentCalendarSource =>
      contentCalendarSources.includes(value as ContentCalendarSource),
    ),
  )
  return contentCalendarSources.filter((source) => selectedSources.has(source))
}

export function createContentCalendarEndpoint(filters: ContentCalendarFilters): string {
  const searchParameters = new URLSearchParams()
  for (const source of normalizeContentCalendarSources(filters.sources)) {
    searchParameters.append('source', source)
  }
  if (filters.categoryId !== undefined) {
    searchParameters.set('category', String(filters.categoryId))
  }
  if (filters.tagId !== undefined) {
    searchParameters.set('tag', String(filters.tagId))
  }
  if (filters.eventCycleId !== undefined) {
    searchParameters.set('eventCycle', String(filters.eventCycleId))
  }
  return `/content/calendar.json?${searchParameters.toString()}`
}

export function parseContentCalendarSearchParams(
  searchParameters: URLSearchParams,
): ParsedContentCalendarRequest | null {
  const month = searchParameters.get('month') ?? ''
  const sourceValues = searchParameters.getAll('source')
  const sources = normalizeContentCalendarSources(sourceValues)
  if (
    !isValidCalendarMonth(month) ||
    sources.length === 0 ||
    sources.length !== new Set(sourceValues).size
  ) {
    return null
  }

  const categoryId = parseOptionalRelationshipID(searchParameters.get('category'))
  const tagId = parseOptionalRelationshipID(searchParameters.get('tag'))
  const eventCycleId = parseOptionalRelationshipID(searchParameters.get('eventCycle'))
  if (categoryId === null || tagId === null || eventCycleId === null) {
    return null
  }

  return {
    filters: {
      ...(categoryId === undefined ? {} : { categoryId }),
      ...(eventCycleId === undefined ? {} : { eventCycleId }),
      sources,
      ...(tagId === undefined ? {} : { tagId }),
    },
    month,
  }
}

function parseOptionalRelationshipID(value: string | null): number | null | undefined {
  if (value === null) return undefined
  if (!/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}
