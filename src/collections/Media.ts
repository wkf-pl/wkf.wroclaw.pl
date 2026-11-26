import { createContentOwnersField } from '@/modules/content/content-owners-field'
import type { CollectionConfig, JSONField, Where } from 'payload'

import {
  invalidateAllPublicDataAfterChange,
  invalidateAllPublicDataAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { createContentAuthorField } from '@/modules/content/content-author-field'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import {
  getMediaCategoryWhere,
  mediaDocumentMimeTypes,
  webRasterImageMimeTypes,
} from '@/modules/media/media-categories'

import {
  mediaImageVariantEndpoint,
  serveOptimizedMediaFile,
} from '@/modules/media/media-image-endpoints'
import { getMediaVariantURL } from '@/modules/media/media-image-data'
import {
  cleanupDeletedMediaImage,
  cleanupReplacedMediaImage,
  storeUploadedMediaImage,
} from '@/modules/media/media-image-upload'

const mediaImageVariantsSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      filename: { type: 'string' },
      width: { type: 'integer' },
      height: { type: 'integer' },
      filesize: { type: 'integer' },
    },
    required: ['filename', 'width', 'height', 'filesize'],
  },
} satisfies NonNullable<JSONField['jsonSchema']>['schema']

const createMedia = createRolePermissionAccess({ operation: 'create', resource: 'media' })
const deleteMedia = createRolePermissionAccess({ operation: 'delete', resource: 'media' })
const publicMediaAccess: Where = { id: { exists: true } }
const readMedia = createRolePermissionAccess({
  operation: 'read',
  publicAccess: publicMediaAccess,
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
    custom: { defaultListWhere: getMediaCategoryWhere('images') },
    defaultColumns: [
      'filename',
      'description',
      'filesize',
      'width',
      'height',
      'url',
      'topics',
      'tags',
      'author',
      'uploadedBy',
    ],
    group: 'Treści',
    listSearchableFields: ['filename', 'description', 'author', 'topics'],
    pagination: {
      limits: [10, 25, 50],
    },
  },
  endpoints: [mediaImageVariantEndpoint, { ...mediaImageVariantEndpoint, method: 'head' }],
  fields: [
    {
      name: 'removeImageMetadata',
      type: 'checkbox',
      virtual: true,
      label: 'Usuń dodatkowe metadane zdjęcia',
      admin: {
        description: 'Dotyczy zdjęć statycznych.',
        components: {
          Field: '/components/admin/RemoveMediaImageMetadataField#RemoveMediaImageMetadataField',
        },
      },
    },
    {
      name: 'imageVariants',
      type: 'json',
      admin: { hidden: true },
      typescriptSchema: [() => ({ oneOf: [mediaImageVariantsSchema, { type: 'null' }] })],
    },
    {
      name: 'legacyImageFiles',
      type: 'array',
      admin: { hidden: true },
      fields: [{ name: 'filename', type: 'text', required: true, index: true }],
    },
    {
      name: 'imageConversionSource',
      type: 'json',
      hidden: true,
      admin: { hidden: true },
      typescriptSchema: [
        () => ({
          oneOf: [
            {
              type: 'object',
              properties: {
                key: { type: 'string' },
                filename: { type: 'string' },
                etag: { type: 'string' },
                filesize: { type: 'integer' },
                finalized: { type: 'boolean' },
                originalDocument: {
                  type: 'object',
                  properties: {
                    mimeType: { type: ['string', 'null'] },
                    width: { type: ['integer', 'null'] },
                    height: { type: ['integer', 'null'] },
                    url: { type: ['string', 'null'] },
                    thumbnailURL: { type: ['string', 'null'] },
                    _objectKey: { type: ['string', 'null'] },
                  },
                },
              },
              required: ['key', 'filename', 'etag', 'filesize', 'originalDocument'],
            },
            { type: 'null' },
          ],
        }),
      ],
    },
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
      hooks: {
        afterRead: [
          ({ data, value }) => {
            const thumbnail = data?.imageVariants?.[0]
            return data && typeof data.id === 'number' && thumbnail?.filename
              ? getMediaVariantURL(data.id, thumbnail.filename)
              : value
          },
        ],
      },
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
      name: 'topics',
      type: 'relationship',
      admin: {
        description: 'Czego dotyczy ta treść? Możesz wybrać kilka tematów.',
        components: { Cell: '/components/admin/MediaTableCells#TaxonomyCell' },
        placeholder: '<brak>',
        position: 'sidebar',
      },
      hasMany: true,
      label: 'Tematy',
      relationTo: 'topics',
    },
    {
      name: 'tags',
      type: 'relationship',
      admin: {
        description: 'Po jakich cechach czytelnik będzie szukać tej treści?',
        components: { Cell: '/components/admin/MediaTableCells#TaxonomyCell' },
        placeholder: '<brak>',
        position: 'sidebar',
      },
      hasMany: true,
      label: 'Tagi',
      relationTo: 'tags',
    },
    createContentAuthorField(),
    createContentOwnersField(),
    {
      name: 'uploadedBy',
      type: 'relationship',
      access: {
        update: () => false,
      },
      admin: {
        components: {
          Cell: '/components/admin/UserIdentity#UserRelationshipCell',
          Field: '/components/admin/UserRelationshipField#UserRelationshipField',
        },
        position: 'sidebar',
        readOnly: true,
      },
      label: 'Przesłane przez',
      relationTo: 'users',
    },
  ],
  hooks: {
    afterChange: [invalidateAllPublicDataAfterChange, cleanupReplacedMediaImage],
    afterDelete: [invalidateAllPublicDataAfterDelete, cleanupDeletedMediaImage],
    beforeChange: [storeUploadedMediaImage],
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
    handlers: [serveOptimizedMediaFile],
    mimeTypes: [...webRasterImageMimeTypes, ...mediaDocumentMimeTypes],
  },
}
