import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { shouldRenderPageTemplate } from '@/modules/content/draft-preview'
import { findPageForRequest, findPageTemplateForRequest } from '@/modules/content/preview-content'
import { findCurrentAndUpcomingEvents, findPastEvents } from '@/modules/events/public-events'
import { resolveEventsIndexArchiveURL } from '@/modules/page-templates/events-index-listings'

import { CmsPageDocument } from '../_components/CmsPageDocument'
import { getContentHeroImage } from '../_components/ContentHero'
import { ContentPagination } from '../_components/ContentPagination'
import { DraftPreviewBanner } from '../_components/DraftPreviewBanner'
import { EventList } from '../_components/EventList'
import { PageTemplateDocument } from '../_components/PageTemplateDocument'

export const metadata: Metadata = { title: 'Wydarzenia' }

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [parameters, { document: template, isDraftPreview: isTemplatePreview }] = await Promise.all(
    [searchParams, findPageTemplateForRequest('events-index')],
  )

  if (
    template &&
    shouldRenderPageTemplate({
      isDraftPreview: isTemplatePreview,
      renderingMode: template.renderingMode,
      searchParams: parameters,
      templateKey: 'events-index',
    })
  ) {
    const archiveURL = resolveEventsIndexArchiveURL(template, parameters)
    if (archiveURL) redirect(archiveURL)

    return (
      <>
        {isTemplatePreview ? (
          <DraftPreviewBanner
            message="Podglądasz roboczy układ szablonu. Opublikowana strona nadal używa ostatnio opublikowanego trybu renderowania."
            pathname="/events"
          />
        ) : null}
        <PageTemplateDocument
          breadcrumbs={[
            { label: 'Strona główna', url: '/' },
            { label: 'Wydarzenia', url: null },
          ]}
          image={getContentHeroImage(template.heroImage)}
          indexTitle="Wydarzenia"
          pathname="/events"
          searchParams={parameters}
          template={template}
        />
      </>
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
