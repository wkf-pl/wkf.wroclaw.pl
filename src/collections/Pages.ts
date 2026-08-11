import type { CollectionConfig } from 'payload'

import { createEditorialFields } from '@/modules/content/editorial-fields'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const createPages = createRolePermissionAccess({ operation: 'create', resource: 'pages' })
const deletePages = createRolePermissionAccess({ operation: 'delete', resource: 'pages' })
const readPages = createRolePermissionAccess({
  anonymousAccess: { _status: { equals: 'published' } },
  operation: 'read',
  resource: 'pages',
})
const updatePages = createRolePermissionAccess({ operation: 'update', resource: 'pages' })

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: createPages,
    delete: deletePages,
    read: readPages,
    update: updatePages,
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'publishedAt', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['title', 'slug'],
    useAsTitle: 'title',
  },
  fields: createEditorialFields({ reserveApplicationSlugs: true }),
  hooks: {
    beforeChange: [setPublishedAt],
  },
  labels: {
    plural: 'Strony',
    singular: 'Strona',
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}
