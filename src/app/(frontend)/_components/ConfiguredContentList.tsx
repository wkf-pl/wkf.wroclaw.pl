import type { CSSProperties } from 'react'

import type { ContentListingPresentation } from '@/modules/content/content-listing-presentation'
import type { ListingDecorationMedia } from '@/modules/content/listing-decoration'
import type { ListingView } from '@/modules/content/listing-view'

import { PresentedContentCarousel } from './ContentCarousel'
import { ListingPresentedItem, ListingPresentation } from './ListingDecoration'

export function ConfiguredContentList({
  items,
  view,
  emptyMessage,
  media,
}: {
  items: ContentListingPresentation[]
  view: ListingView
  emptyMessage?: string | null
  media?: ListingDecorationMedia
}) {
  if (!items.length)
    return <p className="emptyState">{emptyMessage || 'Nie ma opublikowanych treści.'}</p>
  if (view.layout === 'carousel')
    return (
      <ListingPresentation view={view} media={media}>
        <PresentedContentCarousel
          items={items}
          view={view}
          emptyMessage={emptyMessage}
          media={media}
        />
      </ListingPresentation>
    )
  const listView = { horizontal: 'cards', vertical: 'grid', row: 'compact', tile: 'tiles' }[
    view.form
  ]
  const defaultColumns = view.form === 'tile' || view.form === 'vertical' ? 3 : 1
  const customColumns = view.columns !== defaultColumns
  return (
    <ListingPresentation view={view} media={media}>
      <div
        className={`contentList contentList-${listView}${customColumns ? ' contentList-configuredColumns' : ''}`}
        style={
          {
            '--listing-columns': view.columns,
            '--listing-minimum': view.form === 'horizontal' ? '23rem' : '11rem',
          } as CSSProperties
        }
      >
        {items.map((presentation, index) => (
          <ListingPresentedItem
            key={`${presentation.url}-${index}`}
            presentation={presentation}
            view={view}
            media={media}
          />
        ))}
      </div>
    </ListingPresentation>
  )
}
