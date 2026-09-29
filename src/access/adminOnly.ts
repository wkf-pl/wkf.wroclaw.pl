import type { Access } from 'payload'

import { isAdministrator } from '@/modules/membership/role-access'

export const adminOnly: Access = ({ req }) => isAdministrator(req)
