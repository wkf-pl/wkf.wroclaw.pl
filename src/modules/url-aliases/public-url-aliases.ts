import { cache } from 'react'
import { getPayload } from 'payload'

import config from '@payload-config'

import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { publicRequestContext } from '@/modules/content/public-access'

import { resolveUrlAliasTarget } from './url-aliases'

const findPublicUrlAliasDestinationCached = cachePublicData(
  'public-url-alias-destination',
  async (slug: string): Promise<null | string> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'url-aliases',
      context: publicRequestContext,
      depth: 1,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user: null,
      where: { slug: { equals: slug } },
    })

    return result.docs[0] ? resolveUrlAliasTarget(result.docs[0]) : null
  },
  {
    revalidate: 300,
    tags: [
      publicCacheTags.urlAliases,
      publicCacheTags.pages,
      publicCacheTags.posts,
      publicCacheTags.events,
      publicCacheTags.eventCycles,
      publicCacheTags.partners,
      publicCacheTags.contentListings,
    ],
  },
)

export const findPublicUrlAliasDestination = cache(findPublicUrlAliasDestinationCached)
