import { APIError, type CollectionConfig } from 'payload'

import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { populateSlug } from '@/modules/content/slug'
import { documentTypeOptions, isDocumentType } from '@/modules/documents/document-types'
import { readDocuments } from '@/modules/documents/document-access'
import { validateDocumentNumber } from '@/modules/documents/document-validation'
import {
  clientUserHasCollectionPermission,
  createCollectionRolePermissionAccess,
  userCanPerformResourceOperation,
} from '@/modules/membership/role-permissions'
import { getDocumentPermissionResource } from '@/modules/membership/permission-resources'

const createDocuments = createCollectionRolePermissionAccess({
  collection: 'documents',
  operation: 'create',
})
const deleteDocuments = createCollectionRolePermissionAccess({
  collection: 'documents',
  operation: 'delete',
})
const updateDocuments = createCollectionRolePermissionAccess({
  collection: 'documents',
  operation: 'update',
})

function getRelationshipId(value: unknown): number | string | undefined {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const id = value.id
    return typeof id === 'number' || typeof id === 'string' ? id : undefined
  }

  return undefined
}

function getSelectedFileIds(data: Record<string, unknown>): (number | string)[] {
  const ids = new Set<number | string>()
  const primaryFileId = getRelationshipId(data.primaryFile)
  if (primaryFileId !== undefined) {
    ids.add(primaryFileId)
  }

  if (Array.isArray(data.attachments)) {
    for (const attachment of data.attachments) {
      const attachmentId = getRelationshipId(attachment)
      if (attachmentId !== undefined) {
        ids.add(attachmentId)
      }
    }
  }

  return [...ids]
}

export const Documents: CollectionConfig = {
  slug: 'documents',
  access: {
    create: createDocuments,
    delete: deleteDocuments,
    read: readDocuments,
    update: updateDocuments,
  },
  admin: {
    defaultColumns: ['title', 'documentType', 'documentNumber', 'documentDate', '_status'],
    group: 'Klubowe',
    hidden: ({ user }) => !clientUserHasCollectionPermission(user, 'documents', 'read'),
    listSearchableFields: ['title', 'documentNumber', 'summary'],
    useAsTitle: 'title',
  },
  defaultSort: '-documentDate',
  fields: [
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
      label: 'Adres URL',
      required: true,
      unique: true,
    },
    {
      name: 'documentType',
      type: 'select',
      admin: {
        components: {
          Field: '/components/admin/DocumentTypeField#DocumentTypeField',
        },
        isClearable: false,
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
      },
      label: 'Numer dokumentu',
      validate: validateDocumentNumber,
    },
    {
      name: 'documentDate',
      type: 'date',
      admin: {
        date: { displayFormat: 'd MMMM yyyy', pickerAppearance: 'dayOnly' },
      },
      index: true,
      label: 'Data dokumentu',
      required: true,
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
          Field: '/components/admin/UserIdentity#UserRelationshipField',
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
    afterChange: [
      async ({ doc, req }) => {
        for (const fileId of getSelectedFileIds(doc)) {
          await req.payload.update({
            collection: 'document-files',
            context: { assigningDocumentFile: true },
            data: { document: doc.id },
            id: fileId,
            overrideAccess: true,
            req,
          })
        }

        return doc
      },
    ],
    beforeChange: [setPublishedAt],
    beforeDelete: [
      async ({ id, req }) => {
        const files = await req.payload.find({
          collection: 'document-files',
          depth: 0,
          limit: 1000,
          overrideAccess: true,
          pagination: false,
          req,
          where: { document: { equals: id } },
        })

        for (const file of files.docs) {
          await req.payload.delete({
            collection: 'document-files',
            context: { deletingDocumentId: id },
            id: file.id,
            overrideAccess: true,
            req,
          })
        }
      },
    ],
    beforeValidate: [
      async ({ data, operation, originalDoc, req }) => {
        const nextData = { ...originalDoc, ...data }

        if (req.user && isDocumentType(nextData.documentType)) {
          const allowed = await userCanPerformResourceOperation({
            data: nextData,
            operation: operation === 'create' ? 'create' : 'update',
            req,
            resource: getDocumentPermissionResource(nextData.documentType),
          })

          if (!allowed) {
            throw new APIError('Nie masz uprawnień do wybranego rodzaju dokumentu.', 403)
          }
        }

        const documentId = getRelationshipId(originalDoc?.id)
        for (const fileId of getSelectedFileIds(nextData)) {
          const file = await req.payload.findByID({
            collection: 'document-files',
            depth: 0,
            id: fileId,
            overrideAccess: true,
            req,
          })
          const ownerDocumentId = getRelationshipId(file.document)

          if (ownerDocumentId !== undefined && ownerDocumentId !== documentId) {
            throw new APIError('Wybrany plik należy już do innego dokumentu.', 400)
          }
        }

        return nextData
      },
    ],
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
