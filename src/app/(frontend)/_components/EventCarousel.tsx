'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { Event } from '@/payload-types'
import { formatEventDate } from '@/modules/events/presentation'

import { CmsImage } from './CmsImage'
import { Icon } from './Icon'

export function EventCarousel({ events }: { events: Event[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (
      events.length < 2 ||
      paused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % events.length),
      8000,
    )
    return () => window.clearInterval(timer)
  }, [events.length, paused])

  const event = events[activeIndex]
  if (!event) return null

  return (
    <div
      className="eventCarousel"
      onBlur={(event_) => {
        if (!event_.currentTarget.contains(event_.relatedTarget)) setPaused(false)
      }}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <article className="featuredEvent">
        <div className="featuredEventImageLink">
          <CmsImage className="featuredEventImage" media={event.heroImage} />
          <Link className="featuredEventTitle" href={`/events/${event.slug}`}>
            {event.title}
          </Link>
          <Link className="featuredEventCalendar" href={`/events/${event.slug}/calendar.ics`}>
            Dodaj do kalendarza
          </Link>
        </div>
        <div className="featuredEventContent">
          {event.tagline ? <h3>{event.tagline}</h3> : null}
          <p>{event.excerpt}</p>
          <p className="featuredEventFact">
            <span aria-label="Kiedy" className="featuredEventFactIcon" role="img">
              <Icon name="calendar" />
            </span>
            <time dateTime={event.startAt}>{formatEventDate(event)}</time>
          </p>
          {event.location?.venueName ? (
            <p className="featuredEventFact">
              <span aria-label="Gdzie" className="featuredEventFactIcon" role="img">
                <Icon name="location" />
              </span>
              {event.location.venueWebsite ? (
                <a href={event.location.venueWebsite}>{event.location.venueName}</a>
              ) : (
                event.location.venueName
              )}
            </p>
          ) : null}
          <Link className="textArrowLink" href={`/events/${event.slug}`}>
            Więcej…
          </Link>
        </div>
      </article>
      {events.length > 1 ? (
        <div aria-label="Wybór wydarzenia" className="carouselControls">
          {events.map((item, index) => (
            <button
              aria-label={`Pokaż: ${item.title}`}
              aria-pressed={index === activeIndex}
              key={item.id}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              {index + 1}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
