import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { createContentMetadata } from '@/modules/content/content-metadata'
import { findRenderablePageTemplateForRequest } from '@/modules/content/preview-content'
import {
  findCyclesForPartner,
  findEventsForPartner,
  findPublishedPartnerBySlug,
} from '@/modules/events/public-events'
import { createPartnerStructuredData } from '@/modules/events/structured-data'

import { CmsPageDocument } from '../../_components/CmsPageDocument'
import {
  CurrentItemHeading,
  CurrentItemList,
  CurrentItemText,
} from '../../_components/CurrentItemPresentation'
import { getContentHeroImage } from '../../_components/ContentHero'
import { EventList } from '../../_components/EventList'
import { PageTemplateDocument } from '../../_components/PageTemplateDocument'
import { StructuredData } from '../../_components/StructuredData'

type Properties = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}
export async function generateMetadata({ params }: Properties): Promise<Metadata> {
  const partner = await findPublishedPartnerBySlug((await params).slug)
  return partner ? createContentMetadata(partner) : {}
}

export default async function PartnerPage({ params, searchParams }: Properties) {
  const partner = await findPublishedPartnerBySlug((await params).slug)
  if (!partner) notFound()
  const pathname = `/partners/${partner.slug}`
  const breadcrumbs = [
    { label: 'Strona główna', url: '/' },
    { label: partner.name, url: null },
  ]
  const parameters = await searchParams
  const { document: template, isDraftPreview } = await findRenderablePageTemplateForRequest(
    'partner-detail',
    parameters,
  )
  if (template) {
    return (
      <>
        <StructuredData value={createPartnerStructuredData(partner)} />
        <PageTemplateDocument
          breadcrumbs={breadcrumbs}
          currentItem={{
            document: partner,
            target: { relationTo: 'partners', value: partner.id },
            renderField: ({ field, variant }) => {
              if (field === 'name')
                return <CurrentItemHeading text={partner.name} variant={variant} />
              if (field === 'excerpt')
                return <CurrentItemText text={partner.excerpt} variant={variant} />
              if (field === 'website' && partner.website) {
                return (
                  <CurrentItemList variant={variant}>
                    <li>
                      <a href={partner.website}>Strona WWW Partnera</a>
                    </li>
                  </CurrentItemList>
                )
              }
              return null
            },
          }}
          image={getContentHeroImage(partner.heroImage)}
          fallbackTitle={partner.name}
          isDraftPreview={isDraftPreview}
          pathname={pathname}
          searchParams={parameters}
          template={template}
        />
      </>
    )
  }

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
        breadcrumbs={breadcrumbs}
        collection="partners"
        document={partner}
        eyebrow="Partner"
        pathname={pathname}
        searchParams={parameters}
      />
    </>
  )
}
