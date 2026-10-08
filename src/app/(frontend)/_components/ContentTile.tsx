import Link from 'next/link'

import type { Media } from '@/payload-types'

import { CmsImage } from './CmsImage'
import type { ContentCardItem } from './ContentCard'
import { ContentListingMeta } from './ContentListingMeta'

export function ContentTile({ item }: { item: ContentCardItem }) {
  const image = getTileImage(item)

  return (
    <article className="contentTile">
      <Link className="contentTileLink" href={item.url}>
        <span aria-hidden="true" className="contentTileMedia">
          {image && typeof image === 'object' ? (
            <CmsImage className="contentTileImage" media={image} />
          ) : (
            <span className="contentTileImageFallback" />
          )}
        </span>
        <span aria-hidden="true" className="contentTileOverlay" />
        <div className="contentTileContent">
          <h2>{item.document.title}</h2>
          <ContentListingMeta className="contentCardMeta contentTileMeta" item={item} />
        </div>
      </Link>
    </article>
  )
}

function getTileImage(item: ContentCardItem): Media | number | null | undefined {
  return item.kind === 'documents' ? null : item.document.heroImage
}
