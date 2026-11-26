import { getRelationshipId } from '@/lib/relationships'
import { redirect } from 'next/navigation'

import type { ListingBlock, PageTemplateListingBlock } from '@/payload-types'
import { createPaginatedURL, resolveBlockPagination } from '@/modules/content/pagination'
import {
  findContentSearchOptions,
  findPublicContent,
  type ManualContentReference,
  type ContentListingSource,
} from '@/modules/content/content-listing'
import { supportsContentSearchFilter } from '@/modules/content/content-search-filters'
import {
  getContentSearchParameterNames,
  getPreservedSearchParameters,
  parseContentSearchFilters,
} from '@/modules/content/content-search-parameters'
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
import { ContentSearchForm } from './ContentSearchForm'
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
  const isSearch = block.selectionMode === 'filters' && block.searchEnabled === true
  const isCarousel = view.layout === 'carousel'
  const paginationEnabled = !isCarousel && Boolean(block.pagination)
  const { parameterName, requestedPage } = resolveBlockPagination({
    blockId: block.id,
    blockPath,
    enabled: paginationEnabled,
    parameterPrefix: block.legacySearchParameters ? 'search' : 'listing',
    searchParams,
  })
  const sources = (block.sources ?? []) as ContentListingSource[]
  const scope = {
    conditions: (block.conditions ?? []) as ListingConditionInput[],
    currentTarget,
    includeInactiveLocations: Boolean(block.includeInactiveLocations),
    sources,
  }
  const enabled = isSearch
    ? {
        branch: block.filterBranch === true && supportsContentSearchFilter('branch', sources),
        phrase: block.filterPhrase !== false && supportsContentSearchFilter('phrase', sources),
        date: block.filterDate !== false && supportsContentSearchFilter('date', sources),
        tags: block.filterTags !== false && supportsContentSearchFilter('tags', sources),
        topic: block.filterTopic !== false && supportsContentSearchFilter('topic', sources),
        author: block.filterAuthor !== false && supportsContentSearchFilter('author', sources),
        contentType:
          block.filterContentType !== false && supportsContentSearchFilter('contentType', sources),
      }
    : undefined
  const names = getContentSearchParameterNames(parameterName, Boolean(block.legacySearchParameters))
  const groups = isSearch
    ? block.filterTagGroups?.flatMap((group) => getRelationshipId(group) ?? [])
    : []
  const options = enabled
    ? await findContentSearchOptions(scope, {
        topics: enabled.topic,
        tags: enabled.tags,
        author: enabled.author,
        branches: enabled.branch,
        contentType: enabled.contentType,
        groups,
      })
    : undefined
  const availableSources = block.legacySearchParameters ? sources : (options?.sources ?? sources)
  const selection =
    enabled && options
      ? parseContentSearchFilters({
          enabled,
          names,
          options,
          parameters: searchParams,
          sources: availableSources,
        })
      : undefined
  const usesContextRelation = block.selectionMode === 'contextRelation'
  const query = {
    ...scope,
    manualItems: isSearch
      ? undefined
      : usesContextRelation
        ? resolvePageTemplateListingItems(getContextRelation(block), document)
        : getManualItems(block),
    page: isCarousel ? 1 : requestedPage,
    pageSize: isCarousel ? Math.min(block.pageSize, 20) : block.pageSize,
    pagination: paginationEnabled,
    selectionMode:
      usesContextRelation || (!isSearch && block.selectionMode === 'manual')
        ? ('manual' as const)
        : ('filters' as const),
    sort: block.sort ?? 'newest',
  }
  const searchFilters =
    selection && Object.keys(selection.filters).length ? selection.filters : undefined
  const result = await findPublicContent(searchFilters ? { ...query, searchFilters } : query)

  if (paginationEnabled && requestedPage > result.totalPages) {
    redirect(createPaginatedURL(pathname, searchParams, parameterName, result.totalPages))
  }

  const isEmpty = result.items.length === 0
  if (block.hideWhenEmpty && isEmpty && !selection?.hasInput) {
    return { content: null, isEmpty: true }
  }
  const emptyMessage =
    block.emptyMessage || (isSearch ? 'Brak treści pasujących do filtrów.' : undefined)
  const media = view.decoration ? await resolvePublicListingDecorationMedia(view) : undefined
  const content = (
    <div className="listingBlock">
      {enabled &&
      options &&
      selection &&
      (Object.values(enabled).some(Boolean) || Boolean(options.tagGroups?.length)) ? (
        <ContentSearchForm
          enabled={enabled}
          names={names}
          options={options}
          pathname={pathname}
          pageParameter={parameterName}
          preservedParameters={getPreservedSearchParameters(searchParams, names, parameterName)}
          selection={selection}
          sources={availableSources}
        />
      ) : null}
      {legacy ? (
        <ContentList
          columns={parseListingAppearance(block.appearance).overrides?.columns}
          emptyMessage={emptyMessage}
          items={result.items}
          view={legacy}
        />
      ) : (
        <ConfiguredContentList
          emptyMessage={emptyMessage}
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
    isEmpty: isEmpty && !selection?.hasInput,
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
