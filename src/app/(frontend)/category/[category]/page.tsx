import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { findCategoryBySlug } from '@/modules/content/public-content'

import { TaxonomyContentPage } from '../../_components/TaxonomyContentPage'

type CategoryPageProperties = {
  params: Promise<{ category: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: CategoryPageProperties): Promise<Metadata> {
  const { category: slug } = await params
  const category = await findCategoryBySlug(slug)

  return category
    ? {
        description: category.description || `Treści w kategorii ${category.name}.`,
        title: category.name,
      }
    : {}
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProperties) {
  const { category: slug } = await params
  const [category, resolvedSearchParams] = await Promise.all([
    findCategoryBySlug(slug),
    searchParams,
  ])

  if (!category) {
    notFound()
  }

  return (
    <TaxonomyContentPage kind="category" searchParams={resolvedSearchParams} taxonomy={category} />
  )
}
