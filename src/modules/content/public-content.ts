import { cache } from 'react'
import { createLocalReq, getPayload, type PopulateType } from 'payload'

import config from '@payload-config'

import type {
  Topic,
  Footer,
  HomepageHero,
  HomepageSection,
  Navigation,
  Post,
  SiteSetting,
  Tag,
} from '@/payload-types'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { publicRequestContext } from '@/modules/content/public-access'

const publishedLinkTarget = { _status: true, slug: true, title: true } as const
export const publicLinkTargetPopulate = {
  documents: publishedLinkTarget,
  'event-cycles': publishedLinkTarget,
  events: publishedLinkTarget,
  pages: { ...publishedLinkTarget, fullTitle: true },
  partners: { _status: true, name: true, slug: true },
  posts: publishedLinkTarget,
  tags: { name: true, slug: true },
  topics: { name: true, slug: true },
} satisfies PopulateType

const publicMenuPopulate = {
  ...publicLinkTargetPopulate,
  media: { _objectKey: true, alt: true, filename: true, url: true },
} satisfies PopulateType
const publicMenuCacheTags = [
  publicCacheTags.navigation,
  publicCacheTags.contentListings,
  publicCacheTags.media,
]

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
      pagination: false,
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

const getPublicMenus = cache(
  cachePublicData(
    'public-site-menus',
    async (): Promise<{ footer: Footer; navigation: Navigation }> => {
      const payload = await getPayload({ config })
      const request = await createLocalReq({ context: publicRequestContext }, payload)
      const options = {
        depth: 1,
        overrideAccess: false,
        populate: publicMenuPopulate,
        req: request,
      }
      const [navigation, footer] = await Promise.all([
        payload.findGlobal({ ...options, slug: 'navigation' }),
        payload.findGlobal({ ...options, slug: 'footer' }),
      ])
      return { footer, navigation }
    },
    { revalidate: 300, tags: publicMenuCacheTags },
  ),
)

export async function getPublicNavigation(): Promise<Navigation> {
  return (await getPublicMenus()).navigation
}

export async function getPublicFooter(): Promise<Footer> {
  return (await getPublicMenus()).footer
}

const getPublicHomepageHeroCached = cachePublicData(
  'public-homepage-hero',
  async (): Promise<HomepageHero> => {
    const payload = await getPayload({ config })
    return payload.findGlobal({
      slug: 'homepage-hero',
      context: publicRequestContext,
      depth: 2,
      overrideAccess: false,
      user: null,
    })
  },
  { revalidate: 300, tags: [publicCacheTags.navigation, publicCacheTags.homepage] },
)

export const getPublicHomepageHero = cache(getPublicHomepageHeroCached)

const getPublicHomepageSectionsCached = cachePublicData(
  'public-homepage-sections-v2',
  async (): Promise<HomepageSection> => {
    const payload = await getPayload({ config })
    return payload.findGlobal({
      slug: 'homepage-sections',
      context: publicRequestContext,
      depth: 2,
      overrideAccess: false,
      user: null,
    })
  },
  { revalidate: 300, tags: [publicCacheTags.siteSettings, publicCacheTags.homepage] },
)

export const getPublicHomepageSections = cache(getPublicHomepageSectionsCached)

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
      pagination: false,
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
  async (limit: number): Promise<Post[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'posts',
      context: publicRequestContext,
      depth: 2,
      draft: false,
      limit,
      overrideAccess: false,
      pagination: false,
      sort: ['-publishedAt', '-createdAt'],
      user: null,
      where: { _status: { equals: 'published' } },
    })

    return result.docs
  },
  { revalidate: 300, tags: [publicCacheTags.posts, publicCacheTags.homepage] },
)

export function findPublishedPosts(limit: number): Promise<Post[]> {
  const normalizedLimit = Number.isFinite(limit) ? Math.min(100, Math.max(1, Math.floor(limit))) : 1
  return findPublishedPostsCached(normalizedLimit)
}

const findTopicBySlugCached = cachePublicData(
  'topic-by-slug',
  async (slug: string): Promise<Topic | null> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'topics',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user: null,
      where: {
        slug: { equals: slug },
      },
    })

    return result.docs[0] ?? null
  },
  { revalidate: 3600, tags: [publicCacheTags.contentListings] },
)

export const findTopicBySlug = cache(findTopicBySlugCached)

export const findPublicTopicByID = cache(async (id: number): Promise<Topic | null> => {
  const payload = await getPayload({ config })
  return payload.findByID({
    collection: 'topics',
    context: publicRequestContext,
    depth: 0,
    disableErrors: true,
    id,
    joins: false,
    overrideAccess: false,
    user: null,
  })
})

const findTagBySlugCached = cachePublicData(
  'tag-by-slug',
  async (slug: string): Promise<null | Tag> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'tags',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
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
