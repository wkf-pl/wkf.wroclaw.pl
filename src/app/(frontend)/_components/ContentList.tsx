import Link from 'next/link'

import type { PublicContentListItem } from '@/modules/content/content-listing'

import { CmsRichText } from '@/components/CmsRichText'
import { CmsImage } from './CmsImage'
import { ContentCard } from './ContentCard'
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
  'event-cycles': 'Cykl wydarzeń',
  events: 'Wydarzenie',
  pages: 'Strona',
  posts: 'Wpis',
}

export function ContentList({ emptyMessage, items, view }: ContentListProperties) {
  if (!items.length) {
    return <p className="emptyState">{emptyMessage || 'Nie ma opublikowanych treści.'}</p>
  }

  if (view === 'cards') {
    return (
      <div className="contentList contentList-cards">
        {items.map((item) => (
          <ContentCard item={item} key={`${item.kind}-${item.document.id}`} />
        ))}
      </div>
    )
  }

  const showsImageFallback = view === 'grid'

  return (
    <div className={`contentList contentList-${view}`}>
      {items.map((item) => {
        const { document } = item
        const date = getListingDate(item)

        return (
          <article className="contentCard" key={`${item.kind}-${document.id}`}>
            {view !== 'compact' ? (
              <Link aria-label={document.title} className="contentCardImage" href={item.url}>
                {document.heroImage ? (
                  <CmsImage media={document.heroImage} />
                ) : showsImageFallback ? (
                  <span aria-hidden="true" className="contentCardImageFallback" />
                ) : null}
              </Link>
            ) : null}
            <div className="contentCardContent">
              <p className="contentCardMeta">
                <span className="contentCardKind">{contentKindLabels[item.kind]}</span>
                {date ? <time dateTime={date}>{dateFormatter.format(new Date(date))}</time> : null}
              </p>
              <h2>
                <Link href={item.url}>{document.title}</Link>
              </h2>
              {view !== 'compact' ? renderListingExcerpt(item) : null}
              {view !== 'compact' ? (
                <TaxonomyLinks category={document.category} tags={document.tags} />
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function getListingDate(item: PublicContentListItem): null | string {
  switch (item.kind) {
    case 'events':
      return item.document.startAt
    case 'posts':
      return item.document.publishedAt ?? null
    default:
      return null
  }
}

function renderListingExcerpt(item: PublicContentListItem) {
  switch (item.kind) {
    case 'event-cycles':
    case 'events':
      return <CmsRichText data={item.document.excerpt} />
    case 'pages':
      return item.document.listingExcerpt ? <p>{item.document.listingExcerpt}</p> : null
    case 'posts':
      return <p>{item.document.excerpt}</p>
  }
}
