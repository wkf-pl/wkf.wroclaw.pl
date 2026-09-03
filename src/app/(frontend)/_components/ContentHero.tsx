import type { ReactNode } from 'react'
import Link from 'next/link'

import type { PublicBreadcrumb } from '@/modules/content/public-hierarchy'
import type { Category } from '@/payload-types'

import { HierarchyBreadcrumbs } from './HierarchyBreadcrumbs'
import { Icon } from './Icon'

export type ContentHeroImage = {
  alt: string
  height?: number
  src: string
  variant?: 'landscape' | 'portrait'
  width?: number
}

type ContentHeroProperties = {
  breadcrumbs: PublicBreadcrumb[]
  children?: ReactNode
  description?: null | string
  eyebrow: ReactNode
  image?: ContentHeroImage
  title: string
}

type ContentHeroMetaProperties = {
  authorName?: null | string
  date?: {
    dateTime: string
    label: string
  }
}

export function ContentHero({
  breadcrumbs,
  children,
  description,
  eyebrow,
  image,
  title,
}: ContentHeroProperties) {
  const intermediateBreadcrumbs = breadcrumbs.slice(1, -1)
  const imageVariant = image?.variant ?? 'landscape'
  const className = [
    'contentHero',
    image ? null : 'contentHero--withoutImage',
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
          <p className="eyebrow contentHeroEyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {description ? <p className="contentHeroDescription">{description}</p> : null}
          {children}
        </div>

        {image ? (
          <div className="contentHeroMedia">
            {/* eslint-disable-next-line @next/next/no-img-element -- CMS media can use a runtime-configured Azure host. */}
            <img
              alt={image.alt}
              className="contentHeroImage"
              decoding="async"
              fetchPriority="high"
              height={image.height}
              src={image.src}
              width={image.width}
            />
          </div>
        ) : null}
      </div>
    </header>
  )
}

export function ContentHeroCategory({ category }: { category?: Category | number | null }) {
  if (!category || typeof category !== 'object') {
    return <span aria-hidden="true">&nbsp;</span>
  }

  return <Link href={`/category/${category.slug}`}>{category.name}</Link>
}

export function ContentHeroMeta({ authorName, date }: ContentHeroMetaProperties) {
  if (!date && !authorName) {
    return null
  }

  return (
    <p className="contentHeroMeta">
      {date ? (
        <span className="contentHeroMetaItem">
          <Icon name="calendar" />
          <time dateTime={date.dateTime}>{date.label}</time>
        </span>
      ) : null}
      {authorName ? (
        <span className="contentHeroMetaItem">
          <Icon name="users" />
          Autor: {authorName}
        </span>
      ) : null}
    </p>
  )
}
