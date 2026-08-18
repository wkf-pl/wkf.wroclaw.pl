import type { Event } from '@/payload-types'

import { WARSAW_TIME_ZONE } from './constants'

const datePartsFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  timeZone: WARSAW_TIME_ZONE,
  year: 'numeric',
})
const dateTimePartsFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
  month: '2-digit',
  second: '2-digit',
  timeZone: WARSAW_TIME_ZONE,
  year: 'numeric',
})

function getParts(formatter: Intl.DateTimeFormat, date: Date): Record<string, string> {
  return Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]))
}

function formatLocalDate(value: string): string {
  const parts = getParts(datePartsFormatter, new Date(value))
  return `${parts.year}${parts.month}${parts.day}`
}

function formatLocalDateTime(value: string): string {
  const parts = getParts(dateTimePartsFormatter, new Date(value))
  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`
}

function addLocalDay(value: string): string {
  const date = new Date(value)
  date.setUTCDate(date.getUTCDate() + 1)
  return formatLocalDate(date.toISOString())
}

function escapeICS(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r\n', '\\n')
    .replaceAll('\n', '\\n')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;')
}

function foldLine(line: string): string {
  const chunks: string[] = []
  let chunk = ''
  let byteLength = 0
  for (const character of line) {
    const characterLength = new TextEncoder().encode(character).length
    if (byteLength + characterLength > 75) {
      chunks.push(chunk)
      chunk = character
      byteLength = characterLength
    } else {
      chunk += character
      byteLength += characterLength
    }
  }
  chunks.push(chunk)
  return chunks.join('\r\n ')
}

function formatLocation(event: Event): string {
  return [
    event.location?.venueName,
    event.location?.streetAddress,
    event.location?.postalCode,
    event.location?.city,
    'Polska',
  ]
    .filter(Boolean)
    .join(', ')
}

function eventStatus(event: Event): 'CANCELLED' | 'CONFIRMED' | 'TENTATIVE' {
  if (event.eventStatus === 'cancelled') return 'CANCELLED'
  if (event.eventStatus === 'postponed') return 'TENTATIVE'
  return 'CONFIRMED'
}

function createEventLines(event: Event, siteURL: string): string[] {
  const url = `${siteURL}/events/${event.slug}`
  const lines = [
    'BEGIN:VEVENT',
    `UID:${escapeICS(event.calendarUID || `event-${event.id}@wkf.wroclaw.pl`)}`,
    `SEQUENCE:${event.calendarRevision}`,
    `DTSTAMP:${new Date(event.updatedAt).toISOString().replaceAll(/[-:]/g, '').replace('.000', '')}`,
    `STATUS:${eventStatus(event)}`,
    `SUMMARY:${escapeICS(event.title)}`,
    `DESCRIPTION:${escapeICS(event.excerpt)}`,
    `LOCATION:${escapeICS(formatLocation(event))}`,
    `URL:${url}`,
  ]

  if (event.timeMode === 'allDay') {
    lines.push(`DTSTART;VALUE=DATE:${formatLocalDate(event.startAt)}`)
    lines.push(
      `DTEND;VALUE=DATE:${event.endAt ? addLocalDay(event.endAt) : addLocalDay(event.startAt)}`,
    )
  } else {
    lines.push(`DTSTART;TZID=${WARSAW_TIME_ZONE}:${formatLocalDateTime(event.startAt)}`)
    if (event.endAt)
      lines.push(`DTEND;TZID=${WARSAW_TIME_ZONE}:${formatLocalDateTime(event.endAt)}`)
  }

  lines.push('END:VEVENT')
  return lines
}

export function createEventsCalendar(
  events: Event[],
  calendarName: string,
  siteURL = 'https://wkf.wroclaw.pl',
): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wroclawski Klub Fantastyki//Events//PL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(calendarName)}`,
    `X-WR-TIMEZONE:${WARSAW_TIME_ZONE}`,
    ...events.flatMap((event) => createEventLines(event, siteURL)),
    'END:VCALENDAR',
  ]
  return `${lines.map(foldLine).join('\r\n')}\r\n`
}

export function calendarResponse(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      'Cache-Control': 'private, max-age=300',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Type': 'text/calendar; charset=utf-8',
    },
  })
}
