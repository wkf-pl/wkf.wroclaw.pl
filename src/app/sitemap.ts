import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import config from '@payload-config'

import { createPublicSitemap } from '@/modules/content/sitemap'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { publicRequestContext } from '@/modules/content/public-access'

async function loadPublicSitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const [pages, posts, categories, tags, events, cycles, partners, memberProfiles] =
    await Promise.all([
      payload.find({
        collection: 'pages',
        context: publicRequestContext,
        depth: 0,
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        user: null,
        where: { _status: { equals: 'published' } },
      }),
      payload.find({
        collection: 'posts',
        context: publicRequestContext,
        depth: 0,
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        user: null,
        where: { _status: { equals: 'published' } },
      }),
      payload.find({
        collection: 'categories',
        context: publicRequestContext,
        depth: 0,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        user: null,
      }),
      payload.find({
        collection: 'tags',
        context: publicRequestContext,
        depth: 0,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        user: null,
      }),
      payload.find({
        collection: 'events',
        context: publicRequestContext,
        depth: 0,
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        user: null,
        where: { _status: { equals: 'published' } },
      }),
      payload.find({
        collection: 'event-cycles',
        context: publicRequestContext,
        depth: 0,
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        user: null,
        where: { _status: { equals: 'published' } },
      }),
      payload.find({
        collection: 'partners',
        context: publicRequestContext,
        depth: 0,
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        user: null,
        where: { _status: { equals: 'published' } },
      }),
      payload.find({
        collection: 'member-profiles',
        context: publicRequestContext,
        depth: 0,
        draft: false,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        user: null,
        where: { _status: { equals: 'published' } },
      }),
    ])

  return createPublicSitemap({
    categories: categories.docs,
    cycles: cycles.docs,
    events: events.docs,
    memberProfiles: memberProfiles.docs,
    pages: pages.docs,
    partners: partners.docs,
    posts: posts.docs,
    tags: tags.docs,
  })
}

export default cachePublicData('public-sitemap', loadPublicSitemap, {
  revalidate: 3600,
  tags: [publicCacheTags.sitemap],
})
