import type { ReactNode } from 'react'

import type { Event, EventCycle, Page, Partner, Post, User } from '@/payload-types'
import { createPageBreadcrumbs } from '@/modules/content/public-hierarchy'

import { CmsImage } from './CmsImage'
import { ContentLayoutRenderer } from './ContentLayoutRenderer'
import { HierarchyBreadcrumbs } from './HierarchyBreadcrumbs'
import { TaxonomyLinks } from './TaxonomyLinks'

type CmsPageDocumentProperties = {
  document: Event | EventCycle | Page | Partner | Post
  pathname: string
  searchParams: Record<string, string | string[] | undefined>
  showBlogEyebrow?: boolean
  eyebrow?: string
  afterBlocks?: ReactNode
  beforeBlocks?: ReactNode
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
  showBlogEyebrow = false,
  eyebrow,
  afterBlocks,
  beforeBlocks,
}: CmsPageDocumentProperties) {
  const authorName = getAuthorName(document.author)
  const category = 'category' in document ? document.category : undefined
  const tags = 'tags' in document ? document.tags : undefined
  const title = 'title' in document ? document.title : document.name
  const breadcrumbs = 'breadcrumbs' in document ? await createPageBreadcrumbs(document) : []
  return (
    <main className="contentShell">
      <article className="cmsDocument cmsPageDocument">
        <header className="cmsDocumentHeader">
          <HierarchyBreadcrumbs breadcrumbs={breadcrumbs} />
          {showBlogEyebrow || eyebrow ? <p className="eyebrow">{eyebrow || 'Blog'}</p> : null}
          <h1>{title}</h1>
          <TaxonomyLinks category={category} tags={tags} />
          {document.publishedAt || authorName ? (
            <p className="contentMeta">
              {document.publishedAt ? (
                <time dateTime={document.publishedAt}>
                  {dateFormatter.format(new Date(document.publishedAt))}
                </time>
              ) : null}
              {document.publishedAt && authorName ? ' · ' : null}
              {authorName ? `Autor: ${authorName}` : null}
            </p>
          ) : null}
        </header>

        <CmsImage className="heroImage" media={document.heroImage} />

        {beforeBlocks}

        <ContentLayoutRenderer
          document={document}
          pathname={pathname}
          searchParams={searchParams}
        />
        {afterBlocks}
      </article>
    </main>
  )
}

function getAuthorName(author: null | number | User): null | string {
  return author && typeof author === 'object' ? author.displayName || null : null
}
