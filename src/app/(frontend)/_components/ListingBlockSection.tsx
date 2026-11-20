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
import { resolvePageTemplateListingItems } from '@/modules/page-templates/page-template-context'

import type { ContentLayoutDocument } from './ContentLayoutRenderer'
import { normalizeContentPresentation } from '@/modules/content/content-presentation'
import {
  resolvePublicListingDecorationMedia,
  resolvePublicListingView,
} from '@/modules/content/public-listing-view'
import { parseListingAppearance } from '@/modules/content/listing-view'
import { presentListingItem } from '@/modules/content/content-listing-presentation'
import { ConfiguredContentList } from './ConfiguredContentList'
import { ContentPresentation } from './ContentPresentation'
import { ContentList } from './ContentList'
import { ContentPagination } from './ContentPagination'

type ListingBlockSectionProperties = {
  block: ListingBlock | PageTemplateListingBlock
  blockPath: string
  document: ContentLayoutDocument
  currentTarget?: CurrentListingTarget
  presentationPlacement?: 'block' | 'tab'
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
  presentationPlacement = 'block',
  searchParams,
}: ListingBlockSectionProperties) {
  const { view, legacy } = await resolvePublicListingView(block)
  const isCarousel = view.layout === 'carousel'
  const paginationEnabled = !isCarousel && Boolean(block.pagination)
  const { parameterName, requestedPage } = resolveBlockPagination({
    blockId: block.id,
    blockPath,
    enabled: paginationEnabled,
    parameterPrefix: 'listing',
    searchParams,
  })
  const usesContextRelation = block.selectionMode === 'contextRelation'
  const result = await findPublicContent({
    conditions: (block.conditions ?? []) as ListingConditionInput[],
    currentTarget,
    includeInactiveLocations: Boolean(block.includeInactiveLocations),
    manualItems: usesContextRelation
      ? resolvePageTemplateListingItems(getContextRelation(block), document)
      : getManualItems(block),
    page: isCarousel ? 1 : requestedPage,
    pageSize: isCarousel ? Math.min(block.pageSize, 20) : block.pageSize,
    pagination: paginationEnabled,
    selectionMode: usesContextRelation || block.selectionMode === 'manual' ? 'manual' : 'filters',
    sort: block.sort ?? 'newest',
    sources: (block.sources ?? []) as ContentListingSource[],
  })

  if (paginationEnabled && requestedPage > result.totalPages) {
    redirect(createPaginatedURL(pathname, searchParams, parameterName, result.totalPages))
  }

  if (block.hideWhenEmpty && result.items.length === 0) {
    return { content: null, isEmpty: true }
  }
  const media = view.decoration ? await resolvePublicListingDecorationMedia(view) : undefined
  const content = (
    <div className="listingBlock">
      {legacy ? (
        <ContentList
          columns={parseListingAppearance(block.appearance).overrides?.columns}
          emptyMessage={block.emptyMessage}
          items={result.items}
          view={legacy}
        />
      ) : (
        <ConfiguredContentList
          emptyMessage={block.emptyMessage}
          items={result.items.map((item) => presentListingItem(item, view))}
          view={view}
          media={media}
        />
      )}
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
  )
  return {
    content: view.decoration ? (
      content
    ) : (
      <ContentPresentation
        placement={presentationPlacement}
        presentation={normalizeContentPresentation(block)}
      >
        {content}
      </ContentPresentation>
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
