import { cache } from 'react'
import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { Event, EventCycle, Partner, Post } from '@/payload-types'
import { getCurrentUser } from '@/modules/auth/current-user'
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
    user: await getCurrentUser(),
    where: { and: [published, { slug: { equals: slug } }] },
  })
  return (result.docs[0] as T | undefined) ?? null
}

export const findPublishedEventBySlug = cache((slug: string) =>
  findPublicDocument<Event>('events', slug),
)

export const findPublishedEventCycleBySlug = cache((slug: string) =>
  findPublicDocument<EventCycle>('event-cycles', slug),
)

export const findPublishedPartnerBySlug = cache((slug: string) =>
  findPublicDocument<Partner>('partners', slug),
)

export async function findCurrentAndUpcomingEvents(limit = 100, before?: Date): Promise<Event[]> {
  const payload = await getPayload({ config })
  const now = new Date()
  const conditions: Where[] = [published, { eventStatus: { in: ['scheduled', 'rescheduled'] } }]
  conditions.push({
    or: [
      { endAt: { greater_than_equal: now.toISOString() } },
      { startAt: { greater_than_equal: startOfWarsawDay(now).toISOString() } },
    ],
  })
  if (before) conditions.push({ startAt: { less_than_equal: before.toISOString() } })
  const result = await payload.find({
    collection: 'events',
    context: websiteRequestContext,
    depth: 3,
    draft: false,
    limit,
    overrideAccess: false,
    sort: ['startAt', 'title'],
    user: await getCurrentUser(),
    where: { and: conditions },
  })
  return result.docs
}

export async function findHomepageEvents(windowWeeks: number, limit: number): Promise<Event[]> {
  const windowEnd = new Date(Date.now() + windowWeeks * 7 * 86_400_000)
  const events = await findCurrentAndUpcomingEvents(limit, windowEnd)
  return events.length ? events : findCurrentAndUpcomingEvents(1)
}

export async function findPastEvents(page: number, limit = 12) {
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
    user: await getCurrentUser(),
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
}

export async function findEventsForCycle(cycleID: number): Promise<Event[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'events',
    context: websiteRequestContext,
    depth: 2,
    draft: false,
    limit: 100,
    overrideAccess: false,
    sort: ['startAt'],
    user: await getCurrentUser(),
    where: { and: [published, { cycle: { equals: cycleID } }] },
  })
  return result.docs
}

export async function findEventsForPartner(partnerID: number): Promise<Event[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'events',
    context: websiteRequestContext,
    depth: 2,
    draft: false,
    limit: 100,
    overrideAccess: false,
    sort: ['startAt'],
    user: await getCurrentUser(),
    where: { and: [published, { 'partners.partner': { equals: partnerID } }] },
  })
  return result.docs
}

export async function findCyclesForPartner(partnerID: number): Promise<EventCycle[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'event-cycles',
    context: websiteRequestContext,
    depth: 2,
    draft: false,
    limit: 100,
    overrideAccess: false,
    sort: ['title'],
    user: await getCurrentUser(),
    where: { and: [published, { 'eventDefaults.partners.partner': { equals: partnerID } }] },
  })
  return result.docs
}

export async function findPostsRelatedToEvent(eventID: number): Promise<Post[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    context: websiteRequestContext,
    depth: 2,
    draft: false,
    limit: 100,
    overrideAccess: false,
    sort: ['-publishedAt'],
    user: await getCurrentUser(),
    where: { and: [published, { relatedEvents: { equals: eventID } }] },
  })
  return result.docs
}

export async function findPostsRelatedToCycle(cycleID: number): Promise<Post[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    context: websiteRequestContext,
    depth: 2,
    draft: false,
    limit: 100,
    overrideAccess: false,
    sort: ['-publishedAt'],
    user: await getCurrentUser(),
    where: { and: [published, { relatedEventCycles: { equals: cycleID } }] },
  })
  return result.docs
}
