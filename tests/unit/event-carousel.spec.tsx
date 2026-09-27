import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { EventCarousel } from '@/app/(frontend)/_components/EventCarousel'
import type { Event } from '@/payload-types'

function eventFixture(id: number, overrides: Partial<Event> = {}): Event {
  return {
    author: 1,
    calendarRevision: 0,
    capacityMode: 'unlimited',
    createdAt: '2026-09-01T10:00:00.000Z',
    eventStatus: 'scheduled',
    eventType: 1,
    excerpt: `Streszczenie ${id}`,
    id,
    layout: [],
    location: { country: 'Polska' },
    participation: 'public',
    slug: `wydarzenie-${id}`,
    startAt: `2026-09-${String(id).padStart(2, '0')}T16:00:00.000Z`,
    timeMode: 'timed',
    title: `Wydarzenie ${id}`,
    updatedAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  }
}

describe('Event carousel', () => {
  it('renders every slide in one height-defining stack without advertising taglines', () => {
    const markup = renderToStaticMarkup(
      <EventCarousel events={[eventFixture(1), eventFixture(2)]} />,
    )

    expect(markup.match(/<article[^>]+class="featuredEvent/g)).toHaveLength(2)
    expect(markup).toContain('Wydarzenie 1')
    expect(markup).toContain('Wydarzenie 2')
    expect(markup).toContain('Streszczenie 1')
    expect(markup).toContain('Streszczenie 2')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup.indexOf('class="featuredEventTitle"')).toBeLessThan(
      markup.indexOf('class="featuredEventContent"'),
    )
    expect(markup).toContain(
      '<span class="featuredEventTitle">Wydarzenie 1</span></a><div class="featuredEventContent">',
    )
  })
})
