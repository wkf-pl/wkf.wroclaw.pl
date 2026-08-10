import type { GlobalConfig } from 'payload'

import { editorOrAdmin } from '@/access/editorOrAdmin'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: editorOrAdmin,
  },
  fields: [
    {
      name: 'copyrightText',
      type: 'text',
    },
    {
      name: 'links',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
