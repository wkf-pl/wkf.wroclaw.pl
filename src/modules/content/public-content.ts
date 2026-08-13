import { cache } from 'react'
import { getPayload } from 'payload'

import config from '@payload-config'

import type { Category, ClubSection, Footer, Navigation, Post, Tag } from '@/payload-types'

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

export const getPublicNavigation = cache(async (): Promise<Navigation> => {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'navigation',
    depth: 2,
    overrideAccess: false,
    user: null,
  })
})

export const getPublicFooter = cache(async (): Promise<Footer> => {
  const payload = await getPayload({ config })
  return payload.findGlobal({
    slug: 'footer',
    depth: 0,
    overrideAccess: false,
    user: null,
  })
})

export const findPublishedClubSections = cache(async (): Promise<ClubSection[]> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'club-sections',
    depth: 2,
    draft: false,
    limit: 100,
    overrideAccess: false,
    sort: ['displayOrder', 'name'],
    user: null,
    where: {
      _status: { equals: 'published' },
    },
  })

  return result.docs
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
