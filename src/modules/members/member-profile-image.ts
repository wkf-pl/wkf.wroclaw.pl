import type { MemberProfile } from '@/payload-types'

export function getMemberProfileImageURL(
  profile: Pick<MemberProfile, 'id' | 'photo'>,
  size: 'card' | 'profile',
): string {
  const filename = profile.photo?.sizes?.[size]?.filename ?? profile.photo?.filename
  return filename
    ? `/api/member-profiles/${profile.id}/photo/${encodeURIComponent(filename)}`
    : '/assets/member-profile-placeholder.webp'
}
