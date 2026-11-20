'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { CmsRichText } from '@/components/CmsRichText'
import { RasterIcon } from '@/components/RasterIcon'
import type { PublicContentListItem } from '@/modules/content/content-listing'
import type { ListingDecorationMedia } from '@/modules/content/listing-decoration'
import type { ListingView } from '@/modules/content/listing-view'
import {
  getContentListingPresentation,
  type ContentListingPresentation,
} from '@/modules/content/content-listing-presentation'

import { ListingActionContent, ListingFactValue } from './ListingItemContent'
import { CmsImage } from './CmsImage'
import {
  ListingItemSurface,
  ListingPresentedItem,
  resolveListingItemImage,
} from './ListingDecoration'
import { PresentedContentMeta } from './ContentListingMeta'
import { TaxonomyLinks } from './TaxonomyLinks'

type ContentCarouselProperties = {
  emptyMessage?: null | string
  items: ContentCarouselItem[]
}

export type ContentCarouselItem = PublicContentListItem

export function ContentCarousel({ emptyMessage, items }: ContentCarouselProperties) {
  return (
    <PresentedContentCarousel
      emptyMessage={emptyMessage}
      items={items.map((item) => getContentListingPresentation(item, 'carousel'))}
    />
  )
}

export function PresentedContentCarousel({
  emptyMessage,
  items,
  view,
  media,
}: {
  emptyMessage?: string | null
  items: ContentListingPresentation[]
  view?: ListingView
  media?: ListingDecorationMedia
}) {
  const collection = Boolean(
    view && (view.form !== 'horizontal' || view.columns > 1 || !view.information.image),
  )
  const configuredDecoration = Boolean(view?.decoration)
  const [visibleCount, setVisibleCount] = useState(1)
  const pageCount = Math.ceil(items.length / visibleCount)
  const carouselReference = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isIntersecting, setIsIntersecting] = useState(true)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const carousel = carouselReference.current
    if (!collection || !carousel || typeof ResizeObserver === 'undefined') {
      setVisibleCount(1)
      return
    }
    const columns = view?.columns ?? 1
    const minimum = view?.form === 'horizontal' ? 368 : 176
    const updateColumns = () => {
      if (!configuredDecoration) {
        setVisibleCount(
          Math.max(1, Math.min(columns, Math.floor((carousel.clientWidth + 16) / (minimum + 16)))),
        )
        return
      }
      const slides = carousel.firstElementChild
      if (!slides) return
      const style = getComputedStyle(slides)
      const gap = parseFloat(style.columnGap) || 0
      const width =
        slides.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      setVisibleCount(Math.max(1, Math.min(columns, Math.floor((width + gap) / (minimum + gap)))))
    }
    updateColumns()
    const observer = new ResizeObserver(updateColumns)
    observer.observe(carousel)
    return () => observer.disconnect()
  }, [
    collection,
    configuredDecoration,
    view?.columns,
    view?.form,
    view?.decoration?.gap,
    view?.decoration?.padding,
  ])

  useEffect(() => {
    const carousel = carouselReference.current
    if (!carousel || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      { threshold: 0.2 },
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
      pageCount < 2 ||
      paused ||
      !isIntersecting ||
      !isPageVisible ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return
    }

    const timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % pageCount), 8000)
    return () => window.clearInterval(timer)
  }, [isIntersecting, isPageVisible, pageCount, paused])

  if (!items.length) {
    return <p className="emptyState">{emptyMessage || 'Nie ma opublikowanych treści.'}</p>
  }

  const displayedActiveIndex = activeIndex % pageCount
  const controls = (footer = false) =>
    pageCount > 1 ? (
      <div
        aria-label="Wybór slajdu"
        className={`contentCarouselControls${footer ? ' contentCarouselControls--footer' : ''}`}
      >
        {Array.from({ length: pageCount }, (_, pageIndex) => (
          <button
            aria-label={`Pokaż: ${items[pageIndex * visibleCount].title}`}
            aria-pressed={pageIndex === displayedActiveIndex}
            key={pageIndex}
            onClick={() => setActiveIndex(pageIndex)}
            type="button"
          >
            <span className="srOnly">{pageIndex + 1}</span>
          </button>
        ))}
      </div>
    ) : null

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
      <div
        className={`contentCarouselSlides${collection ? ' contentCarouselSlides--collection' : ''}`}
        style={{ '--carousel-columns': visibleCount } as CSSProperties}
      >
        {items.map((item, index) => {
          const isActive = Math.floor(index / visibleCount) === displayedActiveIndex
          const { presentation, showImage } = view
            ? resolveListingItemImage(item, view, media)
            : { presentation: item, showImage: true }

          return (
            <article
              aria-hidden={!isActive}
              aria-label={`${index + 1} z ${items.length}`}
              aria-roledescription="slajd"
              className={`contentCarouselSlide${collection ? ' contentCarouselSlide--collection' : ''}${isActive ? ' contentCarouselSlide--active' : ''}${!showImage && !collection ? ' contentCarouselSlide--withoutImage' : ''}`}
              inert={!isActive}
              key={`${item.url}-${index}`}
            >
              {collection && view ? (
                <div
                  className={`contentList contentList-${{ horizontal: 'cards', vertical: 'grid', row: 'compact', tile: 'tiles' }[view.form]} contentCarouselItem`}
                >
                  <ListingPresentedItem presentation={item} view={view} media={media} />
                </div>
              ) : (
                <CarouselItemSurface view={view} media={media}>
                  {showImage ? (
                    <div className="contentCarouselVisual">
                      <Link
                        aria-label={`Zobacz: ${presentation.title}`}
                        className="contentCarouselVisualLink"
                        href={presentation.url}
                        tabIndex={isActive ? undefined : -1}
                      >
                        {presentation.image?.kind === 'media' ? (
                          <CmsImage
                            className="contentCarouselImage"
                            media={presentation.image.media}
                          />
                        ) : presentation.image?.kind === 'profile' ? (
                          // eslint-disable-next-line @next/next/no-img-element -- profile images can use a runtime-configured Azure host.
                          <img
                            alt={presentation.image.alt}
                            className="contentCarouselImage"
                            src={presentation.image.url}
                          />
                        ) : (
                          <span aria-hidden="true" className="contentCarouselImageFallback" />
                        )}
                        <span
                          className={presentation.hideTitle ? 'srOnly' : 'contentCarouselTitle'}
                        >
                          {presentation.title}
                        </span>
                      </Link>
                      {controls()}
                    </div>
                  ) : null}
                  <div className="contentCarouselContent">
                    {!showImage ? (
                      <h2 className={presentation.hideTitle ? 'srOnly' : undefined}>
                        <Link href={presentation.url}>{presentation.title}</Link>
                      </h2>
                    ) : null}
                    <PresentedContentMeta
                      className="contentCarouselMeta"
                      variant="contentCarousel"
                      presentation={presentation}
                    />
                    {presentation.excerpt?.kind === 'richText' ? (
                      <CmsRichText
                        className="contentCarouselExcerpt"
                        data={presentation.excerpt.value}
                      />
                    ) : presentation.excerpt ? (
                      <p className="contentCarouselExcerpt">{presentation.excerpt.value}</p>
                    ) : null}
                    {presentation.facts.length ? (
                      <div className="contentCarouselEventFacts">
                        {presentation.facts.map((fact) => (
                          <p key={`${fact.icon}-${fact.value}`}>
                            <span
                              aria-label={fact.label}
                              className="contentCarouselEventFactIcon"
                              role="img"
                            >
                              <RasterIcon name={fact.icon} size="small" />
                            </span>
                            <ListingFactValue fact={fact} />
                          </p>
                        ))}
                      </div>
                    ) : null}
                    {presentation.interests ? (
                      <p className="contentCardInterests">{presentation.interests}</p>
                    ) : null}
                    <TaxonomyLinks category={presentation.category} tags={presentation.tags} />
                    {presentation.actionStyle !== 'none' ? (
                      <div className="contentCarouselActions">
                        {presentation.secondaryAction ? (
                          <Link
                            className="contentCarouselSecondaryAction"
                            href={presentation.secondaryAction.href}
                            tabIndex={isActive ? undefined : -1}
                          >
                            <ListingActionContent
                              style={presentation.actionStyle}
                              icon="calendar"
                              label={presentation.secondaryAction.label}
                            />
                          </Link>
                        ) : null}
                        <Link
                          className="contentCarouselAction"
                          href={presentation.url}
                          tabIndex={isActive ? undefined : -1}
                        >
                          <ListingActionContent
                            style={presentation.actionStyle}
                            icon="arrow-right"
                            label="Zobacz"
                            iconLast
                          />
                        </Link>
                      </div>
                    ) : null}
                    {!showImage ? controls(true) : null}
                  </div>
                </CarouselItemSurface>
              )}
            </article>
          )
        })}
      </div>
      {collection ? controls(true) : null}
    </div>
  )
}

function CarouselItemSurface({
  view,
  media,
  children,
}: {
  view?: ListingView
  media?: ListingDecorationMedia
  children: React.ReactNode
}) {
  return view ? (
    <ListingItemSurface view={view} media={media}>
      {children}
    </ListingItemSurface>
  ) : (
    children
  )
}
