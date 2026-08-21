import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import { findPublishedPostBySlug } from '@/modules/content/public-content'

import { CmsDocument } from '../../_components/CmsDocument'

type BlogPostPageProperties = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: BlogPostPageProperties): Promise<Metadata> {
  const { slug } = await params
  const post = await findPublishedPostBySlug(slug)

  return post ? createContentMetadata(post) : {}
}

export default async function BlogPostPage({ params, searchParams }: BlogPostPageProperties) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const post = await findPublishedPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return <CmsDocument document={post} searchParams={resolvedSearchParams} />
}
