import { getPopulatedRelationship } from '@/lib/relationships'
import type { Event, EventCycle, Partner } from '@/payload-types'
import { extractRichTextText } from '@/modules/content/rich-text'
import { getMediaURL } from '@/modules/media/media-url'

export function createEventStructuredData(event: Event) {
  const location = getPopulatedRelationship(event.location)
  const physicalLocation = location
    ? {
        '@type': 'Place',
        name: location.venueName,
        address: {
          '@type': 'PostalAddress',
          streetAddress: location.streetAddress,
          postalCode: location.postalCode,
          addressLocality: location.city,
          addressCountry: location.country,
        },
      }
    : undefined
  const onlineLocation = event.onlineEventURL
    ? { '@type': 'VirtualLocation', url: event.onlineEventURL }
    : undefined
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: extractRichTextText(event.excerpt),
    startDate: event.startAt,
    endDate: event.endAt || undefined,
    eventAttendanceMode: onlineLocation
      ? physicalLocation
        ? 'https://schema.org/MixedEventAttendanceMode'
        : 'https://schema.org/OnlineEventAttendanceMode'
      : physicalLocation
        ? 'https://schema.org/OfflineEventAttendanceMode'
        : undefined,
    image: getMediaURL(event.heroImage),
    location:
      physicalLocation && onlineLocation
        ? [physicalLocation, onlineLocation]
        : (physicalLocation ?? onlineLocation),
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
    description: extractRichTextText(cycle.excerpt),
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
    logo: getMediaURL(partner.heroImage),
  }
}
