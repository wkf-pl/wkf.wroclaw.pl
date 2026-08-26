import Link from 'next/link'

import type { MemberProfile } from '@/payload-types'
import { getMemberProfileImageURL } from '@/modules/members/member-profile-image'
import { extractMemberProfileText } from '@/modules/members/rich-text'

type MemberProfileCardProperties = {
  contextLabel?: null | string
  profile: MemberProfile
}

export function MemberProfileCard({ contextLabel, profile }: MemberProfileCardProperties) {
  const summary = extractMemberProfileText(profile.about, 260)
  const displayedFunction = contextLabel?.trim() || profile.clubFunction?.trim()

  return (
    <article className="memberCard">
      <Link
        aria-label={`Zobacz wizytówkę: ${profile.publicName}`}
        href={`/members/${profile.slug}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- profile images can use a runtime-configured Azure host. */}
        <img
          alt={`Zdjęcie profilowe: ${profile.publicName}`}
          className="memberCardImage"
          height="192"
          src={getMemberProfileImageURL(profile, 'card')}
          width="192"
        />
      </Link>
      <div className="memberCardBody">
        <h3>
          <Link href={`/members/${profile.slug}`}>{profile.publicName}</Link>
        </h3>
        {displayedFunction ? <p className="memberContextLabel">{displayedFunction}</p> : null}
        {summary ? <p className="memberCardSummary">{summary}</p> : null}
        {profile.interests ? <p className="memberCardInterests">{profile.interests}</p> : null}
      </div>
    </article>
  )
}
