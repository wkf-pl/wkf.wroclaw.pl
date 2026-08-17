import type { MemberProfilesBlock as MemberProfilesBlockType, MemberProfile } from '@/payload-types'

import { MemberProfileCard } from './MemberProfileCard'

export function MemberProfilesSection({ block }: { block: MemberProfilesBlockType }) {
  const entries = (block.entries ?? []).filter(
    (entry): entry is typeof entry & { profile: MemberProfile } =>
      typeof entry.profile === 'object' && entry.profile._status === 'published',
  )

  if (entries.length === 0) {
    return null
  }

  return (
    <section className="memberProfilesBlock">
      {block.heading ? <h2>{block.heading}</h2> : null}
      <div className="memberGrid">
        {entries.map((entry) => (
          <MemberProfileCard
            contextLabel={entry.contextLabel}
            key={entry.id ?? `${entry.profile.id}-${entry.contextLabel ?? ''}`}
            profile={entry.profile}
          />
        ))}
      </div>
    </section>
  )
}
