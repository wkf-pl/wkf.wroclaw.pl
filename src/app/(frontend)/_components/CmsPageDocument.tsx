import type { ReactNode } from 'react'

import type { Event, EventCycle, Page, Partner, Post, User } from '@/payload-types'
import { getMediaURL } from '@/modules/media/media-url'
import { createPageBreadcrumbs, type PublicBreadcrumb } from '@/modules/content/public-hierarchy'

import {
  ContentHero,
  ContentHeroCategory,
  ContentHeroMeta,
  type ContentHeroImage,
} from './ContentHero'
import { ContentLayoutRenderer } from './ContentLayoutRenderer'
import { TaxonomyLinks } from './TaxonomyLinks'

type CmsPageDocumentProperties = {
  document: Event | EventCycle | Page | Partner | Post
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
  eyebrow?: string
  afterBlocks?: ReactNode
  beforeBlocks?: ReactNode
  breadcrumbs?: PublicBreadcrumb[]
  heroDate?: {
    dateTime: string
    label: string
  }
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export async function CmsPageDocument({
  document,
  pathname,
  searchParams,
  eyebrow,
  afterBlocks,
  beforeBlocks,
  breadcrumbs: providedBreadcrumbs,
  heroDate,
}: CmsPageDocumentProperties) {
  const authorName = getAuthorName(document.author)
  const category = 'category' in document ? document.category : undefined
  const tags = 'tags' in document ? document.tags : undefined
  const title = 'title' in document ? document.title : document.name
  const heroEyebrow =
    'title' in document ? <ContentHeroCategory category={category} /> : eyebrow || 'Partner'
  const breadcrumbs = await getContentBreadcrumbs(document, providedBreadcrumbs, title)
  const image = getContentHeroImage(document.heroImage)
  const date =
    heroDate ??
    (document.publishedAt
      ? {
          dateTime: document.publishedAt,
          label: dateFormatter.format(new Date(document.publishedAt)),
        }
      : undefined)

  return (
    <main className="contentHeroPage">
      <article className="cmsDocument cmsPageDocument">
        <ContentHero breadcrumbs={breadcrumbs} eyebrow={heroEyebrow} image={image} title={title}>
          <TaxonomyLinks tags={tags} />
          <ContentHeroMeta authorName={authorName} date={date} />
        </ContentHero>

        <div className="contentShell contentPageBody">
          {beforeBlocks}

          <ContentLayoutRenderer
            document={document}
            pathname={pathname}
            searchParams={searchParams}
          />
          {afterBlocks}
        </div>
      </article>
    </main>
  )
}

async function getContentBreadcrumbs(
  document: Event | EventCycle | Page | Partner | Post,
  providedBreadcrumbs: PublicBreadcrumb[] | undefined,
  title: string,
): Promise<PublicBreadcrumb[]> {
  if (providedBreadcrumbs) {
    return providedBreadcrumbs
  }

  if ('breadcrumbs' in document) {
    const pageBreadcrumbs = await createPageBreadcrumbs(document)
    if (pageBreadcrumbs.at(-1)?.label === title) {
      return pageBreadcrumbs
    }
    return [...pageBreadcrumbs, { label: title, url: null }]
  }

  return [
    { label: 'Strona główna', url: '/' },
    { label: title, url: null },
  ]
}

function getContentHeroImage(
  media: Event['heroImage'] | EventCycle['heroImage'] | Page['heroImage'],
): ContentHeroImage | undefined {
  const src = getMediaURL(media)
  if (!src || !media || typeof media !== 'object') {
    return undefined
  }

  return {
    alt: media.alt,
    height: media.height || undefined,
    src,
    width: media.width || undefined,
  }
}

function getAuthorName(author: null | number | User): null | string {
  return author && typeof author === 'object' ? author.displayName || null : null
}
