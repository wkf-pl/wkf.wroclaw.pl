'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { RasterIcon } from '@/components/RasterIcon'
import { CmsRichText } from '@/components/CmsRichText'
import type { PublicContentListItem } from '@/modules/content/content-listing'

import { CmsImage } from './CmsImage'
import { TaxonomyLinks } from './TaxonomyLinks'

type ContentCarouselProperties = {
  emptyMessage?: null | string
  items: PublicContentListItem[]
}

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
          const date = getCarouselDate(item)
          const image = item.document.heroImage
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
                <p className="contentCarouselMeta">
                  <span>{contentKindLabels[item.kind]}</span>
                  {date ? (
                    <time dateTime={date}>{dateFormatter.format(new Date(date))}</time>
                  ) : null}
                </p>
                {renderCarouselExcerpt(item)}
                <TaxonomyLinks category={item.document.category} tags={item.document.tags} />
                <Link
                  className="contentCarouselAction"
                  href={item.url}
                  tabIndex={isActive ? undefined : -1}
                >
                  <span>Zobacz treść</span>
                  <RasterIcon name="arrow-right" size="small" />
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function getCarouselDate(item: PublicContentListItem): null | string {
  switch (item.kind) {
    case 'events':
      return item.document.startAt
    case 'posts':
      return item.document.publishedAt ?? null
    default:
      return null
  }
}

function renderCarouselExcerpt(item: PublicContentListItem) {
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
  }
}
