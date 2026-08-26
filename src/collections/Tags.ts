import type { CollectionConfig } from 'payload'

import {
  invalidateListingsAfterChange,
  invalidateListingsAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { populateSlugFromName } from '@/modules/content/slug'
import { createRelatedContentJoinFields } from '@/modules/content/taxonomy-fields'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const createTags = createRolePermissionAccess({ operation: 'create', resource: 'tags' })
const deleteTags = createRolePermissionAccess({ operation: 'delete', resource: 'tags' })
const readTags = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'tags',
})
const updateTags = createRolePermissionAccess({ operation: 'update', resource: 'tags' })

export const Tags: CollectionConfig = {
  slug: 'tags',
  access: {
    create: createTags,
    delete: deleteTags,
    read: readTags,
    update: updateTags,
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
      label: 'Slug',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis',
    },
    ...createRelatedContentJoinFields('tags'),
  ],
  hooks: {
    afterChange: [invalidateListingsAfterChange],
    afterDelete: [invalidateListingsAfterDelete],
  },
  labels: {
    plural: 'Tagi',
    singular: 'Tag',
  },
}
