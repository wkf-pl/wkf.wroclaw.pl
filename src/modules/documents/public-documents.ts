import { getPayload } from 'payload'

import config from '@payload-config'

import type { Document } from '@/payload-types'
import { publicRequestContext } from '@/modules/content/public-access'

export async function findPublishedDocumentBySlug(slug: string): Promise<Document | null> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'documents',
    context: publicRequestContext,
    depth: 1,
    draft: false,
    limit: 1,
    overrideAccess: false,
    user: null,
    where: { and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }] },
  })

  return result.docs[0] ?? null
}
