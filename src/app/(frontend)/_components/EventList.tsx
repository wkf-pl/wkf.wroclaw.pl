import Link from 'next/link'

import type { Event } from '@/payload-types'
import { formatEventDate, getEventStatusLabel } from '@/modules/events/presentation'

import { CmsImage } from './CmsImage'

export function EventList({ events }: { events: Event[] }) {
  if (!events.length) return <p className="emptyState">Nie ma wydarzeń do wyświetlenia.</p>
  return (
    <div className="eventGrid">
      {events.map((event) => (
        <article className="eventCard" key={event.id}>
          <Link href={`/events/${event.slug}`}>
            <CmsImage className="eventCardImage" media={event.heroImage} />
            <div className="eventCardContent">
              <p className="eyebrow">{getEventStatusLabel(event.eventStatus)}</p>
              <h3>{event.title}</h3>
              <time dateTime={event.startAt}>{formatEventDate(event)}</time>
              {event.location?.venueName ? <p>{event.location.venueName}</p> : null}
              <p>{event.excerpt}</p>
            </div>
          </Link>
        </article>
      ))}
    </div>
  )
}
