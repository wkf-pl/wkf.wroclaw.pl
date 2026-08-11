import { APIError, type CollectionConfig } from 'payload'

import { administratorOrFirstUser } from '@/access/administratorOrFirstUser'
import {
  administratorRoleKey,
  clientUserHasResourcePermission,
  createRolePermissionAccess,
  defaultUserRoleKey,
  isAdministrator,
} from '@/modules/membership/role-permissions'

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
    group: 'Administracja',
    hidden: ({ user }) => !clientUserHasResourcePermission(user, 'users', 'read'),
    useAsTitle: 'email',
  },
  auth: {
    depth: 1,
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      label: 'Nazwa wyświetlana',
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
    beforeValidate: [
      async ({ data, operation, req }) => {
        if (operation !== 'create' || (Array.isArray(data?.roles) && data.roles.length > 0)) {
          return data
        }

        const roleKey = req.user ? defaultUserRoleKey : administratorRoleKey
        const roles = await req.payload.find({
          collection: 'roles',
          depth: 0,
          limit: 1,
          overrideAccess: true,
          pagination: false,
          where: {
            key: {
              equals: roleKey,
            },
          },
        })
        const role = roles.docs[0]

        if (!role) {
          throw new APIError(`Brakuje wymaganej roli systemowej: ${roleKey}.`, 500)
        }

        return {
          ...data,
          roles: [role.id],
        }
      },
    ],
  },
  labels: {
    plural: 'Użytkownicy',
    singular: 'Użytkownik',
  },
}
