'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import type { Event } from '@/payload-types'
import { formatEventDate } from '@/modules/events/presentation'

import { CmsImage } from './CmsImage'
import { RasterIcon } from '@/components/RasterIcon'
import { CmsRichText } from '@/components/CmsRichText'

export function EventCarousel({
  events,
  isActive = true,
}: {
  events: Event[]
  isActive?: boolean
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (
      events.length < 2 ||
      !isActive ||
      paused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % events.length),
      8000,
    )
    return () => window.clearInterval(timer)
  }, [events.length, isActive, paused])

  if (!events[activeIndex]) return null

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
      <div className="eventCarouselSlides">
        {events.map((item, index) => {
          const isActive = index === activeIndex
          return (
            <article
              aria-hidden={!isActive}
              className={`featuredEvent${isActive ? ' featuredEvent--active' : ''}`}
              key={item.id}
            >
              <Link
                aria-label={`Zobacz wydarzenie: ${item.title}`}
                className="featuredEventImageLink"
                href={`/events/${item.slug}`}
                tabIndex={isActive ? undefined : -1}
              >
                <CmsImage className="featuredEventImage" media={item.heroImage} />
                <span className="featuredEventTitle">{item.title}</span>
              </Link>
              <div className="featuredEventContent">
                <CmsRichText className="featuredEventSummary" data={item.excerpt} />
                <p className="featuredEventFact">
                  <span aria-label="Kiedy" className="featuredEventFactIcon" role="img">
                    <RasterIcon name="calendar" size="medium" />
                  </span>
                  <time dateTime={item.startAt}>{formatEventDate(item)}</time>
                </p>
                {item.location?.venueName ? (
                  <p className="featuredEventFact">
                    <span aria-label="Gdzie" className="featuredEventFactIcon" role="img">
                      <RasterIcon name="location" size="medium" />
                    </span>
                    {item.location.venueWebsite ? (
                      <a href={item.location.venueWebsite} tabIndex={isActive ? undefined : -1}>
                        {item.location.venueName}
                      </a>
                    ) : (
                      item.location.venueName
                    )}
                  </p>
                ) : null}
                <div className="featuredEventActions">
                  <Link
                    className="featuredEventPrimaryAction"
                    href={`/events/${item.slug}`}
                    tabIndex={isActive ? undefined : -1}
                  >
                    <span>Zobacz wydarzenie</span>
                    <RasterIcon name="arrow-right" size="small" />
                  </Link>
                  <Link
                    className="featuredEventCalendar"
                    href={`/events/${item.slug}/calendar.ics`}
                    tabIndex={isActive ? undefined : -1}
                  >
                    <RasterIcon name="calendar" size="small" />
                    <span>Dodaj do kalendarza</span>
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
      <div className="eventCarouselFooter">
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
        ) : (
          <span />
        )}
        <Link className="eventCalendarSubscription" href="/events/calendar.ics">
          <RasterIcon name="calendar" size="small" />
          <span>Subskrybuj kalendarz WKF</span>
        </Link>
      </div>
    </div>
  )
}
