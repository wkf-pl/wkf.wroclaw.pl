import { cache } from 'react'
import { getPayload } from 'payload'

import config from '@payload-config'

import type { Category } from '@/payload-types'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'

const findCategorySubtreeIDsCached = cachePublicData(
  'category-subtree-ids',
  async (categoryId: number): Promise<number[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'categories',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      sort: 'id',
      user: null,
      where: {
        or: [{ id: { equals: categoryId } }, { 'breadcrumbs.doc': { equals: categoryId } }],
      },
    })

    return result.docs.map((category) => category.id)
  },
  { revalidate: 3600, tags: [publicCacheTags.contentListings, publicCacheTags.media] },
)

export const findCategorySubtreeIDs = cache(findCategorySubtreeIDsCached)

const findChildCategoriesCached = cachePublicData(
  'child-categories',
  async (categoryId: number): Promise<Category[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'categories',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      sort: ['name', 'id'],
      user: null,
      where: { parent: { equals: categoryId } },
    })

    return result.docs
  },
  { revalidate: 3600, tags: [publicCacheTags.contentListings] },
)

export const findChildCategories = cache(findChildCategoriesCached)
