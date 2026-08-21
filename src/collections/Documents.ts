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
import { getRelationshipId } from '@/lib/relationships'

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

function getSelectedFileIds(data: Record<string, unknown>): (number | string)[] {
  const idsByValue = new Map<string, number | string>()
  const primaryFileId = getRelationshipId(data.primaryFile)
  if (primaryFileId !== undefined) {
    idsByValue.set(String(primaryFileId), primaryFileId)
  }

  if (Array.isArray(data.attachments)) {
    for (const attachment of data.attachments) {
      const attachmentId = getRelationshipId(attachment)
      if (attachmentId !== undefined) {
        idsByValue.set(String(attachmentId), attachmentId)
      }
    }
  }

  return [...idsByValue.values()]
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
        const selectedFileIds = getSelectedFileIds(doc)
        if (selectedFileIds.length > 0) {
          await req.payload.update({
            collection: 'document-files',
            context: { assigningDocumentFile: true },
            data: { document: doc.id },
            overrideAccess: true,
            req,
            where: { id: { in: selectedFileIds } },
          })
        }

        return doc
      },
    ],
    beforeChange: [setPublishedAt],
    beforeDelete: [
      async ({ id, req }) => {
        await req.payload.delete({
          collection: 'document-files',
          context: { ...req.context, deletingDocumentId: id },
          overrideAccess: true,
          req,
          where: { document: { equals: id } },
        })
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

        const selectedFileIds = getSelectedFileIds(nextData)
        if (selectedFileIds.length > 0) {
          const files = await req.payload.find({
            collection: 'document-files',
            depth: 0,
            limit: selectedFileIds.length,
            overrideAccess: true,
            pagination: false,
            req,
            select: { document: true, id: true },
            where: { id: { in: selectedFileIds } },
          })
          const filesByID = new Map(files.docs.map((file) => [String(file.id), file]))
          const documentId = getRelationshipId(originalDoc?.id)

          for (const fileId of selectedFileIds) {
            const file = filesByID.get(String(fileId))
            if (!file) {
              throw new APIError('Nie znaleziono wybranego pliku dokumentu.', 400)
            }

            const ownerDocumentId = getRelationshipId(file.document)
            if (ownerDocumentId !== undefined && ownerDocumentId !== documentId) {
              throw new APIError('Wybrany plik należy już do innego dokumentu.', 400)
            }
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
