import type { CSSProperties, ReactNode } from 'react'

import {
  resolveListingSurface,
  type ListingDecorationMedia,
} from '@/modules/content/listing-decoration'
import type { ContentListingPresentation } from '@/modules/content/content-listing-presentation'
import type { ListingView } from '@/modules/content/listing-view'
import { getMediaURL } from '@/modules/media/media-url'

import { ContentPresentation } from './ContentPresentation'
import { PresentedContentItem } from './PresentedContentItem'

export function ListingPresentation({
  view,
  media,
  children,
}: {
  view: ListingView
  media?: ListingDecorationMedia
  children: ReactNode
}) {
  const decoration = view.decoration
  if (!decoration) return children
  const gap = {
    none: '0px',
    small: '0.75rem',
    large: '1.5rem',
    legacyTile: '1.25rem',
    legacyColumns: '1rem',
  }
  const padding = {
    none: '0px',
    small: '0.75rem',
    large: '1.5rem',
    legacyBlock: 'clamp(1.25rem, 3vw, 2rem)',
    legacyCarousel: '1rem',
  }
  const style = {
    '--listing-gap': gap[decoration.gap],
    '--listing-padding': padding[decoration.padding],
  } as CSSProperties
  const joined = decoration.gap === 'none'

  return (
    <ContentPresentation
      className={`listingPresentation${joined ? ' listingPresentation--joined' : ''}${decoration.itemBorder === 'outline' ? ' listingPresentation--outlinedItems' : ''}`}
      placement="block"
      presentation={resolveListingSurface(decoration, 'surface', media?.surface)}
      style={style}
    >
      {children}
    </ContentPresentation>
  )
}

export function resolveListingItemImage(
  presentation: ContentListingPresentation,
  view: ListingView,
  media?: ListingDecorationMedia,
) {
  const decoration = view.decoration
  if (!view.information.image || view.form === 'row') return { presentation, showImage: false }
  const image = presentation.image
  if (!decoration || (image && (image.kind === 'profile' || getMediaURL(image.media)))) {
    return { presentation, showImage: true }
  }
  if (decoration.fallback === 'custom' && media?.fallback) {
    return {
      presentation: {
        ...presentation,
        image: { kind: 'profile', alt: '', url: media.fallback },
      } satisfies ContentListingPresentation,
      showImage: true,
    }
  }
  return {
    presentation: { ...presentation, image: undefined },
    showImage: decoration.fallback !== 'none',
  }
}

export function ListingItemSurface({
  view,
  media,
  children,
}: {
  view: ListingView
  media?: ListingDecorationMedia
  children: ReactNode
}) {
  if (!view.decoration) return children
  return (
    <ContentPresentation
      className={`listingItemSurface${view.decoration.fill === 'legacy' ? ' listingItemSurface--legacy' : ''}`}
      placement="block"
      presentation={resolveListingSurface(view.decoration, 'fill', media?.fill)}
    >
      {children}
    </ContentPresentation>
  )
}

export function ListingPresentedItem({
  presentation,
  view,
  media,
}: {
  presentation: ContentListingPresentation
  view: ListingView
  media?: ListingDecorationMedia
}) {
  const image = resolveListingItemImage(presentation, view, media)
  return (
    <ListingItemSurface view={view} media={media}>
      <PresentedContentItem
        {...image}
        form={view.form}
        showTileOverlay={!view.decoration || image.showImage}
      />
    </ListingItemSurface>
  )
}
