import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RichText } from '@payloadcms/richtext-lexical/react'

import { getPublicSiteSettings } from '@/modules/content/public-content'
import {
  findPublicMemberProfileBySlug,
  getContactChannelLabel,
  getMemberProfileImageURL,
} from '@/modules/members/public-members'
import { extractMemberProfileText } from '@/modules/members/rich-text'

import { ContactChannelIcon } from '../../_components/ContactChannelIcon'

type MemberPageProperties = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: MemberPageProperties): Promise<Metadata> {
  const { slug } = await params
  const profile = await findPublicMemberProfileBySlug(slug)
  return profile
    ? {
        description: extractMemberProfileText(profile.about, 160) || undefined,
        title: profile.publicName,
      }
    : {}
}

export default async function MemberPage({ params }: MemberPageProperties) {
  const { slug } = await params
  const [profile, siteSettings] = await Promise.all([
    findPublicMemberProfileBySlug(slug),
    getPublicSiteSettings(),
  ])

  if (!profile) {
    notFound()
  }

  const plays = profile.games?.filter((game) => game.plays) ?? []
  const runs = profile.games?.filter((game) => game.runs) ?? []
  const about = profile.about
  const clubActivities = profile.clubActivities
  const reportSubject = encodeURIComponent(`Zgłoszenie wizytówki: ${profile.publicName}`)
  const reportBody = encodeURIComponent(`Zgłaszam treść wizytówki /members/${profile.slug}`)

  return (
    <main className="contentShell memberProfilePage">
      <article className="memberProfile">
        <header className="memberProfileHeader">
          {/* eslint-disable-next-line @next/next/no-img-element -- profile images can use a runtime-configured Azure host. */}
          <img
            alt={`Zdjęcie profilowe: ${profile.publicName}`}
            className="memberProfileImage"
            height="512"
            src={getMemberProfileImageURL(profile, 'profile')}
            width="512"
          />
          <div>
            <h1>{profile.publicName}</h1>
            {profile.clubFunction ? (
              <p className="memberContextLabel">{profile.clubFunction}</p>
            ) : null}
          </div>
        </header>

        {about && extractMemberProfileText(about) ? (
          <section className="memberProfileSection">
            <h2>O mnie</h2>
            <RichText data={about} />
          </section>
        ) : null}
        {clubActivities && extractMemberProfileText(clubActivities) ? (
          <section className="memberProfileSection">
            <h2>Aktywności klubowe</h2>
            <RichText data={clubActivities} />
          </section>
        ) : null}
        {profile.interests ? (
          <section className="memberProfileSection">
            <h2>Zainteresowania</h2>
            <p>{profile.interests}</p>
          </section>
        ) : null}
        <GameSection heading="Gram w" games={plays} />
        <GameSection heading="Prowadzę" games={runs} />

        {profile.contactTopics ? (
          <section className="memberProfileSection">
            <h2>W jakich sprawach można się ze mną kontaktować?</h2>
            <p>{profile.contactTopics}</p>
          </section>
        ) : null}

        {profile.contactChannels?.length ? (
          <section className="memberProfileSection">
            <h2>Kontakt</h2>
            <ul className="contactChannels">
              {profile.contactChannels.map((channel) => {
                const label = getContactChannelLabel(channel.type)
                return (
                  <li key={channel.id ?? `${channel.type}-${channel.url}`}>
                    <a
                      aria-label={label}
                      href={channel.url}
                      rel={channel.type === 'email' ? undefined : 'nofollow noreferrer noopener'}
                      target={channel.type === 'email' ? undefined : '_blank'}
                      title={label}
                    >
                      <ContactChannelIcon type={channel.type} />
                      <span className="srOnly">{label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}

        {siteSettings.contactEmail ? (
          <footer className="memberProfileFooter">
            <a
              href={`mailto:${siteSettings.contactEmail}?subject=${reportSubject}&body=${reportBody}`}
            >
              Zgłoś treść
            </a>
          </footer>
        ) : null}
      </article>
    </main>
  )
}

function GameSection({
  games,
  heading,
}: {
  games: { id?: null | string; title: string }[]
  heading: string
}) {
  return games.length ? (
    <section className="memberProfileSection">
      <h2>{heading}</h2>
      <ul className="memberChips">
        {games.map((game) => (
          <li key={game.id ?? game.title}>{game.title}</li>
        ))}
      </ul>
    </section>
  ) : null
}
