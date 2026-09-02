import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import {findPostForRequest} from '@/modules/content/preview-content'

import { CmsDocument } from '../../_components/CmsDocument'
import {DraftPreviewBanner} from '../../_components/DraftPreviewBanner'

type BlogPostPageProperties = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: BlogPostPageProperties): Promise<Metadata> {
  const { slug } = await params
    const {document: post} = await findPostForRequest(slug)

  return post ? createContentMetadata(post) : {}
}

export default async function BlogPostPage({ params, searchParams }: BlogPostPageProperties) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
    const {document: post, isDraftPreview} = await findPostForRequest(slug)

  if (!post) {
    notFound()
  }

    const pathname = `/blog/${slug}`

    return (
        <>
            {isDraftPreview ? <DraftPreviewBanner pathname={pathname}/> : null}
            <CmsDocument document={post} searchParams={resolvedSearchParams}/>
        </>
    )
}
