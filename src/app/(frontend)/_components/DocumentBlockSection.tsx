import { redirect } from 'next/navigation'

import type { DocumentsBlock } from '@/payload-types'
import { getRelationshipId } from '@/lib/relationships'
import { createPaginatedURL, resolveBlockPagination } from '@/modules/content/pagination'
import {
  findDocumentListing,
  type DocumentListingSort,
  type DocumentListingView,
} from '@/modules/documents/document-listing'

import { ContentPagination } from './ContentPagination'
import { DocumentItems } from './DocumentList'

export async function DocumentBlockSection({
  block,
  blockPath,
  pathname,
  searchParams,
}: {
  block: DocumentsBlock
  blockPath: string
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}) {
  const { parameterName, requestedPage } = resolveBlockPagination({
    blockId: block.id,
    blockPath,
    enabled: Boolean(block.pagination),
    parameterPrefix: 'documents',
    searchParams,
  })
  const result = await findDocumentListing({
    categoryId: getRelationshipId(block.category),
    manualDocuments: getManualDocuments(block),
    page: requestedPage,
    pageSize: block.pageSize,
    pagination: Boolean(block.pagination),
    selectionMode: block.selectionMode,
    sort: block.sort as DocumentListingSort,
    tagId: getRelationshipId(block.tag),
  })

  if (block.pagination && requestedPage > result.totalPages) {
    redirect(createPaginatedURL(pathname, searchParams, parameterName, result.totalPages))
  }

  return (
    <section className="documentsBlock">
      {block.heading ? <h2 className="listingBlockHeading">{block.heading}</h2> : null}
      <DocumentItems
        documents={result.items}
        emptyMessage={block.emptyMessage}
        view={block.view as DocumentListingView}
      />
      {block.pagination ? (
        <ContentPagination
          currentPage={result.page}
          parameterName={parameterName}
          pathname={pathname}
          searchParams={searchParams}
          totalPages={result.totalPages}
        />
      ) : null}
    </section>
  )
}

function getManualDocuments(block: DocumentsBlock) {
  return block.items?.map((item) => item.document) ?? []
}
