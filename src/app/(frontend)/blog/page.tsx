import type { Metadata } from 'next'

import { findPublishedPosts } from '@/modules/content/public-content'

import { PostList } from '../_components/PostList'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  description: 'Artykuły i aktualności Wrocławskiego Klubu Fantastyki.',
  title: 'Blog',
}

export default async function BlogPage() {
  const posts = await findPublishedPosts()

  return (
    <main className="contentShell">
      <header className="listingHeader">
        <p className="eyebrow">WKF</p>
        <h1>Blog</h1>
        <p>Artykuły, aktualności i relacje z życia klubu.</p>
      </header>
      <PostList posts={posts} />
    </main>
  )
}
