import type { CollectionConfig, Field } from 'payload'

import {
  invalidateListingsAfterChange,
  invalidateListingsAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { populateSlugFromName } from '@/modules/content/slug'
import {
  createHierarchyDisplayFields,
  populateHierarchyFullTitle,
  preventDeletingCategoryWithChildren,
  validateHierarchy,
} from '@/modules/content/hierarchy'
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

const categoryParentField: Field = {
  name: 'parent',
  type: 'relationship',
  admin: { placeholder: '<brak>' },
  label: 'Kategoria nadrzędna',
  relationTo: 'categories',
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: createCategories,
    delete: deleteCategories,
    read: readCategories,
    update: updateCategories,
  },
  admin: {
    defaultColumns: ['fullTitle', 'description', 'slug', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['fullTitle', 'name', 'slug'],
    useAsTitle: 'fullTitle',
    pagination: {
      limits: [10, 25, 50]
    },
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
      label: 'Slug',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis',
    },
    categoryParentField,
    {
      name: 'fullTitle',
      type: 'text',
      admin: { hidden: true, readOnly: true },
      index: true,
      label: 'Pełna ścieżka',
    },
    ...createRelatedContentJoinFields('category'),
    ...createHierarchyDisplayFields('categories'),
  ],
  hooks: {
    afterChange: [invalidateListingsAfterChange],
    afterDelete: [invalidateListingsAfterDelete],
    beforeChange: [populateHierarchyFullTitle],
    beforeDelete: [preventDeletingCategoryWithChildren],
    beforeValidate: [validateHierarchy],
  },
  labels: {
    plural: 'Kategorie',
    singular: 'Kategoria',
  },
}
