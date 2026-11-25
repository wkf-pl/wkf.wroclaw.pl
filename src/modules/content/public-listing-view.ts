import { getPayload } from 'payload'

import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import type { ContentPresentationData } from '@/modules/content/content-presentation'
import { loadListingDecorationMedia } from '@/modules/content/listing-decoration-media'
import { getListingViewReference, resolveListingView } from '@/modules/content/listing-view'

const loadPublishedSettings = cachePublicData(
  'listing-view-v2',
  async (reference: { id: number } | { presetKey: string }) => {
    const { default: config } = await import('@payload-config')
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'listing-views',
      where: {
        ...('id' in reference
          ? { id: { equals: reference.id } }
          : { presetKey: { equals: reference.presetKey } }),
        _status: { equals: 'published' },
      },
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
    })
    return docs[0]?.settings
  },
  { tags: [publicCacheTags.listingViews], revalidate: 300 },
)

export async function resolvePublicListingView(
  block: ContentPresentationData & { appearance?: unknown; view?: unknown },
) {
  const reference = getListingViewReference(block.appearance, block.view)
  return resolveListingView(
    block.appearance,
    block.view,
    reference ? await loadPublishedSettings(reference) : undefined,
    block,
  )
}

export async function resolvePublicListingDecorationMedia(
  view: ReturnType<typeof resolveListingView>['view'],
) {
  const decoration = view.decoration
  if (!decoration || !(decoration.surfaceImage || decoration.fillImage || decoration.fallbackImage))
    return undefined
  const { default: config } = await import('@payload-config')
  return loadListingDecorationMedia(await getPayload({ config }), decoration)
}
