import Link from 'next/link'

import type { PublicContentListItem } from '@/modules/content/content-listing'

import { ContentCard } from './ContentCard'
import { ContentListingMeta } from './ContentListingMeta'
import { ContentTile } from './ContentTile'

export type ContentListView = 'cards' | 'compact' | 'grid' | 'tiles'

type ContentListProperties = {
  emptyMessage?: null | string
  items: PublicContentListItem[]
  view: ContentListView
}

export function ContentList({ emptyMessage, items, view }: ContentListProperties) {
  if (!items.length) {
    return <p className="emptyState">{emptyMessage || 'Nie ma opublikowanych treści.'}</p>
  }

  if (view === 'tiles') {
    return (
      <div className="contentList contentList-tiles">
        {items.map((item) => (
          <ContentTile item={item} key={`${item.kind}-${item.document.id}`} />
        ))}
      </div>
    )
  }

  if (view !== 'compact') {
    return (
      <div className={`contentList contentList-${view}`}>
        {items.map((item) => (
          <ContentCard item={item} key={`${item.kind}-${item.document.id}`} view={view} />
        ))}
      </div>
    )
  }

  return (
    <div className="contentList contentList-compact">
      {items.map((item) => {
        const { document } = item

        return (
          <article className="contentCard" key={`${item.kind}-${document.id}`}>
            <div className="contentCardContent">
              <ContentListingMeta item={item} />
              <h2>
                <Link href={item.url}>{document.title}</Link>
              </h2>
            </div>
          </article>
        )
      })}
    </div>
  )
}
