import { redirect } from 'next/navigation'

import type { ListingBlock, PageTemplateListingBlock } from '@/payload-types'
import { createPaginatedURL, resolveBlockPagination } from '@/modules/content/pagination'
import {
  findPublicContent,
  type ManualContentReference,
  type ContentListingSource,
} from '@/modules/content/content-listing'
import type { ListingConditionInput } from '@/modules/content/listing-conditions'
import type { CurrentListingTarget } from '@/modules/content/listing-conditions'
import { isFilteredEventsListing } from '@/modules/page-templates/events-index-listings'
import { resolvePageTemplateListingItems } from '@/modules/page-templates/page-template-context'

import type { ContentLayoutDocument } from './ContentLayoutRenderer'
import { ContentList } from './ContentList'
import { ContentPagination } from './ContentPagination'

type ListingBlockSectionProperties = {
  block: ListingBlock | PageTemplateListingBlock
  blockPath: string
  document: ContentLayoutDocument
  currentTarget?: CurrentListingTarget
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
}

export async function ListingBlockSection(properties: ListingBlockSectionProperties) {
  return (await resolveListingBlockSection(properties)).content
}

export async function resolveListingBlockSection({
  block,
  blockPath,
  currentTarget,
  document,
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
  const usesContextRelation = block.selectionMode === 'contextRelation'
  const usesEventsIndexTime =
    'templateKey' in document &&
    document.templateKey === 'events-index' &&
    isFilteredEventsListing(block)
  const result = await findPublicContent({
    conditions: (block.conditions ?? []) as ListingConditionInput[],
    currentTarget,
    eventTimeScope: usesEventsIndexTime ? 'eventsIndex' : undefined,
    manualItems: usesContextRelation
      ? resolvePageTemplateListingItems(getContextRelation(block), document)
      : getManualItems(block),
    page: isCarousel ? 1 : requestedPage,
    pageSize: block.pageSize,
    pagination: paginationEnabled,
    selectionMode: usesContextRelation || block.selectionMode === 'manual' ? 'manual' : 'filters',
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

function getManualItems(block: ListingBlock | PageTemplateListingBlock): ManualContentReference[] {
  return (block.items?.map(({ contextLabel, item }) => ({
    contextLabel,
    ...item,
  })) ?? []) as ManualContentReference[]
}

function getContextRelation(block: ListingBlock | PageTemplateListingBlock): string | undefined {
  return 'contextRelation' in block ? (block.contextRelation ?? undefined) : undefined
}
