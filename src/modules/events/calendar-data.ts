import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { publicRequestContext } from '@/modules/content/public-access'
import {
  getCalendarEventDate,
  getCalendarMonthBounds,
  isValidCalendarMonth,
  toCalendarEvent,
  toCalendarEventType,
  type CalendarMonthPayload,
} from '@/modules/events/calendar-presentation'

const published: Where = { _status: { equals: 'published' } }

async function findCalendarMonthUncached(month: string): Promise<CalendarMonthPayload> {
  if (!isValidCalendarMonth(month)) throw new Error('Invalid calendar month.')

  const payload = await getPayload({ config })
  const bounds = getCalendarMonthBounds(month)
  const [eventsResult, eventTypesResult] = await Promise.all([
    payload.find({
      collection: 'events',
      context: publicRequestContext,
      depth: 1,
      draft: false,
      limit: 1000,
      overrideAccess: false,
      sort: ['startAt', 'title'],
      user: null,
      where: {
        and: [
          published,
          { eventStatus: { in: ['scheduled', 'rescheduled'] } },
          { startAt: { greater_than_equal: bounds.start } },
          { startAt: { less_than: bounds.end } },
        ],
      },
    }),
    payload.find({
      collection: 'event-types',
      context: publicRequestContext,
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      sort: 'name',
      user: null,
    }),
  ])

  const events = eventsResult.docs
    .map(toCalendarEvent)
    .filter((event) => getCalendarEventDate(event).startsWith(month))

  return {
    events,
    eventTypes: eventTypesResult.docs.map(toCalendarEventType),
    truncated: eventsResult.hasNextPage,
  }
}

export const findCalendarMonth = cachePublicData('calendar-month', findCalendarMonthUncached, {
  revalidate: 300,
  tags: [publicCacheTags.events, publicCacheTags.eventTypes, publicCacheTags.homepage],
})
