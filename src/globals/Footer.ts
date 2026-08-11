import type { GlobalConfig } from 'payload'

import { editorOrAdmin } from '@/access/editorOrAdmin'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
    update: editorOrAdmin,
  },
  admin: {
    group: 'Ustawienia',
  },
  fields: [
    {
      name: 'copyrightText',
      type: 'text',
      label: 'Tekst praw autorskich',
    },
    {
      name: 'links',
      type: 'array',
      label: 'Odnośniki',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Etykieta',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          label: 'Adres URL',
          required: true,
        },
      ],
    },
  ],
  label: 'Stopka',
}
