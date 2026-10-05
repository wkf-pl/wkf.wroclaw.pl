import { redirect } from 'next/navigation'

import type { Event, EventCycle, ListingBlock, Page, Partner, Post } from '@/payload-types'
import { getRelationshipId } from '@/lib/relationships'
import { createPaginatedURL, resolveBlockPagination } from '@/modules/content/pagination'
import {
  findPublicContent,
  type TaxonomizableCollectionSlug,
} from '@/modules/content/content-listing'

import { ContentList } from './ContentList'
import { ContentPagination } from './ContentPagination'

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
  const { parameterName, requestedPage } = resolveBlockPagination({
    blockId: block.id,
    blockPath,
    enabled: Boolean(block.pagination),
    parameterPrefix: 'listing',
    searchParams,
  })
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
    <div className="listingBlock">
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
    </div>
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
