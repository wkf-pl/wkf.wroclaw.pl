import { APIError, type CollectionConfig } from 'payload'

import { createRolePermissionAccess } from '@/modules/membership/role-permissions'
import { readDocumentFiles } from '@/modules/documents/document-access'

const createDocumentFiles = createRolePermissionAccess({
  operation: 'create',
  resource: 'document-files',
})
const deleteDocumentFiles = createRolePermissionAccess({
  operation: 'delete',
  resource: 'document-files',
})
const updateDocumentFiles = createRolePermissionAccess({
  operation: 'update',
  resource: 'document-files',
})

export const DocumentFiles: CollectionConfig = {
  slug: 'document-files',
  access: {
    create: createDocumentFiles,
    delete: deleteDocumentFiles,
    read: readDocumentFiles,
    update: updateDocumentFiles,
  },
  admin: {
    group: 'Treści',
    hidden: true,
    useAsTitle: 'label',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      admin: {
        description: 'Czytelna nazwa wyświetlana przy odnośniku do pliku.',
      },
      label: 'Nazwa pliku',
      required: true,
    },
    {
      name: 'document',
      type: 'relationship',
      access: {
        update: () => false,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
      relationTo: 'documents',
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      access: {
        update: () => false,
      },
      admin: {
        hidden: true,
        readOnly: true,
      },
      relationTo: 'users',
    },
  ],
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const file = await req.payload.findByID({
          collection: 'document-files',
          depth: 0,
          id,
          overrideAccess: true,
          req,
        })
        const deletingDocumentId = req.context?.deletingDocumentId
        const parentDocumentId =
          typeof file.document === 'object' && file.document ? file.document.id : file.document

        if (deletingDocumentId !== undefined && parentDocumentId === deletingDocumentId) {
          return
        }

        const references = await req.payload.count({
          collection: 'documents',
          overrideAccess: true,
          req,
          where: {
            or: [{ primaryFile: { equals: id } }, { attachments: { contains: id } }],
          },
        })

        if (references.totalDocs > 0) {
          throw new APIError('Nie można usunąć pliku używanego przez dokument.', 400)
        }
      },
    ],
    beforeValidate: [
      ({ data, operation, req }) => {
        if (operation === 'create' && req.user) {
          return { ...data, uploadedBy: req.user.id }
        }

        return data
      },
    ],
  },
  labels: {
    plural: 'Pliki dokumentów',
    singular: 'Plik dokumentu',
  },
  upload: {
    mimeTypes: ['application/pdf'],
  },
}
