import type { CollectionConfig } from 'payload'

import { editorOrAdmin } from '@/access/editorOrAdmin'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: () => true,
    update: editorOrAdmin,
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
  ],
  labels: {
    plural: 'Media',
    singular: 'Plik',
  },
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
