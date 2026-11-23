import { sql } from '@payloadcms/db-postgres'
import type { CollectionConfig, Field } from 'payload'

import {
  invalidateListingsAfterChange,
  invalidateListingsAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { populateSlugFromName } from '@/modules/content/slug'
import {
  createHierarchyDisplayFields,
  populateHierarchyFullTitle,
  preventDeletingTopicWithChildren,
  validateHierarchy,
} from '@/modules/content/hierarchy'
import { getTransactionExecutor } from '@/modules/content/lock-content-author'
import { createRelatedContentJoinFields } from '@/modules/content/taxonomy-fields'
import { createRolePermissionAccess } from '@/modules/membership/role-access'

const createTopics = createRolePermissionAccess({
  operation: 'create',
  resource: 'topics',
})
const deleteTopics = createRolePermissionAccess({
  operation: 'delete',
  resource: 'topics',
})
const readTopics = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'topics',
})
const updateTopics = createRolePermissionAccess({
  operation: 'update',
  resource: 'topics',
})

const topicParentField: Field = {
  name: 'parent',
  type: 'relationship',
  admin: { placeholder: '<brak>' },
  label: 'Temat nadrzędny',
  relationTo: 'topics',
}

export const Topics: CollectionConfig = {
  slug: 'topics',
  access: {
    create: createTopics,
    delete: deleteTopics,
    read: readTopics,
    update: updateTopics,
  },
  admin: {
    defaultColumns: ['fullTitle', 'description', 'slug', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['fullTitle', 'name', 'slug'],
    useAsTitle: 'fullTitle',
    pagination: {
      limits: [10, 25, 50],
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
    topicParentField,
    {
      name: 'fullTitle',
      type: 'text',
      admin: { hidden: true, readOnly: true },
      index: true,
      label: 'Pełna ścieżka',
    },
    ...createRelatedContentJoinFields('topics'),
    ...createHierarchyDisplayFields('topics'),
  ],
  hooks: {
    afterChange: [invalidateListingsAfterChange],
    afterDelete: [invalidateListingsAfterDelete],
    beforeChange: [populateHierarchyFullTitle],
    beforeDelete: [
      preventDeletingTopicWithChildren,
      async ({ id, req }) => {
        const execute = (await req.transactionID)
          ? await getTransactionExecutor(req)
          : req.payload.db.drizzle.execute.bind(req.payload.db.drizzle)
        const token = `|${id}|`
        await execute(sql`
          UPDATE content_listing_items
          SET topic_search_index = replace(topic_search_index, ${token}, '|')
          WHERE topic_search_index LIKE ${`%${token}%`}
        `)
      },
    ],
    beforeValidate: [validateHierarchy],
  },
  labels: {
    plural: 'Tematy',
    singular: 'Temat',
  },
}
