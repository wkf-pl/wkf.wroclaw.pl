import Link from 'next/link'

import { CmsRichText } from '@/components/CmsRichText'
import { RasterIcon } from '@/components/RasterIcon'
import type { ContentListingPresentation } from '@/modules/content/content-listing-presentation'
import type { ListingView } from '@/modules/content/listing-view'

import { CmsImage } from './CmsImage'
import { PresentedContentMeta } from './ContentListingMeta'
import { TaxonomyLinks } from './TaxonomyLinks'

export function PresentedContentDetails({
  presentation,
  grid = false,
}: {
  presentation: ContentListingPresentation
  grid?: boolean
}) {
  return (
    <>
      {presentation.facts.length ? (
        <div className={`contentCardFacts${grid ? ' contentCardFacts--grid' : ''}`}>
          {presentation.facts.map((fact) => (
            <p key={`${fact.icon}-${fact.value}`}>
              <span aria-label={fact.label} className="contentCardFactIcon" role="img">
                <RasterIcon name={fact.icon} size="small" />
              </span>
              {fact.dateTime ? (
                <time dateTime={fact.dateTime}>{fact.value}</time>
              ) : fact.href ? (
                <a href={fact.href}>{fact.value}</a>
              ) : (
                fact.value
              )}
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
      {presentation.secondaryAction ? (
        <Link
          className="contentCarouselSecondaryAction contentCardSecondaryAction"
          href={presentation.secondaryAction.href}
        >
          <RasterIcon name="calendar" size="small" />
          <span>{presentation.secondaryAction.label}</span>
        </Link>
      ) : null}
    </>
  )
}

function PresentedImage({
  presentation,
  tile = false,
}: {
  presentation: ContentListingPresentation
  tile?: boolean
}) {
  return presentation.image?.kind === 'media' ? (
    <CmsImage className={tile ? 'contentTileImage' : undefined} media={presentation.image.media} />
  ) : presentation.image?.kind === 'profile' ? (
    // eslint-disable-next-line @next/next/no-img-element -- Profile images can use a runtime-configured host.
    <img
      alt={tile ? '' : presentation.image.alt}
      className={tile ? 'contentTileImage' : undefined}
      src={presentation.image.url}
    />
  ) : (
    <span
      aria-hidden="true"
      className={tile ? 'contentTileImageFallback' : 'contentCardImageFallback'}
    />
  )
}

export function PresentedContentItem({
  presentation,
  form,
  showImage = true,
}: {
  presentation: ContentListingPresentation
  form: ListingView['form']
  showImage?: boolean
}) {
  if (form === 'tile') {
    return (
      <article className="contentTile">
        <div className="contentTileLink">
          {showImage ? (
            <span aria-hidden="true" className="contentTileMedia">
              <PresentedImage presentation={presentation} tile />
            </span>
          ) : null}
          <span aria-hidden="true" className="contentTileOverlay" />
          <div className="contentTileContent">
            <h2>
              <Link className="contentTileTitleLink" href={presentation.url}>
                {presentation.title}
              </Link>
            </h2>
            <PresentedContentMeta
              className="contentCardMeta contentTileMeta"
              presentation={presentation}
            />
            <PresentedContentDetails presentation={presentation} />
          </div>
        </div>
      </article>
    )
  }
  const row = form === 'row'
  const grid = form === 'vertical'
  return (
    <article
      className={`contentCard${grid ? ' contentCard--grid' : ''}${!showImage || row ? ' contentCard--withoutImage' : ''}`}
    >
      {showImage && !row ? (
        <Link aria-label={presentation.title} className="contentCardImage" href={presentation.url}>
          <PresentedImage presentation={presentation} />
        </Link>
      ) : null}
      <div className="contentCardContent">
        <PresentedContentMeta presentation={presentation} />
        <h2>
          <Link href={presentation.url}>{presentation.title}</Link>
        </h2>
        <PresentedContentDetails grid={grid} presentation={presentation} />
      </div>
    </article>
  )
}
