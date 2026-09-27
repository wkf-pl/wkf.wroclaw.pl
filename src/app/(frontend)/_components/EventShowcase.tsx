'use client'

import Link from 'next/link'
import { useState } from 'react'

import { RasterIcon } from '@/components/RasterIcon'
import type { Event } from '@/payload-types'
import type { CalendarMonthPayload } from '@/modules/events/calendar-presentation'

import { EventCalendar } from './EventCalendar'
import { EventCarousel } from './EventCarousel'

type EventShowcaseView = 'calendar' | 'upcoming'

export function EventShowcase({
  events,
  initialCalendarData,
  initialCalendarMonth,
}: {
  events: Event[]
  initialCalendarData: CalendarMonthPayload
  initialCalendarMonth: string
}) {
  const [view, setView] = useState<EventShowcaseView>('upcoming')

  return (
    <div className="homeEventShowcase">
      <div className="homeEventToolbar">
        <span aria-hidden="true" />
        <div aria-label="Widok wydarzeń" className="homeEventViewTabs" role="tablist">
          <button
            aria-controls="home-events-upcoming"
            aria-selected={view === 'upcoming'}
            id="home-events-upcoming-tab"
            onClick={() => setView('upcoming')}
            role="tab"
            type="button"
          >
            Najbliższe
          </button>
          <button
            aria-controls="home-events-calendar"
            aria-selected={view === 'calendar'}
            id="home-events-calendar-tab"
            onClick={() => setView('calendar')}
            role="tab"
            type="button"
          >
            Kalendarz
          </button>
        </div>
        <Link className="homeEventAllLink" href="/events">
          <span>Wszystkie wydarzenia</span>
          <RasterIcon name="arrow-right" size="small" />
        </Link>
      </div>

      <div
        aria-labelledby="home-events-upcoming-tab"
        className="homeEventPanel"
        hidden={view !== 'upcoming'}
        id="home-events-upcoming"
        role="tabpanel"
      >
        {events.length ? (
          <EventCarousel events={events} isActive={view === 'upcoming'} />
        ) : (
          <p className="homeEventEmpty">
            Wkrótce pojawią się kolejne wydarzenia. Zajrzyj do kalendarza.
          </p>
        )}
      </div>
      <div
        aria-labelledby="home-events-calendar-tab"
        className="homeEventPanel"
        hidden={view !== 'calendar'}
        id="home-events-calendar"
        role="tabpanel"
      >
        <EventCalendar initialData={initialCalendarData} initialMonth={initialCalendarMonth} />
      </div>
    </div>
  )
}
