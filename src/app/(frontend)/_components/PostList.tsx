import Link from 'next/link'

import type { Post } from '@/payload-types'

import { CmsImage } from './CmsImage'
import { TaxonomyLinks } from './TaxonomyLinks'

type PostListProperties = {
  posts: Post[]
}

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export function PostList({ posts }: PostListProperties) {
  if (!posts.length) {
    return <p className="emptyState">Nie ma jeszcze opublikowanych wpisów.</p>
  }

  return (
    <div className="postList">
      {posts.map((post) => (
        <article className="postCard" key={post.id}>
          <Link aria-label={post.title} className="postCardImage" href={`/blog/${post.slug}`}>
            <CmsImage media={post.heroImage} />
          </Link>
          <div className="postCardContent">
            {post.publishedAt ? (
              <time dateTime={post.publishedAt}>
                {dateFormatter.format(new Date(post.publishedAt))}
              </time>
            ) : null}
            <h2>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.excerpt}</p>
            <TaxonomyLinks categories={post.categories} tags={post.tags} />
          </div>
        </article>
      ))}
    </div>
  )
}
