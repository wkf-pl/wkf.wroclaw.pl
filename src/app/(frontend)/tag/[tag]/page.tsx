import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { findPublishedPosts, findTagBySlug } from '@/modules/content/public-content'

import { PostList } from '../../_components/PostList'

type TagPageProperties = {
  params: Promise<{ tag: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: TagPageProperties): Promise<Metadata> {
  const { tag: slug } = await params
  const tag = await findTagBySlug(slug)

  return tag
    ? {
        description: tag.description || `Wpisy oznaczone tagiem ${tag.name}.`,
        title: `#${tag.name}`,
      }
    : {}
}

export default async function TagPage({ params }: TagPageProperties) {
  const { tag: slug } = await params
  const tag = await findTagBySlug(slug)

  if (!tag) {
    notFound()
  }

  const posts = await findPublishedPosts({ field: 'tags', id: tag.id })

  return (
    <main className="contentShell">
      <header className="listingHeader">
        <p className="eyebrow">Tag</p>
        <h1>#{tag.name}</h1>
        {tag.description ? <p>{tag.description}</p> : null}
      </header>
      <PostList posts={posts} />
    </main>
  )
}
