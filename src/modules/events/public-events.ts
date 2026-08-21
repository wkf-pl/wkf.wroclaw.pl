import { cache } from 'react'
import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { Event, EventCycle, Partner, Post } from '@/payload-types'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { websiteRequestContext } from '@/modules/membership/role-permissions'

const published: Where = { _status: { equals: 'published' } }

function startOfWarsawDay(date = new Date()): Date {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Europe/Warsaw',
    timeZoneName: 'longOffset',
    year: 'numeric',
  })
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  )
  const offsetMatch = parts.timeZoneName?.match(/GMT([+-])(\d{2}):(\d{2})/)
  const offsetMinutes = offsetMatch
    ? (offsetMatch[1] === '+' ? 1 : -1) * (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3]))
    : 0
  return new Date(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) -
      offsetMinutes * 60_000,
  )
}

async function findPublicDocument<T extends Event | EventCycle | Partner>(
  collection: 'event-cycles' | 'events' | 'partners',
  slug: string,
): Promise<null | T> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection,
    context: websiteRequestContext,
    depth: 3,
    draft: false,
    limit: 1,
    overrideAccess: false,
    user: null,
    where: { and: [published, { slug: { equals: slug } }] },
  })
  return (result.docs[0] as T | undefined) ?? null
}

const findPublishedEventBySlugCached = cachePublicData(
  'published-event-by-slug',
  (slug: string) => findPublicDocument<Event>('events', slug),
  { revalidate: 3600, tags: [publicCacheTags.events] },
)

const findPublishedEventCycleBySlugCached = cachePublicData(
  'published-event-cycle-by-slug',
  (slug: string) => findPublicDocument<EventCycle>('event-cycles', slug),
  { revalidate: 3600, tags: [publicCacheTags.eventCycles] },
)

export const findPublishedEventBySlug = cache(findPublishedEventBySlugCached)
export const findPublishedEventCycleBySlug = cache(findPublishedEventCycleBySlugCached)

const findPublishedPartnerBySlugCached = cachePublicData(
  'published-partner-by-slug',
  (slug: string) => findPublicDocument<Partner>('partners', slug),
  { revalidate: 3600, tags: [publicCacheTags.partners] },
)

export const findPublishedPartnerBySlug = cache(findPublishedPartnerBySlugCached)

async function findCurrentAndUpcomingEventsUncached(
  limit: number,
  beforeISOString?: string,
): Promise<Event[]> {
  const payload = await getPayload({ config })
  const now = new Date()
  const conditions: Where[] = [published, { eventStatus: { in: ['scheduled', 'rescheduled'] } }]
  conditions.push({
    or: [
      { endAt: { greater_than_equal: now.toISOString() } },
      { startAt: { greater_than_equal: startOfWarsawDay(now).toISOString() } },
    ],
  })
  if (beforeISOString) conditions.push({ startAt: { less_than_equal: beforeISOString } })
  const result = await payload.find({
    collection: 'events',
    context: websiteRequestContext,
    depth: 3,
    draft: false,
    limit,
    overrideAccess: false,
    sort: ['startAt', 'title'],
    user: null,
    where: { and: conditions },
  })
  return result.docs
}

const findCurrentAndUpcomingEventsCached = cachePublicData(
  'current-and-upcoming-events',
  findCurrentAndUpcomingEventsUncached,
  { revalidate: 300, tags: [publicCacheTags.events] },
)

export function findCurrentAndUpcomingEvents(limit = 100, before?: Date): Promise<Event[]> {
  return findCurrentAndUpcomingEventsCached(limit, before?.toISOString())
}

async function findHomepageEventsUncached(windowWeeks: number, limit: number): Promise<Event[]> {
  const windowEnd = new Date(Date.now() + windowWeeks * 7 * 86_400_000)
  const events = await findCurrentAndUpcomingEventsUncached(limit, windowEnd.toISOString())
  return events.length ? events : findCurrentAndUpcomingEventsUncached(1)
}

export const findHomepageEvents = cachePublicData('homepage-events', findHomepageEventsUncached, {
  revalidate: 300,
  tags: [publicCacheTags.events, publicCacheTags.homepage],
})

const findPastEventsCached = cachePublicData(
  'past-events',
  async (page: number, limit: number) => {
    const payload = await getPayload({ config })
    return payload.find({
      collection: 'events',
      context: websiteRequestContext,
      depth: 2,
      draft: false,
      limit,
      overrideAccess: false,
      page,
      sort: ['-startAt', 'title'],
      user: null,
      where: {
        and: [
          published,
          {
            or: [
              { endAt: { less_than: new Date().toISOString() } },
              {
                and: [
                  { endAt: { exists: false } },
                  { startAt: { less_than: startOfWarsawDay().toISOString() } },
                ],
              },
            ],
          },
        ],
      },
    })
  },
  { revalidate: 300, tags: [publicCacheTags.events] },
)

export function findPastEvents(page: number, limit = 12) {
  return findPastEventsCached(page, limit)
}

export const findEventsForCycle = cachePublicData(
  'events-for-cycle',
  async (cycleID: number): Promise<Event[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'events',
      context: websiteRequestContext,
      depth: 2,
      draft: false,
      limit: 100,
      overrideAccess: false,
      sort: ['startAt'],
      user: null,
      where: { and: [published, { cycle: { equals: cycleID } }] },
    })
    return result.docs
  },
  { revalidate: 3600, tags: [publicCacheTags.events, publicCacheTags.eventCycles] },
)

export const findEventsForPartner = cachePublicData(
  'events-for-partner',
  async (partnerID: number): Promise<Event[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'events',
      context: websiteRequestContext,
      depth: 2,
      draft: false,
      limit: 100,
      overrideAccess: false,
      sort: ['startAt'],
      user: null,
      where: { and: [published, { 'partners.partner': { equals: partnerID } }] },
    })
    return result.docs
  },
  { revalidate: 3600, tags: [publicCacheTags.events, publicCacheTags.partners] },
)

export const findCyclesForPartner = cachePublicData(
  'cycles-for-partner',
  async (partnerID: number): Promise<EventCycle[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'event-cycles',
      context: websiteRequestContext,
      depth: 2,
      draft: false,
      limit: 100,
      overrideAccess: false,
      sort: ['title'],
      user: null,
      where: { and: [published, { 'eventDefaults.partners.partner': { equals: partnerID } }] },
    })
    return result.docs
  },
  { revalidate: 3600, tags: [publicCacheTags.eventCycles, publicCacheTags.partners] },
)

export const findPostsRelatedToEvent = cachePublicData(
  'posts-related-to-event',
  async (eventID: number): Promise<Post[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      context: websiteRequestContext,
      depth: 2,
      draft: false,
      limit: 100,
      overrideAccess: false,
      sort: ['-publishedAt'],
      user: null,
      where: { and: [published, { relatedEvents: { equals: eventID } }] },
    })
    return result.docs
  },
  { revalidate: 3600, tags: [publicCacheTags.events, publicCacheTags.posts] },
)

export const findPostsRelatedToCycle = cachePublicData(
  'posts-related-to-cycle',
  async (cycleID: number): Promise<Post[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      context: websiteRequestContext,
      depth: 2,
      draft: false,
      limit: 100,
      overrideAccess: false,
      sort: ['-publishedAt'],
      user: null,
      where: { and: [published, { relatedEventCycles: { equals: cycleID } }] },
    })
    return result.docs
  },
  { revalidate: 3600, tags: [publicCacheTags.eventCycles, publicCacheTags.posts] },
)
