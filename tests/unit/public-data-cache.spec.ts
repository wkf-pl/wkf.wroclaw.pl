import { describe, expect, it, vi } from 'vitest'

import { createPublicDataCache, publicCacheTags } from '@/modules/cache/public-data-cache'
import {
  createPublicCacheInvalidator,
  getContentSourceCacheTags,
  getMemberProfileCacheTags,
  getMemberProfileImageCacheTags,
  getPartnerCacheTags,
  invalidateMemberProfileImagesAfterChange,
  invalidateMemberProfileImagesAfterDelete,
  invalidateMemberProfilesAfterChange,
  invalidateMemberProfilesAfterDelete,
  invalidatePartnersAfterChange,
  invalidatePartnersAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { normalizePublicMediaOptions } from '@/modules/media/media-listing'
import { MemberProfileImages } from '@/collections/MemberProfileImages'
import { MemberProfiles } from '@/collections/MemberProfiles'
import { Partners } from '@/collections/Partners'

describe('public data cache', () => {
  it('reuses data for the same arguments after crossing the connection boundary', async () => {
    const values = new Map<string, Promise<unknown>>()
    const waitForConnection = vi.fn(async () => undefined)
    const cachePublicData = createPublicDataCache({
      cache: <Arguments extends unknown[], Result>(
        loader: (...arguments_: Arguments) => Promise<Result>,
      ) => {
        return (...arguments_: Arguments): Promise<Result> => {
          const key = JSON.stringify(arguments_)
          const existing = values.get(key) as Promise<Result> | undefined
          if (existing) return existing
          const value = loader(...arguments_)
          values.set(key, value)
          return value
        }
      },
      enabled: true,
      waitForConnection,
    })
    const loader = vi.fn(async (slug: string) => ({ slug }))
    const cachedLoader = cachePublicData('test-loader', loader, {
      revalidate: 300,
      tags: [publicCacheTags.pages],
    })

    await expect(cachedLoader('page')).resolves.toEqual({ slug: 'page' })
    await expect(cachedLoader('page')).resolves.toEqual({ slug: 'page' })

    expect(loader).toHaveBeenCalledTimes(1)
    expect(waitForConnection).toHaveBeenCalledTimes(2)
  })

  it('maps source changes to dependent listing, detail, homepage and sitemap tags', () => {
    expect(getContentSourceCacheTags('posts')).toEqual([
      publicCacheTags.posts,
      publicCacheTags.contentListings,
      publicCacheTags.homepage,
      publicCacheTags.sitemap,
    ])
    expect(getContentSourceCacheTags('pages')).toEqual([
      publicCacheTags.pages,
      publicCacheTags.contentListings,
      publicCacheTags.sitemap,
    ])
  })

  it('expires every unique tag immediately', () => {
    const revalidate = vi.fn()
    const invalidate = createPublicCacheInvalidator({ enabled: true, revalidate })

    invalidate([publicCacheTags.sitemap, publicCacheTags.sitemap, publicCacheTags.homepage])

    expect(revalidate.mock.calls).toEqual([
      [publicCacheTags.sitemap, { expire: 0 }],
      [publicCacheTags.homepage, { expire: 0 }],
    ])
  })

  it('maps partner and member profile changes to all embedded cache dependencies', () => {
    expect(getPartnerCacheTags()).toEqual([
      publicCacheTags.partners,
      publicCacheTags.events,
      publicCacheTags.eventCycles,
      publicCacheTags.sitemap,
    ])
    expect(getMemberProfileCacheTags()).toEqual([
      publicCacheTags.memberProfiles,
      publicCacheTags.pages,
      publicCacheTags.posts,
      publicCacheTags.events,
      publicCacheTags.eventCycles,
      publicCacheTags.partners,
      publicCacheTags.sitemap,
    ])
    expect(getMemberProfileImageCacheTags()).toEqual(
      getMemberProfileCacheTags().filter((tag) => tag !== publicCacheTags.sitemap),
    )
  })

  it('uses matching invalidators for create, update and delete hooks', () => {
    expect(Partners.hooks?.afterChange).toContain(invalidatePartnersAfterChange)
    expect(Partners.hooks?.afterDelete).toContain(invalidatePartnersAfterDelete)
    expect(MemberProfiles.hooks?.afterChange).toContain(invalidateMemberProfilesAfterChange)
    expect(MemberProfiles.hooks?.afterDelete).toContain(invalidateMemberProfilesAfterDelete)
    expect(MemberProfileImages.hooks?.afterChange).toContain(
      invalidateMemberProfileImagesAfterChange,
    )
    expect(MemberProfileImages.hooks?.afterDelete).toContain(
      invalidateMemberProfileImagesAfterDelete,
    )
  })

  it('normalizes every filtered media cache-key dimension', () => {
    const base = {
      categoryId: 3,
      kind: 'attachments' as const,
      page: 2.8,
      pageSize: 1000,
      pagination: true,
      selectionMode: 'filters' as const,
      sort: 'newest' as const,
      tagId: 5,
    }

    expect(normalizePublicMediaOptions(base)).toEqual({
      categoryId: 3,
      kind: 'attachments',
      page: 2,
      pageSize: 100,
      pagination: true,
      selectionMode: 'filters',
      sort: 'newest',
      tagId: 5,
    })
  })
})
