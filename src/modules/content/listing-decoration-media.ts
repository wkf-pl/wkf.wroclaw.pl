import type { Payload } from 'payload'

import { publicRequestContext } from '@/modules/content/public-access'
import { webRasterImageMimeTypes } from '@/modules/media/media-categories'
import { getMediaURL } from '@/modules/media/media-url'

import type { ListingDecoration, ListingDecorationMedia } from './listing-decoration'

export async function loadListingDecorationMedia(
  payload: Payload,
  decoration?: ListingDecoration,
): Promise<ListingDecorationMedia | undefined> {
  if (!decoration) return undefined
  const surface = decoration.surface === 'image' ? decoration.surfaceImage : null
  const fill = decoration.fill === 'image' ? decoration.fillImage : null
  const fallback = decoration.fallback === 'custom' ? decoration.fallbackImage : null
  const ids = [...new Set([surface, fill, fallback].filter((id) => id !== null))]
  if (ids.length === 0) return undefined
  const { docs } = await payload.find({
    collection: 'media',
    context: publicRequestContext,
    depth: 0,
    pagination: false,
    overrideAccess: false,
    user: null,
    select: { url: true },
    where: { id: { in: ids }, mimeType: { in: [...webRasterImageMimeTypes] } },
  })
  const urls = new Map(docs.map((doc) => [doc.id, getMediaURL(doc)]))
  return {
    surface: surface ? urls.get(surface) : undefined,
    fill: fill ? urls.get(fill) : undefined,
    fallback: fallback ? urls.get(fallback) : undefined,
  }
}
