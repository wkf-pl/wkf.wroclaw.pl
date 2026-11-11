import {
  createPaginatedURL,
  getRequestedPage,
  resolveBlockPagination,
} from '@/modules/content/pagination'
import type { PageTemplate, PageTemplateListingBlock } from '@/payload-types'

export function resolveTemplateListingPageURL({
  template,
  pathname,
  searchParams,
  matches,
}: {
  template: PageTemplate
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
  matches: (block: PageTemplateListingBlock) => boolean
}): string | undefined {
  const { page, ...blockSearchParams } = searchParams
  if (page === undefined) return undefined

  const listingID = findPaginatedListingID([template.informationPanel, template.content], matches)
  if (!listingID) return undefined

  const { parameterName } = resolveBlockPagination({
    blockId: listingID,
    blockPath: 'content',
    enabled: true,
    parameterPrefix: 'listing',
    searchParams: blockSearchParams,
  })
  const requestedPage = getRequestedPage(blockSearchParams[parameterName] ?? page)
  return createPaginatedURL(pathname, blockSearchParams, parameterName, requestedPage)
}

function findPaginatedListingID(
  blocks: unknown[],
  matches: (block: PageTemplateListingBlock) => boolean,
): string | undefined {
  for (const block of blocks) {
    if (Array.isArray(block)) {
      const match = findPaginatedListingID(block, matches)
      if (match) return match
      continue
    }

    if (!block || typeof block !== 'object') continue
    if ('blockType' in block && block.blockType === 'listing') {
      const listing = block as PageTemplateListingBlock
      if (listing.id && listing.pagination && listing.view !== 'carousel' && matches(listing)) {
        return listing.id
      }
      continue
    }

    const container = block as Record<string, unknown>
    const match = findPaginatedListingID(
      [container.columns, container.sections, container.tabs, container.blocks].filter(
        Array.isArray,
      ),
      matches,
    )
    if (match) return match
  }
  return undefined
}
