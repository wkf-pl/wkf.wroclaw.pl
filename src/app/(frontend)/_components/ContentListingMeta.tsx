import type { PublicContentListItem } from '@/modules/content/content-listing'
import { getDocumentTypeLabel } from '@/modules/documents/document-types'
import { formatEventStartDate } from '@/modules/events/presentation'

import type { DocumentCardItem } from './ContentCard'

type ContentListingMetaItem = DocumentCardItem | PublicContentListItem

const publicationDateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
})

export function ContentListingMeta({
  className = 'contentCardMeta',
  item,
}: {
  className?: string
  item: ContentListingMetaItem
}) {
  switch (item.kind) {
    case 'documents':
      return (
        <p className={className}>
          <span className="contentCardKind">
            {getDocumentTypeLabel(item.document.documentType)}
          </span>
          <span className="contentCardMetaText">
            {item.document.documentNumber ? `nr ${item.document.documentNumber} ` : null}z dnia{' '}
            <time dateTime={item.document.documentDate}>
              {publicationDateFormatter.format(new Date(item.document.documentDate))}
            </time>
          </span>
        </p>
      )
    case 'event-cycles':
      return (
        <p className={className}>
          <span className="contentCardKind">Cykl wydarzeń</span>
        </p>
      )
    case 'events':
      return (
        <p className={className}>
          <span className="contentCardKind">Wydarzenie</span>
          <time dateTime={item.document.startAt}>{formatEventStartDate(item.document)}</time>
        </p>
      )
    case 'pages':
      return (
        <p className={className}>
          <span className="contentCardKind">Strona</span>
        </p>
      )
    case 'posts':
      return (
        <p className={className}>
          <span className="contentCardKind">Wpis</span>
          {item.document.publishedAt ? (
            <time dateTime={item.document.publishedAt}>
              {publicationDateFormatter.format(new Date(item.document.publishedAt))}
            </time>
          ) : null}
        </p>
      )
  }
}
