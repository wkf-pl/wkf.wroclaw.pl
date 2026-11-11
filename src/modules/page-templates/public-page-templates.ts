import { getPayload } from 'payload'

import config from '@payload-config'

import type { PageTemplate } from '@/payload-types'
import { cachePublicData, publicCacheTags } from '@/modules/cache/public-data-cache'

import type { PageTemplateID } from './page-template-registry'

async function findPublishedPageTemplateUncached(
  templateKey: PageTemplateID,
): Promise<PageTemplate | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'page-templates',
    depth: 3,
    draft: false,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [{ _status: { equals: 'published' } }, { templateKey: { equals: templateKey } }],
    },
  })

  return result.docs[0] ?? null
}

export const findPublishedPageTemplate = cachePublicData(
  'published-page-template',
  findPublishedPageTemplateUncached,
  { revalidate: 3600, tags: [publicCacheTags.pageTemplates] },
)
