import type { Payload, PayloadRequest, Where } from 'payload'

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
import { publicRequestContext } from '@/modules/content/public-access'
import type { PartnerRole } from '@/modules/events/constants'

import type { ContentListingSource } from './listing-conditions'

// The related-content migration imports the index builder from this module.
export { createContentListingIndexData } from './content-listing-index-data'

export type ContentListingDocument =
  Document | Event | EventCycle | Location | MemberProfile | Page | Partner | Post

export type PublicContentListItem =
  | { document: Document; kind: 'documents'; url: string }
  | { document: EventCycle; kind: 'event-cycles'; url: string }
  | { document: Event; kind: 'events'; url: string }
  | { contextLabel?: null | string; document: MemberProfile; kind: 'member-profiles'; url: string }
  | { document: Location; kind: 'locations'; url: string }
  | { document: Page; kind: 'pages'; url: string }
  | {
      contextLabel?: null | string
      document: Partner
      kind: 'partners'
      partnerRoles?: readonly PartnerRole[]
      url: string
    }
  | { document: Post; kind: 'posts'; url: string }

export type SelectedContentListingItem = {
  contextLabel?: null | string
  partnerRoles?: readonly PartnerRole[]
  source: ContentListingSource
  sourceDocumentId: number
  url: string
}

export async function findPublishedContentListingDocument(
  req: PayloadRequest,
  source: ContentListingSource,
  documentID: number,
  includeSearchMetadata = false,
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

  const authorSelection = includeSearchMetadata ? ({ author: true } as const) : {}
  const publicationSelection = includeSearchMetadata ? ({ publishedAt: true } as const) : {}

  switch (source) {
    case 'locations': {
      const result = await req.payload.find({ ...query, collection: 'locations' })
      return result.docs[0]
    }
    case 'documents': {
      const result = await req.payload.find({
        ...query,
        collection: 'documents',
        select: {
          ...authorSelection,
          topics: true,
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
          ...authorSelection,
          ...publicationSelection,
          topics: true,
          parent: true,
          eventDefaults: {
            partners: true,
          },
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
          ...authorSelection,
          topics: true,
          parent: true,
          cycle: true,
          endAt: true,
          excerpt: true,
          heroImage: true,
          id: true,
          partners: true,
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
          ...authorSelection,
          ...publicationSelection,
          topics: true,
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
          ...authorSelection,
          ...publicationSelection,
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
          ...authorSelection,
          topics: true,
          parent: true,
          excerpt: true,
          heroImage: true,
          id: true,
          publishedAt: true,
          relatedContent: true,
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
    locations: [],
    posts: [],
  }

  for (const item of selectedItems) idsBySource[item.source].push(item.sourceDocumentId)

  const [documents, eventCycles, events, memberProfiles, pages, partners, posts, locations] =
    await Promise.all([
      findPublishedDocuments(payload, idsBySource.documents),
      findPublishedEventCycles(payload, idsBySource['event-cycles']),
      findPublishedEvents(payload, idsBySource.events),
      findPublishedMemberProfiles(payload, idsBySource['member-profiles']),
      findPublishedPages(payload, idsBySource.pages),
      findPublishedPartners(payload, idsBySource.partners),
      findPublishedPosts(payload, idsBySource.posts),
      idsBySource.locations.length
        ? payload
            .find({
              collection: 'locations',
              context: publicRequestContext,
              overrideAccess: false,
              user: null,
              draft: false,
              pagination: false,
              depth: 0,
              where: { id: { in: idsBySource.locations } },
            })
            .then((result) => result.docs)
        : [],
    ])

  const documentsByReference = new Map<string, ContentListingDocument>([
    ...locations.map((document) => [`locations:${document.id}`, document] as const),
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
      case 'locations':
        return [{ document: document as Location, kind: item.source, url: item.url }]
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
        return [
          {
            contextLabel: item.contextLabel,
            document: document as Partner,
            kind: item.source,
            partnerRoles: item.partnerRoles,
            url: item.url,
          },
        ]
      case 'posts':
        return [{ document: document as Post, kind: item.source, url: item.url }]
    }
  })
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
      topics: true,
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
      topics: true,
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
    populate: { 'event-cycles': { slug: true, title: true } },
    select: {
      topics: true,
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
    populate: { pages: { title: true } },
    select: {
      topics: true,
      heroImage: true,
      id: true,
      listingExcerpt: true,
      parent: true,
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
      topics: true,
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
