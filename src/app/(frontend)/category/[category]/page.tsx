import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { findCategoryBySlug, findPublishedPosts } from '@/modules/content/public-content'

import { PostList } from '../../_components/PostList'
import { SiteHeader } from '../../_components/SiteHeader'

type CategoryPageProperties = {
  params: Promise<{ category: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: CategoryPageProperties): Promise<Metadata> {
  const { category: slug } = await params
  const category = await findCategoryBySlug(slug)

  return category
    ? {
        description: category.description || `Wpisy w kategorii ${category.name}.`,
        title: category.name,
      }
    : {}
}

export default async function CategoryPage({ params }: CategoryPageProperties) {
  const { category: slug } = await params
  const category = await findCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const posts = await findPublishedPosts({ field: 'categories', id: category.id })

  return (
    <main className="contentShell">
      <SiteHeader />
      <header className="listingHeader">
        <p className="eyebrow">Kategoria</p>
        <h1>{category.name}</h1>
        {category.description ? <p>{category.description}</p> : null}
      </header>
      <PostList posts={posts} />
    </main>
  )
}
