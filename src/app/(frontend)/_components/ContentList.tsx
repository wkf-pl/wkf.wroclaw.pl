import Link from 'next/link'

import type { PublicContentListItem } from '@/modules/content/content-listing'

import { CmsImage } from './CmsImage'
import { TaxonomyLinks } from './TaxonomyLinks'

export type ContentListView = 'cards' | 'compact' | 'grid'

type ContentListProperties = {
  emptyMessage?: null | string
  items: PublicContentListItem[]
  view: ContentListView
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const contentKindLabels: Record<PublicContentListItem['kind'], string> = {
  pages: 'Strona',
  posts: 'Wpis',
}

export function ContentList({ emptyMessage, items, view }: ContentListProperties) {
  if (!items.length) {
    return <p className="emptyState">{emptyMessage || 'Nie ma opublikowanych treści.'}</p>
  }

  return (
    <div className={`contentList contentList-${view}`}>
      {items.map((item) => (
        <article className="contentCard" key={`${item.kind}-${item.id}`}>
          {view !== 'compact' ? (
            <Link aria-label={item.title} className="contentCardImage" href={item.url}>
              <CmsImage media={item.image} />
            </Link>
          ) : null}
          <div className="contentCardContent">
            <p className="contentCardMeta">
              <span>{contentKindLabels[item.kind]}</span>
              {item.date ? (
                <time dateTime={item.date}>{dateFormatter.format(new Date(item.date))}</time>
              ) : null}
            </p>
            <h2>
              <Link href={item.url}>{item.title}</Link>
            </h2>
            {view !== 'compact' && item.excerpt ? <p>{item.excerpt}</p> : null}
            {view !== 'compact' ? (
              <TaxonomyLinks categories={item.categories} tags={item.tags} />
            ) : null}
          </div>
        </article>
      ))}
    </div>
  )
}
