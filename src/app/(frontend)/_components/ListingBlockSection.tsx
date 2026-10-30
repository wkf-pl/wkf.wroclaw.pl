import { redirect } from 'next/navigation'

import type {
  Event,
  EventCycle,
  HomepageSection,
  ListingBlock,
  Page,
  Partner,
  Post,
} from '@/payload-types'
import { createPaginatedURL, resolveBlockPagination } from '@/modules/content/pagination'
import {
  findPublicContent,
  type ManualContentReference,
  type TaxonomizableCollectionSlug,
} from '@/modules/content/content-listing'
import type { ListingConditionInput } from '@/modules/content/listing-conditions'

import { ContentList } from './ContentList'
import { ContentPagination } from './ContentPagination'

type ContentDocument = Event | EventCycle | HomepageSection | Page | Partner | Post

type ListingBlockSectionProperties = {
  block: ListingBlock
  blockPath: string
  document: ContentDocument
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}

export async function ListingBlockSection(properties: ListingBlockSectionProperties) {
  return (await resolveListingBlockSection(properties)).content
}

export async function resolveListingBlockSection({
  block,
  blockPath,
  pathname,
  searchParams,
}: ListingBlockSectionProperties) {
  const { parameterName, requestedPage } = resolveBlockPagination({
    blockId: block.id,
    blockPath,
    enabled: Boolean(block.pagination),
    parameterPrefix: 'listing',
    searchParams,
  })
  const result = await findPublicContent({
    conditions: (block.conditions ?? []) as ListingConditionInput[],
    manualItems: getManualItems(block),
    page: requestedPage,
    pageSize: block.pageSize,
    pagination: Boolean(block.pagination),
    selectionMode: block.selectionMode,
    sort: block.sort ?? 'newest',
    sources: (block.sources ?? []) as TaxonomizableCollectionSlug[],
  })

  if (block.pagination && requestedPage > result.totalPages) {
    redirect(createPaginatedURL(pathname, searchParams, parameterName, result.totalPages))
  }

  return {
    content: (
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
    ),
    isEmpty: result.items.length === 0,
  }
}

function getManualItems(block: ListingBlock): ManualContentReference[] {
  return (block.items?.map(({ item }) => item) ?? []) as ManualContentReference[]
}
