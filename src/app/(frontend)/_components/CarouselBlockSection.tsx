import type {
  CarouselBlock,
  Event,
  EventCycle,
  HomepageSection,
  Page,
  Partner,
  Post,
} from '@/payload-types'
import { getRelationshipId } from '@/lib/relationships'
import {
  findPublicContent,
  type ManualContentReference,
  type TaxonomizableCollectionSlug,
} from '@/modules/content/content-listing'

import { ContentCarousel } from './ContentCarousel'

type ContentDocument = Event | EventCycle | HomepageSection | Page | Partner | Post

export async function CarouselBlockSection({
  block,
  document,
}: {
  block: CarouselBlock
  document: ContentDocument
}) {
  const result = await findPublicContent({
    categoryId: getRelationshipId(block.category),
    eventCycleId:
      getRelationshipId(block.eventCycle) ??
      ('calendarFeedKey' in document ? document.id : undefined),
    eventTimeFilter: block.eventTimeFilter ?? 'all',
    manualItems: (block.items?.map(({ item }) => item) ?? []) as ManualContentReference[],
    page: 1,
    pageSize: block.slideLimit,
    pagination: false,
    parentId: getCarouselParentId(block, document),
    selectionMode: block.selectionMode,
    sort: block.sort ?? 'newest',
    sources: (block.sources ?? []) as TaxonomizableCollectionSlug[],
    tagId: getRelationshipId(block.tag),
  })

  return <ContentCarousel emptyMessage={block.emptyMessage} items={result.items} />
}

function getCarouselParentId(block: CarouselBlock, document: ContentDocument): number | undefined {
  if (block.parentFilter === 'current') {
    return 'fullTitle' in document ? document.id : -1
  }

  return block.parentFilter === 'specific' ? getRelationshipId(block.parentPage) : undefined
}
