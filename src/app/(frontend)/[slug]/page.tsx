import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import { findPublishedPageBySlug } from '@/modules/content/public-content'

import { CmsDocument } from '../_components/CmsDocument'

type PageProperties = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProperties): Promise<Metadata> {
  const { slug } = await params
  const page = await findPublishedPageBySlug(slug)

  return page ? createContentMetadata(page) : {}
}

export default async function StaticPage({ params }: PageProperties) {
  const { slug } = await params
  const page = await findPublishedPageBySlug(slug)

  if (!page) {
    notFound()
  }

  return <CmsDocument document={page} />
}
