import type { PayloadRequest } from 'payload'

import { groupAuthoredCollections } from '@/modules/content/content-author'

export function groupAuthorWhere(id: number | string) {
  return { author: { equals: { relationTo: 'user-groups', value: id } } }
}

export async function findUserGroupAssignments(
  req: PayloadRequest,
  id: number | string,
  limit: number,
) {
  return Promise.all(
    groupAuthoredCollections.map(async (collection) => ({
      collection,
      ...(await req.payload.find({
        collection,
        depth: 0,
        disableErrors: true,
        limit,
        overrideAccess: false,
        req,
        trash: true,
        where: groupAuthorWhere(id),
      })),
    })),
  )
}
