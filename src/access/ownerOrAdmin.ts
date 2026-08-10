import type { Access } from 'payload'

import { isUserWithRoles, userHasAnyRole } from '@/modules/membership/user-roles'

export const ownerOrAdmin: Access = ({ req }) => {
  if (userHasAnyRole(req.user, ['administrator'])) {
    return true
  }

  if (!isUserWithRoles(req.user)) {
    return false
  }

  return {
    id: {
      equals: req.user.id,
    },
  }
}
