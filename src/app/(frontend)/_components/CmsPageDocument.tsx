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
  aside?: ReactNode
  bodyClassName?: string
  description?: null | string
  eyebrow?: ReactNode
  afterBlocks?: ReactNode
  beforeBlocks?: ReactNode
  breadcrumbs?: PublicBreadcrumb[]
  heroContent?: ReactNode
  heroDate?: {
    dateTime: string
    label: string
  }
  showHeroMeta?: boolean
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
  aside,
  bodyClassName,
  description,
  eyebrow,
  afterBlocks,
  beforeBlocks,
  breadcrumbs: providedBreadcrumbs,
  heroContent,
  heroDate,
  showHeroMeta = true,
}: CmsPageDocumentProperties) {
  const authorName = getAuthorName(document.author)
  const category = 'category' in document ? document.category : undefined
  const tags = 'tags' in document ? document.tags : undefined
  const title = 'title' in document ? document.title : document.name
  const heroEyebrow =
    eyebrow ?? ('title' in document ? <ContentHeroCategory category={category} /> : 'Partner')
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
        <ContentHero
          breadcrumbs={breadcrumbs}
          description={description}
          eyebrow={heroEyebrow}
          image={image}
          title={title}
        >
          {heroContent}
          <TaxonomyLinks tags={tags} />
          {showHeroMeta ? <ContentHeroMeta authorName={authorName} date={date} /> : null}
        </ContentHero>

        <div
          className={[
            'contentShell',
            'contentPageBody',
            aside ? 'contentPageBody--withAside' : null,
            bodyClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {beforeBlocks}
          {aside ? (
            <div className="eventPageColumns">
              <div className="eventPageMain">
                <ContentLayoutRenderer
                  document={document}
                  pathname={pathname}
                  searchParams={searchParams}
                />
                {afterBlocks}
              </div>
              <aside aria-label="Organizatorzy i partnerzy" className="eventPageSidebar">
                {aside}
              </aside>
            </div>
          ) : (
            <>
              <ContentLayoutRenderer
                document={document}
                pathname={pathname}
                searchParams={searchParams}
              />
              {afterBlocks}
            </>
          )}
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
