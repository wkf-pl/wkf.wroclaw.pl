import type { CollectionConfig } from 'payload'

import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const createMedia = createRolePermissionAccess({ operation: 'create', resource: 'media' })
const deleteMedia = createRolePermissionAccess({ operation: 'delete', resource: 'media' })
const readMedia = createRolePermissionAccess({
  anonymousAccess: true,
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
    group: 'Treści',
  },
  fields: [
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
      name: 'uploadedBy',
      type: 'relationship',
      access: {
        update: () => false,
      },
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      label: 'Przesłane przez',
      relationTo: 'users',
    },
  ],
  hooks: {
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
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
