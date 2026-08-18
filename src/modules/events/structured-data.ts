import type { Event, EventCycle, Partner } from '@/payload-types'

function mediaURL(value: Event['heroImage']): string | undefined {
  return value && typeof value === 'object' ? value.url || undefined : undefined
}

export function createEventStructuredData(event: Event) {
  if (event.visibility !== 'public') return null
  const status =
    event.eventStatus === 'cancelled'
      ? 'https://schema.org/EventCancelled'
      : event.eventStatus === 'postponed'
        ? 'https://schema.org/EventPostponed'
        : event.eventStatus === 'rescheduled'
          ? 'https://schema.org/EventRescheduled'
          : 'https://schema.org/EventScheduled'
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.excerpt,
    startDate: event.startAt,
    endDate: event.endAt || undefined,
    eventStatus: status,
    previousStartDate: event.previousStartAt || undefined,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: mediaURL(event.heroImage),
    location: event.location?.venueName
      ? {
          '@type': 'Place',
          name: event.location.venueName,
          address: {
            '@type': 'PostalAddress',
            streetAddress: event.location.streetAddress,
            postalCode: event.location.postalCode,
            addressLocality: event.location.city,
            addressCountry: 'PL',
          },
        }
      : undefined,
    organizer: {
      '@type': 'Organization',
      name: 'Wrocławski Klub Fantastyki',
      url: 'https://wkf.wroclaw.pl',
    },
    sponsor:
      event.partners?.flatMap((item) =>
        typeof item.partner === 'object'
          ? [
              {
                '@type': 'Organization',
                name: item.partner.name,
                url: item.partner.website || `https://wkf.wroclaw.pl/partners/${item.partner.slug}`,
              },
            ]
          : [],
      ) || undefined,
    url: `https://wkf.wroclaw.pl/events/${event.slug}`,
  }
}

export function createEventCycleStructuredData(cycle: EventCycle) {
  return {
    '@context': 'https://schema.org',
    '@type': ['EventSeries', 'CollectionPage'],
    name: cycle.title,
    description: cycle.excerpt,
    url: `https://wkf.wroclaw.pl/events/series/${cycle.slug}`,
  }
}

export function createPartnerStructuredData(partner: Partner) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: partner.name,
    description: partner.excerpt,
    url: partner.website || `https://wkf.wroclaw.pl/partners/${partner.slug}`,
    logo: mediaURL(partner.heroImage),
  }
}
