import { revalidateTag } from 'next/cache.js'
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from 'payload'

import type { ContentListingSource } from '@/modules/content/listing-conditions'

import {
  isPublicDataCacheEnabled,
  publicCacheTags,
  skipPublicCacheInvalidationContextKey,
} from './public-data-cache'

const tagsBySource: Record<ContentListingSource, string[]> = {
  documents: [publicCacheTags.contentListings, publicCacheTags.sitemap],
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
  'member-profiles': [
    publicCacheTags.memberProfiles,
    publicCacheTags.pages,
    publicCacheTags.posts,
    publicCacheTags.events,
    publicCacheTags.eventCycles,
    publicCacheTags.partners,
    publicCacheTags.contentListings,
    publicCacheTags.sitemap,
  ],
  pages: [publicCacheTags.pages, publicCacheTags.contentListings, publicCacheTags.sitemap],
  partners: [
    publicCacheTags.partners,
    publicCacheTags.events,
    publicCacheTags.eventCycles,
    publicCacheTags.contentListings,
    publicCacheTags.sitemap,
  ],
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

export function invalidateContentSource(source: ContentListingSource): void {
  invalidatePublicCacheTags(tagsBySource[source])
}

export function getContentSourceCacheTags(source: ContentListingSource): string[] {
  return [...tagsBySource[source]]
}

function createCollectionCacheInvalidators(tags: readonly string[]): {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} {
  const invalidate = <Document>({
    doc,
    req,
  }: {
    doc: Document
    req: { context?: Record<string, unknown> }
  }) => {
    if (!req.context?.[skipPublicCacheInvalidationContextKey]) invalidatePublicCacheTags(tags)
    return doc
  }

  return {
    afterChange: invalidate as CollectionAfterChangeHook,
    afterDelete: invalidate as CollectionAfterDeleteHook,
  }
}

const listingInvalidators = createCollectionCacheInvalidators([
  publicCacheTags.contentListings,
  publicCacheTags.media,
  publicCacheTags.sitemap,
])
export const invalidateListingsAfterChange = listingInvalidators.afterChange
export const invalidateListingsAfterDelete = listingInvalidators.afterDelete

const sitemapInvalidators = createCollectionCacheInvalidators([publicCacheTags.sitemap])
export const invalidateSitemapAfterChange = sitemapInvalidators.afterChange
export const invalidateSitemapAfterDelete = sitemapInvalidators.afterDelete

const urlAliasInvalidators = createCollectionCacheInvalidators([publicCacheTags.urlAliases])
export const invalidateUrlAliasesAfterChange = urlAliasInvalidators.afterChange
export const invalidateUrlAliasesAfterDelete = urlAliasInvalidators.afterDelete

const allPublicDataInvalidators = createCollectionCacheInvalidators(Object.values(publicCacheTags))
export const invalidateAllPublicDataAfterChange = allPublicDataInvalidators.afterChange
export const invalidateAllPublicDataAfterDelete = allPublicDataInvalidators.afterDelete

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

const homepageInvalidators = createCollectionCacheInvalidators([publicCacheTags.homepage])
export const invalidateHomepageAfterChange = homepageInvalidators.afterChange
export const invalidateHomepageAfterDelete = homepageInvalidators.afterDelete

const partnerCacheTags = tagsBySource.partners

const eventTypeCacheTags = [
  publicCacheTags.eventTypes,
  publicCacheTags.events,
  publicCacheTags.homepage,
]

const memberProfileCacheTags = tagsBySource['member-profiles']

const memberProfileImageCacheTags = memberProfileCacheTags.filter(
  (tag) => tag !== publicCacheTags.sitemap,
)

export function getPartnerCacheTags(): string[] {
  return [...partnerCacheTags]
}

export function getMemberProfileCacheTags(): string[] {
  return [...memberProfileCacheTags]
}

export function getMemberProfileImageCacheTags(): string[] {
  return [...memberProfileImageCacheTags]
}

export function getEventTypeCacheTags(): string[] {
  return [...eventTypeCacheTags]
}

const eventTypeInvalidators = createCollectionCacheInvalidators(eventTypeCacheTags)
export const invalidateEventTypesAfterChange = eventTypeInvalidators.afterChange
export const invalidateEventTypesAfterDelete = eventTypeInvalidators.afterDelete

const partnerInvalidators = createCollectionCacheInvalidators(partnerCacheTags)
export const invalidatePartnersAfterChange = partnerInvalidators.afterChange
export const invalidatePartnersAfterDelete = partnerInvalidators.afterDelete

const memberProfileInvalidators = createCollectionCacheInvalidators(memberProfileCacheTags)
export const invalidateMemberProfilesAfterChange = memberProfileInvalidators.afterChange
export const invalidateMemberProfilesAfterDelete = memberProfileInvalidators.afterDelete

const memberProfileImageInvalidators = createCollectionCacheInvalidators(
  memberProfileImageCacheTags,
)
export const invalidateMemberProfileImagesAfterChange = memberProfileImageInvalidators.afterChange
export const invalidateMemberProfileImagesAfterDelete = memberProfileImageInvalidators.afterDelete
