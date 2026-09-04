import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { GoogleMapEmbed } from '@/components/maps/GoogleMapEmbed'
import { createContentMetadata } from '@/modules/content/content-metadata'
import { buildGoogleMapsURL } from '@/modules/events/map-embed'
import {
  formatEventDate,
  getEventStatusLabel,
  getPartnerRoleLabel,
} from '@/modules/events/presentation'
import { findPostsRelatedToEvent, findPublishedEventBySlug } from '@/modules/events/public-events'
import { createEventStructuredData } from '@/modules/events/structured-data'
import { resolveLink } from '@/modules/navigation/links'

import { CmsPageDocument } from '../../_components/CmsPageDocument'
import { SmallPostList } from '../../_components/SmallPostList'
import { StructuredData } from '../../_components/StructuredData'

type Properties = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}
export async function generateMetadata({ params }: Properties): Promise<Metadata> {
  const event = await findPublishedEventBySlug((await params).slug)
  return event ? createContentMetadata(event) : {}
}

export default async function EventPage({ params, searchParams }: Properties) {
  const event = await findPublishedEventBySlug((await params).slug)
  if (!event) notFound()
  const relatedPosts = await findPostsRelatedToEvent(event.id)
  const location = event.location
  const mapURL = buildGoogleMapsURL({
    city: location?.city,
    name: location?.venueName,
    postalCode: location?.postalCode,
    streetAddress: location?.streetAddress,
  })
  const details = (
    <section className="eventDetails">
      <dl>
        <div>
          <dt>Termin</dt>
          <dd>
            <time dateTime={event.startAt}>{formatEventDate(event)}</time>
          </dd>
        </div>
        <div>
          <dt>Stan</dt>
          <dd>{getEventStatusLabel(event.eventStatus)}</dd>
        </div>
        {location?.venueName ? (
          <div>
            <dt>Miejsce</dt>
            <dd>
              {location.venueWebsite ? (
                <a href={location.venueWebsite}>{location.venueName}</a>
              ) : (
                location.venueName
              )}
              <br />
              {location.streetAddress}, {location.postalCode} {location.city} ·{' '}
              <a href={mapURL}>Otwórz w Mapach Google</a>
            </dd>
          </div>
        ) : null}
        <div>
          <dt>Uczestnictwo</dt>
          <dd>{event.participation === 'members' ? 'Dla klubowiczów' : 'Publiczne'}</dd>
        </div>
        <div>
          <dt>Liczba miejsc</dt>
          <dd>
            {event.capacityMode === 'unlimited'
              ? 'Bez limitu'
              : event.capacityMode === 'approximate'
                ? `Około ${event.capacity}`
                : event.capacity}
          </dd>
        </div>
      </dl>
      <p>
        <Link href={`/events/${event.slug}/calendar.ics`}>Dodaj to wydarzenie do kalendarza</Link>
      </p>
      {event.cycle && typeof event.cycle === 'object' ? (
        <p>
          <Link href={`/events/series/${event.cycle.slug}`}>Zobacz cykl: {event.cycle.title}</Link>
          {event.cycle.calendarFeedKey ? (
            <>
              {' '}
              ·{' '}
              <Link href={`/events/calendar.ics?series=${event.cycle.calendarFeedKey}`}>
                Subskrybuj serię
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
      {location?.mapEmbedURL ? (
        <div className="eventMap">
          <GoogleMapEmbed src={location.mapEmbedURL} />
        </div>
      ) : null}
    </section>
  )
  const cooperation =
    event.organizers?.length ||
    event.partners?.length ||
    event.externalLinks?.length ||
    relatedPosts.length ? (
      <section className="eventCooperation">
        {event.organizers?.length ? (
          <>
            <h2>Organizatorzy</h2>
            <ul>
              {event.organizers.map((item) => (
                <li key={item.id}>
                  {typeof item.profile === 'object' ? item.profile.publicName : 'Organizator'}
                  {item.role ? ` — ${item.role}` : ''}
                  {item.responsibilities ? <div>{item.responsibilities}</div> : null}
                  {item.contactFor ? <div>Kontakt w sprawie: {item.contactFor}</div> : null}
                  {item.showContactChannels &&
                  typeof item.profile === 'object' &&
                  item.profile.contactChannels?.length ? (
                    <ul aria-label="Kanały kontaktu">
                      {item.profile.contactChannels.map((channel) => (
                        <li key={channel.id}>
                          <a
                            href={channel.type === 'email' ? `mailto:${channel.url}` : channel.url}
                          >
                            {channel.type === 'email' ? channel.url : channel.type}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {event.partners?.length ? (
          <>
            <h2>Partnerzy</h2>
            <ul>
              {event.partners.map((item) => (
                <li key={item.id}>
                  {typeof item.partner === 'object' ? (
                    <Link href={`/partners/${item.partner.slug}`}>{item.partner.name}</Link>
                  ) : (
                    'Partner'
                  )}{' '}
                  — {item.roles.map(getPartnerRoleLabel).join(', ')}
                  {item.contribution ? <div>{item.contribution}</div> : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}
        {event.externalLinks?.length ? (
          <>
            <h2>Linki</h2>
            <ul>
              {event.externalLinks.map((item) => {
                const link = resolveLink(item)
                return link ? (
                  <li key={item.id}>
                    <a href={link.href} rel={link.rel} target={link.target}>
                      {item.label}
                    </a>
                  </li>
                ) : null
              })}
            </ul>
          </>
        ) : null}
        {relatedPosts.length ? (
          <>
            <h2>Powiązane wpisy</h2>
            <SmallPostList posts={relatedPosts} />
          </>
        ) : null}
      </section>
    ) : null
  return (
    <>
      <StructuredData value={createEventStructuredData(event)} />
      <CmsPageDocument
        afterBlocks={cooperation}
        beforeBlocks={details}
        breadcrumbs={[
          { label: 'Strona główna', url: '/' },
          { label: 'Wydarzenia', url: '/events' },
          { label: event.title, url: null },
        ]}
        document={event}
        heroDate={{ dateTime: event.startAt, label: formatEventDate(event) }}
        pathname={`/events/${event.slug}`}
        searchParams={await searchParams}
      />
    </>
  )
}
