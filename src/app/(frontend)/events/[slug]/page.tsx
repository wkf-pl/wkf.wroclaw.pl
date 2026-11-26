import { getPopulatedRelationship } from '@/lib/relationships'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RasterIcon } from '@/components/RasterIcon'
import { createContentMetadata } from '@/modules/content/content-metadata'
import {
  findEventForRequest,
  findRenderablePageTemplateForRequest,
} from '@/modules/content/preview-content'
import { pageTemplatePreviewParameter } from '@/modules/content/draft-preview'
import { extractRichTextText } from '@/modules/content/rich-text'
import { buildGoogleMapsURL } from '@/modules/events/map-embed'
import { findPostsRelatedToEvent } from '@/modules/events/public-events'
import { createEventStructuredData } from '@/modules/events/structured-data'
import { resolveLink } from '@/modules/navigation/links'

import { CmsPageDocument } from '../../_components/CmsPageDocument'
import { DraftPreviewBanner } from '../../_components/DraftPreviewBanner'
import { SmallPostList } from '../../_components/SmallPostList'
import { StructuredData } from '../../_components/StructuredData'
import { EventHeroEyebrow, EventSidebar, EventSummary } from './EventDetails'
import { EventTemplateDocument } from './EventTemplateDocument'

type Properties = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}
export async function generateMetadata({ params, searchParams }: Properties): Promise<Metadata> {
  const { slug } = await params
  const parameters = await searchParams
  const { document: event } = await findEventForRequest(
    slug,
    parameters[pageTemplatePreviewParameter] === 'event-detail',
  )
  return event ? createContentMetadata(event) : {}
}

export default async function EventPage({ params, searchParams }: Properties) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const { document: event, isDraftPreview } = await findEventForRequest(
    slug,
    resolvedSearchParams[pageTemplatePreviewParameter] === 'event-detail',
  )
  if (!event) notFound()
  const pathname = `/events/${slug}`
  const { document: template, isDraftPreview: isTemplateDraftPreview } =
    await findRenderablePageTemplateForRequest('event-detail', resolvedSearchParams, isDraftPreview)

  if (template) {
    return (
      <>
        {isDraftPreview ? <DraftPreviewBanner pathname={pathname} /> : null}
        {isTemplateDraftPreview ? (
          <DraftPreviewBanner
            message="Podglądasz roboczy układ szablonu. Opublikowana strona nadal używa ostatnio opublikowanego trybu renderowania."
            pathname={pathname}
          />
        ) : null}
        <StructuredData value={createEventStructuredData(event)} />
        <EventTemplateDocument
          event={event}
          searchParams={resolvedSearchParams}
          template={template}
        />
      </>
    )
  }

  const relatedPosts = await findPostsRelatedToEvent(event.id)
  const location = getPopulatedRelationship(event.location)
  const mapURL = buildGoogleMapsURL({
    city: location?.city,
    country: location?.country,
    name: location?.venueName,
    postalCode: location?.postalCode,
    streetAddress: location?.streetAddress,
  })
  const cycle = event.cycle && typeof event.cycle === 'object' ? event.cycle : null
  const sidebar =
    event.organizers?.length || event.partners?.length ? (
      <EventSidebar organizers={event.organizers} partners={event.partners} />
    ) : undefined
  const supplementaryContent =
    event.externalLinks?.length || relatedPosts.length ? (
      <div className="eventSupplementary">
        {event.externalLinks?.length ? (
          <section className="eventSupplementarySection">
            <h2>Linki</h2>
            <ul className="eventLinkList">
              {event.externalLinks.map((item) => {
                const link = resolveLink(item)
                return link ? (
                  <li key={item.id}>
                    <a href={link.href} rel={link.rel} target={link.target}>
                      <RasterIcon name="external-link" size="small" />
                      {item.label}
                    </a>
                  </li>
                ) : null
              })}
            </ul>
          </section>
        ) : null}
        {relatedPosts.length ? (
          <section className="eventSupplementarySection">
            <h2>Powiązane wpisy</h2>
            <SmallPostList posts={relatedPosts} />
          </section>
        ) : null}
      </div>
    ) : null
  return (
    <>
      {isDraftPreview ? <DraftPreviewBanner pathname={pathname} /> : null}
      <StructuredData value={createEventStructuredData(event)} />
      <CmsPageDocument
        afterBlocks={supplementaryContent}
        aside={sidebar}
        beforeBlocks={<EventSummary event={event} mapURL={mapURL} />}
        bodyClassName="eventPageBody"
        breadcrumbs={[
          { label: 'Strona główna', url: '/' },
          { label: 'Wydarzenia', url: '/events' },
          { label: event.title, url: null },
        ]}
        collection="events"
        description={extractRichTextText(event.excerpt)}
        document={event}
        eyebrow={<EventHeroEyebrow eventType={event.eventType} />}
        heroContent={
          cycle ? (
            <nav aria-label="Cykl wydarzenia" className="eventHeroLinks">
              <Link href={`/events/series/${cycle.slug}`}>Cykl: {cycle.title}</Link>
              {cycle.calendarFeedKey ? (
                <Link href={`/events/calendar.ics?series=${cycle.calendarFeedKey}`}>
                  Subskrybuj cykl
                </Link>
              ) : null}
            </nav>
          ) : null
        }
        pathname={pathname}
        searchParams={resolvedSearchParams}
        showHeroMeta={false}
      />
    </>
  )
}
