import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { Document } from '@/payload-types'
import { findCategorySubtreeIDs } from '@/modules/content/category-hierarchy'
import { publicRequestContext } from '@/modules/content/public-access'

export type DocumentListingSort = 'newest' | 'oldest' | 'titleAscending' | 'titleDescending'
export type DocumentListingView = 'cards' | 'grid' | 'list'

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
  const page = options.pagination ? Math.max(1, Math.floor(options.page)) : 1
  const pageSize = Math.min(100, Math.max(1, Math.floor(options.pageSize)))

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
  const documentIds = (options.manualDocuments ?? []).map((document) =>
    typeof document === 'number' ? document : document.id,
  )
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
    const documentsById = new Map(result.docs.map((document) => [document.id, document]))
    documents = documentIds.flatMap((documentId) => {
      const document = documentsById.get(documentId)
      return document ? [document] : []
    })
  }

  const totalDocs = documents.length
  const totalPages = options.pagination ? Math.max(1, Math.ceil(totalDocs / pageSize)) : 1
  const offset = options.pagination ? (page - 1) * pageSize : 0

  return {
    items: documents.slice(offset, offset + pageSize),
    page,
    pageSize,
    totalDocs,
    totalPages,
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
