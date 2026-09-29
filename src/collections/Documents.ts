import type { CollectionConfig } from 'payload'

import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { createTaxonomyFields } from '@/modules/content/taxonomy-fields'
import { populateSlug } from '@/modules/content/slug'
import { documentTypeOptions } from '@/modules/documents/document-types'
import { readDocuments } from '@/modules/documents/document-access'
import {
  assignDocumentFiles,
  deleteDocumentFiles,
  validateDocumentFiles,
} from '@/modules/documents/document-files-lifecycle'
import { validateDocumentNumber } from '@/modules/documents/document-validation'
import { clientUserHasCollectionPermission } from '@/modules/membership/permission-resolution'
import { createRolePermissionAccess } from '@/modules/membership/role-access'

const createDocuments = createRolePermissionAccess({
  operation: 'create',
  resource: 'documents',
})
const deleteDocuments = createRolePermissionAccess({
  operation: 'delete',
  resource: 'documents',
})
const updateDocuments = createRolePermissionAccess({
  operation: 'update',
  resource: 'documents',
})

const taxonomyFields = createTaxonomyFields()

export const Documents: CollectionConfig = {
  slug: 'documents',
  access: {
    create: createDocuments,
    delete: deleteDocuments,
    read: readDocuments,
    update: updateDocuments,
  },
  admin: {
    defaultColumns: [
      'title',
      'documentType',
      'documentNumber',
      'documentDate',
      'category',
      'tags',
      '_status',
    ],
    group: 'Klubowe',
    hidden: ({ user }) => !clientUserHasCollectionPermission(user, 'documents', 'read'),
    listSearchableFields: ['title', 'documentNumber', 'summary'],
    useAsTitle: 'title',
    pagination: {
      limits: [10, 25, 50],
    },
  },
  defaultSort: '-documentDate',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'documentType',
          type: 'select',
          admin: {
            isClearable: false,
            width: '33.333%',
          },
          defaultValue: 'resolution',
          label: 'Rodzaj dokumentu',
          options: [...documentTypeOptions],
          required: true,
        },
        {
          name: 'documentNumber',
          type: 'text',
          admin: {
            description: 'Na przykład 3/2026. Pole jest wymagane dla uchwał.',
            width: '33.333%',
          },
          label: 'Numer dokumentu',
          validate: validateDocumentNumber,
        },
        {
          name: 'documentDate',
          type: 'date',
          admin: {
            date: { displayFormat: 'd MMMM yyyy', pickerAppearance: 'dayOnly' },
            width: '33.334%',
          },
          index: true,
          label: 'Data dokumentu',
          required: true,
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: 'Tytuł',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Adres jest tworzony automatycznie z tytułu, ale można go zmienić.',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [populateSlug],
      },
      index: true,
      label: 'Slug',
      required: true,
      unique: true,
    },
    {
      name: 'summary',
      type: 'textarea',
      label: 'Streszczenie',
      maxLength: 500,
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Dodatkowy opis',
    },
    {
      name: 'primaryFile',
      type: 'upload',
      label: 'Główny plik PDF',
      relationTo: 'document-files',
      required: true,
    },
    {
      name: 'attachments',
      type: 'upload',
      hasMany: true,
      label: 'Dodatkowe załączniki PDF',
      relationTo: 'document-files',
    },
    ...taxonomyFields,
    {
      name: 'author',
      type: 'relationship',
      defaultValue: ({ user }) => user?.id,
      label: 'Autor wpisu',
      relationTo: 'users',
      required: true,
      admin: {
        components: {
          Cell: '/components/admin/UserIdentity#UserRelationshipCell',
          Field: '/components/admin/UserRelationshipField#UserRelationshipField',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      index: true,
      label: 'Data publikacji',
    },
  ],
  hooks: {
    afterChange: [assignDocumentFiles],
    beforeChange: [setPublishedAt],
    beforeDelete: [deleteDocumentFiles],
    beforeValidate: [validateDocumentFiles],
  },
  indexes: [{ fields: ['documentType', 'documentNumber'], unique: true }],
  labels: {
    plural: 'Dokumenty',
    singular: 'Dokument',
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}
