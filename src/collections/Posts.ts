import type { CollectionConfig } from 'payload'

import { createEditorialFields, getEditorialField } from '@/modules/content/editorial-fields'
import {
  removeContentListingAfterDelete,
  syncContentListingAfterChange,
} from '@/modules/content/content-listing-index'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { createContentLayoutField } from '@/modules/content/layout-field'
import { createDraftPreviewURL } from '@/modules/content/draft-preview'
import { publishedPublicAccess } from '@/modules/content/public-access'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'

const createPosts = createRolePermissionAccess({ operation: 'create', resource: 'posts' })
const deletePosts = createRolePermissionAccess({ operation: 'delete', resource: 'posts' })
const readPosts = createRolePermissionAccess({
  operation: 'read',
  publicAccess: publishedPublicAccess,
  resource: 'posts',
})
const updatePosts = createRolePermissionAccess({ operation: 'update', resource: 'posts' })

const editorialFields = createEditorialFields({
  includeContent: false,
  includeExcerpt: true,
  includeTaxonomy: true,
})

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: createPosts,
    delete: deletePosts,
    read: readPosts,
    update: updatePosts,
  },
  admin: {
    components: {
      edit: {
        PreviewButton: '/components/admin/DraftPreviewButton#DraftPreviewButton',
      },
    },
    defaultColumns: ['title', 'slug', 'category', 'tags', '_status', 'publishedAt', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['title', 'slug', 'excerpt'],
    useAsTitle: 'title',
    pagination: {
      limits: [10, 25, 50],
    },
    preview: (document) => createDraftPreviewURL('posts', document),
  },
  defaultSort: '-publishedAt',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Treść',
          fields: [
            getEditorialField(editorialFields, 'title'),
            getEditorialField(editorialFields, 'heroImage'),
            getEditorialField(editorialFields, 'excerpt'),
            {
              type: 'row',
              fields: [
                {
                  name: 'relatedEvents',
                  type: 'relationship',
                  admin: { placeholder: '<brak>', width: '50%' },
                  hasMany: true,
                  label: 'Powiązane wydarzenia',
                  relationTo: 'events',
                },
                {
                  name: 'relatedEventCycles',
                  type: 'relationship',
                  admin: { placeholder: '<brak>', width: '50%' },
                  hasMany: true,
                  label: 'Powiązane cykle',
                  relationTo: 'event-cycles',
                },
              ],
            },
            createContentLayoutField('Treści'),
          ],
        },
        { label: 'SEO', fields: [getEditorialField(editorialFields, 'seo')] },
      ],
    },
    getEditorialField(editorialFields, 'slug'),
    getEditorialField(editorialFields, 'category'),
    getEditorialField(editorialFields, 'tags'),
    getEditorialField(editorialFields, 'author'),
    getEditorialField(editorialFields, 'publishedAt'),
  ],
  hooks: {
    afterChange: [syncContentListingAfterChange],
    afterDelete: [removeContentListingAfterDelete],
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
