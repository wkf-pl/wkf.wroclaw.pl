import { getPayload } from 'payload'

import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
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
    })
    return docs[0]?.settings
  },
  { tags: [publicCacheTags.listingViews], revalidate: 300 },
)

export async function resolvePublicListingView(block: { appearance?: unknown; view?: unknown }) {
  const reference = getListingViewReference(block.appearance, block.view)
  return resolveListingView(
    block.appearance,
    block.view,
    reference ? await loadPublishedSettings(reference) : undefined,
  )
}
