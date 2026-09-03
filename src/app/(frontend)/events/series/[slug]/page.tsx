import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import {
  findEventsForCycle,
  findPostsRelatedToCycle,
  findPublishedEventCycleBySlug,
} from '@/modules/events/public-events'
import { createEventCycleStructuredData } from '@/modules/events/structured-data'
import { getPartnerRoleLabel } from '@/modules/events/presentation'
import { resolveLink } from '@/modules/navigation/links'

import { CmsPageDocument } from '../../../_components/CmsPageDocument'
import { EventList } from '../../../_components/EventList'
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
      {cycle.eventDefaults.organizers?.length ? (
        <>
          <h2>Organizatorzy</h2>
          <ul>
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
          </ul>
        </>
      ) : null}
      {cycle.eventDefaults.partners?.length ? (
        <>
          <h2>Partnerzy</h2>
          <ul>
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
          </ul>
        </>
      ) : null}
      {cycle.eventDefaults.externalLinks?.length ? (
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
      ) : null}
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
        breadcrumbs={[
          { label: 'Strona główna', url: '/' },
          { label: 'Wydarzenia', url: '/events' },
          { label: cycle.title, url: null },
        ]}
        document={cycle}
        pathname={`/events/series/${cycle.slug}`}
        searchParams={await searchParams}
      />
    </>
  )
}
