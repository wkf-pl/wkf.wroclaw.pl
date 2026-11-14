import { APIError, type Access, type CollectionConfig } from 'payload'

import { invalidateAllPublicDataAfterChange } from '@/modules/cache/invalidate-public-data'
import { groupAuthoredCollections } from '@/modules/content/content-author'
import { lockAuthorGroup } from '@/modules/content/lock-content-author'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import { groupAuthorWhere } from '@/modules/membership/user-group-assignments'
import { getUserGroupIds } from '@/modules/membership/user-group-membership'

const readGroups = createRolePermissionAccess({
  operation: 'read',
  resource: 'user-groups',
  publicAccess: true,
})
const updateGroups = createRolePermissionAccess({ operation: 'update', resource: 'user-groups' })

const readGroupsAndMemberships: Access = async (arguments_) => {
  const { req } = arguments_
  const access = await readGroups(arguments_)
  if (!req.user || access === true) return access

  const groupIds = await getUserGroupIds(req)
  return groupIds.length > 0 ? { id: { in: groupIds } } : false
}

export const UserGroups: CollectionConfig = {
  slug: 'user-groups',
  labels: { singular: 'Grupa użytkowników', plural: 'Grupy użytkowników' },
  access: {
    create: createRolePermissionAccess({ operation: 'create', resource: 'user-groups' }),
    delete: createRolePermissionAccess({ operation: 'delete', resource: 'user-groups' }),
    read: readGroupsAndMemberships,
    update: updateGroups,
  },
  admin: {
    defaultColumns: ['name', 'updatedAt'],
    group: 'Administracja',
    useAsTitle: 'name',
  },
  defaultPopulate: { name: true },
  disableBulkEdit: true,
  fields: [
    { name: 'name', type: 'text', label: 'Nazwa', required: true, unique: true },
    {
      name: 'members',
      type: 'relationship',
      access: { read: async ({ req }) => (await updateGroups({ req })) === true },
      hasMany: true,
      label: 'Członkowie',
      relationTo: 'users',
    },
    {
      name: 'assignments',
      type: 'ui',
      label: 'Przypisania',
      admin: {
        components: { Field: '/components/admin/UserGroupAssignments#UserGroupAssignments' },
      },
    },
  ],
  hooks: {
    afterChange: [invalidateAllPublicDataAfterChange],
    beforeDelete: [
      async ({ id, req }) => {
        await lockAuthorGroup(req, Number(id), true)
        const counts = await Promise.all(
          groupAuthoredCollections.map((collection) =>
            req.payload.count({
              collection,
              req,
              overrideAccess: true,
              trash: true,
              where: groupAuthorWhere(id),
            }),
          ),
        )
        if (counts.some(({ totalDocs }) => totalDocs > 0)) {
          throw new APIError(
            'Przed usunięciem grupy przekaż przypisane do niej treści, również te w koszu.',
            409,
          )
        }
      },
    ],
  },
}
