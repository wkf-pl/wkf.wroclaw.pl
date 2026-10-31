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
  type ContentListingSource,
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
  const isCarousel = block.view === 'carousel'
  const paginationEnabled = !isCarousel && Boolean(block.pagination)
  const { parameterName, requestedPage } = resolveBlockPagination({
    blockId: block.id,
    blockPath,
    enabled: paginationEnabled,
    parameterPrefix: 'listing',
    searchParams,
  })
  const result = await findPublicContent({
    conditions: (block.conditions ?? []) as ListingConditionInput[],
    manualItems: getManualItems(block),
    page: isCarousel ? 1 : requestedPage,
    pageSize: block.pageSize,
    pagination: paginationEnabled,
    selectionMode: block.selectionMode,
    sort: block.sort ?? 'newest',
    sources: (block.sources ?? []) as ContentListingSource[],
  })

  if (paginationEnabled && requestedPage > result.totalPages) {
    redirect(createPaginatedURL(pathname, searchParams, parameterName, result.totalPages))
  }

  return {
    content:
      block.hideWhenEmpty && result.items.length === 0 ? null : (
        <div className="listingBlock">
          <ContentList emptyMessage={block.emptyMessage} items={result.items} view={block.view} />
          {paginationEnabled ? (
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
  return (block.items?.map(({ contextLabel, item }) => ({
    contextLabel,
    ...item,
  })) ?? []) as ManualContentReference[]
}
