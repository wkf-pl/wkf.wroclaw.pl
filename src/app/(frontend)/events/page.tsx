import type { Metadata } from 'next'
import Link from 'next/link'

import { findPublishedPageBySlug } from '@/modules/content/public-content'
import { findCurrentAndUpcomingEvents, findPastEvents } from '@/modules/events/public-events'

import { CmsPageDocument } from '../_components/CmsPageDocument'
import { ContentPagination } from '../_components/ContentPagination'
import { EventList } from '../_components/EventList'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Wydarzenia' }

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const parameters = await searchParams
  const page = Math.max(1, Number.parseInt(parameters.page || '1', 10) || 1)
  const [systemPage, upcoming, archive] = await Promise.all([
    findPublishedPageBySlug('events'),
    findCurrentAndUpcomingEvents(),
    findPastEvents(page),
  ])
  const introduction = systemPage ? (
    <CmsPageDocument document={systemPage} pathname="/events" searchParams={parameters} />
  ) : null

  return (
    <>
      {introduction}
      <main className="contentShell eventsIndex">
        <section>
          <div className="contentSectionHeading">
            <h2>Trwające i nadchodzące</h2>
            <Link href="/events/calendar.ics">Subskrybuj kalendarz WKF</Link>
          </div>
          <EventList events={upcoming} />
        </section>
        <section>
          <h2>Archiwum</h2>
          <EventList events={archive.docs} />
          <ContentPagination
            currentPage={archive.page || 1}
            parameterName="page"
            pathname="/events"
            searchParams={parameters}
            totalPages={archive.totalPages}
          />
        </section>
      </main>
    </>
  )
}
