import type { Access } from 'payload'

import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const createUserWithRolePermission = createRolePermissionAccess({
  operation: 'create',
  resource: 'users',
})

export const administratorOrFirstUser: Access = async ({ req }) => {
  if (req.user) {
    return createUserWithRolePermission({ req })
  }

  const { totalDocs } = await req.payload.count({ collection: 'users' })

  return totalDocs === 0
}
