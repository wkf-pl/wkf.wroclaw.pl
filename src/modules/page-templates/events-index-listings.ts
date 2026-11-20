import type { ListingBlock, PageTemplate, PageTemplateListingBlock } from '@/payload-types'

import { resolveTemplateListingPageURL } from './template-listing-pagination'

export function isFilteredEventsListing(block: ListingBlock | PageTemplateListingBlock): boolean {
  return (
    block.selectionMode === 'filters' &&
    block.sources?.length === 1 &&
    block.sources[0] === 'events'
  )
}

export async function resolveEventsIndexArchiveURL(
  template: PageTemplate,
  searchParams: Record<string, string | string[] | undefined>,
): Promise<string | undefined> {
  return resolveTemplateListingPageURL({
    template,
    pathname: '/events',
    searchParams,
    matches: (block) =>
      isFilteredEventsListing(block) &&
      Boolean(
        block.conditions?.some(
          ({ field, operator, eventTimeValue }) =>
            field === 'eventTime' && operator === 'equals' && eventTimeValue === 'past',
        ),
      ),
  })
}
