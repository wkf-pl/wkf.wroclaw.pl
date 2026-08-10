import type { Access } from 'payload'

import { userHasAnyRole } from '@/modules/membership/user-roles'

export const editorOrAdmin: Access = ({ req }) =>
  userHasAnyRole(req.user, ['administrator', 'editor'])
