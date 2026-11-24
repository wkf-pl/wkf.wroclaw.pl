import { contentParentKey, getContentParent } from './content-parent'
import { refreshListingAncestry } from './listing-ancestry-sql'
import { getTransactionExecutor } from './lock-content-owners'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, PayloadRequest } from 'payload'

import { getRelationshipId } from '@/lib/relationships'
import { invalidateContentSource } from '@/modules/cache/invalidate-public-data'
import { allListingSources, type ContentListingSource } from '@/modules/content/listing-conditions'

import {
  createContentListingIndexData,
  createContentSearchIndexData,
} from './content-listing-index-data'
import { findPublishedContentListingDocument } from './content-listing-sources'

export const contentListingSyncContextKey = 'skipContentListingSync'

export async function syncContentListingItem(
  req: PayloadRequest,
  source: ContentListingSource,
  documentID: number,
  options: { rebuild?: boolean } = {},
): Promise<boolean> {
  const [publishedDocument, existingResult] = await Promise.all([
    findPublishedContentListingDocument(req, source, documentID, true),
    req.payload.find({
      collection: 'content-listing-items',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      req,
      select: {
        sourceUpdatedAt: true,
        contentParent: true,
        searchAuthor: true,
      },
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
      if (!options.rebuild && isContentParentSource(source)) await updateAncestry(req)
      return true
    }
    return false
  }

  const searchMetadata = createContentSearchIndexData(publishedDocument)
  if (
    !options.rebuild &&
    existingItem?.sourceUpdatedAt === publishedDocument.updatedAt &&
    (getRelationshipId(existingItem.searchAuthor) ?? null) === searchMetadata.searchAuthor
  )
    return false
  const parent = getContentParent({
    parent: 'parent' in publishedDocument ? publishedDocument.parent : undefined,
    cycle: 'cycle' in publishedDocument ? publishedDocument.cycle : undefined,
  })
  const contentParent = parent ? contentParentKey(parent) : null
  const data = {
    ...createContentListingIndexData(source, publishedDocument),
    ...searchMetadata,
    contentParent,
  }

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
  if (!options.rebuild && contentParent !== (existingItem?.contentParent ?? null)) {
    await updateAncestry(req)
  }
  return true
}

function isContentParentSource(source: string): boolean {
  return source === 'pages' || source === 'event-cycles'
}

async function updateAncestry(req: PayloadRequest): Promise<void> {
  const execute = (await req.transactionID)
    ? await getTransactionExecutor(req)
    : req.payload.db.drizzle.execute.bind(req.payload.db.drizzle)
  await execute(refreshListingAncestry)
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
    if (isContentParentSource(collection.slug)) await updateAncestry(req)
  }
  invalidateContentSource(collection.slug)
  return doc
}
