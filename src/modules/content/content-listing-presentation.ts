import { getPopulatedRelationship } from '@/lib/relationships'
import type { Category, Event, EventCycle, Media, Tag } from '@/payload-types'
import type { PublicContentListItem } from '@/modules/content/content-listing-sources'
import { getDocumentTypeLabel } from '@/modules/documents/document-types'
import {
  formatEventDate,
  formatEventLocationAddress,
  formatEventStartDate,
  getPartnerRoleLabel,
} from '@/modules/events/presentation'
import { getMemberProfileImageURL } from '@/modules/members/member-profile-image'
import { extractMemberProfileText } from '@/modules/members/rich-text'

export type ContentListingView = 'cards' | 'carousel' | 'compact' | 'grid' | 'tiles'

export type ContentListingImage =
  { alt: string; kind: 'profile'; url: string } | { kind: 'media'; media: Media | number }

export type ContentListingExcerpt =
  | { kind: 'plain'; value: string }
  | { kind: 'richText'; value: Event['excerpt'] | EventCycle['excerpt'] }

export type ContentListingFact = {
  dateTime?: string
  href?: string
  icon: 'calendar' | 'location'
  label: string
  value: string
}

export type ContentListingPresentation = {
  category?: Category | number | null
  contextLabel?: string
  excerpt?: ContentListingExcerpt
  facts: ContentListingFact[]
  image?: ContentListingImage
  interests?: string
  kindLabel: string
  metadataDate?: { dateTime: string; label: string }
  metadataLink?: { href: string; label: string; prefix: string }
  metadataText?: string
  secondaryAction?: { href: string; label: string }
  tags?: (number | Tag)[] | null
  title: string
  url: string
}

const publicationDateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
})

const shortDateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
})

export function getContentListingPresentation(
  item: PublicContentListItem,
  view: ContentListingView,
): ContentListingPresentation {
  switch (item.kind) {
    case 'locations':
      return {
        excerpt: createPlainExcerpt(formatEventLocationAddress(item.document)),
        facts: [],
        kindLabel: 'Miejsce',
        title: item.document.venueName,
        url: item.url,
      }
    case 'documents':
      return {
        category: item.document.category,
        excerpt: createPlainExcerpt(item.document.summary),
        facts: [],
        kindLabel: getDocumentTypeLabel(item.document.documentType),
        metadataDate: {
          dateTime: item.document.documentDate,
          label: publicationDateFormatter.format(new Date(item.document.documentDate)),
        },
        metadataText: `${item.document.documentNumber ? `nr ${item.document.documentNumber} ` : ''}z dnia`,
        tags: item.document.tags,
        title: item.document.title,
        url: item.url,
      }
    case 'event-cycles':
      return {
        category: item.document.category,
        excerpt: createRichTextExcerpt(item.document.excerpt, view),
        facts: [],
        image: createMediaImage(item.document.heroImage),
        kindLabel: 'Cykl wydarzeń',
        tags: item.document.tags,
        title: item.document.title,
        url: item.url,
      }
    case 'events': {
      const event = item.document
      const location = getPopulatedRelationship(event.location)
      const cycle = event.cycle && typeof event.cycle === 'object' ? event.cycle : null
      const facts: ContentListingFact[] = []
      if (view === 'cards' || view === 'carousel') {
        facts.push({
          dateTime: event.startAt,
          icon: 'calendar',
          label: 'Kiedy',
          value: formatEventDate(event),
        })
      }
      if ((view === 'cards' || view === 'carousel' || view === 'grid') && location?.venueName) {
        facts.push({
          href: location?.venueWebsite ?? undefined,
          icon: 'location',
          label: 'Gdzie',
          value: location?.venueName,
        })
      }

      return {
        category: event.category,
        excerpt: createRichTextExcerpt(event.excerpt, view),
        facts,
        image: createMediaImage(event.heroImage),
        kindLabel: 'Wydarzenie',
        ...(view === 'cards' && cycle
          ? {
              metadataLink: {
                href: `/events/series/${cycle.slug}`,
                label: cycle.title,
                prefix: 'z cyklu',
              },
            }
          : {}),
        ...(view === 'grid' || view === 'compact' || view === 'tiles'
          ? {
              metadataDate: {
                dateTime: event.startAt,
                label: formatEventStartDate(event),
              },
            }
          : {}),
        secondaryAction: {
          href: `/events/${event.slug}/calendar.ics`,
          label: 'Dodaj do kalendarza',
        },
        tags: event.tags,
        title: event.title,
        url: item.url,
      }
    }
    case 'member-profiles': {
      const profile = item.document
      const contextLabel = item.contextLabel?.trim() || profile.clubFunction?.trim() || undefined
      return {
        contextLabel,
        excerpt:
          view === 'cards' || view === 'grid' || view === 'carousel'
            ? createPlainExcerpt(extractMemberProfileText(profile.about, 260))
            : undefined,
        facts: [],
        image: {
          alt: `Zdjęcie profilowe: ${profile.publicName}`,
          kind: 'profile',
          url: getMemberProfileImageURL(profile, 'card'),
        },
        interests:
          view === 'cards' || view === 'grid' ? profile.interests?.trim() || undefined : undefined,
        kindLabel: 'Wizytówka',
        title: profile.publicName,
        url: item.url,
      }
    }
    case 'pages':
      return {
        category: item.document.category,
        excerpt: createPlainExcerpt(item.document.listingExcerpt),
        facts: [],
        image: createMediaImage(item.document.heroImage),
        kindLabel: 'Strona',
        tags: item.document.tags,
        title: item.document.title,
        url: item.url,
      }
    case 'partners': {
      const rolesLabel =
        view === 'tiles' || view === 'compact'
          ? item.partnerRoles?.map(getPartnerRoleLabel).join(', ')
          : undefined

      return {
        contextLabel: item.contextLabel?.trim() || undefined,
        excerpt: createPlainExcerpt(item.document.excerpt),
        facts: [],
        image: createMediaImage(item.document.heroImage),
        kindLabel: rolesLabel || 'Partner',
        title: item.document.name,
        url: item.url,
      }
    }
    case 'posts':
      return {
        category: item.document.category,
        excerpt: createPlainExcerpt(item.document.excerpt),
        facts: [],
        image: createMediaImage(item.document.heroImage),
        kindLabel: 'Wpis',
        metadataDate: item.document.publishedAt
          ? {
              dateTime: item.document.publishedAt,
              label: publicationDateFormatter.format(new Date(item.document.publishedAt)),
            }
          : undefined,
        tags: item.document.tags,
        title: item.document.title,
        url: item.url,
      }
  }
}

function createMediaImage(
  value: Media | number | null | undefined,
): ContentListingImage | undefined {
  return value ? { kind: 'media', media: value } : undefined
}

function createPlainExcerpt(value: null | string | undefined): ContentListingExcerpt | undefined {
  return value?.trim() ? { kind: 'plain', value: value.trim() } : undefined
}

function createRichTextExcerpt(
  value: Event['excerpt'] | EventCycle['excerpt'],
  view: ContentListingView,
): ContentListingExcerpt | undefined {
  return view === 'cards' || view === 'grid' || view === 'carousel'
    ? { kind: 'richText', value }
    : undefined
}

export function presentListingItem(
  item: PublicContentListItem,
  view: import('./listing-view').ListingView,
): ContentListingPresentation {
  const presentation = getContentListingPresentation(item, 'cards')
  const enabled = view.information
  const partnerRoles =
    item.kind === 'partners' ? item.partnerRoles?.map(getPartnerRoleLabel).join(', ') : undefined
  const shortEventDate = item.kind === 'events' && view.dateFormat === 'short'
  const dateTime = shortEventDate ? item.document.startAt : presentation.metadataDate?.dateTime
  const metadataDate = dateTime
    ? {
        dateTime,
        label: (view.dateFormat === 'short' ? shortDateFormatter : publicationDateFormatter).format(
          new Date(dateTime),
        ),
      }
    : undefined

  return {
    ...presentation,
    category: enabled.taxonomy ? presentation.category : undefined,
    contextLabel: enabled.context
      ? [presentation.contextLabel, partnerRoles].filter(Boolean).join(' · ') || undefined
      : undefined,
    excerpt: enabled.excerpt ? presentation.excerpt : undefined,
    facts: presentation.facts.filter((fact) =>
      fact.icon === 'calendar' ? enabled.date && !shortEventDate : enabled.venue,
    ),
    image: enabled.image ? presentation.image : undefined,
    interests: enabled.interests ? presentation.interests : undefined,
    kindLabel: enabled.kind ? presentation.kindLabel : '',
    metadataDate: enabled.date ? metadataDate : undefined,
    metadataLink: enabled.cycle ? presentation.metadataLink : undefined,
    metadataText: enabled.date ? presentation.metadataText : undefined,
    secondaryAction: enabled.calendar ? presentation.secondaryAction : undefined,
    tags: enabled.taxonomy ? presentation.tags : undefined,
  }
}
