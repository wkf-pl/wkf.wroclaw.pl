import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { EventCalendar } from '@/app/(frontend)/_components/EventCalendar'
import {
  getCalendarEventDate,
  getCalendarMonthBounds,
  isValidCalendarMonth,
  toCalendarEvent,
  type CalendarMonthPayload,
} from '@/modules/events/calendar-presentation'
import { createRichTextDocument } from '@/modules/members/rich-text'

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
      eventType: { id: 1, iconColor: 'lantern-glow', iconName: 'dice', name: 'Sesje RPG' },
      excerpt: firstExcerpt,
      id: 1,
      slug: 'erpegowy-wtorek',
      startAt: '2026-09-08T16:00:00.000Z',
      title: 'Erpegowy Wtorek',
    },
    {
      eventType: { id: 2, iconColor: 'mist-silver', iconName: 'users', name: 'Spotkania' },
      excerpt: secondExcerpt,
      id: 2,
      slug: 'spotkanie-klubowe',
      startAt: '2026-09-08T17:00:00.000Z',
      title: 'Spotkanie klubowe',
    },
  ],
  truncated: false,
}

describe('Event calendar', () => {
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
    expect(markup).toContain('Subskrybuj kalendarz WKF')
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
        excerpt,
        id: 1,
        slug: 'wydarzenie',
        startAt: '2026-09-08T16:00:00.000Z',
        title: 'Wydarzenie',
      }),
    ).toMatchObject({ excerpt })
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
