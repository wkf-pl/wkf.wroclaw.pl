import type { GlobalConfig } from 'payload'

import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const readFooter = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'footer',
})
const updateFooter = createRolePermissionAccess({ operation: 'update', resource: 'footer' })

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: readFooter,
    update: updateFooter,
  },
  admin: {
    group: 'Ustawienia',
  },
  fields: [
    {
      name: 'copyrightText',
      type: 'richText',
      label: 'Tekst praw autorskich',
    },
  ],
  label: 'Stopka',
}
