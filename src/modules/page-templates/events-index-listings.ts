import {
  createPaginatedURL,
  getRequestedPage,
  resolveBlockPagination,
} from '@/modules/content/pagination'
import type { ListingBlock, PageTemplate, PageTemplateListingBlock } from '@/payload-types'

export function isFilteredEventsListing(block: ListingBlock | PageTemplateListingBlock): boolean {
  return (
    block.selectionMode === 'filters' &&
    block.sources?.length === 1 &&
    block.sources[0] === 'events'
  )
}

export function resolveEventsIndexArchiveURL(
  template: PageTemplate,
  searchParams: Record<string, string | string[] | undefined>,
): string | undefined {
  const { page, ...blockSearchParams } = searchParams
  if (page === undefined) return undefined

  const archiveBlockID = findArchiveListingID([template.informationPanel, template.content])
  if (!archiveBlockID) return undefined

  const { parameterName } = resolveBlockPagination({
    blockId: archiveBlockID,
    blockPath: 'content',
    enabled: true,
    parameterPrefix: 'listing',
    searchParams: blockSearchParams,
  })
  const archivePage = getRequestedPage(blockSearchParams[parameterName] ?? page)
  return createPaginatedURL('/events', blockSearchParams, parameterName, archivePage)
}

function findArchiveListingID(blocks: unknown[]): string | undefined {
  for (const block of blocks) {
    if (Array.isArray(block)) {
      const match = findArchiveListingID(block)
      if (match) return match
      continue
    }

    if (!block || typeof block !== 'object') continue
    if ('blockType' in block && block.blockType === 'listing') {
      const listing = block as PageTemplateListingBlock
      if (
        listing.id &&
        listing.pagination &&
        listing.view !== 'carousel' &&
        isFilteredEventsListing(listing) &&
        listing.conditions?.some(
          ({ field, operator, eventTimeValue }) =>
            field === 'eventTime' && operator === 'equals' && eventTimeValue === 'past',
        )
      ) {
        return listing.id
      }
      continue
    }

    const container = block as Record<string, unknown>
    const match = findArchiveListingID(
      [container.columns, container.sections, container.tabs, container.blocks].filter(
        Array.isArray,
      ),
    )
    if (match) return match
  }
  return undefined
}
