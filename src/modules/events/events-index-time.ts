import type { Where } from 'payload'

import type { ListingEventTimeValue } from '@/modules/content/listing-conditions'

export function createUpcomingEventsIndexWhere(now: Date): Where {
  return {
    and: [
      { eventStatus: { in: ['scheduled', 'rescheduled'] } },
      createEventsIndexTimeWhere('upcoming', now),
    ],
  }
}

export function createEventsIndexTimeWhere(
  period: ListingEventTimeValue,
  now: Date,
  { start = 'startAt', end = 'endAt' } = {},
): Where {
  const currentTime = now.toISOString()
  const dayStart = startOfWarsawDay(now).toISOString()

  return period === 'upcoming'
    ? {
        or: [
          { [end]: { greater_than_equal: currentTime } },
          { [start]: { greater_than_equal: dayStart } },
        ],
      }
    : {
        or: [
          { [end]: { less_than: currentTime } },
          { and: [{ [end]: { exists: false } }, { [start]: { less_than: dayStart } }] },
        ],
      }
}

function startOfWarsawDay(date: Date): Date {
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
