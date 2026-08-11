import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import { findPublishedPostBySlug } from '@/modules/content/public-content'

import { CmsDocument } from '../../_components/CmsDocument'

type BlogPostPageProperties = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: BlogPostPageProperties): Promise<Metadata> {
  const { slug } = await params
  const post = await findPublishedPostBySlug(slug)

  return post ? createContentMetadata(post) : {}
}

export default async function BlogPostPage({ params }: BlogPostPageProperties) {
  const { slug } = await params
  const post = await findPublishedPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return <CmsDocument document={post} />
}
