import { unstable_cache } from 'next/cache.js'
import { connection } from 'next/server.js'

export const publicCacheTags = {
  contentListings: 'public:content-listings',
  eventCycles: 'public:event-cycles',
  events: 'public:events',
  homepage: 'public:homepage',
  media: 'public:media',
  memberProfiles: 'public:member-profiles',
  navigation: 'public:navigation',
  pages: 'public:pages',
  partners: 'public:partners',
  posts: 'public:posts',
  siteSettings: 'public:site-settings',
  sitemap: 'public:sitemap',
} as const

export const skipPublicCacheInvalidationContextKey = 'skipPublicCacheInvalidation'
export const isPublicDataCacheEnabled =
  process.env.NODE_ENV !== 'test' && process.env.VITEST !== 'true'

type PublicDataCacheOptions = { revalidate: number; tags: string[] }

type PublicDataCacheDependencies = {
  cache: <Arguments extends unknown[], Result>(
    loader: (...arguments_: Arguments) => Promise<Result>,
    keyParts: string[],
    options: PublicDataCacheOptions,
  ) => (...arguments_: Arguments) => Promise<Result>
  enabled: boolean
  waitForConnection: () => Promise<void>
}

export function createPublicDataCache(dependencies: PublicDataCacheDependencies) {
  return function cachePublicData<Arguments extends unknown[], Result>(
    key: string,
    loader: (...arguments_: Arguments) => Promise<Result>,
    options: PublicDataCacheOptions,
  ): (...arguments_: Arguments) => Promise<Result> {
    if (!dependencies.enabled) return loader

    const cachedLoader = dependencies.cache(loader, [key], options)
    return async (...arguments_: Arguments) => {
      await dependencies.waitForConnection()
      return cachedLoader(...arguments_)
    }
  }
}

export const cachePublicData = createPublicDataCache({
  cache: unstable_cache,
  enabled: isPublicDataCacheEnabled,
  waitForConnection: connection,
})
