import type { PayloadRequest } from 'payload'

import { contentOwnerCollections } from '@/modules/content/content-owners'

export function groupOwnerWhere(id: number | string) {
  return { owners: { equals: { relationTo: 'user-groups', value: id } } }
}

export async function findUserGroupAssignments(
  req: PayloadRequest,
  id: number | string,
  limit: number,
) {
  return Promise.all(
    contentOwnerCollections.map(async (collection) => ({
      collection,
      ...(await req.payload.find({
        collection,
        depth: 0,
        disableErrors: true,
        limit,
        overrideAccess: false,
        req,
        trash: true,
        where: groupOwnerWhere(id),
      })),
    })),
  )
}
