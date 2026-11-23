import { cache } from 'react'
import { getPayload } from 'payload'

import config from '@payload-config'

import { collectPayloadPages } from '@/lib/payload-pagination'

import type { Topic } from '@/payload-types'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'

const findTopicSubtreeIDsCached = cachePublicData(
  'topic-subtree-ids',
  async (topicId: number): Promise<number[]> => {
    const payload = await getPayload({ config })
    const topics = await collectPayloadPages((page) =>
      payload.find({
        collection: 'topics',
        depth: 0,
        joins: false,
        limit: 100,
        overrideAccess: false,
        page,
        select: { name: true },
        sort: 'id',
        user: null,
        where: {
          or: [{ id: { equals: topicId } }, { 'breadcrumbs.doc': { equals: topicId } }],
        },
      }),
    )

    return topics.map((topic) => topic.id)
  },
  { revalidate: 3600, tags: [publicCacheTags.contentListings, publicCacheTags.media] },
)

export const findTopicSubtreeIDs = cache(findTopicSubtreeIDsCached)

const findChildTopicsCached = cachePublicData(
  'child-topics',
  async (topicId: number): Promise<Topic[]> => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'topics',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      sort: ['name', 'id'],
      user: null,
      where: { parent: { equals: topicId } },
    })

    return result.docs
  },
  { revalidate: 3600, tags: [publicCacheTags.contentListings] },
)

export const findChildTopics = cache(findChildTopicsCached)
