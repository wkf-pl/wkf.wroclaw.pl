import type {
  CarouselBlock,
  Event,
  EventCycle,
  HomepageSection,
  Page,
  Partner,
  Post,
} from '@/payload-types'
import {
  findPublicContent,
  type ManualContentReference,
  type TaxonomizableCollectionSlug,
} from '@/modules/content/content-listing'
import type { ListingConditionInput } from '@/modules/content/listing-conditions'

import { ContentCarousel } from './ContentCarousel'

type ContentDocument = Event | EventCycle | HomepageSection | Page | Partner | Post

type CarouselBlockSectionProperties = {
  block: CarouselBlock
  document: ContentDocument
}

export async function CarouselBlockSection(properties: CarouselBlockSectionProperties) {
  return (await resolveCarouselBlockSection(properties)).content
}

export async function resolveCarouselBlockSection({ block }: CarouselBlockSectionProperties) {
  const result = await findPublicContent({
    conditions: (block.conditions ?? []) as ListingConditionInput[],
    manualItems: (block.items?.map(({ item }) => item) ?? []) as ManualContentReference[],
    page: 1,
    pageSize: block.slideLimit,
    pagination: false,
    selectionMode: block.selectionMode,
    sort: block.sort ?? 'newest',
    sources: (block.sources ?? []) as TaxonomizableCollectionSlug[],
  })

  return {
    content: <ContentCarousel emptyMessage={block.emptyMessage} items={result.items} />,
    isEmpty: result.items.length === 0,
  }
}
