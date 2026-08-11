import type { Access } from 'payload'

import { isAdministrator } from '@/modules/membership/role-permissions'

export const adminOnly: Access = ({ req }) => isAdministrator(req)
