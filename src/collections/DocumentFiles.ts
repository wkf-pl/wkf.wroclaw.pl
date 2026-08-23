import { APIError, type CollectionConfig } from 'payload'

import { createRolePermissionAccess } from '@/modules/membership/role-permissions'
import { readDocumentFiles } from '@/modules/documents/document-access'

const createDocumentFiles = createRolePermissionAccess({
  operation: 'create',
  resource: 'documents',
})
const deleteDocumentFiles = createRolePermissionAccess({
  operation: 'delete',
  resource: 'documents',
})
const updateDocumentFiles = createRolePermissionAccess({
  operation: 'update',
  resource: 'documents',
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
        if (req.context?.deletingDocumentId !== undefined) {
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
