import Link from 'next/link'
import type { ReactNode } from 'react'

import { extractRichTextText } from '@/modules/content/rich-text'
import { resolveEventStatus } from '@/modules/events/event-status'
import {
  formatEventCapacity,
  formatEventDateParts,
  formatEventLocationAddress,
  getEventAudienceLabel,
  getEventStatusLabel,
} from '@/modules/events/presentation'
import type { CurrentItemFieldBlock, Event, PageTemplate } from '@/payload-types'

import { PageTemplateDocument } from '../../_components/PageTemplateDocument'
import { getContentHeroImage } from '../../_components/ContentHero'
import { CurrentItemText } from '../../_components/CurrentItemPresentation'
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
  return (
    <PageTemplateDocument
      breadcrumbs={[
        { label: 'Strona główna', url: '/' },
        { label: 'Wydarzenia', url: '/events' },
        { label: event.title, url: null },
      ]}
      currentItem={{
        document: event,
        renderField: (block) => <EventCurrentItemField block={block} event={event} />,
        target: { relationTo: 'events', value: event.id },
      }}
      image={getContentHeroImage(event.heroImage)}
      pathname={`/events/${event.slug}`}
      searchParams={searchParams}
      template={template}
    />
  )
}

function EventCurrentItemField({ block, event }: { block: CurrentItemFieldBlock; event: Event }) {
  switch (block.field) {
    case 'eventType':
      return <EventTypeField event={event} variant={block.variant} />
    case 'eventStatus':
      return <EventStatusField event={event} variant={block.variant} />
    case 'title':
      return <EventTitleField event={event} variant={block.variant} />
    case 'excerpt':
      return <CurrentItemText text={extractRichTextText(event.excerpt)} variant={block.variant} />
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
    case 'partners':
      return <EventPartnersField event={event} variant={block.variant} />
    default:
      return null
  }
}

function EventTypeField({ event, variant }: { event: Event; variant: string }) {
  const eventType = typeof event.eventType === 'object' ? event.eventType : null
  if (!eventType) return null

  return <span className={`pageTemplateBadge pageTemplateBadge--${variant}`}>{eventType.name}</span>
}

function EventStatusField({ event, variant }: { event: Event; variant: string }) {
  const status = resolveEventStatus(event.eventStatus, event)
  return (
    <span className={`pageTemplateBadge pageTemplateBadge--${variant}`} data-event-status={status}>
      {getEventStatusLabel(status)}
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

function EventCycleField({ event, variant }: { event: Event; variant: string }) {
  const cycle = typeof event.cycle === 'object' ? event.cycle : null
  if (!cycle) return null

  return (
    <span className={`pageTemplateList pageTemplateList--${variant}`}>
      <Link href={`/events/series/${cycle.slug}`}>{cycle.title}</Link>
    </span>
  )
}

function EventTimeField({ event, variant }: { event: Event; variant: string }) {
  const date = formatEventDateParts(event)
  return (
    <EventInformationValue variant={variant}>
      <time dateTime={event.startAt}>
        <strong>{date.date}</strong>
        <span>{date.time}</span>
      </time>
    </EventInformationValue>
  )
}

function EventLocationField({ event, variant }: { event: Event; variant: string }) {
  const address = formatEventLocationAddress(event.location)
  const venue = event.location.venueName
  if (!address && !venue) return null

  return (
    <EventInformationValue variant={variant}>
      {venue ? <strong>{venue}</strong> : null}
      {address ? <span>{address}</span> : null}
    </EventInformationValue>
  )
}

function EventAudienceField({ event, variant }: { event: Event; variant: string }) {
  return (
    <EventInformationValue variant={variant}>
      {getEventAudienceLabel(event.participation)}
    </EventInformationValue>
  )
}

function EventCapacityField({ event, variant }: { event: Event; variant: string }) {
  return (
    <EventInformationValue variant={variant}>{formatEventCapacity(event)}</EventInformationValue>
  )
}

function EventPartnersField({ event, variant }: { event: Event; variant: string }) {
  const partners = event.partners ?? []
  if (!partners.length) return null

  return (
    <ul className={`pageTemplatePartners pageTemplatePartners--${variant}`}>
      {partners.map((item, index) => {
        const partner = typeof item.partner === 'object' ? item.partner : null
        return partner ? (
          <li key={item.id ?? `partner-${index}`}>
            <Link href={`/partners/${partner.slug}`}>{partner.name}</Link>
            {item.contribution ? <span>{item.contribution}</span> : null}
          </li>
        ) : null
      })}
    </ul>
  )
}

function EventInformationValue({ children, variant }: { children: ReactNode; variant: string }) {
  return (
    <div
      className={
        variant === 'compact'
          ? 'pageTemplateEventFact pageTemplateEventFact--compact'
          : 'pageTemplateEventFact'
      }
    >
      {children}
    </div>
  )
}
