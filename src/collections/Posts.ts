import type { CollectionConfig } from 'payload'

import { createEditorialFields } from '@/modules/content/editorial-fields'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { createContentLayoutField } from '@/modules/content/layout-field'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'

const createPosts = createRolePermissionAccess({ operation: 'create', resource: 'posts' })
const deletePosts = createRolePermissionAccess({ operation: 'delete', resource: 'posts' })
const readPosts = createRolePermissionAccess({
  operation: 'read',
  resource: 'posts',
})
const updatePosts = createRolePermissionAccess({ operation: 'update', resource: 'posts' })

const editorialFields = createEditorialFields({
  includeContent: false,
  includeExcerpt: true,
  includeTaxonomy: true,
})

function getEditorialField(name: string) {
  const field = editorialFields.find((candidate) => 'name' in candidate && candidate.name === name)

  if (!field) {
    throw new Error(`Missing editorial field: ${name}`)
  }

  return field
}

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
  fields: [
    getEditorialField('title'),
    getEditorialField('slug'),
    {
      type: 'row',
      fields: [getEditorialField('categories'), getEditorialField('tags')],
    },
    getEditorialField('heroImage'),
    getEditorialField('excerpt'),
    createContentLayoutField('Treści'),
    getEditorialField('author'),
    getEditorialField('publishedAt'),
    getEditorialField('seo'),
  ],
  hooks: {
    beforeChange: [setPublishedAt],
    beforeValidate: [validateMediaBlocks],
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
