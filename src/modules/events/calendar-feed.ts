import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { Event, EventCycle } from '@/payload-types'
import { websiteRequestContext } from '@/modules/membership/role-permissions'

export async function findPublicCalendarEvents(seriesKey?: null | string): Promise<{
  events: Event[]
  series: EventCycle | null
}> {
  const payload = await getPayload({ config })
  let series: EventCycle | null = null
  const conditions: Where[] = [
    { _status: { equals: 'published' } },
    { visibility: { equals: 'public' } },
    { startAt: { greater_than_equal: new Date(Date.now() - 365 * 86_400_000).toISOString() } },
  ]

  if (seriesKey) {
    const cycleResult = await payload.find({
      collection: 'event-cycles',
      context: websiteRequestContext,
      depth: 0,
      draft: false,
      limit: 1,
      overrideAccess: false,
      user: null,
      where: {
        and: [
          { _status: { equals: 'published' } },
          { visibility: { equals: 'public' } },
          { calendarFeedKey: { equals: seriesKey } },
        ],
      },
    })
    series = cycleResult.docs[0] ?? null
    if (!series) return { events: [], series: null }
    conditions.push({ cycle: { equals: series.id } })
  }

  const result = await payload.find({
    collection: 'events',
    context: websiteRequestContext,
    depth: 1,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    sort: ['startAt'],
    user: null,
    where: { and: conditions },
  })
  return { events: result.docs, series }
}
