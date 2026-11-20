import { getContentListingPresentation } from '@/modules/content/content-listing-presentation'

import type { ContentCardItem } from './ContentCard'
import { PresentedContentItem } from './PresentedContentItem'

export function ContentTile({ item }: { item: ContentCardItem }) {
  const presentation = getContentListingPresentation(item, 'tiles')
  return (
    <PresentedContentItem
      presentation={{ ...presentation, secondaryAction: undefined }}
      form="tile"
    />
  )
}
