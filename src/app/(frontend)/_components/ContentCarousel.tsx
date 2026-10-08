'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { RasterIcon } from '@/components/RasterIcon'
import { CmsRichText } from '@/components/CmsRichText'
import type { PublicContentListItem } from '@/modules/content/content-listing'
import { getDocumentTypeLabel } from '@/modules/documents/document-types'
import { formatEventDate } from '@/modules/events/presentation'
import type { Document, Media } from '@/payload-types'

import { CmsImage } from './CmsImage'
import { TaxonomyLinks } from './TaxonomyLinks'

type ContentCarouselProperties = {
  emptyMessage?: null | string
  items: ContentCarouselItem[]
}

export type DocumentCarouselItem = {
  document: Document
  kind: 'documents'
  url: string
}

export type ContentCarouselItem = DocumentCarouselItem | PublicContentListItem

const contentKindLabels: Record<PublicContentListItem['kind'], string> = {
  'event-cycles': 'Cykl wydarzeń',
  events: 'Wydarzenie',
  pages: 'Strona',
  posts: 'Wpis',
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
})

export function ContentCarousel({ emptyMessage, items }: ContentCarouselProperties) {
  const carouselReference = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isIntersecting, setIsIntersecting] = useState(true)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const carousel = carouselReference.current
    if (!carousel || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      {
        threshold: 0.2,
      },
    )
    observer.observe(carousel)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updatePageVisibility = () => setIsPageVisible(document.visibilityState === 'visible')
    updatePageVisibility()
    document.addEventListener('visibilitychange', updatePageVisibility)
    return () => document.removeEventListener('visibilitychange', updatePageVisibility)
  }, [])

  useEffect(() => {
    if (
      items.length < 2 ||
      paused ||
      !isIntersecting ||
      !isPageVisible ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const timer = window.setInterval(
      () => setActiveIndex((index) => (index + 1) % items.length),
      8000,
    )
    return () => window.clearInterval(timer)
  }, [isIntersecting, isPageVisible, items.length, paused])

  if (!items.length) {
    return <p className="emptyState">{emptyMessage || 'Nie ma opublikowanych treści.'}</p>
  }

  const displayedActiveIndex = activeIndex % items.length

  return (
    <div
      aria-label="Karuzela treści"
      aria-roledescription="karuzela"
      className="contentCarousel"
      onBlur={(event_) => {
        if (!event_.currentTarget.contains(event_.relatedTarget)) setPaused(false)
      }}
      onFocus={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      ref={carouselReference}
      role="region"
    >
      <div className="contentCarouselSlides">
        {items.map((item, index) => {
          const isActive = index === displayedActiveIndex
          const image = getCarouselImage(item)
          const title = item.document.title

          return (
            <article
              aria-hidden={!isActive}
              aria-label={`${index + 1} z ${items.length}`}
              aria-roledescription="slajd"
              className={`contentCarouselSlide${isActive ? ' contentCarouselSlide--active' : ''}`}
              inert={!isActive}
              key={`${item.kind}-${item.document.id}`}
            >
              <div className="contentCarouselVisual">
                <Link
                  aria-label={`Zobacz: ${title}`}
                  className="contentCarouselVisualLink"
                  href={item.url}
                  tabIndex={isActive ? undefined : -1}
                >
                  {image ? (
                    <CmsImage className="contentCarouselImage" media={image} />
                  ) : (
                    <span aria-hidden="true" className="contentCarouselImageFallback" />
                  )}
                  <span className="contentCarouselTitle">{title}</span>
                </Link>
                {items.length > 1 ? (
                  <div aria-label="Wybór slajdu" className="contentCarouselControls">
                    {items.map((controlItem, controlIndex) => (
                      <button
                        aria-label={`Pokaż: ${controlItem.document.title}`}
                        aria-pressed={controlIndex === displayedActiveIndex}
                        key={`${controlItem.kind}-${controlItem.document.id}`}
                        onClick={() => setActiveIndex(controlIndex)}
                        type="button"
                      >
                        <span className="srOnly">{controlIndex + 1}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="contentCarouselContent">
                {renderCarouselMetadata(item)}
                {renderCarouselExcerpt(item)}
                {renderEventFacts(item, isActive)}
                <TaxonomyLinks category={item.document.category} tags={item.document.tags} />
                <div className="contentCarouselActions">
                  {item.kind === 'events' ? (
                    <Link
                      className="contentCarouselSecondaryAction"
                      href={`/events/${item.document.slug}/calendar.ics`}
                      tabIndex={isActive ? undefined : -1}
                    >
                      <RasterIcon name="calendar" size="small" />
                      <span>Dodaj do kalendarza</span>
                    </Link>
                  ) : null}
                  <Link
                    className="contentCarouselAction"
                    href={item.url}
                    tabIndex={isActive ? undefined : -1}
                  >
                    <span>Zobacz</span>
                    <RasterIcon name="arrow-right" size="small" />
                  </Link>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function getCarouselImage(item: ContentCarouselItem): Media | number | null | undefined {
  return item.kind === 'documents' ? null : item.document.heroImage
}

function renderCarouselMetadata(item: ContentCarouselItem) {
  switch (item.kind) {
    case 'documents':
      return (
        <p className="contentCarouselMeta">
          <span className="contentCarouselKind">
            {getDocumentTypeLabel(item.document.documentType)}
          </span>
          <span className="contentCarouselMetaText">
            {item.document.documentNumber ? `nr ${item.document.documentNumber} ` : null}z dnia{' '}
            <time dateTime={item.document.documentDate}>
              {dateFormatter.format(new Date(item.document.documentDate))}
            </time>
          </span>
        </p>
      )
    case 'posts':
      return (
        <p className="contentCarouselMeta">
          <span className="contentCarouselKind">{contentKindLabels[item.kind]}</span>
          {item.document.publishedAt ? (
            <time dateTime={item.document.publishedAt}>
              {dateFormatter.format(new Date(item.document.publishedAt))}
            </time>
          ) : null}
        </p>
      )
    default:
      return (
        <p className="contentCarouselMeta">
          <span className="contentCarouselKind">{contentKindLabels[item.kind]}</span>
        </p>
      )
  }
}

function renderCarouselExcerpt(item: ContentCarouselItem) {
  switch (item.kind) {
    case 'event-cycles':
    case 'events':
      return <CmsRichText className="contentCarouselExcerpt" data={item.document.excerpt} />
    case 'pages':
      return item.document.listingExcerpt ? (
        <p className="contentCarouselExcerpt">{item.document.listingExcerpt}</p>
      ) : null
    case 'posts':
      return <p className="contentCarouselExcerpt">{item.document.excerpt}</p>
    case 'documents':
      return <p className="contentCarouselExcerpt">{item.document.summary}</p>
  }
}

function renderEventFacts(item: ContentCarouselItem, isActive: boolean) {
  if (item.kind !== 'events') return null

  const { location } = item.document

  return (
    <div className="contentCarouselEventFacts">
      <p>
        <span aria-label="Kiedy" className="contentCarouselEventFactIcon" role="img">
          <RasterIcon name="calendar" size="small" />
        </span>
        <time dateTime={item.document.startAt}>{formatEventDate(item.document)}</time>
      </p>
      {location.venueName ? (
        <p>
          <span aria-label="Gdzie" className="contentCarouselEventFactIcon" role="img">
            <RasterIcon name="location" size="small" />
          </span>
          {location.venueWebsite ? (
            <a href={location.venueWebsite} tabIndex={isActive ? undefined : -1}>
              {location.venueName}
            </a>
          ) : (
            location.venueName
          )}
        </p>
      ) : null}
    </div>
  )
}
