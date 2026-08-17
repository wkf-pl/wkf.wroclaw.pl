import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { findTagBySlug } from '@/modules/content/public-content'

import { TaxonomyContentPage } from '../../_components/TaxonomyContentPage'

type TagPageProperties = {
  params: Promise<{ tag: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: TagPageProperties): Promise<Metadata> {
  const { tag: slug } = await params
  const tag = await findTagBySlug(slug)

  return tag
    ? {
        description: tag.description || `Treści oznaczone tagiem ${tag.name}.`,
        title: `#${tag.name}`,
      }
    : {}
}

export default async function TagPage({ params, searchParams }: TagPageProperties) {
  const { tag: slug } = await params
  const [tag, resolvedSearchParams] = await Promise.all([findTagBySlug(slug), searchParams])

  if (!tag) {
    notFound()
  }

  return <TaxonomyContentPage kind="tag" searchParams={resolvedSearchParams} taxonomy={tag} />
}
