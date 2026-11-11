import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CmsRichText } from '@/components/CmsRichText'
import { findRenderablePageTemplateForRequest } from '@/modules/content/preview-content'
import { getPublicSiteSettings } from '@/modules/content/public-content'
import {
  findPublicMemberProfileBySlug,
  getContactChannelLabel,
  getMemberProfileImageURL,
} from '@/modules/members/public-members'
import { extractMemberProfileText } from '@/modules/members/rich-text'
import type { MemberProfile } from '@/payload-types'

import { ContentHero, type ContentHeroImage } from '../../_components/ContentHero'
import { ContactChannelIcon } from '../../_components/ContactChannelIcon'
import {
  CurrentItemHeading,
  CurrentItemList,
  CurrentItemText,
  getCurrentItemTextClassName,
} from '../../_components/CurrentItemPresentation'
import { PageTemplateDocument } from '../../_components/PageTemplateDocument'

type MemberPageProperties = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

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

export default async function MemberPage({ params, searchParams }: MemberPageProperties) {
  const { slug } = await params
  const [profile, siteSettings] = await Promise.all([
    findPublicMemberProfileBySlug(slug),
    getPublicSiteSettings(),
  ])

  if (!profile) {
    notFound()
  }

  const pathname = `/members/${profile.slug}`
  const breadcrumbs = [
    { label: 'Strona główna', url: '/' },
    { label: 'Klubowicze', url: '/members' },
    { label: profile.publicName, url: null },
  ]
  const image: ContentHeroImage = {
    alt: `Zdjęcie profilowe: ${profile.publicName}`,
    height: 512,
    src: getMemberProfileImageURL(profile, 'profile'),
    variant: 'portrait',
    width: 512,
  }
  const parameters = await searchParams
  const { document: template, isDraftPreview } = await findRenderablePageTemplateForRequest(
    'member-detail',
    parameters,
  )
  const content = (
    <MemberProfileContent
      as={template ? 'div' : 'article'}
      contactEmail={siteSettings.contactEmail}
      profile={profile}
    />
  )

  if (template) {
    return (
      <PageTemplateDocument
        breadcrumbs={breadcrumbs}
        currentItem={{
          content,
          document: profile,
          target: { relationTo: 'member-profiles', value: profile.id },
          renderField: ({ field, variant }) => {
            switch (field) {
              case 'publicName':
                return <CurrentItemHeading text={profile.publicName} variant={variant} />
              case 'clubFunction':
                return <CurrentItemText text={profile.clubFunction} variant={variant} />
              case 'about':
                return profile.about && extractMemberProfileText(profile.about) ? (
                  <CmsRichText
                    className={getCurrentItemTextClassName(variant)}
                    data={profile.about}
                  />
                ) : null
              case 'contactChannels':
                return <ProfileContactLinks channels={profile.contactChannels} variant={variant} />
              default:
                return null
            }
          },
        }}
        image={image}
        fallbackTitle={profile.publicName}
        isDraftPreview={isDraftPreview}
        pathname={pathname}
        searchParams={parameters}
        template={template}
      />
    )
  }

  return (
    <main className="contentHeroPage">
      <ContentHero
        breadcrumbs={breadcrumbs}
        description={profile.clubFunction}
        eyebrow="Wizytówka"
        image={image}
        title={profile.publicName}
      />

      <div className="contentShell contentPageBody memberProfilePage">{content}</div>
    </main>
  )
}

function MemberProfileContent({
  as: Container,
  contactEmail,
  profile,
}: {
  as: 'article' | 'div'
  contactEmail?: string | null
  profile: MemberProfile
}) {
  const plays = profile.games?.filter((game) => game.plays) ?? []
  const runs = profile.games?.filter((game) => game.runs) ?? []
  const about = profile.about
  const reportSubject = encodeURIComponent(`Zgłoszenie wizytówki: ${profile.publicName}`)
  const reportBody = encodeURIComponent(`Zgłaszam treść wizytówki /members/${profile.slug}`)

  return (
    <Container className="memberProfile">
      {about && extractMemberProfileText(about) ? (
        <section className="memberProfileSection">
          <h2>O mnie</h2>
          <CmsRichText data={about} />
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
          <ProfileContactLinks channels={profile.contactChannels} />
        </section>
      ) : null}

      {contactEmail ? (
        <footer className="memberProfileFooter">
          <a href={`mailto:${contactEmail}?subject=${reportSubject}&body=${reportBody}`}>
            Zgłoś treść
          </a>
        </footer>
      ) : null}
    </Container>
  )
}

function ProfileContactLinks({
  channels,
  variant,
}: {
  channels: MemberProfile['contactChannels']
  variant?: string
}) {
  if (!channels?.length) return null
  const links = channels.map((channel) => {
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
  })

  return variant ? (
    <CurrentItemList className="contactChannels" variant={variant}>
      {links}
    </CurrentItemList>
  ) : (
    <ul className="contactChannels">{links}</ul>
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
