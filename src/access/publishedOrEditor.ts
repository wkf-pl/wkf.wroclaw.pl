import type { Access } from 'payload'

import { userHasAnyRole } from '@/modules/membership/user-roles'

export const publishedOrEditor: Access = ({ req }) => {
  if (userHasAnyRole(req.user, ['administrator', 'editor'])) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
