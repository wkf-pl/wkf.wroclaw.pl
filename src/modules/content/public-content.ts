import { cache } from 'react'
import { getPayload } from 'payload'

import config from '@payload-config'

import type { Category, ClubSection, Navigation, Post, SiteSetting, Tag } from '@/payload-types'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { publicRequestContext } from '@/modules/content/public-access'

type PostTaxonomyFilter = {
  field: 'category' | 'tags'
  id: number
}

const findPublishedPageBySlugCached = cachePublicData(
  'published-page-by-slug',
  async (slug: string) => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pages',
      context: publicRequestContext,
      depth: 2,
      draft: false,
      limit: 1,
      overrideAccess: false,
      user: null,
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
      },
    })

    return result.docs[0] ?? null
  },
  { revalidate: 3600, tags: [publicCacheTags.pages] },
)

export const findPublishedPageBySlug = cache(findPublishedPageBySlugCached)

const getPublicNavigationCached = cachePublicData(
  'public-navigation',
  async (): Promise<Navigation> => {
    const payload = await getPayload({ config })
    return payload.findGlobal({
      slug: 'navigation',
      context: publicRequestContext,
      depth: 2,
      overrideAccess: false,
      user: null,
    })
  },
  { revalidate: 300, tags: [publicCacheTags.navigation, publicCacheTags.homepage] },
)

export const getPublicNavigation = cache(getPublicNavigationCached)

const getPublicSiteSettingsCached = cachePublicData(
  'public-site-settings',
  async (): Promise<SiteSetting> => {
    const payload = await getPayload({ config })
    return payload.findGlobal({
      slug: 'site-settings',
      context: publicRequestContext,
      depth: 1,
      overrideAccess: false,
      user: null,
    })
  },
  { revalidate: 300, tags: [publicCacheTags.siteSettings, publicCacheTags.homepage] },
)

export const getPublicSiteSettings = cache(getPublicSiteSettingsCached)

const findPublishedClubSectionsCached = cachePublicData(
  'published-club-sections',
  async (): Promise<ClubSection[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'club-sections',
      context: publicRequestContext,
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
  },
  { revalidate: 300, tags: [publicCacheTags.homepage] },
)

export const findPublishedClubSections = cache(findPublishedClubSectionsCached)

const findPublishedPostBySlugCached = cachePublicData(
  'published-post-by-slug',
  async (slug: string) => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      context: publicRequestContext,
      depth: 2,
      draft: false,
      limit: 1,
      overrideAccess: false,
      user: null,
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
      },
    })

    return result.docs[0] ?? null
  },
  { revalidate: 3600, tags: [publicCacheTags.posts] },
)

export const findPublishedPostBySlug = cache(findPublishedPostBySlugCached)

const findPublishedPostsCached = cachePublicData(
  'published-posts',
  async (field?: PostTaxonomyFilter['field'], id?: number): Promise<Post[]> => {
    const payload = await getPayload({ config })
    const taxonomyConstraint = field && id !== undefined ? { [field]: { equals: id } } : undefined
    const result = await payload.find({
      collection: 'posts',
      context: publicRequestContext,
      depth: 2,
      draft: false,
      limit: 100,
      overrideAccess: false,
      sort: ['-publishedAt', '-createdAt'],
      user: null,
      where: {
        and: [
          { _status: { equals: 'published' } },
          ...(taxonomyConstraint ? [taxonomyConstraint] : []),
        ],
      },
    })

    return result.docs
  },
  { revalidate: 300, tags: [publicCacheTags.posts, publicCacheTags.homepage] },
)

export function findPublishedPosts(filter?: PostTaxonomyFilter): Promise<Post[]> {
  return findPublishedPostsCached(filter?.field, filter?.id)
}

const findCategoryBySlugCached = cachePublicData(
  'category-by-slug',
  async (slug: string): Promise<Category | null> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'categories',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      user: null,
      where: {
        slug: { equals: slug },
      },
    })

    return result.docs[0] ?? null
  },
  { revalidate: 3600, tags: [publicCacheTags.contentListings] },
)

export const findCategoryBySlug = cache(findCategoryBySlugCached)

const findTagBySlugCached = cachePublicData(
  'tag-by-slug',
  async (slug: string): Promise<null | Tag> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'tags',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      user: null,
      where: {
        slug: { equals: slug },
      },
    })

    return result.docs[0] ?? null
  },
  { revalidate: 3600, tags: [publicCacheTags.contentListings] },
)

export const findTagBySlug = cache(findTagBySlugCached)
