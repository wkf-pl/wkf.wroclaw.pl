import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import {findPageForRequest} from '@/modules/content/preview-content'

import { CmsPageDocument } from '../_components/CmsPageDocument'
import {DraftPreviewBanner} from '../_components/DraftPreviewBanner'

type BlogPageProperties = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata(): Promise<Metadata> {
    const {document: page} = await findPageForRequest('blog')
  return page ? createContentMetadata(page) : {}
}

export default async function BlogPage({ searchParams }: BlogPageProperties) {
    const [{document: page, isDraftPreview}, resolvedSearchParams] = await Promise.all([
        findPageForRequest('blog'),
    searchParams,
  ])

  if (!page) {
    notFound()
  }

    return (
        <>
            {isDraftPreview ? <DraftPreviewBanner pathname="/blog"/> : null}
            <CmsPageDocument document={page} pathname="/blog" searchParams={resolvedSearchParams}/>
        </>
    )
}
