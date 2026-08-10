import type { Access } from 'payload'

import { userHasAnyRole } from '@/modules/membership/user-roles'

export const administratorOrFirstUser: Access = async ({ req }) => {
  if (userHasAnyRole(req.user, ['administrator'])) {
    return true
  }

  if (req.user) {
    return false
  }

  const { totalDocs } = await req.payload.count({ collection: 'users' })

  return totalDocs === 0
}
