import Link from 'next/link'
import type { ReactNode } from 'react'

import { RasterIcon } from '@/components/RasterIcon'
import { getMediaURL } from '@/modules/media/media-url'
import { extractRichTextText } from '@/modules/content/rich-text'
import { resolveEventStatus } from '@/modules/events/event-status'
import { buildGoogleMapsURL } from '@/modules/events/map-embed'
import { formatEventDateParts, getEventStatusLabel } from '@/modules/events/presentation'
import type { CurrentItemFieldBlock, Event, PageTemplate } from '@/payload-types'

import { PageTemplateDocument } from '../../_components/PageTemplateDocument'
import { TaxonomyLinks } from '../../_components/TaxonomyLinks'

type EventTemplateDocumentProperties = {
  event: Event
  searchParams: Record<string, string | string[] | undefined>
  template: PageTemplate
}

export function EventTemplateDocument({
  event,
  searchParams,
  template,
}: EventTemplateDocumentProperties) {
  const location = event.location
  const mapURL = buildGoogleMapsURL({
    city: location?.city,
    name: location?.venueName,
    postalCode: location?.postalCode,
    streetAddress: location?.streetAddress,
  })

  return (
    <PageTemplateDocument
      breadcrumbs={[
        { label: 'Strona główna', url: '/' },
        { label: 'Wydarzenia', url: '/events' },
        { label: event.title, url: null },
      ]}
      currentTarget={{ relationTo: 'events', value: event.id }}
      document={event}
      image={getEventHeroImage(event)}
      pathname={`/events/${event.slug}`}
      renderCurrentItemField={(block) => (
        <EventCurrentItemField block={block} event={event} mapURL={mapURL} />
      )}
      searchParams={searchParams}
      template={template}
    />
  )
}

function EventCurrentItemField({
  block,
  event,
  mapURL,
}: {
  block: CurrentItemFieldBlock
  event: Event
  mapURL: string
}) {
  switch (block.field) {
    case 'eventType':
      return <EventTypeField event={event} variant={block.variant} />
    case 'eventStatus':
      return <EventStatusField event={event} variant={block.variant} />
    case 'title':
      return <EventTitleField event={event} variant={block.variant} />
    case 'excerpt':
      return <EventExcerptField event={event} variant={block.variant} />
    case 'eventCycle':
      return <EventCycleField event={event} variant={block.variant} />
    case 'tags':
      return <TaxonomyLinks tags={event.tags} />
    case 'eventTime':
      return <EventTimeField event={event} variant={block.variant} />
    case 'eventLocation':
      return <EventLocationField event={event} variant={block.variant} />
    case 'eventAudience':
      return <EventAudienceField event={event} variant={block.variant} />
    case 'eventCapacity':
      return <EventCapacityField event={event} variant={block.variant} />
    case 'eventActions':
      return <EventActionsField event={event} mapURL={mapURL} variant={block.variant} />
    case 'partners':
      return <EventPartnersField event={event} variant={block.variant} />
    default:
      return null
  }
}

function EventTypeField({ event, variant }: { event: Event; variant: string }) {
  const eventType = typeof event.eventType === 'object' ? event.eventType : null
  if (!eventType) return null

  return (
    <span className={`pageTemplateBadge pageTemplateBadge--${variant}`}>
      <RasterIcon name={eventType.iconName} size="small" />
      <span>{eventType.name}</span>
    </span>
  )
}

function EventStatusField({ event, variant }: { event: Event; variant: string }) {
  return (
    <span
      className={`pageTemplateBadge pageTemplateBadge--${variant}`}
      data-event-status={resolveEventStatus(event.eventStatus, event)}
    >
      {getEventStatusLabel(resolveEventStatus(event.eventStatus, event))}
    </span>
  )
}

function EventTitleField({ event, variant }: { event: Event; variant: string }) {
  if (variant === 'eyebrow') {
    return <p className="eyebrow contentHeroEyebrow">{event.title}</p>
  }
  if (variant === 'sectionHeading') {
    return <h2 className="pageTemplateCurrentHeading">{event.title}</h2>
  }
  return <h1>{event.title}</h1>
}

function EventExcerptField({ event, variant }: { event: Event; variant: string }) {
  const excerpt = extractRichTextText(event.excerpt)
  if (!excerpt) return null

  return <p className={`pageTemplateText pageTemplateText--${variant}`}>{excerpt}</p>
}

function EventCycleField({ event, variant }: { event: Event; variant: string }) {
  const cycle = typeof event.cycle === 'object' ? event.cycle : null
  if (!cycle) return null

  return (
    <p className={`pageTemplateList pageTemplateList--${variant}`}>
      <Link href={`/events/series/${cycle.slug}`}>Cykl: {cycle.title}</Link>
      {cycle.calendarFeedKey ? (
        <Link href={`/events/calendar.ics?series=${cycle.calendarFeedKey}`}>Subskrybuj cykl</Link>
      ) : null}
    </p>
  )
}

function EventTimeField({ event, variant }: { event: Event; variant: string }) {
  const date = formatEventDateParts(event)
  return (
    <EventInformationField icon="calendar" label="Kiedy" variant={variant}>
      <time dateTime={event.startAt}>
        <strong>{date.date}</strong>
        <span>{date.time}</span>
      </time>
    </EventInformationField>
  )
}

function EventLocationField({ event, variant }: { event: Event; variant: string }) {
  const address = formatLocationAddress(event.location)
  const venue = event.location.venueName

  return (
    <EventInformationField icon="location" label="Gdzie" variant={variant}>
      {venue ? <strong>{venue}</strong> : null}
      {address ? <span>{address}</span> : <span>Do ustalenia</span>}
    </EventInformationField>
  )
}

function EventAudienceField({ event, variant }: { event: Event; variant: string }) {
  return (
    <EventInformationField icon="users" label="Dla kogo" variant={variant}>
      <span>{event.participation === 'members' ? 'Dla klubowiczów' : 'Wydarzenie publiczne'}</span>
    </EventInformationField>
  )
}

function EventCapacityField({ event, variant }: { event: Event; variant: string }) {
  return (
    <EventInformationField icon="collection" label="Miejsca" variant={variant}>
      <span>{formatCapacity(event)}</span>
    </EventInformationField>
  )
}

function EventActionsField({
  event,
  mapURL,
  variant,
}: {
  event: Event
  mapURL: string
  variant: string
}) {
  const hasLocation = Boolean(event.location.venueName || formatLocationAddress(event.location))
  return (
    <div className={`pageTemplateEventActions pageTemplateEventActions--${variant}`}>
      <Link className="eventPrimaryAction" href={`/events/${event.slug}/calendar.ics`}>
        <RasterIcon name="calendar" size="small" />
        Dodaj do kalendarza
      </Link>
      {hasLocation ? (
        <a className="eventSecondaryAction" href={mapURL} rel="noreferrer noopener" target="_blank">
          <RasterIcon name="location" size="small" />
          Otwórz w Mapach
        </a>
      ) : null}
    </div>
  )
}

function EventPartnersField({ event, variant }: { event: Event; variant: string }) {
  const partners = event.partners ?? []
  if (!partners.length) return null

  return (
    <section className={`pageTemplatePartners pageTemplatePartners--${variant}`}>
      <h2>Partnerzy</h2>
      <ul>
        {partners.map((item, index) => {
          const partner = typeof item.partner === 'object' ? item.partner : null
          return (
            <li key={item.id ?? `partner-${index}`}>
              {partner ? <Link href={`/partners/${partner.slug}`}>{partner.name}</Link> : 'Partner'}
              {item.contribution ? <span>{item.contribution}</span> : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function EventInformationField({
  children,
  icon,
  label,
  variant,
}: {
  children: ReactNode
  icon: 'calendar' | 'collection' | 'location' | 'users'
  label: string
  variant: string
}) {
  return (
    <dl className={`pageTemplateEventFact pageTemplateEventFact--${variant}`}>
      <dt>
        {variant === 'icon' ? <RasterIcon name={icon} size="medium" /> : null}
        <span>{label}</span>
      </dt>
      <dd>{children}</dd>
    </dl>
  )
}

function getEventHeroImage(event: Event) {
  const source = getMediaURL(event.heroImage)
  if (!source || !event.heroImage || typeof event.heroImage !== 'object') return undefined

  return {
    alt: event.heroImage.alt,
    height: event.heroImage.height || undefined,
    src: source,
    width: event.heroImage.width || undefined,
  }
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
