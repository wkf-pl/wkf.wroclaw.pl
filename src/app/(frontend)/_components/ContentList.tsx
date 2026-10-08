import Link from 'next/link'

import type { PublicContentListItem } from '@/modules/content/content-listing'
import { formatEventStartDate } from '@/modules/events/presentation'

import { ContentCard } from './ContentCard'

export type ContentListView = 'cards' | 'compact' | 'grid'

type ContentListProperties = {
  emptyMessage?: null | string
  items: PublicContentListItem[]
  view: ContentListView
}

const publicationDateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Warsaw',
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
        const date = getListingDate(item)

        return (
          <article className="contentCard" key={`${item.kind}-${document.id}`}>
            <div className="contentCardContent">
              <p className="contentCardMeta">
                <span className="contentCardKind">{contentKindLabels[item.kind]}</span>
                {date ? <time dateTime={date.dateTime}>{date.label}</time> : null}
              </p>
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

function getListingDate(item: PublicContentListItem): null | { dateTime: string; label: string } {
  switch (item.kind) {
    case 'events':
      return {
        dateTime: item.document.startAt,
        label: formatEventStartDate(item.document),
      }
    case 'posts':
      return item.document.publishedAt
        ? {
            dateTime: item.document.publishedAt,
            label: publicationDateFormatter.format(new Date(item.document.publishedAt)),
          }
        : null
    default:
      return null
  }
}
