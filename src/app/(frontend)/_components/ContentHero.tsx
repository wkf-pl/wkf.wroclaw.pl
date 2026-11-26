import type { ReactNode } from 'react'
import Link from 'next/link'
import { Fragment } from 'react'

import type { PublicBreadcrumb } from '@/modules/content/public-hierarchy'
import type { Topic, Media } from '@/payload-types'
import { getResponsiveMedia } from '@/modules/media/media-url'

import { HierarchyBreadcrumbs } from './HierarchyBreadcrumbs'
import { RasterIcon } from '@/components/RasterIcon'

export type ContentHeroImage = {
  alt: string
  height?: number
  src: string
  srcSet?: string
  variant?: 'landscape' | 'portrait'
  width?: number
}

export function getContentHeroImage(
  media:
    | (Pick<Media, 'alt' | 'height' | 'url' | 'width'> &
        Partial<Pick<Media, 'id' | 'imageVariants'>>)
    | number
    | null
    | undefined,
): ContentHeroImage | undefined {
  if (!media || typeof media !== 'object') return undefined
  const { src, srcSet, height, width } = getResponsiveMedia(media)
  if (!src) return undefined

  return {
    alt: media.alt,
    height,
    src,
    srcSet,
    width,
  }
}

type ContentHeroProperties = {
  breadcrumbs: PublicBreadcrumb[]
  children?: ReactNode
  customCopy?: ReactNode
  description?: null | string
  eyebrow?: ReactNode
  image?: ContentHeroImage
  media?: ReactNode
  title?: string
}

type ContentHeroMetaProperties = {
  authorName?: null | string
  collection?: 'documents' | 'event-cycles' | 'events' | 'pages' | 'partners' | 'posts'
  date?: {
    dateTime: string
    label: string
  }
}

export function ContentHero({
  breadcrumbs,
  children,
  customCopy,
  description,
  eyebrow,
  image,
  media,
  title,
}: ContentHeroProperties) {
  const intermediateBreadcrumbs = breadcrumbs.slice(1, -1)
  const imageVariant = image?.variant ?? 'landscape'
  const hasMedia = image !== undefined || media !== undefined
  const className = [
    'contentHero',
    hasMedia ? null : 'contentHero--withoutImage',
    imageVariant === 'portrait' ? 'contentHero--portrait' : null,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={className}>
      <div className="contentHeroInner">
        <div className="contentHeroCopy">
          <div className="contentHeroBreadcrumbSlot">
            <HierarchyBreadcrumbs breadcrumbs={intermediateBreadcrumbs} />
          </div>
          {customCopy ?? (
            <>
              <p className="eyebrow contentHeroEyebrow">{eyebrow}</p>
              {title ? <h1>{title}</h1> : null}
              {description ? <p className="contentHeroDescription">{description}</p> : null}
              {children}
            </>
          )}
        </div>

        {media !== undefined ? (
          <div className="contentHeroMedia contentHeroMedia--custom">{media}</div>
        ) : image ? (
          <div className="contentHeroMedia">
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host. */}
            <img
              alt={image.alt}
              className="contentHeroImage"
              decoding="async"
              fetchPriority="high"
              height={image.height}
              sizes={
                image.srcSet
                  ? '(max-width: 760px) 100vw, (max-width: 1200px) 50vw, 680px'
                  : undefined
              }
              src={image.src}
              srcSet={image.srcSet}
              width={image.width}
            />
          </div>
        ) : null}
      </div>
    </header>
  )
}

export function ContentHeroTopics({ topics }: { topics?: (Topic | number)[] | null }) {
  const populatedTopics = topics?.filter((topic): topic is Topic => typeof topic === 'object') ?? []
  if (!populatedTopics.length) return <span aria-hidden="true">&nbsp;</span>

  return populatedTopics.map((topic, index) => (
    <Fragment key={topic.id}>
      {index > 0 ? ', ' : null}
      <Link href={`/topic/${topic.slug}`}>{topic.name}</Link>
    </Fragment>
  ))
}

export function ContentHeroMeta({ authorName, collection, date }: ContentHeroMetaProperties) {
  const visibleDate = collection === 'event-cycles' || collection === 'pages' ? undefined : date

  if (collection === 'pages' || (!visibleDate && !authorName)) {
    return null
  }

  return (
    <p className="contentHeroMeta">
      {visibleDate ? (
        <span className="contentHeroMetaItem">
          <RasterIcon name="calendar" size="small" />
          <time dateTime={visibleDate.dateTime}>{visibleDate.label}</time>
        </span>
      ) : null}
      {authorName ? (
        <span className="contentHeroMetaItem">
          <RasterIcon name="users" size="small" />
          Autor: {authorName}
        </span>
      ) : null}
    </p>
  )
}
