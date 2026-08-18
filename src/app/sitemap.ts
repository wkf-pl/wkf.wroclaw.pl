import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'

import config from '@payload-config'

import { websiteRequestContext } from '@/modules/membership/role-permissions'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const [events, cycles, partners] = await Promise.all([
    payload.find({
      collection: 'events',
      context: websiteRequestContext,
      depth: 0,
      draft: false,
      limit: 1000,
      overrideAccess: false,
      user: null,
      where: { and: [{ _status: { equals: 'published' } }, { visibility: { equals: 'public' } }] },
    }),
    payload.find({
      collection: 'event-cycles',
      context: websiteRequestContext,
      depth: 0,
      draft: false,
      limit: 1000,
      overrideAccess: false,
      user: null,
      where: { and: [{ _status: { equals: 'published' } }, { visibility: { equals: 'public' } }] },
    }),
    payload.find({
      collection: 'partners',
      context: websiteRequestContext,
      depth: 0,
      draft: false,
      limit: 1000,
      overrideAccess: false,
      user: null,
      where: { _status: { equals: 'published' } },
    }),
  ])
  return [
    { url: 'https://wkf.wroclaw.pl/events' },
    ...events.docs.map((event) => ({
      lastModified: event.updatedAt,
      url: `https://wkf.wroclaw.pl/events/${event.slug}`,
    })),
    ...cycles.docs.map((cycle) => ({
      lastModified: cycle.updatedAt,
      url: `https://wkf.wroclaw.pl/events/series/${cycle.slug}`,
    })),
    ...partners.docs.map((partner) => ({
      lastModified: partner.updatedAt,
      url: `https://wkf.wroclaw.pl/partners/${partner.slug}`,
    })),
  ]
}
