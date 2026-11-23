import { getRelationshipId } from '@/lib/relationships'
import type { CollectionConfig } from 'payload'

import {
  invalidateListingsAfterChange,
  invalidateListingsAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { populateSlugFromName } from '@/modules/content/slug'
import { createRelatedContentJoinFields } from '@/modules/content/taxonomy-fields'
import { createRolePermissionAccess } from '@/modules/membership/role-access'

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
    defaultColumns: ['name', 'slug', 'description', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['name', 'slug', 'displayName'],
    useAsTitle: 'displayName',
    pagination: {
      limits: [10, 25, 50],
    },
  },
  forceSelect: { name: true, group: true },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'group',
      type: 'relationship',
      relationTo: 'tag-groups',
      label: 'Grupa tagów',
      index: true,
    },
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
    beforeChange: [
      async ({ data, originalDoc, req }) => {
        const id = getRelationshipId(Object.hasOwn(data, 'group') ? data.group : originalDoc?.group)
        const name = data.name ?? originalDoc?.name
        const group =
          id === undefined
            ? null
            : await req.payload.findByID({
                collection: 'tag-groups',
                id,
                depth: 0,
                overrideAccess: true,
                req,
                disableErrors: true,
              })
        return { ...data, displayName: group ? `${group.name} › ${name}` : name }
      },
    ],
    afterChange: [invalidateListingsAfterChange],
    afterDelete: [invalidateListingsAfterDelete],
  },
  labels: {
    plural: 'Tagi',
    singular: 'Tag',
  },
}
