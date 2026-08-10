import type { Access } from 'payload'

import { userHasAnyRole } from '@/modules/membership/user-roles'

export const adminOnly: Access = ({ req }) => userHasAnyRole(req.user, ['administrator'])
