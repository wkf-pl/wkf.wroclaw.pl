import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { Document } from '@/payload-types'
import { getRelationshipIds } from '@/lib/relationships'
import { findCategorySubtreeIDs } from '@/modules/content/category-hierarchy'
import {
  normalizeListingWindow,
  paginateInMemory,
  restoreRelationshipOrder,
} from '@/modules/content/listing-window'
import { publicRequestContext } from '@/modules/content/public-access'

export type DocumentListingSort = 'newest' | 'oldest' | 'titleAscending' | 'titleDescending'
export type DocumentListingView = 'cards' | 'carousel' | 'grid' | 'list' | 'tiles'

export type FindDocumentListingOptions = {
  categoryId?: number
  manualDocuments?: (Document | number)[]
  page: number
  pageSize: number
  pagination: boolean
  selectionMode: 'filters' | 'manual'
  sort: DocumentListingSort
  tagId?: number
}

export type PublicDocumentListingResult = {
  items: Document[]
  page: number
  pageSize: number
  totalDocs: number
  totalPages: number
}

export async function findDocumentListing(
  options: FindDocumentListingOptions,
): Promise<PublicDocumentListingResult> {
  const { page, pageSize } = normalizeListingWindow(options)

  if (options.selectionMode === 'manual') {
    return findManualDocuments(options, page, pageSize)
  }

  const payload = await getPayload({ config })
  const categoryIds =
    options.categoryId === undefined ? undefined : await findCategorySubtreeIDs(options.categoryId)
  const conditions: Where[] = [{ _status: { equals: 'published' } }]

  if (categoryIds !== undefined) {
    conditions.push({ category: { in: categoryIds } })
  }
  if (options.tagId !== undefined) {
    conditions.push({ tags: { equals: options.tagId } })
  }

  const result = await payload.find({
    collection: 'documents',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    limit: pageSize,
    overrideAccess: false,
    page,
    sort: getPayloadSort(options.sort),
    user: null,
    where: { and: conditions },
  })

  return {
    items: result.docs,
    page,
    pageSize,
    totalDocs: result.totalDocs,
    totalPages: options.pagination ? Math.max(1, result.totalPages) : 1,
  }
}

async function findManualDocuments(
  options: FindDocumentListingOptions,
  page: number,
  pageSize: number,
): Promise<PublicDocumentListingResult> {
  const documentIds = getRelationshipIds(options.manualDocuments)
  let documents: Document[] = []

  if (documentIds.length > 0) {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'documents',
      context: publicRequestContext,
      depth: 1,
      draft: false,
      limit: documentIds.length,
      overrideAccess: false,
      pagination: false,
      user: null,
      where: {
        and: [{ id: { in: [...new Set(documentIds)] } }, { _status: { equals: 'published' } }],
      },
    })
    documents = restoreRelationshipOrder(documentIds, result.docs)
  }

  const pageResult = paginateInMemory(documents, {
    page,
    pageSize,
    pagination: options.pagination,
  })

  return {
    items: pageResult.items,
    page: pageResult.page,
    pageSize: pageResult.pageSize,
    totalDocs: pageResult.totalDocs,
    totalPages: pageResult.totalPages,
  }
}

function getPayloadSort(sort: DocumentListingSort): string[] {
  switch (sort) {
    case 'oldest':
      return ['documentDate', 'title', 'id']
    case 'titleAscending':
      return ['title', '-documentDate', 'id']
    case 'titleDescending':
      return ['-title', '-documentDate', 'id']
    default:
      return ['-documentDate', 'title', 'id']
  }
}
