import type { CSSProperties } from 'react'

import type { ContentListingPresentation } from '@/modules/content/content-listing-presentation'
import type { ListingView } from '@/modules/content/listing-view'

import { PresentedContentCarousel } from './ContentCarousel'
import { PresentedContentItem } from './PresentedContentItem'

export function ConfiguredContentList({
  items,
  view,
  emptyMessage,
}: {
  items: ContentListingPresentation[]
  view: ListingView
  emptyMessage?: string | null
}) {
  if (!items.length)
    return <p className="emptyState">{emptyMessage || 'Nie ma opublikowanych treści.'}</p>
  if (view.layout === 'carousel')
    return <PresentedContentCarousel items={items} view={view} emptyMessage={emptyMessage} />
  const listView = { horizontal: 'cards', vertical: 'grid', row: 'compact', tile: 'tiles' }[
    view.form
  ]
  const defaultColumns = view.form === 'tile' || view.form === 'vertical' ? 3 : 1
  const customColumns = view.columns !== defaultColumns
  return (
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
        <PresentedContentItem
          key={`${presentation.url}-${index}`}
          presentation={presentation}
          form={view.form}
          showImage={view.information.image}
        />
      ))}
    </div>
  )
}
