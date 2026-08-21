import type { Metadata } from 'next'

import { findPublicMemberProfiles } from '@/modules/members/public-members'

import { MemberProfileCard } from '../_components/MemberProfileCard'

export const metadata: Metadata = {
  description: 'Publiczne wizytówki członków Wrocławskiego Klubu Fantastyki.',
  title: 'Klubowicze',
}

export default async function MembersPage() {
  const profiles = await findPublicMemberProfiles()

  return (
    <main className="contentShell membersPage">
      <header className="membersHeader">
        <h1>Klubowicze</h1>
        <p>Poznaj osoby współtworzące Wrocławski Klub Fantastyki.</p>
      </header>
      {profiles.length ? (
        <div className="memberGrid">
          {profiles.map((profile) => (
            <MemberProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      ) : (
        <p className="emptyMessage">Nie opublikowano jeszcze żadnych wizytówek.</p>
      )}
    </main>
  )
}
