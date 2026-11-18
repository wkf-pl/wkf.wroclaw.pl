import { getPayload } from 'payload'

import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'
import { getSharedListingViewId, resolveListingView } from '@/modules/content/listing-view'

const loadPublishedSettings = cachePublicData(
  'listing-view-v1',
  async (id: number) => {
    const { default: config } = await import('@payload-config')
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'listing-views',
      where: { id: { equals: id }, _status: { equals: 'published' } },
      depth: 0,
      limit: 1,
      overrideAccess: true,
    })
    return docs[0]?.settings
  },
  { tags: [publicCacheTags.listingViews], revalidate: 300 },
)

export async function resolvePublicListingView(block: { appearance?: unknown; view?: unknown }) {
  const id = getSharedListingViewId(block.appearance)
  return resolveListingView(
    block.appearance,
    block.view,
    id ? await loadPublishedSettings(id) : undefined,
  )
}
