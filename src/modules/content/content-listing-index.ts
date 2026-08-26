import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import type { Event, EventCycle, Page, Post } from '@/payload-types'
import { invalidateContentSource } from '@/modules/cache/invalidate-public-data'

import type { TaxonomizableCollectionSlug, TaxonomizableDocument } from './content-listing'

export const contentListingSyncContextKey = 'skipContentListingSync'

const contentListingSourceSelect = {
  category: true,
  createdAt: true,
  cycle: true,
  endAt: true,
  excerpt: true,
  heroImage: true,
  id: true,
  listingExcerpt: true,
  parent: true,
  publishedAt: true,
  slug: true,
  startAt: true,
  tags: true,
  title: true,
  updatedAt: true,
} as const

function relationshipID(value: null | number | { id: number } | undefined): number | undefined {
  return typeof value === 'number'
    ? value
    : value && typeof value === 'object'
      ? value.id
      : undefined
}

function buildPublicURL(source: TaxonomizableCollectionSlug, slug: string): string {
  if (source === 'posts') return `/blog/${slug}`
  if (source === 'events') return `/events/${slug}`
  if (source === 'event-cycles') return `/events/series/${slug}`
  return `/${slug}`
}

function createIndexData(source: TaxonomizableCollectionSlug, document: TaxonomizableDocument) {
  const event = source === 'events' ? (document as Event) : null
  const cycle = source === 'event-cycles' ? (document as EventCycle) : null
  const page = source === 'pages' ? (document as Page) : null
  const post = source === 'posts' ? (document as Post) : null

  return {
    category: relationshipID(document.category),
    eventCycle: event ? relationshipID(event.cycle) : null,
    eventEndAt: event?.endAt ?? null,
    eventStartAt: event?.startAt ?? null,
    excerpt:
      page?.listingExcerpt?.trim() || post?.excerpt || event?.excerpt || cycle?.excerpt || null,
    heroImage: relationshipID(document.heroImage),
    parentPage: page ? relationshipID(page.parent) : null,
    sortDate: event?.startAt ?? document.publishedAt ?? document.createdAt,
    source,
    sourceDocumentId: document.id,
    sourceUpdatedAt: document.updatedAt,
    tags:
      document.tags?.flatMap((tag) => {
        const id = relationshipID(tag)
        return id === undefined ? [] : [id]
      }) ?? [],
    title: document.title,
    url: buildPublicURL(source, document.slug),
  }
}

export async function syncContentListingItem(
  req: PayloadRequest,
  source: TaxonomizableCollectionSlug,
  documentID: number,
): Promise<boolean> {
  const [publishedResult, existingResult] = await Promise.all([
    req.payload.find({
      collection: source,
      depth: 0,
      draft: false,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      req,
      select: contentListingSourceSelect,
      where: { and: [{ id: { equals: documentID } }, { _status: { equals: 'published' } }] },
    }),
    req.payload.find({
      collection: 'content-listing-items',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      req,
      where: {
        and: [{ source: { equals: source } }, { sourceDocumentId: { equals: documentID } }],
      },
    }),
  ])

  const publishedDocument = publishedResult.docs[0] as TaxonomizableDocument | undefined
  const existingItem = existingResult.docs[0]
  if (!publishedDocument) {
    if (existingItem) {
      await req.payload.delete({
        collection: 'content-listing-items',
        id: existingItem.id,
        overrideAccess: true,
        req,
      })
      return true
    }
    return false
  }

  if (existingItem?.sourceUpdatedAt === publishedDocument.updatedAt) return false
  const data = createIndexData(source, publishedDocument)
  if (existingItem) {
    await req.payload.update({
      collection: 'content-listing-items',
      data,
      id: existingItem.id,
      overrideAccess: true,
      req,
    })
  } else {
    await req.payload.create({
      collection: 'content-listing-items',
      data,
      overrideAccess: true,
      req,
    })
  }
  return true
}

function isTaxonomizableCollection(value: string): value is TaxonomizableCollectionSlug {
  return value === 'pages' || value === 'posts' || value === 'events' || value === 'event-cycles'
}

export const syncContentListingAfterChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  req,
}) => {
  if (req.context?.[contentListingSyncContextKey] || !isTaxonomizableCollection(collection.slug)) {
    return doc
  }
  if (await syncContentListingItem(req, collection.slug, doc.id)) {
    invalidateContentSource(collection.slug)
  }
  return doc
}

export const removeContentListingAfterDelete: CollectionAfterDeleteHook = async ({
  collection,
  doc,
  req,
}) => {
  if (req.context?.[contentListingSyncContextKey] || !isTaxonomizableCollection(collection.slug)) {
    return doc
  }
  const indexed = await req.payload.find({
    collection: 'content-listing-items',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    req,
    where: {
      and: [{ source: { equals: collection.slug } }, { sourceDocumentId: { equals: doc.id } }],
    },
  })
  if (indexed.docs[0]) {
    await req.payload.delete({
      collection: 'content-listing-items',
      id: indexed.docs[0].id,
      overrideAccess: true,
      req,
    })
  }
  invalidateContentSource(collection.slug)
  return doc
}
