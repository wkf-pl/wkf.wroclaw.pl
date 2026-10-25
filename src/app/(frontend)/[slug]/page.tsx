import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import { findPageForRequest } from '@/modules/content/preview-content'
import { appendSearchParameters } from '@/modules/url-aliases/url-aliases'
import { findPublicUrlAliasDestination } from '@/modules/url-aliases/public-url-aliases'

import { CmsPageDocument } from '../_components/CmsPageDocument'
import { DraftPreviewBanner } from '../_components/DraftPreviewBanner'

type PageProperties = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: PageProperties): Promise<Metadata> {
  const { slug } = await params
  if (await findPublicUrlAliasDestination(slug)) return {}

  const { document: page } = await findPageForRequest(slug)

  return page ? createContentMetadata(page) : {}
}

export default async function StaticPage({ params, searchParams }: PageProperties) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const aliasDestination = await findPublicUrlAliasDestination(slug)
  if (aliasDestination) {
    permanentRedirect(appendSearchParameters(aliasDestination, resolvedSearchParams))
  }

  const { document: page, isDraftPreview } = await findPageForRequest(slug)

  if (!page) {
    notFound()
  }

  const pathname = `/${slug}`

  return (
    <>
      {isDraftPreview ? <DraftPreviewBanner pathname={pathname} /> : null}
      <CmsPageDocument
        collection="pages"
        document={page}
        pathname={pathname}
        searchParams={resolvedSearchParams}
      />
    </>
  )
}
