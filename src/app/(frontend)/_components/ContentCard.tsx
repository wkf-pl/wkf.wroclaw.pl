import type { PublicContentListItem } from '@/modules/content/content-listing'
import { getContentListingPresentation } from '@/modules/content/content-listing-presentation'

import { PresentedContentItem } from './PresentedContentItem'

export type ContentCardItem = PublicContentListItem
export type ContentCardView = 'cards' | 'grid'

export function ContentCard({
  item,
  view = 'cards',
}: {
  item: ContentCardItem
  view?: ContentCardView
}) {
  const presentation = getContentListingPresentation(item, view)
  return (
    <PresentedContentItem
      presentation={{ ...presentation, secondaryAction: undefined }}
      form={view === 'grid' ? 'vertical' : 'horizontal'}
    />
  )
}
