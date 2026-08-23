import { cache } from 'react'
import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { MemberProfile } from '@/payload-types'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { publicRequestContext } from '@/modules/content/public-access'

export { getMemberProfileImage, getMemberProfileImageURL } from './member-profile-image'

const publicProfileConditions: Where[] = [{ _status: { equals: 'published' } }]
const publicProfileWhere: Where = { and: publicProfileConditions }

const findPublicMemberProfilesCached = cachePublicData(
  'public-member-profiles',
  async (): Promise<MemberProfile[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'member-profiles',
      context: publicRequestContext,
      depth: 1,
      draft: false,
      limit: 0,
      overrideAccess: false,
      pagination: false,
      sort: 'publicName',
      user: null,
      where: publicProfileWhere,
    })

    return result.docs
  },
  { revalidate: 300, tags: [publicCacheTags.memberProfiles] },
)

export const findPublicMemberProfiles = cache(findPublicMemberProfilesCached)

const findPublicMemberProfileBySlugCached = cachePublicData(
  'public-member-profile-by-slug',
  async (slug: string): Promise<MemberProfile | null> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'member-profiles',
      context: publicRequestContext,
      depth: 1,
      draft: false,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user: null,
      where: {
        and: [{ slug: { equals: slug } }, ...publicProfileConditions],
      },
    })

    return result.docs[0] ?? null
  },
  { revalidate: 3600, tags: [publicCacheTags.memberProfiles] },
)

export const findPublicMemberProfileBySlug = cache(findPublicMemberProfileBySlugCached)

export function getContactChannelLabel(type: string): string {
  const labels: Record<string, string> = {
    bluesky: 'Bluesky',
    discord: 'Discord',
    email: 'E-mail',
    facebook: 'Facebook',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    mastodon: 'Mastodon',
    messenger: 'Messenger',
    other: 'Inny link',
    twitch: 'Twitch',
    website: 'Strona WWW',
    youtube: 'YouTube',
  }

  return labels[type] ?? type
}
