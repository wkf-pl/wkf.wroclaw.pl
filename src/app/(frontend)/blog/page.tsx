import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import {
  findPageForRequest,
  findRenderablePageTemplateForRequest,
} from '@/modules/content/preview-content'
import { findPublishedPageBySlug } from '@/modules/content/public-content'

import { CmsPageDocument } from '../_components/CmsPageDocument'
import { DraftPreviewBanner } from '../_components/DraftPreviewBanner'
import { IndexPageTemplateDocument } from '../_components/IndexPageTemplateDocument'

type BlogPageProperties = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ searchParams }: BlogPageProperties): Promise<Metadata> {
  const { document: template } = await findRenderablePageTemplateForRequest(
    'blog-index',
    await searchParams,
  )
  if (template) {
    const page = await findPublishedPageBySlug('blog')
    return page
      ? createContentMetadata(page)
      : { alternates: { canonical: '/blog' }, title: 'Blog' }
  }

  const { document: page } = await findPageForRequest('blog')
  return page ? createContentMetadata(page) : {}
}

export default async function BlogPage({ searchParams }: BlogPageProperties) {
  const resolvedSearchParams = await searchParams
  const { document: template, isDraftPreview: isTemplatePreview } =
    await findRenderablePageTemplateForRequest('blog-index', resolvedSearchParams)

  if (template) {
    return (
      <IndexPageTemplateDocument
        isDraftPreview={isTemplatePreview}
        pathname="/blog"
        searchParams={resolvedSearchParams}
        template={template}
        title="Blog"
      />
    )
  }

  const { document: page, isDraftPreview } = await findPageForRequest('blog')
  if (!page) {
    notFound()
  }

  return (
    <>
      {isDraftPreview ? <DraftPreviewBanner pathname="/blog" /> : null}
      <CmsPageDocument
        collection="pages"
        document={page}
        pathname="/blog"
        searchParams={resolvedSearchParams}
      />
    </>
  )
}
