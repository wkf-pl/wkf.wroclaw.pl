import type { CollectionConfig } from 'payload'

import { createEditorialFields } from '@/modules/content/editorial-fields'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const createPosts = createRolePermissionAccess({ operation: 'create', resource: 'posts' })
const deletePosts = createRolePermissionAccess({ operation: 'delete', resource: 'posts' })
const readPosts = createRolePermissionAccess({
  anonymousAccess: { _status: { equals: 'published' } },
  operation: 'read',
  resource: 'posts',
})
const updatePosts = createRolePermissionAccess({ operation: 'update', resource: 'posts' })

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: createPosts,
    delete: deletePosts,
    read: readPosts,
    update: updatePosts,
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'publishedAt', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['title', 'slug', 'excerpt'],
    useAsTitle: 'title',
  },
  defaultSort: '-publishedAt',
  fields: createEditorialFields({ includeExcerpt: true, includeTaxonomy: true }),
  hooks: {
    beforeChange: [setPublishedAt],
  },
  labels: {
    plural: 'Wpisy',
    singular: 'Wpis',
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}
