import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import { findPublishedPageBySlug } from '@/modules/content/public-content'

import { CmsPageDocument } from '../_components/CmsPageDocument'

type BlogPageProperties = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await findPublishedPageBySlug('blog')
  return page ? createContentMetadata(page) : {}
}

export default async function BlogPage({ searchParams }: BlogPageProperties) {
  const [page, resolvedSearchParams] = await Promise.all([
    findPublishedPageBySlug('blog'),
    searchParams,
  ])

  if (!page) {
    notFound()
  }

  return <CmsPageDocument document={page} pathname="/blog" searchParams={resolvedSearchParams} />
}
