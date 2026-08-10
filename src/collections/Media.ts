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
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
