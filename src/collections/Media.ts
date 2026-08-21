import type { CollectionConfig } from 'payload'

import {
  invalidateAllPublicDataAfterChange,
  invalidateAllPublicDataAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'
import { mediaDocumentMimeTypes } from '@/modules/media/media-categories'

const createMedia = createRolePermissionAccess({ operation: 'create', resource: 'media' })
const deleteMedia = createRolePermissionAccess({ operation: 'delete', resource: 'media' })
const readMedia = createRolePermissionAccess({
  operation: 'read',
  resource: 'media',
})
const updateMedia = createRolePermissionAccess({ operation: 'update', resource: 'media' })

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: createMedia,
    delete: deleteMedia,
    read: readMedia,
    update: updateMedia,
  },
  admin: {
    components: {
      Description: '/components/admin/MediaCategoryTabs#MediaCategoryTabs',
    },
    defaultColumns: [
      'filename',
      'description',
      'filesize',
      'width',
      'height',
      'url',
      'thumbnailURL',
      'categories',
      'tags',
      'uploadedBy',
    ],
    group: 'Treści',
  },
  fields: [
    {
      name: 'filesize',
      type: 'number',
      admin: {
        components: { Cell: '/components/admin/MediaTableCells#FileSizeCell' },
      },
    },
    {
      name: 'width',
      type: 'number',
      admin: {
        components: { Cell: '/components/admin/MediaTableCells#NumberCell' },
      },
    },
    {
      name: 'height',
      type: 'number',
      admin: {
        components: { Cell: '/components/admin/MediaTableCells#NumberCell' },
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        components: { Cell: '/components/admin/MediaTableCells#URLCell' },
      },
    },
    {
      name: 'thumbnailURL',
      type: 'text',
      admin: {
        components: { Cell: '/components/admin/MediaTableCells#URLCell' },
      },
    },
    {
      name: 'alt',
      type: 'text',
      admin: {
        description:
          'Krótki opis obrazu dla czytników ekranu i sytuacji, gdy plik nie może się wyświetlić.',
      },
      label: 'Tekst alternatywny',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'categories',
          type: 'relationship',
          admin: {
            components: { Cell: '/components/admin/MediaTableCells#TaxonomyCell' },
            placeholder: '<brak>',
            width: '50%',
          },
          hasMany: true,
          label: 'Kategorie',
          relationTo: 'categories',
        },
        {
          name: 'tags',
          type: 'relationship',
          admin: {
            components: { Cell: '/components/admin/MediaTableCells#TaxonomyCell' },
            placeholder: '<brak>',
            width: '50%',
          },
          hasMany: true,
          label: 'Tagi',
          relationTo: 'tags',
        },
      ],
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      access: {
        update: () => false,
      },
      admin: {
        components: {
          Cell: '/components/admin/UserIdentity#UserRelationshipCell',
          Field: '/components/admin/UserIdentity#UserRelationshipField',
        },
        position: 'sidebar',
        readOnly: true,
      },
      label: 'Przesłane przez',
      relationTo: 'users',
    },
  ],
  hooks: {
    afterChange: [invalidateAllPublicDataAfterChange],
    afterDelete: [invalidateAllPublicDataAfterDelete],
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user) {
          return {
            ...data,
            uploadedBy: req.user.id,
          }
        }

        return data
      },
    ],
  },
  labels: {
    plural: 'Media',
    singular: 'Plik',
  },
  upload: {
    mimeTypes: ['image/*', ...mediaDocumentMimeTypes],
  },
}
