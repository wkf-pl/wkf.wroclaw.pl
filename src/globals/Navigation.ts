import type { GlobalConfig } from 'payload'

import { editorOrAdmin } from '@/access/editorOrAdmin'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: () => true,
    update: editorOrAdmin,
  },
  admin: {
    group: 'Ustawienia',
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Elementy nawigacji',
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
        {
          name: 'openInNewTab',
          type: 'checkbox',
          defaultValue: false,
          label: 'Otwórz w nowej karcie',
        },
      ],
    },
  ],
  label: 'Nawigacja',
}
