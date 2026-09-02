import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import { findPageForRequest } from '@/modules/content/preview-content'

import { CmsPageDocument } from '../_components/CmsPageDocument'
import { DraftPreviewBanner } from '../_components/DraftPreviewBanner'

type PageProperties = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProperties): Promise<Metadata> {
  const { slug } = await params
  const { document: page } = await findPageForRequest(slug)

  return page ? createContentMetadata(page) : {}
}

export default async function StaticPage({ params, searchParams }: PageProperties) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const { document: page, isDraftPreview } = await findPageForRequest(slug)

  if (!page) {
    notFound()
  }

  const pathname = `/${slug}`

  return (
    <>
      {isDraftPreview ? <DraftPreviewBanner pathname={pathname} /> : null}
      <CmsPageDocument document={page} pathname={pathname} searchParams={resolvedSearchParams} />
    </>
  )
}
