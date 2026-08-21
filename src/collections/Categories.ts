import type { CollectionConfig } from 'payload'

import {
  invalidateListingsAfterChange,
  invalidateListingsAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { populateSlugFromName } from '@/modules/content/slug'
import { createRelatedContentJoinFields } from '@/modules/content/taxonomy-fields'
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
        position: 'sidebar',
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
    ...createRelatedContentJoinFields('categories'),
  ],
  hooks: {
    afterChange: [invalidateListingsAfterChange],
    afterDelete: [invalidateListingsAfterDelete],
  },
  labels: {
    plural: 'Kategorie',
    singular: 'Kategoria',
  },
}
