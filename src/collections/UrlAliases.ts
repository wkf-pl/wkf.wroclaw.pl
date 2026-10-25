import type { CollectionConfig } from 'payload'

import {
  invalidateUrlAliasesAfterChange,
  invalidateUrlAliasesAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { clientUserHasCollectionPermission } from '@/modules/membership/permission-resolution'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import {
  normalizeUrlAliasSlug,
  targetCollectionRequiresPublishedStatus,
  urlAliasTargetCollections,
  validateUrlAliasSlug,
} from '@/modules/url-aliases/url-aliases'

const createUrlAliases = createRolePermissionAccess({
  operation: 'create',
  resource: 'url-aliases',
})
const deleteUrlAliases = createRolePermissionAccess({
  operation: 'delete',
  resource: 'url-aliases',
})
const readUrlAliases = createRolePermissionAccess({
  operation: 'read',
  publicAccess: true,
  resource: 'url-aliases',
})
const updateUrlAliases = createRolePermissionAccess({
  operation: 'update',
  resource: 'url-aliases',
})

export const UrlAliases: CollectionConfig = {
  slug: 'url-aliases',
  access: {
    create: createUrlAliases,
    delete: deleteUrlAliases,
    read: readUrlAliases,
    update: updateUrlAliases,
  },
  admin: {
    defaultColumns: ['slug', 'target', 'documentDestination', 'updatedAt'],
    group: 'Treści',
    hidden: ({ user }) => !clientUserHasCollectionPermission(user, 'url-aliases', 'read'),
    useAsTitle: 'slug',
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Jednosegmentowy adres bez domeny, na przykład statut dla /statut.',
      },
      hooks: {
        beforeValidate: [normalizeUrlAliasSlug],
      },
      index: true,
      label: 'Adres aliasu',
      required: true,
      unique: true,
      validate: validateUrlAliasSlug,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'target',
          type: 'relationship',
          admin: {
            components: {
              Field: '/components/admin/UrlAliasTargetField#UrlAliasTargetField',
            },
            width: '66.667%',
          },
          filterOptions: ({ relationTo }) =>
            targetCollectionRequiresPublishedStatus(relationTo)
              ? { _status: { equals: 'published' } }
              : true,
          label: 'Cel',
          maxDepth: 1,
          relationTo: [...urlAliasTargetCollections],
          required: true,
        },
        {
          name: 'documentDestination',
          type: 'select',
          admin: {
            condition: (_data, siblingData) => siblingData.target?.relationTo === 'documents',
            isClearable: false,
            width: '33.333%',
          },
          defaultValue: 'page',
          label: 'Cel dokumentu',
          options: [
            { label: 'Strona dokumentu', value: 'page' },
            { label: 'Główny plik PDF', value: 'primaryFile' },
          ],
          required: true,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [invalidateUrlAliasesAfterChange],
    afterDelete: [invalidateUrlAliasesAfterDelete],
  },
  labels: {
    plural: 'Aliasy adresów',
    singular: 'Alias adresu',
  },
}
