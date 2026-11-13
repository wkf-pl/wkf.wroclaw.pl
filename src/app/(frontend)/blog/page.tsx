import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createBlogTemplateMetadata } from '@/modules/content/content-metadata'
import { findRenderablePageTemplateForRequest } from '@/modules/content/preview-content'
import { findPublishedPageTemplate } from '@/modules/page-templates/public-page-templates'
import type { PageTemplate } from '@/payload-types'

import { IndexPageTemplateDocument } from '../_components/IndexPageTemplateDocument'

type BlogPageProperties = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const legacyBlogContent: PageTemplate['content'] = [
  {
    blockType: 'listing',
    pageSize: 12,
    pagination: true,
    selectionMode: 'filters',
    sort: 'newest',
    sources: ['posts'],
    view: 'cards',
  },
]

export async function generateMetadata(): Promise<Metadata> {
  return createBlogTemplateMetadata(await findPublishedPageTemplate('blog-index'))
}

export default async function BlogPage({ searchParams }: BlogPageProperties) {
  const parameters = await searchParams
  const { document, isDraftPreview } = await findRenderablePageTemplateForRequest(
    'blog-index',
    parameters,
  )
  const publishedTemplate = document ?? (await findPublishedPageTemplate('blog-index'))
  if (!publishedTemplate) notFound()

  const template = document ?? {
    ...publishedTemplate,
    hero: [],
    heroImage: null,
    informationPanel: [],
    content: legacyBlogContent,
  }

  return (
    <IndexPageTemplateDocument
      isDraftPreview={Boolean(document) && isDraftPreview}
      pathname="/blog"
      searchParams={parameters}
      template={template}
      title="Blog"
    />
  )
}
