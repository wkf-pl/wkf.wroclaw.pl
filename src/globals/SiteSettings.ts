import type { GlobalConfig } from 'payload'

import { editorOrAdmin } from '@/access/editorOrAdmin'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: editorOrAdmin,
  },
  admin: {
    group: 'Ustawienia',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Wrocławski Klub Fantastyki',
      label: 'Nazwa strony',
      required: true,
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      label: 'Opis strony',
    },
    {
      name: 'contactEmail',
      type: 'email',
      label: 'E-mail kontaktowy',
    },
  ],
  label: 'Ustawienia strony',
}
