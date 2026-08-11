import type { GlobalConfig } from 'payload'

import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const readNavigation = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'navigation',
})
const updateNavigation = createRolePermissionAccess({
  operation: 'update',
  resource: 'navigation',
})

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: readNavigation,
    update: updateNavigation,
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
