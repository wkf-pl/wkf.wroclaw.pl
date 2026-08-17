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
    afterChange: [
      async ({ doc, req }) => {
        const roleIDs: (number | string)[] = Array.isArray(doc.roles)
          ? doc.roles
              .map((role: number | string | { id: number | string }) =>
                typeof role === 'object' ? role.id : role,
              )
              .filter(
                (id: unknown): id is number | string =>
                  typeof id === 'number' || typeof id === 'string',
              )
          : []
        const memberRoles = roleIDs.length
          ? await req.payload.find({
              collection: 'roles',
              depth: 0,
              limit: roleIDs.length,
              overrideAccess: true,
              pagination: false,
              req,
              where: {
                and: [{ id: { in: roleIDs } }, { key: { equals: 'member' } }],
              },
            })
          : { docs: [] }

        if (memberRoles.docs.length === 0) {
          await req.payload.update({
            collection: 'member-profiles',
            data: { _status: 'draft' },
            overrideAccess: true,
            req,
            unpublishAllLocales: true,
            where: { owner: { equals: doc.id } },
          })
        }

        return doc
      },
    ],
    beforeDelete: [
      async ({ id, req }) => {
        await req.payload.delete({
          collection: 'member-profiles',
          overrideAccess: true,
          req,
          where: { owner: { equals: id } },
        })

        await req.payload.delete({
          collection: 'member-profile-images',
          overrideAccess: true,
          req,
          where: { owner: { equals: id } },
        })
      },
    ],
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
