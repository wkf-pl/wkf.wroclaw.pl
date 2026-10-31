import Link from 'next/link'

import { getContentListingPresentation } from '@/modules/content/content-listing-presentation'

import { CmsImage } from './CmsImage'
import type { ContentCardItem } from './ContentCard'
import { ContentListingMeta } from './ContentListingMeta'

export function ContentTile({ item }: { item: ContentCardItem }) {
  const presentation = getContentListingPresentation(item, 'tiles')

  return (
    <article className="contentTile">
      <Link className="contentTileLink" href={presentation.url}>
        <span aria-hidden="true" className="contentTileMedia">
          {presentation.image?.kind === 'media' ? (
            <CmsImage className="contentTileImage" media={presentation.image.media} />
          ) : presentation.image?.kind === 'profile' ? (
            // eslint-disable-next-line @next/next/no-img-element -- profile images can use a runtime-configured Azure host.
            <img alt="" className="contentTileImage" src={presentation.image.url} />
          ) : (
            <span className="contentTileImageFallback" />
          )}
        </span>
        <span aria-hidden="true" className="contentTileOverlay" />
        <div className="contentTileContent">
          <h2>{presentation.title}</h2>
          <ContentListingMeta
            className="contentCardMeta contentTileMeta"
            item={item}
            view="tiles"
          />
        </div>
      </Link>
    </article>
  )
}
