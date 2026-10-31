import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import { invalidateContentSource } from '@/modules/cache/invalidate-public-data'
import { allListingSources, type ContentListingSource } from '@/modules/content/listing-conditions'

import {
  createContentListingIndexData,
  findPublishedContentListingDocument,
} from './content-listing-sources'

export const contentListingSyncContextKey = 'skipContentListingSync'

export async function syncContentListingItem(
  req: PayloadRequest,
  source: ContentListingSource,
  documentID: number,
): Promise<boolean> {
  const [publishedDocument, existingResult] = await Promise.all([
    findPublishedContentListingDocument(req, source, documentID),
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
  const data = createContentListingIndexData(source, publishedDocument)
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

function isContentListingSource(value: string): value is ContentListingSource {
  return allListingSources.some((source) => source === value)
}

export const syncContentListingAfterChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  req,
}) => {
  if (req.context?.[contentListingSyncContextKey] || !isContentListingSource(collection.slug)) {
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
  if (req.context?.[contentListingSyncContextKey] || !isContentListingSource(collection.slug)) {
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
