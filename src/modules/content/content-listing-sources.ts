import type { Payload, PayloadRequest, Where } from 'payload'

import type {
  Document,
  Event,
  EventCycle,
  MemberProfile,
  Page,
  Partner,
  Post,
} from '@/payload-types'
import { getRelationshipId } from '@/lib/relationships'
import { publicRequestContext } from '@/modules/content/public-access'
import { extractRichTextText } from '@/modules/content/rich-text'

import {
  createListingTagSearchIndex,
  normalizeListingTitle,
  type ContentListingSource,
} from './listing-conditions'

export type ContentListingDocument =
  Document | Event | EventCycle | MemberProfile | Page | Partner | Post

export type PublicContentListItem =
  | { document: Document; kind: 'documents'; url: string }
  | { document: EventCycle; kind: 'event-cycles'; url: string }
  | { document: Event; kind: 'events'; url: string }
  | { contextLabel?: null | string; document: MemberProfile; kind: 'member-profiles'; url: string }
  | { document: Page; kind: 'pages'; url: string }
  | { document: Partner; kind: 'partners'; url: string }
  | { document: Post; kind: 'posts'; url: string }

export type SelectedContentListingItem = {
  contextLabel?: null | string
  source: ContentListingSource
  sourceDocumentId: number
  url: string
}

export type ContentListingIndexData = {
  category: null | number
  eventCycle: null | number
  eventEndAt: null | string
  eventStartAt: null | string
  excerpt: null | string
  hasSignificantDate: boolean
  heroImage: null | number
  normalizedTitle: string
  parentPage: null | number
  significantDate: null | string
  source: ContentListingSource
  sourceDocumentId: number
  sourceUpdatedAt: string
  tagSearchIndex: string
  tags: number[]
  title: string
  url: string
}

export async function findPublishedContentListingDocument(
  req: PayloadRequest,
  source: ContentListingSource,
  documentID: number,
): Promise<ContentListingDocument | undefined> {
  const where: Where = {
    and: [{ id: { equals: documentID } }, { _status: { equals: 'published' } }],
  }
  const query = {
    depth: 0 as const,
    draft: false,
    limit: 1,
    overrideAccess: true,
    pagination: false as const,
    req,
    where,
  }

  switch (source) {
    case 'documents': {
      const result = await req.payload.find({
        ...query,
        collection: 'documents',
        select: {
          category: true,
          documentDate: true,
          id: true,
          slug: true,
          summary: true,
          tags: true,
          title: true,
          updatedAt: true,
        },
      })
      return result.docs[0]
    }
    case 'event-cycles': {
      const result = await req.payload.find({
        ...query,
        collection: 'event-cycles',
        select: {
          category: true,
          excerpt: true,
          heroImage: true,
          id: true,
          slug: true,
          tags: true,
          title: true,
          updatedAt: true,
        },
      })
      return result.docs[0]
    }
    case 'events': {
      const result = await req.payload.find({
        ...query,
        collection: 'events',
        select: {
          category: true,
          cycle: true,
          endAt: true,
          excerpt: true,
          heroImage: true,
          id: true,
          slug: true,
          startAt: true,
          tags: true,
          title: true,
          updatedAt: true,
        },
      })
      return result.docs[0]
    }
    case 'member-profiles': {
      const result = await req.payload.find({
        ...query,
        collection: 'member-profiles',
        select: {
          about: true,
          id: true,
          publicName: true,
          slug: true,
          updatedAt: true,
        },
      })
      return result.docs[0]
    }
    case 'pages': {
      const result = await req.payload.find({
        ...query,
        collection: 'pages',
        select: {
          category: true,
          heroImage: true,
          id: true,
          listingExcerpt: true,
          parent: true,
          slug: true,
          tags: true,
          title: true,
          updatedAt: true,
        },
      })
      return result.docs[0]
    }
    case 'partners': {
      const result = await req.payload.find({
        ...query,
        collection: 'partners',
        select: {
          excerpt: true,
          heroImage: true,
          id: true,
          name: true,
          slug: true,
          updatedAt: true,
        },
      })
      return result.docs[0]
    }
    case 'posts': {
      const result = await req.payload.find({
        ...query,
        collection: 'posts',
        select: {
          category: true,
          excerpt: true,
          heroImage: true,
          id: true,
          publishedAt: true,
          slug: true,
          tags: true,
          title: true,
          updatedAt: true,
        },
      })
      return result.docs[0]
    }
  }
}

export function createContentListingIndexData(
  source: ContentListingSource,
  document: ContentListingDocument,
): ContentListingIndexData {
  switch (source) {
    case 'documents':
      return createTaxonomizableIndexData(source, document as Document, {
        excerpt: (document as Document).summary?.trim() || null,
        heroImage: null,
        significantDate: (document as Document).documentDate,
        url: `/dokumenty/${document.slug}`,
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

export async function hydrateContentListingItems(
  payload: Payload,
  selectedItems: readonly SelectedContentListingItem[],
): Promise<PublicContentListItem[]> {
  const idsBySource: Record<ContentListingSource, number[]> = {
    documents: [],
    'event-cycles': [],
    events: [],
    'member-profiles': [],
    pages: [],
    partners: [],
    posts: [],
  }

  for (const item of selectedItems) idsBySource[item.source].push(item.sourceDocumentId)

  const [documents, eventCycles, events, memberProfiles, pages, partners, posts] =
    await Promise.all([
      findPublishedDocuments(payload, idsBySource.documents),
      findPublishedEventCycles(payload, idsBySource['event-cycles']),
      findPublishedEvents(payload, idsBySource.events),
      findPublishedMemberProfiles(payload, idsBySource['member-profiles']),
      findPublishedPages(payload, idsBySource.pages),
      findPublishedPartners(payload, idsBySource.partners),
      findPublishedPosts(payload, idsBySource.posts),
    ])

  const documentsByReference = new Map<string, ContentListingDocument>([
    ...documents.map((document) => [`documents:${document.id}`, document] as const),
    ...eventCycles.map((document) => [`event-cycles:${document.id}`, document] as const),
    ...events.map((document) => [`events:${document.id}`, document] as const),
    ...memberProfiles.map((document) => [`member-profiles:${document.id}`, document] as const),
    ...pages.map((document) => [`pages:${document.id}`, document] as const),
    ...partners.map((document) => [`partners:${document.id}`, document] as const),
    ...posts.map((document) => [`posts:${document.id}`, document] as const),
  ])

  return selectedItems.flatMap((item): PublicContentListItem[] => {
    const document = documentsByReference.get(`${item.source}:${item.sourceDocumentId}`)
    if (!document) return []

    switch (item.source) {
      case 'documents':
        return [{ document: document as Document, kind: item.source, url: item.url }]
      case 'event-cycles':
        return [{ document: document as EventCycle, kind: item.source, url: item.url }]
      case 'events':
        return [{ document: document as Event, kind: item.source, url: item.url }]
      case 'member-profiles':
        return [
          {
            contextLabel: item.contextLabel,
            document: document as MemberProfile,
            kind: item.source,
            url: item.url,
          },
        ]
      case 'pages':
        return [{ document: document as Page, kind: item.source, url: item.url }]
      case 'partners':
        return [{ document: document as Partner, kind: item.source, url: item.url }]
      case 'posts':
        return [{ document: document as Post, kind: item.source, url: item.url }]
    }
  })
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
  return {
    category: null,
    eventCycle: null,
    eventEndAt: null,
    eventStartAt: null,
    excerpt: values.excerpt,
    hasSignificantDate: false,
    heroImage: values.heroImage ?? null,
    normalizedTitle: normalizeListingTitle(values.title),
    parentPage: null,
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
    category: getRelationshipId(document.category) ?? null,
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

function uniqueIDs(ids: readonly number[]): number[] {
  return [...new Set(ids)]
}

async function findPublishedDocuments(
  payload: Payload,
  ids: readonly number[],
): Promise<Document[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'documents',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    select: {
      category: true,
      documentDate: true,
      documentNumber: true,
      documentType: true,
      id: true,
      slug: true,
      summary: true,
      tags: true,
      title: true,
    },
    user: null,
    where: { id: { in: uniqueIDs(ids) } },
  })
  return result.docs
}

async function findPublishedEventCycles(
  payload: Payload,
  ids: readonly number[],
): Promise<EventCycle[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'event-cycles',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    select: {
      category: true,
      excerpt: true,
      heroImage: true,
      id: true,
      slug: true,
      tags: true,
      title: true,
    },
    user: null,
    where: { id: { in: uniqueIDs(ids) } },
  })
  return result.docs
}

async function findPublishedEvents(payload: Payload, ids: readonly number[]): Promise<Event[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'events',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    select: {
      category: true,
      cycle: true,
      endAt: true,
      excerpt: true,
      heroImage: true,
      id: true,
      location: true,
      slug: true,
      startAt: true,
      tags: true,
      timeMode: true,
      title: true,
    },
    user: null,
    where: { id: { in: uniqueIDs(ids) } },
  })
  return result.docs
}

async function findPublishedMemberProfiles(
  payload: Payload,
  ids: readonly number[],
): Promise<MemberProfile[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'member-profiles',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    select: {
      about: true,
      clubFunction: true,
      id: true,
      interests: true,
      photo: true,
      publicName: true,
      slug: true,
    },
    user: null,
    where: { id: { in: uniqueIDs(ids) } },
  })
  return result.docs
}

async function findPublishedPages(payload: Payload, ids: readonly number[]): Promise<Page[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'pages',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    select: {
      category: true,
      heroImage: true,
      id: true,
      layout: true,
      listingExcerpt: true,
      slug: true,
      tags: true,
      title: true,
    },
    user: null,
    where: { id: { in: uniqueIDs(ids) } },
  })
  return result.docs
}

async function findPublishedPartners(payload: Payload, ids: readonly number[]): Promise<Partner[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'partners',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    select: {
      excerpt: true,
      heroImage: true,
      id: true,
      name: true,
      slug: true,
    },
    user: null,
    where: { id: { in: uniqueIDs(ids) } },
  })
  return result.docs
}

async function findPublishedPosts(payload: Payload, ids: readonly number[]): Promise<Post[]> {
  if (!ids.length) return []
  const result = await payload.find({
    collection: 'posts',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    overrideAccess: false,
    pagination: false,
    select: {
      category: true,
      excerpt: true,
      heroImage: true,
      id: true,
      publishedAt: true,
      slug: true,
      tags: true,
      title: true,
    },
    user: null,
    where: { id: { in: uniqueIDs(ids) } },
  })
  return result.docs
}
