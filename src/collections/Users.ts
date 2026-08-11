import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { administratorOrFirstUser } from '@/access/administratorOrFirstUser'
import { ownerOrAdmin } from '@/access/ownerOrAdmin'
import { userHasAnyRole, userRoleLabels, userRoles } from '@/modules/membership/user-roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: administratorOrFirstUser,
    delete: adminOnly,
    read: ownerOrAdmin,
    update: ownerOrAdmin,
  },
  admin: {
    group: 'Administracja',
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'displayName',
      type: 'text',
      label: 'Nazwa wyświetlana',
    },
    {
      name: 'roles',
      type: 'select',
      access: {
        update: ({ req }) => userHasAnyRole(req.user, ['administrator']),
      },
      defaultValue: ({ req }) => (req.user ? ['user'] : ['administrator']),
      hasMany: true,
      label: 'Role',
      options: userRoles.map((role) => ({ label: userRoleLabels[role], value: role })),
      required: true,
      saveToJWT: true,
    },
  ],
  labels: {
    plural: 'Użytkownicy',
    singular: 'Użytkownik',
  },
}
