import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import {
  findCyclesForPartner,
  findEventsForPartner,
  findPublishedPartnerBySlug,
} from '@/modules/events/public-events'
import { createPartnerStructuredData } from '@/modules/events/structured-data'

import { CmsPageDocument } from '../../_components/CmsPageDocument'
import { EventList } from '../../_components/EventList'
import { StructuredData } from '../../_components/StructuredData'

type Properties = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Properties): Promise<Metadata> {
  const partner = await findPublishedPartnerBySlug((await params).slug)
  return partner ? createContentMetadata(partner) : {}
}

export default async function PartnerPage({ params, searchParams }: Properties) {
  const partner = await findPublishedPartnerBySlug((await params).slug)
  if (!partner) notFound()
  const [events, cycles] = await Promise.all([
    findEventsForPartner(partner.id),
    findCyclesForPartner(partner.id),
  ])
  const related = (
    <>
      {partner.website ? (
        <p>
          <a href={partner.website}>Strona WWW Partnera</a>
        </p>
      ) : null}
      {cycles.length ? (
        <section>
          <h2>Powiązane cykle</h2>
          <ul>
            {cycles.map((cycle) => (
              <li key={cycle.id}>
                <a href={`/events/series/${cycle.slug}`}>{cycle.title}</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section>
        <h2>Powiązane wydarzenia</h2>
        <EventList events={events} />
      </section>
    </>
  )
  return (
    <>
      <StructuredData value={createPartnerStructuredData(partner)} />
      <CmsPageDocument
        afterBlocks={related}
        document={partner}
        eyebrow="Partner"
        pathname={`/partners/${partner.slug}`}
        searchParams={await searchParams}
      />
    </>
  )
}
