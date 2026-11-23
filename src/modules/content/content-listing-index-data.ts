import { getContentAuthorReference } from './content-author'
import { getRelationshipId } from '@/lib/relationships'
import { buildGoogleMapsURL } from '@/modules/events/map-embed'
import { formatEventLocationAddress } from '@/modules/events/presentation'
import type {
  Document,
  Event,
  EventCycle,
  Location,
  MemberProfile,
  Page,
  Partner,
  Post,
} from '@/payload-types'

import type { ContentListingDocument } from './content-listing-sources'
import {
  createListingTagSearchIndex,
  isListingSource,
  normalizeListingTitle,
  type ContentListingSource,
} from './listing-conditions'
import { extractRichTextText } from './rich-text'

type ContentListingIndexData = {
  topics: number[]
  topicSearchIndex: string
  eventCycle: null | number
  eventEndAt: null | string
  eventStartAt: null | string
  excerpt: null | string
  hasSignificantDate: boolean
  isInactiveLocation?: boolean
  heroImage: null | number
  normalizedTitle: string
  parentPage: null | number
  relatedTargetSearchIndex: string
  relatedTargets: ContentListingTarget[]
  significantDate: null | string
  source: ContentListingSource
  sourceDocumentId: number
  sourceUpdatedAt: string
  tagSearchIndex: string
  tags: number[]
  title: string
  url: string
}

type ContentListingTarget = {
  relationTo: ContentListingSource
  value: number
}

export function createContentListingIndexData(
  source: ContentListingSource,
  document: ContentListingDocument,
): ContentListingIndexData {
  switch (source) {
    case 'locations': {
      const location = document as Location
      return {
        ...createBaseIndexData(source, location, {
          excerpt: formatEventLocationAddress(location),
          title: location.venueName,
          url:
            location.venueWebsite || buildGoogleMapsURL({ ...location, name: location.venueName }),
        }),
        isInactiveLocation: !location.isActive,
      }
    }
    case 'documents':
      return createTaxonomizableIndexData(source, document as Document, {
        excerpt: (document as Document).summary?.trim() || null,
        heroImage: null,
        significantDate: (document as Document).documentDate,
        url: `/dokumenty/${(document as Document).slug}`,
      })
    case 'event-cycles': {
      const eventCycle = document as EventCycle
      return createTaxonomizableIndexData(source, eventCycle, {
        excerpt: extractRichTextText(eventCycle.excerpt) || null,
        heroImage: getRelationshipId(eventCycle.heroImage) ?? null,
        significantDate: null,
        url: `/events/series/${eventCycle.slug}`,
      })
    }
    case 'events': {
      const event = document as Event
      return createTaxonomizableIndexData(source, event, {
        eventCycle: getRelationshipId(event.cycle) ?? null,
        eventEndAt: event.endAt ?? null,
        eventStartAt: event.startAt,
        excerpt: extractRichTextText(event.excerpt) || null,
        heroImage: getRelationshipId(event.heroImage) ?? null,
        significantDate: event.startAt,
        url: `/events/${event.slug}`,
      })
    }
    case 'member-profiles': {
      const profile = document as MemberProfile
      return createBaseIndexData(source, profile, {
        excerpt: extractRichTextText(profile.about) || null,
        title: profile.publicName,
        url: `/members/${profile.slug}`,
      })
    }
    case 'pages': {
      const page = document as Page
      return createTaxonomizableIndexData(source, page, {
        excerpt: page.listingExcerpt?.trim() || null,
        heroImage: getRelationshipId(page.heroImage) ?? null,
        parentPage: getRelationshipId(page.parent) ?? null,
        significantDate: null,
        url: `/${page.slug}`,
      })
    }
    case 'partners': {
      const partner = document as Partner
      return createBaseIndexData(source, partner, {
        excerpt: partner.excerpt?.trim() || null,
        heroImage: getRelationshipId(partner.heroImage) ?? null,
        title: partner.name,
        url: `/partners/${partner.slug}`,
      })
    }
    case 'posts': {
      const post = document as Post
      return createTaxonomizableIndexData(source, post, {
        excerpt: post.excerpt || null,
        heroImage: getRelationshipId(post.heroImage) ?? null,
        significantDate: post.publishedAt ?? null,
        url: `/blog/${post.slug}`,
      })
    }
  }
}

function createBaseIndexData(
  source: ContentListingSource,
  document: ContentListingDocument,
  values: {
    excerpt: null | string
    heroImage?: null | number
    title: string
    url: string
  },
): ContentListingIndexData {
  const relatedTargets = getContentListingTargets(source, document)
  return {
    topics: [],
    topicSearchIndex: '|',
    eventCycle: null,
    eventEndAt: null,
    eventStartAt: null,
    excerpt: values.excerpt,
    hasSignificantDate: false,
    heroImage: values.heroImage ?? null,
    normalizedTitle: normalizeListingTitle(values.title),
    parentPage: null,
    relatedTargetSearchIndex: createRelatedTargetSearchIndex(relatedTargets),
    relatedTargets,
    significantDate: null,
    source,
    sourceDocumentId: document.id,
    sourceUpdatedAt: document.updatedAt,
    tagSearchIndex: createListingTagSearchIndex([]),
    tags: [],
    title: values.title,
    url: values.url,
  }
}

export function createRelatedTargetSearchIndex(targets: readonly ContentListingTarget[]): string {
  return targets.length
    ? `|${targets.map(({ relationTo, value }) => `${relationTo}:${value}`).join('|')}|`
    : '|'
}

function getContentListingTargets(
  source: ContentListingSource,
  document: ContentListingDocument,
): ContentListingTarget[] {
  const targets: ContentListingTarget[] = []

  if (source === 'posts') {
    const post = document as Post
    for (const reference of post.relatedContent ?? []) {
      if (!isListingSource(reference.relationTo)) continue
      const id = getRelationshipId(reference.value)
      if (id !== undefined) targets.push({ relationTo: reference.relationTo, value: id })
    }
  } else if (source === 'events') {
    const event = document as Event
    const cycleID = getRelationshipId(event.cycle)
    if (cycleID !== undefined) targets.push({ relationTo: 'event-cycles', value: cycleID })
    for (const partner of event.partners ?? []) {
      const id = getRelationshipId(partner.partner)
      if (id !== undefined) targets.push({ relationTo: 'partners', value: id })
    }
  } else if (source === 'event-cycles') {
    const eventCycle = document as EventCycle
    for (const partner of eventCycle.eventDefaults.partners ?? []) {
      const id = getRelationshipId(partner.partner)
      if (id !== undefined) targets.push({ relationTo: 'partners', value: id })
    }
  }

  const seen = new Set<string>()
  return targets.filter(({ relationTo, value }) => {
    const key = `${relationTo}:${value}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function createTaxonomizableIndexData(
  source: ContentListingSource,
  document: Document | Event | EventCycle | Page | Post,
  values: {
    eventCycle?: null | number
    eventEndAt?: null | string
    eventStartAt?: null | string
    excerpt: null | string
    heroImage: null | number
    parentPage?: null | number
    significantDate: null | string
    url: string
  },
): ContentListingIndexData {
  const topics = document.topics?.flatMap((topic) => getRelationshipId(topic) ?? []) ?? []
  const tagIDs =
    document.tags?.flatMap((tag) => {
      const id = getRelationshipId(tag)
      return id === undefined ? [] : [id]
    }) ?? []

  return {
    ...createBaseIndexData(source, document, {
      excerpt: values.excerpt,
      heroImage: values.heroImage,
      title: document.title,
      url: values.url,
    }),
    topics,
    topicSearchIndex: topics.length ? createListingTagSearchIndex(topics) : '|',
    eventCycle: values.eventCycle ?? null,
    eventEndAt: values.eventEndAt ?? null,
    eventStartAt: values.eventStartAt ?? null,
    hasSignificantDate: values.significantDate !== null,
    parentPage: values.parentPage ?? null,
    significantDate: values.significantDate,
    tagSearchIndex: createListingTagSearchIndex(tagIDs),
    tags: tagIDs,
  }
}

export function createContentSearchIndexData(document: ContentListingDocument) {
  const author = 'author' in document ? getContentAuthorReference(document.author) : undefined
  const signature =
    'publicAuthorSignature' in document ? document.publicAuthorSignature?.trim() : null
  const searchDate =
    'startAt' in document
      ? document.startAt
      : 'documentDate' in document
        ? document.documentDate
        : 'publishedAt' in document
          ? document.publishedAt
          : null

  return {
    searchDate: searchDate ?? null,
    searchAuthorSignature: signature || null,
    searchAuthorGroup: !signature && author?.relationTo === 'user-groups' ? author.value : null,
  }
}
