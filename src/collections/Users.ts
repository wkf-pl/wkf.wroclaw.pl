import type { CollectionConfig } from 'payload'

import { administratorOrFirstUser } from '@/access/administratorOrFirstUser'
import { createRolePermissionAccess, isAdministrator } from '@/modules/membership/role-access'
import { clientUserHasResourcePermission } from '@/modules/membership/permission-resolution'
import {
  assignDefaultUserRole,
  deleteUserMemberData,
  unpublishProfileWithoutMemberRole,
} from '@/modules/members/user-lifecycle'

const readUsers = createRolePermissionAccess({
  operation: 'read',
  resource: 'users',
  selfAccess: true,
})
const updateUsers = createRolePermissionAccess({
  operation: 'update',
  resource: 'users',
  selfAccess: true,
})
const deleteUsers = createRolePermissionAccess({ operation: 'delete', resource: 'users' })

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: administratorOrFirstUser,
    delete: deleteUsers,
    read: readUsers,
    update: updateUsers,
  },
  admin: {
    defaultColumns: ['displayName', 'email', 'roles', 'updatedAt'],
    group: 'Administracja',
    hidden: ({ user }) => !clientUserHasResourcePermission(user, 'users', 'read'),
    useAsTitle: 'displayName',
  },
  auth: {
    depth: 1,
  },
  disableBulkEdit: true,
  fields: [
    {
      name: 'email',
      type: 'email',
      admin: {
        components: {
          Cell: '/components/admin/UserIdentity#UserEmailCell',
        },
      },
      label: 'Adres e-mail',
    },
    {
      name: 'displayName',
      type: 'text',
      admin: {
        components: {
          Cell: '/components/admin/UserIdentity#UserDisplayNameCell',
        },
      },
      label: 'Nazwa wyświetlana',
      required: true,
      unique: true,
    },
    {
      name: 'roles',
      type: 'relationship',
      access: {
        create: ({ req }) => isAdministrator(req),
        update: ({ req }) => isAdministrator(req),
      },
      hasMany: true,
      label: 'Role',
      relationTo: 'roles',
      required: true,
    },
  ],
  hooks: {
    afterChange: [unpublishProfileWithoutMemberRole],
    beforeDelete: [deleteUserMemberData],
    beforeValidate: [assignDefaultUserRole],
  },
  labels: {
    plural: 'Użytkownicy',
    singular: 'Użytkownik',
  },
}
