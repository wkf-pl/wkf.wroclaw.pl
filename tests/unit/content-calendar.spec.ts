import { describe, expect, it } from 'vitest'

import {
  createContentCalendarEndpoint,
  parseContentCalendarSearchParams,
  toCalendarContentEvent,
  toCalendarContentPost,
} from '@/modules/content/content-calendar-presentation'
import { createRichTextDocument } from '@/modules/members/rich-text'

describe('content calendar presentation', () => {
  it('normalizes Events and Posts with their respective public dates and destinations', () => {
    const excerpt = createRichTextDocument(['Opis wydarzenia.'])
    const event = toCalendarContentEvent({
      eventType: {
        createdAt: '2026-08-01T08:00:00.000Z',
        iconColor: 'lantern-glow',
        iconName: 'dice',
        id: 7,
        name: 'Sesje RPG',
        updatedAt: '2026-08-01T08:00:00.000Z',
      },
      endAt: '2026-08-13T20:00:00.000Z',
      excerpt,
      id: 11,
      location: {
        venueName: 'Klub Pod Kolumnami',
        venueWebsite: 'https://example.com/klub',
      },
      slug: 'sesja-testowa',
      startAt: '2026-08-13T16:00:00.000Z',
      timeMode: 'timed',
      title: 'Sesja testowa',
    })
    const post = toCalendarContentPost({
      excerpt: 'Opis wpisu.',
      id: 11,
      publishedAt: '2026-08-14T09:00:00.000Z',
      slug: 'wpis-testowy',
      title: 'Wpis testowy',
    })

    expect(event).toMatchObject({
      dateTime: '2026-08-13T16:00:00.000Z',
      endAt: '2026-08-13T20:00:00.000Z',
      id: 'events:11',
      kind: 'events',
      location: {
        venueName: 'Klub Pod Kolumnami',
        venueWebsite: 'https://example.com/klub',
      },
      summary: { kind: 'richText', value: excerpt },
      timeMode: 'timed',
      type: { id: 'event-type:7', name: 'Sesje RPG' },
      url: '/events/sesja-testowa',
    })
    expect(post).toMatchObject({
      dateTime: '2026-08-14T09:00:00.000Z',
      id: 'posts:11',
      kind: 'posts',
      summary: { kind: 'text', value: 'Opis wpisu.' },
      type: { iconName: 'book', id: 'posts', name: 'Wpisy' },
      url: '/blog/wpis-testowy',
    })
  })

  it('round-trips normalized calendar filters through the public endpoint', () => {
    const endpoint = createContentCalendarEndpoint({
      categoryId: 4,
      eventCycleId: 8,
      sources: ['posts', 'events', 'posts'],
      tagId: 6,
    })

    expect(endpoint).toBe(
      '/content/calendar.json?source=events&source=posts&category=4&tag=6&eventCycle=8',
    )
    expect(
      parseContentCalendarSearchParams(
        new URL(`http://localhost${endpoint}&month=2026-08`).searchParams,
      ),
    ).toEqual({
      filters: { categoryId: 4, eventCycleId: 8, sources: ['events', 'posts'], tagId: 6 },
      month: '2026-08',
    })
    expect(
      parseContentCalendarSearchParams(
        new URL('http://localhost/content/calendar.json?source=pages&month=2026-08').searchParams,
      ),
    ).toBeNull()
  })
})
