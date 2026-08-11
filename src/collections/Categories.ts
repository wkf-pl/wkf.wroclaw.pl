import type { CollectionConfig } from 'payload'

import { populateSlugFromName } from '@/modules/content/slug'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const createCategories = createRolePermissionAccess({
  operation: 'create',
  resource: 'categories',
})
const deleteCategories = createRolePermissionAccess({
  operation: 'delete',
  resource: 'categories',
})
const readCategories = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'categories',
})
const updateCategories = createRolePermissionAccess({
  operation: 'update',
  resource: 'categories',
})

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: createCategories,
    delete: deleteCategories,
    read: readCategories,
    update: updateCategories,
  },
  admin: {
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['name', 'slug'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nazwa',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Adres jest tworzony automatycznie z nazwy.',
      },
      hooks: {
        beforeValidate: [populateSlugFromName],
      },
      index: true,
      label: 'Adres URL',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis',
    },
  ],
  labels: {
    plural: 'Kategorie',
    singular: 'Kategoria',
  },
}
