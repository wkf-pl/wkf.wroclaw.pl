import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContentCalendar, EventCalendar } from '@/app/(frontend)/_components/EventCalendar'
import type { ContentCalendarMonthPayload } from '@/modules/content/content-calendar-presentation'
import {
  getCalendarEventDate,
  getCalendarMonthBounds,
  isValidCalendarMonth,
  toCalendarEvent,
  type CalendarMonthPayload,
} from '@/modules/events/calendar-presentation'
import { createRichTextDocument } from '@/modules/members/rich-text'

import { readFrontendStyles } from '../helpers/frontend-styles'

const firstExcerpt = createRichTextDocument([
  'Cotygodniowe spotkanie przy grach fabularnych.',
  'Drugi akapit kalendarza.',
])
const secondExcerpt = createRichTextDocument(['Otwarte spotkanie klubowe.'])

const calendarData: CalendarMonthPayload = {
  eventTypes: [
    { id: 1, iconColor: 'lantern-glow', iconName: 'dice', name: 'Sesje RPG' },
    { id: 2, iconColor: 'mist-silver', iconName: 'users', name: 'Spotkania' },
  ],
  events: [
    {
      endAt: '2026-09-08T20:00:00.000Z',
      eventType: { id: 1, iconColor: 'lantern-glow', iconName: 'dice', name: 'Sesje RPG' },
      excerpt: firstExcerpt,
      id: 1,
      location: {
        venueName: 'Klub Pod Kolumnami',
        venueWebsite: 'https://example.com/klub',
      },
      slug: 'erpegowy-wtorek',
      startAt: '2026-09-08T16:00:00.000Z',
      timeMode: 'timed',
      title: 'Erpegowy Wtorek',
    },
    {
      endAt: null,
      eventType: { id: 2, iconColor: 'mist-silver', iconName: 'users', name: 'Spotkania' },
      excerpt: secondExcerpt,
      id: 2,
      location: {},
      slug: 'spotkanie-klubowe',
      startAt: '2026-09-08T17:00:00.000Z',
      timeMode: 'timed',
      title: 'Spotkanie klubowe',
    },
  ],
  truncated: false,
}

describe('Event calendar', () => {
  it('renders mixed Event and Post content without an unrelated calendar subscription', () => {
    const mixedData: ContentCalendarMonthPayload = {
      itemTypes: [
        { id: 'event-type:1', iconColor: 'lantern-glow', iconName: 'dice', name: 'Sesje RPG' },
        { id: 'posts', iconColor: 'mist-silver', iconName: 'book', name: 'Wpisy' },
      ],
      items: [
        {
          dateTime: '2026-09-08T16:00:00.000Z',
          endAt: '2026-09-08T20:00:00.000Z',
          id: 'events:1',
          kind: 'events',
          location: {
            venueName: 'Klub Pod Kolumnami',
            venueWebsite: 'https://example.com/klub',
          },
          summary: { kind: 'richText', value: firstExcerpt },
          timeMode: 'timed',
          title: 'Erpegowy Wtorek',
          type: {
            id: 'event-type:1',
            iconColor: 'lantern-glow',
            iconName: 'dice',
            name: 'Sesje RPG',
          },
          url: '/events/erpegowy-wtorek',
        },
        {
          dateTime: '2026-09-08T09:00:00.000Z',
          id: 'posts:1',
          kind: 'posts',
          summary: { kind: 'text', value: 'Aktualność klubowa.' },
          title: 'Nowy wpis',
          type: { id: 'posts', iconColor: 'mist-silver', iconName: 'book', name: 'Wpisy' },
          url: '/blog/nowy-wpis',
        },
      ],
      truncated: false,
    }
    const markup = renderToStaticMarkup(
      <ContentCalendar
        endpoint="/content/calendar.json?source=events&amp;source=posts"
        initialData={mixedData}
        initialMonth="2026-09"
        subscriptionURL="/events/calendar.ics"
      />,
    )

    expect(markup).toContain('aria-label="8, treści: 2: Erpegowy Wtorek, Nowy wpis"')
    expect(markup).toContain('href="/events/erpegowy-wtorek"')
    expect(markup).toContain('href="/blog/nowy-wpis"')
    expect(markup).toContain('Aktualność klubowa.')
    expect(markup).toContain('8 września 2026')
    expect(markup).toContain('8 września 2026, 18:00 - 22:00')
    expect(markup).toContain('href="https://example.com/klub"')
    expect(markup).toContain('href="/events/erpegowy-wtorek/calendar.ics"')
    expect(markup).toContain('Dodaj do kalendarza')
    expect(markup).toContain('Zobacz wydarzenie')
    expect(markup).toContain('Zobacz wpis')
    expect(markup).not.toContain('Czytaj wpis')
    expect(markup).not.toContain('Opublikowano')
    expect(markup).toContain('Zasubskrybuj kalendarz WKF')
  })

  it('renders the month, weekday grid, type legend and all types for an occupied day', () => {
    const markup = renderToStaticMarkup(
      <EventCalendar initialData={calendarData} initialMonth="2026-09" />,
    )

    expect(markup).toContain('wrzesień 2026')
    expect(markup).toContain('aria-label="8, wydarzenia: 2: Erpegowy Wtorek, Spotkanie klubowe"')
    expect(markup).toContain('data-icon-name="dice"')
    expect(markup).toContain('data-icon-name="users"')
    expect(markup).toContain('Sesje RPG')
    expect(markup).toContain('Spotkania')
    expect(markup).toContain('Cotygodniowe spotkanie przy grach fabularnych.')
    expect(markup).toContain('Drugi akapit kalendarza.')
    expect(markup).toContain('Zasubskrybuj kalendarz WKF')
    expect(markup).toContain('href="/events/erpegowy-wtorek/calendar.ics"')
    expect(markup.indexOf('Dodaj do kalendarza')).toBeLessThan(markup.indexOf('Zobacz wydarzenie'))
  })

  it('keeps the Event excerpt in the public calendar payload', () => {
    const excerpt = createRichTextDocument(['Streszczenie wydarzenia.'])
    expect(
      toCalendarEvent({
        eventType: {
          createdAt: '2026-09-01T10:00:00.000Z',
          iconColor: 'lantern-glow',
          iconName: 'dice',
          id: 1,
          name: 'Sesje RPG',
          updatedAt: '2026-09-01T10:00:00.000Z',
        },
        endAt: '2026-09-08T20:00:00.000Z',
        excerpt,
        id: 1,
        location: {
          venueName: 'Klub Pod Kolumnami',
          venueWebsite: 'https://example.com/klub',
        },
        slug: 'wydarzenie',
        startAt: '2026-09-08T16:00:00.000Z',
        timeMode: 'timed',
        title: 'Wydarzenie',
      }),
    ).toMatchObject({ excerpt })
  })

  it('uses the approved sidebar hierarchy and action treatments', () => {
    const frontendStyles = readFrontendStyles()

    expect(frontendStyles).toMatch(
      /\.calendarDetails h4 \{[^}]*color: var\(--gold-light\);[^}]*font-size: 1\.08rem;[^}]*letter-spacing: 0\.08em;[^}]*text-transform: uppercase;/,
    )
    expect(frontendStyles).toMatch(
      /\.calendarSelectionActions \{[^}]*display: flex;[^}]*align-items: center;/,
    )
    expect(frontendStyles).toMatch(
      /\.calendarEventPrimaryAction \{[^}]*background: var\(--gold-light\);[^}]*color: var\(--background-deep\);/,
    )
    expect(frontendStyles).toMatch(
      /\.calendarEventCalendarAction \{[^}]*color: var\(--gold-light\);/,
    )
  })

  it('announces an initially truncated month before hydration', () => {
    const markup = renderToStaticMarkup(
      <EventCalendar initialData={{ ...calendarData, truncated: true }} initialMonth="2026-09" />,
    )

    expect(markup).toContain('Zbyt wiele wydarzeń. Zobacz pełną listę wydarzeń.')
    expect(markup).toContain('href="/events"')
  })

  it('groups dates in Europe/Warsaw across UTC day and daylight-saving boundaries', () => {
    expect(getCalendarEventDate({ startAt: '2026-03-28T23:30:00.000Z' })).toBe('2026-03-29')
    expect(getCalendarEventDate({ startAt: '2026-10-24T22:30:00.000Z' })).toBe('2026-10-25')
  })

  it('validates month input and queries a margin around UTC boundaries', () => {
    expect(isValidCalendarMonth('2026-09')).toBe(true)
    expect(isValidCalendarMonth('2026-13')).toBe(false)
    expect(isValidCalendarMonth('1899-12')).toBe(false)
    expect(getCalendarMonthBounds('2026-09')).toEqual({
      end: '2026-10-02T00:00:00.000Z',
      start: '2026-08-31T00:00:00.000Z',
    })
  })
})
