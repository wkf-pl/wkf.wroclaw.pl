import type { GlobalConfig } from 'payload'

import { editorOrAdmin } from '@/access/editorOrAdmin'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: editorOrAdmin,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Wrocławski Klub Fantastyki',
      required: true,
    },
    {
      name: 'siteDescription',
      type: 'textarea',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
  ],
}
