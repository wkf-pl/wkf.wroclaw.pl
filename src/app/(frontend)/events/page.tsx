import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import {
  findPageForRequest,
  findRenderablePageTemplateForRequest,
} from '@/modules/content/preview-content'
import { findCurrentAndUpcomingEvents, findPastEvents } from '@/modules/events/public-events'
import { resolveEventsIndexArchiveURL } from '@/modules/page-templates/events-index-listings'

import { CmsPageDocument } from '../_components/CmsPageDocument'
import { ContentPagination } from '../_components/ContentPagination'
import { DraftPreviewBanner } from '../_components/DraftPreviewBanner'
import { EventList } from '../_components/EventList'
import { IndexPageTemplateDocument } from '../_components/IndexPageTemplateDocument'

export const metadata: Metadata = { title: 'Wydarzenia' }

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const parameters = await searchParams
  const { document: template, isDraftPreview: isTemplatePreview } =
    await findRenderablePageTemplateForRequest('events-index', parameters)

  if (template) {
    const archiveURL = resolveEventsIndexArchiveURL(template, parameters)
    if (archiveURL) redirect(archiveURL)

    return (
      <IndexPageTemplateDocument
        isDraftPreview={isTemplatePreview}
        pathname="/events"
        searchParams={parameters}
        template={template}
        title="Wydarzenia"
      />
    )
  }

  const page = Math.max(1, Number.parseInt(String(parameters.page ?? '1'), 10) || 1)
  const [{ document: systemPage, isDraftPreview }, upcoming, archive] = await Promise.all([
    findPageForRequest('events'),
    findCurrentAndUpcomingEvents(),
    findPastEvents(page),
  ])
  const introduction = systemPage ? (
    <CmsPageDocument
      collection="pages"
      document={systemPage}
      pathname="/events"
      searchParams={parameters}
    />
  ) : null

  return (
    <>
      {isDraftPreview ? <DraftPreviewBanner pathname="/events" /> : null}
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
