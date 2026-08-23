import { revalidateTag } from 'next/cache.js'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

import type { TaxonomizableCollectionSlug } from '@/modules/content/content-listing'

import {
  isPublicDataCacheEnabled,
  publicCacheTags,
  skipPublicCacheInvalidationContextKey,
} from './public-data-cache'

const tagsBySource: Record<TaxonomizableCollectionSlug, string[]> = {
  'event-cycles': [
    publicCacheTags.eventCycles,
    publicCacheTags.contentListings,
    publicCacheTags.homepage,
    publicCacheTags.sitemap,
  ],
  events: [
    publicCacheTags.events,
    publicCacheTags.contentListings,
    publicCacheTags.homepage,
    publicCacheTags.sitemap,
  ],
  pages: [publicCacheTags.pages, publicCacheTags.contentListings, publicCacheTags.sitemap],
  posts: [
    publicCacheTags.posts,
    publicCacheTags.contentListings,
    publicCacheTags.homepage,
    publicCacheTags.sitemap,
  ],
}

export function createPublicCacheInvalidator({
  enabled,
  revalidate,
}: {
  enabled: boolean
  revalidate: (tag: string, profile: { expire: number }) => void
}) {
  return (tags: readonly string[]): void => {
    if (!enabled) return
    for (const tag of new Set(tags)) revalidate(tag, { expire: 0 })
  }
}

function revalidateNextCacheTag(tag: string, profile: { expire: number }): void {
  try {
    revalidateTag(tag, profile)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith('Invariant: static generation store missing in revalidateTag')
    ) {
      return
    }
    throw error
  }
}

export const invalidatePublicCacheTags = createPublicCacheInvalidator({
  enabled: isPublicDataCacheEnabled,
  revalidate: revalidateNextCacheTag,
})

export function invalidateContentSource(source: TaxonomizableCollectionSlug): void {
  invalidatePublicCacheTags(tagsBySource[source])
}

export function getContentSourceCacheTags(source: TaxonomizableCollectionSlug): string[] {
  return [...tagsBySource[source]]
}

export const invalidateListingsAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
    invalidatePublicCacheTags([
      publicCacheTags.contentListings,
      publicCacheTags.media,
      publicCacheTags.sitemap,
    ])
  }
  return doc
}

export const invalidateListingsAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
    invalidatePublicCacheTags([
      publicCacheTags.contentListings,
      publicCacheTags.media,
      publicCacheTags.sitemap,
    ])
  }
  return doc
}

export const invalidateSitemapAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
    invalidatePublicCacheTags([publicCacheTags.sitemap])
  }
  return doc
}

export const invalidateSitemapAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
    invalidatePublicCacheTags([publicCacheTags.sitemap])
  }
  return doc
}

export const invalidateAllPublicDataAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
    invalidatePublicCacheTags(Object.values(publicCacheTags))
  }
  return doc
}

export const invalidateAllPublicDataAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
    invalidatePublicCacheTags(Object.values(publicCacheTags))
  }
  return doc
}

export const invalidateNavigationAfterChange: GlobalAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
    invalidatePublicCacheTags([publicCacheTags.navigation, publicCacheTags.homepage])
  }
  return doc
}

export const invalidateSiteSettingsAfterChange: GlobalAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
    invalidatePublicCacheTags([publicCacheTags.siteSettings, publicCacheTags.homepage])
  }
  return doc
}

export const invalidateHomepageAfterChange: CollectionAfterChangeHook = ({ doc, req }) => {
  if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
    invalidatePublicCacheTags([publicCacheTags.homepage])
  }
  return doc
}

export const invalidateHomepageAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
    invalidatePublicCacheTags([publicCacheTags.homepage])
  }
  return doc
}

const partnerCacheTags = [
  publicCacheTags.partners,
  publicCacheTags.events,
  publicCacheTags.eventCycles,
  publicCacheTags.sitemap,
]

const memberProfileCacheTags = [
  publicCacheTags.memberProfiles,
  publicCacheTags.pages,
  publicCacheTags.posts,
  publicCacheTags.events,
  publicCacheTags.eventCycles,
  publicCacheTags.partners,
  publicCacheTags.sitemap,
]

const memberProfileImageCacheTags = memberProfileCacheTags.filter(
  (tag) => tag !== publicCacheTags.sitemap,
)

function invalidateCollectionTagsAfterChange(tags: readonly string[]): CollectionAfterChangeHook {
  return ({ doc, req }) => {
    if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
      invalidatePublicCacheTags(tags)
    }
    return doc
  }
}

function invalidateCollectionTagsAfterDelete(tags: readonly string[]): CollectionAfterDeleteHook {
  return ({ doc, req }) => {
    if (!req.context?.[skipPublicCacheInvalidationContextKey]) {
      invalidatePublicCacheTags(tags)
    }
    return doc
  }
}

export function getPartnerCacheTags(): string[] {
  return [...partnerCacheTags]
}

export function getMemberProfileCacheTags(): string[] {
  return [...memberProfileCacheTags]
}

export function getMemberProfileImageCacheTags(): string[] {
  return [...memberProfileImageCacheTags]
}

export const invalidatePartnersAfterChange = invalidateCollectionTagsAfterChange(partnerCacheTags)
export const invalidatePartnersAfterDelete = invalidateCollectionTagsAfterDelete(partnerCacheTags)
export const invalidateMemberProfilesAfterChange =
  invalidateCollectionTagsAfterChange(memberProfileCacheTags)
export const invalidateMemberProfilesAfterDelete =
  invalidateCollectionTagsAfterDelete(memberProfileCacheTags)
export const invalidateMemberProfileImagesAfterChange = invalidateCollectionTagsAfterChange(
  memberProfileImageCacheTags,
)
export const invalidateMemberProfileImagesAfterDelete = invalidateCollectionTagsAfterDelete(
  memberProfileImageCacheTags,
)
