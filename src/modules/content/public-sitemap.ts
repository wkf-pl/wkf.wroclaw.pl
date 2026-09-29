import { getPayload } from 'payload'

import config from '@payload-config'

import { collectPayloadPages } from '@/lib/payload-pagination'

import { publicRequestContext } from './public-access'
import { createPublicSitemap } from './sitemap'

const publicContentWhere = { _status: { equals: 'published' } } as const
const sitemapDocumentSelect = { slug: true, updatedAt: true } as const

export async function loadPublicSitemap() {
  const payload = await getPayload({ config })
  const [pages, posts, categories, tags, events, cycles, partners, memberProfiles] =
    await Promise.all([
      collectPayloadPages((page) =>
        payload.find({
          collection: 'pages',
          context: publicRequestContext,
          depth: 0,
          draft: false,
          limit: 100,
          overrideAccess: false,
          page,
          select: { ...sitemapDocumentSelect, systemKey: true },
          user: null,
          where: publicContentWhere,
        }),
      ),
      collectPayloadPages((page) =>
        payload.find({
          collection: 'posts',
          context: publicRequestContext,
          depth: 0,
          draft: false,
          limit: 100,
          overrideAccess: false,
          page,
          select: sitemapDocumentSelect,
          user: null,
          where: publicContentWhere,
        }),
      ),
      collectPayloadPages((page) =>
        payload.find({
          collection: 'categories',
          context: publicRequestContext,
          depth: 0,
          limit: 100,
          overrideAccess: false,
          page,
          select: sitemapDocumentSelect,
          user: null,
        }),
      ),
      collectPayloadPages((page) =>
        payload.find({
          collection: 'tags',
          context: publicRequestContext,
          depth: 0,
          limit: 100,
          overrideAccess: false,
          page,
          select: sitemapDocumentSelect,
          user: null,
        }),
      ),
      collectPayloadPages((page) =>
        payload.find({
          collection: 'events',
          context: publicRequestContext,
          depth: 0,
          draft: false,
          limit: 100,
          overrideAccess: false,
          page,
          select: sitemapDocumentSelect,
          user: null,
          where: publicContentWhere,
        }),
      ),
      collectPayloadPages((page) =>
        payload.find({
          collection: 'event-cycles',
          context: publicRequestContext,
          depth: 0,
          draft: false,
          limit: 100,
          overrideAccess: false,
          page,
          select: sitemapDocumentSelect,
          user: null,
          where: publicContentWhere,
        }),
      ),
      collectPayloadPages((page) =>
        payload.find({
          collection: 'partners',
          context: publicRequestContext,
          depth: 0,
          draft: false,
          limit: 100,
          overrideAccess: false,
          page,
          select: sitemapDocumentSelect,
          user: null,
          where: publicContentWhere,
        }),
      ),
      collectPayloadPages((page) =>
        payload.find({
          collection: 'member-profiles',
          context: publicRequestContext,
          depth: 0,
          draft: false,
          limit: 100,
          overrideAccess: false,
          page,
          select: sitemapDocumentSelect,
          user: null,
          where: publicContentWhere,
        }),
      ),
    ])

  return createPublicSitemap({
    categories,
    cycles,
    events,
    memberProfiles,
    pages,
    partners,
    posts,
    tags,
  })
}
