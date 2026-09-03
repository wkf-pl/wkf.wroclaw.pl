import { redirect } from 'next/navigation'

import type { Event, EventCycle, ListingBlock, Page, Partner, Post } from '@/payload-types'
import { getRelationshipId } from '@/lib/relationships'
import { createBlockParameterSuffix } from '@/modules/content/block-parameter-name'
import {
  findPublicContent,
  type TaxonomizableCollectionSlug,
} from '@/modules/content/content-listing'

import { ContentList } from './ContentList'
import { ContentPagination, createPaginatedURL, getRequestedPage } from './ContentPagination'

type ContentDocument = Event | EventCycle | Page | Partner | Post

export async function ListingBlockSection({
  block,
  blockPath,
  document,
  pathname,
  searchParams,
}: {
  block: ListingBlock
  blockPath: string
  document: ContentDocument
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}) {
  const parameterSuffix = createBlockParameterSuffix(block.id, blockPath)
  const parameterName = `listing_${parameterSuffix}`
  const requestedPage = block.pagination ? getRequestedPage(searchParams[parameterName]) : 1
  const parentId = getListingParentId(block, document)
  const result = await findPublicContent({
    categoryId: getRelationshipId(block.category),
    eventCycleId:
      getRelationshipId(block.eventCycle) ??
      ('calendarFeedKey' in document ? document.id : undefined),
    eventTimeFilter: block.eventTimeFilter ?? 'all',
    page: requestedPage,
    pageSize: block.pageSize,
    pagination: Boolean(block.pagination),
    parentId,
    sort: block.sort,
    sources: block.sources as TaxonomizableCollectionSlug[],
    tagId: getRelationshipId(block.tag),
  })

  if (block.pagination && requestedPage > result.totalPages) {
    redirect(createPaginatedURL(pathname, searchParams, parameterName, result.totalPages))
  }

  return (
    <section className="listingBlock">
      {block.heading ? <h2 className="listingBlockHeading">{block.heading}</h2> : null}
      <ContentList emptyMessage={block.emptyMessage} items={result.items} view={block.view} />
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

function getListingParentId(
  block: ListingBlock,
  document: Pick<ContentDocument, 'id'>,
): number | undefined {
  if (block.parentFilter === 'current') {
    return document.id
  }

  return block.parentFilter === 'specific' ? getRelationshipId(block.parentPage) : undefined
}
