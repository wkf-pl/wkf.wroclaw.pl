import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import { findPublishedPageBySlug } from '@/modules/content/public-content'

import { CmsPageDocument } from '../_components/CmsPageDocument'

type PageProperties = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProperties): Promise<Metadata> {
  const { slug } = await params
  const page = await findPublishedPageBySlug(slug)

  return page ? createContentMetadata(page) : {}
}

export default async function StaticPage({ params, searchParams }: PageProperties) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const page = await findPublishedPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return (
    <CmsPageDocument document={page} pathname={`/${slug}`} searchParams={resolvedSearchParams} />
  )
}
