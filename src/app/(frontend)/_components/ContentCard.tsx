import Link from 'next/link'

import { CmsRichText } from '@/components/CmsRichText'
import { RasterIcon } from '@/components/RasterIcon'
import type { PublicContentListItem } from '@/modules/content/content-listing'
import { getContentListingPresentation } from '@/modules/content/content-listing-presentation'

import { CmsImage } from './CmsImage'
import { ContentListingMeta } from './ContentListingMeta'
import { TaxonomyLinks } from './TaxonomyLinks'

export type ContentCardItem = PublicContentListItem
export type ContentCardView = 'cards' | 'grid'

export function ContentCard({
  item,
  view = 'cards',
}: {
  item: ContentCardItem
  view?: ContentCardView
}) {
  const presentation = getContentListingPresentation(item, view)

  return (
    <article className={view === 'grid' ? 'contentCard contentCard--grid' : 'contentCard'}>
      <Link aria-label={presentation.title} className="contentCardImage" href={presentation.url}>
        {presentation.image?.kind === 'media' ? (
          <CmsImage media={presentation.image.media} />
        ) : presentation.image?.kind === 'profile' ? (
          // eslint-disable-next-line @next/next/no-img-element -- profile images can use a runtime-configured Azure host.
          <img alt={presentation.image.alt} src={presentation.image.url} />
        ) : (
          <span aria-hidden="true" className="contentCardImageFallback" />
        )}
      </Link>
      <div className="contentCardContent">
        <ContentListingMeta item={item} view={view} />
        <h2>
          <Link href={presentation.url}>{presentation.title}</Link>
        </h2>
        {presentation.facts.length ? (
          <div
            className={
              view === 'grid' ? 'contentCardFacts contentCardFacts--grid' : 'contentCardFacts'
            }
          >
            {presentation.facts.map((fact) => (
              <p key={`${fact.icon}-${fact.value}`}>
                <span aria-label={fact.label} className="contentCardFactIcon" role="img">
                  <RasterIcon name={fact.icon} size="small" />
                </span>
                {fact.dateTime ? <time dateTime={fact.dateTime}>{fact.value}</time> : null}
                {!fact.dateTime && fact.href ? <a href={fact.href}>{fact.value}</a> : null}
                {!fact.dateTime && !fact.href ? fact.value : null}
              </p>
            ))}
          </div>
        ) : null}
        {presentation.excerpt?.kind === 'richText' ? (
          <CmsRichText className="contentCardExcerpt" data={presentation.excerpt.value} />
        ) : presentation.excerpt ? (
          <p className="contentCardExcerpt">{presentation.excerpt.value}</p>
        ) : null}
        {presentation.interests ? (
          <p className="contentCardInterests">{presentation.interests}</p>
        ) : null}
        <TaxonomyLinks category={presentation.category} tags={presentation.tags} />
      </div>
    </article>
  )
}
