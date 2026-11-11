import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import { findRenderablePageTemplateForRequest } from '@/modules/content/preview-content'
import { extractRichTextText } from '@/modules/content/rich-text'
import {
  findEventsForCycle,
  findPostsRelatedToCycle,
  findPublishedEventCycleBySlug,
} from '@/modules/events/public-events'
import { createEventCycleStructuredData } from '@/modules/events/structured-data'
import { getPartnerRoleLabel } from '@/modules/events/presentation'
import { resolveLink } from '@/modules/navigation/links'
import type { EventCycle } from '@/payload-types'

import { CmsPageDocument } from '../../../_components/CmsPageDocument'
import { getContentHeroImage } from '../../../_components/ContentHero'
import {
  CurrentItemHeading,
  CurrentItemList,
  CurrentItemText,
} from '../../../_components/CurrentItemPresentation'
import { EventList } from '../../../_components/EventList'
import { PageTemplateDocument } from '../../../_components/PageTemplateDocument'
import { SmallPostList } from '../../../_components/SmallPostList'
import { StructuredData } from '../../../_components/StructuredData'

type Properties = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}
export async function generateMetadata({ params }: Properties): Promise<Metadata> {
  const cycle = await findPublishedEventCycleBySlug((await params).slug)
  return cycle ? createContentMetadata(cycle) : {}
}

export default async function EventCyclePage({ params, searchParams }: Properties) {
  const cycle = await findPublishedEventCycleBySlug((await params).slug)
  if (!cycle) notFound()
  const pathname = `/events/series/${cycle.slug}`
  const breadcrumbs = [
    { label: 'Strona główna', url: '/' },
    { label: 'Wydarzenia', url: '/events' },
    { label: cycle.title, url: null },
  ]
  const parameters = await searchParams
  const { document: template, isDraftPreview } = await findRenderablePageTemplateForRequest(
    'event-cycle-detail',
    parameters,
  )
  if (template) {
    return (
      <>
        <StructuredData value={createEventCycleStructuredData(cycle)} />
        <PageTemplateDocument
          breadcrumbs={breadcrumbs}
          currentItem={{
            afterContent: <CycleExternalLinks cycle={cycle} />,
            document: cycle,
            target: { relationTo: 'event-cycles', value: cycle.id },
            renderField: ({ field, variant }) => {
              switch (field) {
                case 'title':
                  return <CurrentItemHeading text={cycle.title} variant={variant} />
                case 'excerpt':
                  return (
                    <CurrentItemText text={extractRichTextText(cycle.excerpt)} variant={variant} />
                  )
                case 'organizers':
                  return <CycleOrganizers cycle={cycle} variant={variant} />
                case 'partners':
                  return <CyclePartners cycle={cycle} variant={variant} />
                default:
                  return null
              }
            },
          }}
          image={getContentHeroImage(cycle.heroImage)}
          fallbackTitle={cycle.title}
          isDraftPreview={isDraftPreview}
          pathname={pathname}
          searchParams={parameters}
          template={template}
        />
      </>
    )
  }

  const [events, relatedPosts] = await Promise.all([
    findEventsForCycle(cycle.id),
    findPostsRelatedToCycle(cycle.id),
  ])
  const related = (
    <section>
      <div className="contentSectionHeading">
        <h2>Wydarzenia w tym cyklu</h2>
        {cycle.calendarFeedKey ? (
          <Link href={`/events/calendar.ics?series=${cycle.calendarFeedKey}`}>
            Subskrybuj serię
          </Link>
        ) : null}
      </div>
      <EventList events={events} />
      <CycleOrganizers cycle={cycle} />
      <CyclePartners cycle={cycle} />
      <CycleExternalLinks cycle={cycle} />
      {relatedPosts.length ? (
        <>
          <h2>Powiązane wpisy</h2>
          <SmallPostList posts={relatedPosts} />
        </>
      ) : null}
    </section>
  )
  return (
    <>
      <StructuredData value={createEventCycleStructuredData(cycle)} />
      <CmsPageDocument
        afterBlocks={related}
        breadcrumbs={breadcrumbs}
        collection="event-cycles"
        document={cycle}
        pathname={pathname}
        searchParams={parameters}
      />
    </>
  )
}

function CycleOrganizers({ cycle, variant }: { cycle: EventCycle; variant?: string }) {
  return cycle.eventDefaults.organizers?.length ? (
    <>
      <h2>Organizatorzy</h2>
      <CurrentItemList variant={variant}>
        {cycle.eventDefaults.organizers.map((item) => (
          <li key={item.id}>
            {typeof item.profile === 'object' ? item.profile.publicName : 'Organizator'}
            {item.role ? ` — ${item.role}` : ''}
            {item.responsibilities ? <div>{item.responsibilities}</div> : null}
            {item.contactFor ? <div>Kontakt w sprawie: {item.contactFor}</div> : null}
            {item.showContactChannels &&
            typeof item.profile === 'object' &&
            item.profile.contactChannels?.length ? (
              <ul aria-label="Kanały kontaktu">
                {item.profile.contactChannels.map((channel) => (
                  <li key={channel.id}>
                    <a href={channel.type === 'email' ? `mailto:${channel.url}` : channel.url}>
                      {channel.type === 'email' ? channel.url : channel.type}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </CurrentItemList>
    </>
  ) : null
}

function CyclePartners({ cycle, variant }: { cycle: EventCycle; variant?: string }) {
  return cycle.eventDefaults.partners?.length ? (
    <>
      <h2>Partnerzy</h2>
      <CurrentItemList variant={variant}>
        {cycle.eventDefaults.partners.map((item) => (
          <li key={item.id}>
            {typeof item.partner === 'object' ? (
              <Link href={`/partners/${item.partner.slug}`}>{item.partner.name}</Link>
            ) : (
              'Partner'
            )}{' '}
            — {item.roles.map(getPartnerRoleLabel).join(', ')}
            {item.contribution ? <div>{item.contribution}</div> : null}
          </li>
        ))}
      </CurrentItemList>
    </>
  ) : null
}

function CycleExternalLinks({ cycle }: { cycle: EventCycle }) {
  return cycle.eventDefaults.externalLinks?.length ? (
    <>
      <h2>Linki</h2>
      <ul>
        {cycle.eventDefaults.externalLinks.map((item) => {
          const link = resolveLink(item)
          return link ? (
            <li key={item.id}>
              <a href={link.href} rel={link.rel} target={link.target}>
                {item.label}
              </a>
            </li>
          ) : null
        })}
      </ul>
    </>
  ) : null
}
