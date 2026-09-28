import Link from 'next/link'
import type { ReactNode } from 'react'

import { RasterIcon } from '@/components/RasterIcon'
import type { Event } from '@/payload-types'
import {
  formatEventDateParts,
  getEventStatusLabel,
  getPartnerRoleLabel,
} from '@/modules/events/presentation'
import { getContactChannelLabel } from '@/modules/members/public-members'

import { ContactChannelIcon } from '../../_components/ContactChannelIcon'

type EventHeroEyebrowProperties = Pick<Event, 'eventStatus' | 'eventType'>

type EventSummaryProperties = {
  event: Pick<
    Event,
    | 'capacity'
    | 'capacityMode'
    | 'endAt'
    | 'location'
    | 'participation'
    | 'slug'
    | 'startAt'
    | 'timeMode'
  >
  mapURL: string
}

type EventSidebarProperties = Pick<Event, 'organizers' | 'partners'>

export function EventHeroEyebrow({ eventStatus, eventType }: EventHeroEyebrowProperties) {
  const populatedEventType = typeof eventType === 'object' ? eventType : null

  return (
    <span className="eventHeroEyebrow">
      {populatedEventType ? (
        <span className="eventHeroType" data-event-type-color={populatedEventType.iconColor}>
          <RasterIcon name={populatedEventType.iconName} size="small" />
          <span>{populatedEventType.name}</span>
        </span>
      ) : null}
      <span className="eventHeroStatus" data-event-status={eventStatus}>
        {getEventStatusLabel(eventStatus)}
      </span>
    </span>
  )
}

export function EventSummary({ event, mapURL }: EventSummaryProperties) {
  const eventDate = formatEventDateParts(event)
  const locationAddress = formatLocationAddress(event.location)
  const hasLocation = Boolean(event.location.venueName || locationAddress)

  return (
    <section aria-label="Najważniejsze informacje o wydarzeniu" className="eventDetails">
      <dl className="eventFacts">
        <EventFact icon="calendar" label="Kiedy">
          <time dateTime={event.startAt}>
            <strong className="eventFactPrimary">{eventDate.date}</strong>
            <span className="eventFactSecondary">{eventDate.time}</span>
          </time>
        </EventFact>
        <EventFact icon="location" label="Gdzie">
          {event.location.venueName ? (
            event.location.venueWebsite ? (
              <strong className="eventFactPrimary">
                <a href={event.location.venueWebsite}>{event.location.venueName}</a>
              </strong>
            ) : (
              <strong className="eventFactPrimary">{event.location.venueName}</strong>
            )
          ) : locationAddress ? (
            <strong className="eventFactPrimary">{locationAddress}</strong>
          ) : (
            <strong className="eventFactPrimary">Do ustalenia</strong>
          )}
          {event.location.venueName && locationAddress ? (
            <span className="eventFactSecondary">{locationAddress}</span>
          ) : null}
        </EventFact>
        <div className="eventFact eventFact--combined">
          <EventFactHeading icon="users" label="Dla kogo" />
          <dd>{event.participation === 'members' ? 'Dla klubowiczów' : 'Wydarzenie publiczne'}</dd>
          <EventFactHeading icon="collection" label="Miejsca" />
          <dd>{formatCapacity(event)}</dd>
        </div>
      </dl>
      <div className="eventDetailActions">
        <Link className="eventPrimaryAction" href={`/events/${event.slug}/calendar.ics`}>
          <RasterIcon name="calendar" size="small" />
          Dodaj do kalendarza
        </Link>
        {hasLocation ? (
          <a
            className="eventSecondaryAction"
            href={mapURL}
            rel="noreferrer noopener"
            target="_blank"
          >
            <RasterIcon name="location" size="small" />
            Otwórz w Mapach
          </a>
        ) : null}
      </div>
    </section>
  )
}

export function EventSidebar({ organizers, partners }: EventSidebarProperties) {
  if (!organizers?.length && !partners?.length) return null

  return (
    <div className="eventSidebar">
      {organizers?.length ? (
        <section className="eventSidebarSection">
          <h2>Organizatorzy</h2>
          <ul className="eventSidebarList">
            {organizers.map((item, index) => {
              const profile = typeof item.profile === 'object' ? item.profile : null
              return (
                <li key={item.id ?? `organizer-${index}`}>
                  <h3>
                    {profile ? (
                      <Link href={`/members/${profile.slug}`}>{profile.publicName}</Link>
                    ) : (
                      'Organizator'
                    )}
                  </h3>
                  {item.role ? <p className="eventSidebarRole">{item.role}</p> : null}
                  {item.responsibilities ? <p>{item.responsibilities}</p> : null}
                  {item.contactFor ? <p>Kontakt w sprawie: {item.contactFor}</p> : null}
                  {item.showContactChannels && profile?.contactChannels?.length ? (
                    <ul aria-label="Kanały kontaktu" className="eventSidebarContactChannels">
                      {profile.contactChannels.map((channel, channelIndex) => {
                        const label = getContactChannelLabel(channel.type)
                        return (
                          <li key={channel.id ?? `${channel.type}-${channelIndex}`}>
                            <a
                              href={
                                channel.type === 'email' ? `mailto:${channel.url}` : channel.url
                              }
                              rel={
                                channel.type === 'email'
                                  ? undefined
                                  : 'nofollow noreferrer noopener'
                              }
                              target={channel.type === 'email' ? undefined : '_blank'}
                            >
                              <ContactChannelIcon type={channel.type} />
                              <span>{channel.type === 'email' ? channel.url : label}</span>
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {partners?.length ? (
        <section className="eventSidebarSection">
          <h2>Partnerzy</h2>
          <ul className="eventSidebarList">
            {partners.map((item, index) => {
              const partner = typeof item.partner === 'object' ? item.partner : null
              return (
                <li key={item.id ?? `partner-${index}`}>
                  <h3>
                    {partner ? (
                      <Link href={`/partners/${partner.slug}`}>{partner.name}</Link>
                    ) : (
                      'Partner'
                    )}
                  </h3>
                  <p className="eventSidebarRole">
                    {item.roles.map(getPartnerRoleLabel).join(', ')}
                  </p>
                  {item.contribution ? <p>{item.contribution}</p> : null}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function EventFact({
  children,
  icon,
  label,
}: {
  children: ReactNode
  icon: 'calendar' | 'collection' | 'location' | 'users'
  label: string
}) {
  return (
    <div className="eventFact">
      <EventFactHeading icon={icon} label={label} />
      <dd>{children}</dd>
    </div>
  )
}

function EventFactHeading({
  icon,
  label,
}: {
  icon: 'calendar' | 'collection' | 'location' | 'users'
  label: string
}) {
  return (
    <dt>
      <RasterIcon name={icon} size="medium" />
      <span>{label}</span>
    </dt>
  )
}

function formatCapacity(event: Pick<Event, 'capacity' | 'capacityMode'>): string {
  if (event.capacityMode === 'unlimited') return 'Bez limitu'
  if (!event.capacity) return 'Liczba miejsc do potwierdzenia'
  return event.capacityMode === 'approximate' ? `Około ${event.capacity}` : String(event.capacity)
}

function formatLocationAddress(location: Event['location']): string {
  const cityLine = [location.postalCode, location.city].filter(Boolean).join(' ')
  return [location.streetAddress, cityLine].filter(Boolean).join(', ')
}
