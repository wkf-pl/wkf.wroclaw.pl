import type { MemberProfile, MemberProfileImage } from '@/payload-types'
import { getMediaURL } from '@/modules/media/media-url'

export function getMemberProfileImage(profile: MemberProfile): MemberProfileImage | null {
  return profile.photo && typeof profile.photo === 'object' ? profile.photo : null
}

export function getMemberProfileImageURL(profile: MemberProfile, size: 'card' | 'profile'): string {
  const image = getMemberProfileImage(profile)
  return image?.sizes?.[size]?.url || getMediaURL(image) || '/assets/member-profile-placeholder.svg'
}
