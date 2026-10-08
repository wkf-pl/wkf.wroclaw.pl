import type { Event, EventType } from '@/payload-types'
import { isEventTypeIconColor, type EventTypeIconColor } from '@/modules/events/event-types'
import {
  isSelectableRasterIconName,
  type SelectableRasterIconName,
} from '@/modules/icons/icon-registry'

export type CalendarEventType = {
  id: number
  iconColor: EventTypeIconColor
  iconName: SelectableRasterIconName
  name: string
}

export type CalendarEvent = {
  endAt: null | string
  eventType: CalendarEventType
  excerpt: Event['excerpt']
  id: number
  location: Pick<Event['location'], 'venueName' | 'venueWebsite'>
  slug: string
  startAt: string
  timeMode: Event['timeMode']
  title: string
}

export type CalendarMonthPayload = {
  eventTypes: CalendarEventType[]
  events: CalendarEvent[]
  truncated: boolean
}

const fallbackEventType: CalendarEventType = {
  id: 0,
  iconColor: 'parchment-ivory',
  iconName: 'event',
  name: 'Wydarzenie',
}

const calendarDateFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
})

const calendarMonthFormatter = new Intl.DateTimeFormat('en-CA', {
  month: '2-digit',
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
})

export function toCalendarEventType(
  eventType: Pick<EventType, 'iconColor' | 'iconName' | 'id' | 'name'>,
): CalendarEventType {
  return {
    id: eventType.id,
    iconColor: isEventTypeIconColor(eventType.iconColor)
      ? eventType.iconColor
      : fallbackEventType.iconColor,
    iconName: isSelectableRasterIconName(eventType.iconName)
      ? eventType.iconName
      : fallbackEventType.iconName,
    name: eventType.name,
  }
}

export function toCalendarEvent(
  event: Pick<
    Event,
    'endAt' | 'eventType' | 'excerpt' | 'id' | 'slug' | 'startAt' | 'timeMode' | 'title'
  > & {
    location: Pick<Event['location'], 'venueName' | 'venueWebsite'>
  },
): CalendarEvent {
  return {
    endAt: event.endAt ?? null,
    eventType:
      event.eventType && typeof event.eventType === 'object'
        ? toCalendarEventType(event.eventType)
        : fallbackEventType,
    excerpt: event.excerpt,
    id: event.id,
    location: {
      venueName: event.location.venueName,
      venueWebsite: event.location.venueWebsite,
    },
    slug: event.slug,
    startAt: event.startAt,
    timeMode: event.timeMode,
    title: event.title,
  }
}

export function getCalendarEventDate(event: Pick<CalendarEvent, 'startAt'>): string {
  return calendarDateFormatter.format(new Date(event.startAt))
}

export function isValidCalendarMonth(month: string): boolean {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return false
  const year = Number(month.slice(0, 4))
  return year >= 1900 && year <= 2200
}

export function getCalendarMonthBounds(month: string): { end: string; start: string } {
  if (!isValidCalendarMonth(month)) throw new Error('Invalid calendar month.')
  const [year, monthNumber] = month.split('-').map(Number)

  return {
    end: new Date(Date.UTC(year, monthNumber, 2)).toISOString(),
    start: new Date(Date.UTC(year, monthNumber - 1, 0)).toISOString(),
  }
}

export function getWarsawCalendarMonth(date = new Date()): string {
  return calendarMonthFormatter.format(date)
}
