'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { CmsRichText } from '@/components/CmsRichText'
import { RasterIcon } from '@/components/RasterIcon'
import type { PublicContentListItem } from '@/modules/content/content-listing'
import { getContentListingPresentation } from '@/modules/content/content-listing-presentation'

import { CmsImage } from './CmsImage'
import { TaxonomyLinks } from './TaxonomyLinks'

type ContentCarouselProperties = {
  emptyMessage?: null | string
  items: ContentCarouselItem[]
}

export type ContentCarouselItem = PublicContentListItem

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
          const presentation = getContentListingPresentation(item, 'carousel')

          return (
            <article
              aria-hidden={!isActive}
              aria-label={`${index + 1} z ${items.length}`}
              aria-roledescription="slajd"
              className={`contentCarouselSlide${isActive ? ' contentCarouselSlide--active' : ''}`}
              inert={!isActive}
              key={`${item.kind}-${item.document.id}-${item.kind === 'member-profiles' ? (item.contextLabel ?? '') : ''}`}
            >
              <div className="contentCarouselVisual">
                <Link
                  aria-label={`Zobacz: ${presentation.title}`}
                  className="contentCarouselVisualLink"
                  href={presentation.url}
                  tabIndex={isActive ? undefined : -1}
                >
                  {presentation.image?.kind === 'media' ? (
                    <CmsImage className="contentCarouselImage" media={presentation.image.media} />
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
                  <span className="contentCarouselTitle">{presentation.title}</span>
                </Link>
                {items.length > 1 ? (
                  <div aria-label="Wybór slajdu" className="contentCarouselControls">
                    {items.map((controlItem, controlIndex) => {
                      const controlPresentation = getContentListingPresentation(
                        controlItem,
                        'carousel',
                      )
                      return (
                        <button
                          aria-label={`Pokaż: ${controlPresentation.title}`}
                          aria-pressed={controlIndex === displayedActiveIndex}
                          key={`${controlItem.kind}-${controlItem.document.id}-${controlIndex}`}
                          onClick={() => setActiveIndex(controlIndex)}
                          type="button"
                        >
                          <span className="srOnly">{controlIndex + 1}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
              <div className="contentCarouselContent">
                <p className="contentCarouselMeta">
                  <span className="contentCarouselKind">{presentation.kindLabel}</span>
                  {presentation.metadataText ? (
                    <span className="contentCarouselMetaText">{presentation.metadataText}</span>
                  ) : null}
                  {presentation.metadataDate ? (
                    <time dateTime={presentation.metadataDate.dateTime}>
                      {presentation.metadataDate.label}
                    </time>
                  ) : null}
                  {presentation.contextLabel ? (
                    <span className="contentCarouselMetaText">{presentation.contextLabel}</span>
                  ) : null}
                </p>
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
                        {fact.dateTime ? <time dateTime={fact.dateTime}>{fact.value}</time> : null}
                        {!fact.dateTime && fact.href ? (
                          <a href={fact.href} tabIndex={isActive ? undefined : -1}>
                            {fact.value}
                          </a>
                        ) : null}
                        {!fact.dateTime && !fact.href ? fact.value : null}
                      </p>
                    ))}
                  </div>
                ) : null}
                <TaxonomyLinks category={presentation.category} tags={presentation.tags} />
                <div className="contentCarouselActions">
                  {presentation.secondaryAction ? (
                    <Link
                      className="contentCarouselSecondaryAction"
                      href={presentation.secondaryAction.href}
                      tabIndex={isActive ? undefined : -1}
                    >
                      <RasterIcon name="calendar" size="small" />
                      <span>{presentation.secondaryAction.label}</span>
                    </Link>
                  ) : null}
                  <Link
                    className="contentCarouselAction"
                    href={presentation.url}
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
