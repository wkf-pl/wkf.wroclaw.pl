import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@payload-config'
import { getRelationshipId } from '@/lib/relationships'

const findAuthorName = cache(async (id: number): Promise<string | null> => {
  const payload = await getPayload({ config })
  const author = await payload.findByID({
    collection: 'users',
    depth: 0,
    disableErrors: true,
    id,
    overrideAccess: true,
    select: { displayName: true },
  })
  return author?.displayName ?? null
})

export async function getContentAuthorName(author: unknown): Promise<string | null> {
  const id = getRelationshipId(author)
  return typeof id === 'number' ? findAuthorName(id) : null
}
