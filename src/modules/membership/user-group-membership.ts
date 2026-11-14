import type { PayloadRequest } from 'payload'

import { getUserIdentity } from './permission-resolution'

export async function getUserGroupIds(req: PayloadRequest): Promise<number[]> {
  const userId = getUserIdentity(req.user)
  if (userId === undefined) return []

  const { docs } = await req.payload.db.find<{ id: number }>({
    collection: 'user-groups',
    pagination: false,
    req,
    select: { id: true },
    where: { members: { equals: userId } },
  })

  return docs.map(({ id }) => id)
}
