import Link from 'next/link'

import { CmsRichText } from '@/components/CmsRichText'
import { RasterIcon } from '@/components/RasterIcon'
import type { ContentListingPresentation } from '@/modules/content/content-listing-presentation'
import type { ListingView } from '@/modules/content/listing-view'

import { ListingActionContent, ListingFactValue } from './ListingItemContent'
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
              <ListingFactValue fact={fact} />
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
          <ListingActionContent
            style={presentation.actionStyle}
            icon="calendar"
            label={presentation.secondaryAction.label}
          />
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
  showTileOverlay = true,
}: {
  presentation: ContentListingPresentation
  form: ListingView['form']
  showImage?: boolean
  showTileOverlay?: boolean
}) {
  if (form === 'tile') {
    return (
      <article className="contentTile">
        <div className={`contentTileLink${showImage ? '' : ' contentTileLink--withoutImage'}`}>
          {showImage ? (
            <span aria-hidden="true" className="contentTileMedia">
              <PresentedImage presentation={presentation} tile />
            </span>
          ) : null}
          {showTileOverlay ? <span aria-hidden="true" className="contentTileOverlay" /> : null}
          <div className="contentTileContent">
            <h2 className={presentation.hideTitle ? 'listingHiddenTitle' : undefined}>
              <Link className="contentTileTitleLink" href={presentation.url}>
                {presentation.hideTitle ? (
                  <span className="srOnly">{presentation.title}</span>
                ) : (
                  presentation.title
                )}
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
        <h2 className={presentation.hideTitle ? 'listingHiddenTitle' : undefined}>
          <Link href={presentation.url}>
            {presentation.hideTitle ? (
              <span className="srOnly">{presentation.title}</span>
            ) : (
              presentation.title
            )}
          </Link>
        </h2>
        <PresentedContentDetails grid={grid} presentation={presentation} />
      </div>
    </article>
  )
}
