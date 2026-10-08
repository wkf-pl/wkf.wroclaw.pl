import Link from 'next/link'

import { RasterIcon } from '@/components/RasterIcon'
import type { PublicContentListItem } from '@/modules/content/content-listing'
import { getDocumentTypeLabel } from '@/modules/documents/document-types'
import { formatEventDate } from '@/modules/events/presentation'
import type { Document, EventCycle, Media } from '@/payload-types'

import { CmsImage } from './CmsImage'
import { CmsRichText } from '@/components/CmsRichText'
import { TaxonomyLinks } from './TaxonomyLinks'

const publicationDateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
})

export type DocumentCardItem = {
  document: Document
  kind: 'documents'
  url: string
}

export type ContentCardItem = DocumentCardItem | PublicContentListItem

export function ContentCard({ item }: { item: ContentCardItem }) {
  const title = item.document.title
  const image = getCardImage(item)

  return (
    <article className="contentCard">
      <Link aria-label={title} className="contentCardImage" href={item.url}>
        {image ? (
          <CmsImage media={image} />
        ) : (
          <span aria-hidden="true" className="contentCardImageFallback" />
        )}
      </Link>
      <div className="contentCardContent">
        {renderCardMetadata(item)}
        <h2>
          <Link href={item.url}>{title}</Link>
        </h2>
        {renderEventFacts(item)}
        {renderCardExcerpt(item)}
        <TaxonomyLinks category={item.document.category} tags={item.document.tags} />
      </div>
    </article>
  )
}

function getCardImage(item: ContentCardItem): Media | number | null | undefined {
  return item.kind === 'documents' ? null : item.document.heroImage
}

function renderCardMetadata(item: ContentCardItem) {
  switch (item.kind) {
    case 'event-cycles':
      return (
        <p className="contentCardMeta">
          <span className="contentCardKind">Cykl wydarzeń</span>
        </p>
      )
    case 'events': {
      const cycle = getPopulatedEventCycle(item.document.cycle)
      return (
        <p className="contentCardMeta">
          <span className="contentCardKind">Wydarzenie</span>
          {cycle ? (
            <>
              <span className="contentCardMetaText">z cyklu</span>
              <Link className="contentCardMetaLink" href={`/events/series/${cycle.slug}`}>
                {cycle.title}
              </Link>
            </>
          ) : null}
        </p>
      )
    }
    case 'pages':
      return (
        <p className="contentCardMeta">
          <span className="contentCardKind">Strona</span>
        </p>
      )
    case 'posts':
      return (
        <p className="contentCardMeta">
          <span className="contentCardKind">Wpis</span>
          {item.document.publishedAt ? (
            <time dateTime={item.document.publishedAt}>
              {publicationDateFormatter.format(new Date(item.document.publishedAt))}
            </time>
          ) : null}
        </p>
      )
    case 'documents':
      return (
        <p className="contentCardMeta">
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
  }
}

function renderEventFacts(item: ContentCardItem) {
  if (item.kind !== 'events') return null

  const { location } = item.document
  return (
    <div className="contentCardFacts">
      <p>
        <span aria-label="Kiedy" className="contentCardFactIcon" role="img">
          <RasterIcon name="calendar" size="small" />
        </span>
        <time dateTime={item.document.startAt}>{formatEventDate(item.document)}</time>
      </p>
      {location.venueName ? (
        <p>
          <span aria-label="Gdzie" className="contentCardFactIcon" role="img">
            <RasterIcon name="location" size="small" />
          </span>
          {location.venueWebsite ? (
            <a href={location.venueWebsite}>{location.venueName}</a>
          ) : (
            location.venueName
          )}
        </p>
      ) : null}
    </div>
  )
}

function renderCardExcerpt(item: ContentCardItem) {
  switch (item.kind) {
    case 'event-cycles':
    case 'events':
      return <CmsRichText className="contentCardExcerpt" data={item.document.excerpt} />
    case 'pages':
      return item.document.listingExcerpt ? (
        <p className="contentCardExcerpt">{item.document.listingExcerpt}</p>
      ) : null
    case 'posts':
      return <p className="contentCardExcerpt">{item.document.excerpt}</p>
    case 'documents':
      return <p className="contentCardExcerpt">{item.document.summary}</p>
  }
}

function getPopulatedEventCycle(value: EventCycle | number | null | undefined): EventCycle | null {
  return value && typeof value === 'object' ? value : null
}
