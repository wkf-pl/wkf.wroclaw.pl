import { cache } from 'react'
import { getPayload, type Where } from 'payload'

import config from '@payload-config'

import type { MemberProfile, MemberProfileImage } from '@/payload-types'

const publicProfileConditions: Where[] = [{ _status: { equals: 'published' } }]
const publicProfileWhere: Where = { and: publicProfileConditions }

export const findPublicMemberProfiles = cache(async (): Promise<MemberProfile[]> => {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'member-profiles',
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
})

export const findPublicMemberProfileBySlug = cache(
  async (slug: string): Promise<MemberProfile | null> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'member-profiles',
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
)

export function getMemberProfileImage(profile: MemberProfile): MemberProfileImage | null {
  return profile.photo && typeof profile.photo === 'object' ? profile.photo : null
}

export function getMemberProfileImageURL(profile: MemberProfile, size: 'card' | 'profile'): string {
  const image = getMemberProfileImage(profile)
  return image?.sizes?.[size]?.url || image?.url || '/assets/member-profile-placeholder.svg'
}

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
