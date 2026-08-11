import { cache } from 'react'
import { getPayload } from 'payload'

import config from '@payload-config'

import type { Category, Post, Tag } from '@/payload-types'

type PostTaxonomyFilter = {
  field: 'categories' | 'tags'
  id: number
}

export const findPublishedPageBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'pages',
    depth: 2,
    draft: false,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })

  return result.docs[0] ?? null
})

export const findPublishedPostBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    draft: false,
    limit: 1,
    overrideAccess: false,
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
  })

  return result.docs[0] ?? null
})

export async function findPublishedPosts(filter?: PostTaxonomyFilter): Promise<Post[]> {
  const payload = await getPayload({ config })
  const taxonomyConstraint = filter ? { [filter.field]: { equals: filter.id } } : undefined
  const result = await payload.find({
    collection: 'posts',
    depth: 2,
    draft: false,
    limit: 100,
    overrideAccess: false,
    sort: ['-publishedAt', '-createdAt'],
    where: {
      and: [
        { _status: { equals: 'published' } },
        ...(taxonomyConstraint ? [taxonomyConstraint] : []),
      ],
    },
  })

  return result.docs
}

export const findCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs[0] ?? null
})

export const findTagBySlug = cache(async (slug: string): Promise<null | Tag> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'tags',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs[0] ?? null
})
