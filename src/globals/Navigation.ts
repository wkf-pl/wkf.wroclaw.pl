import type { GlobalConfig } from 'payload'

import { invalidateNavigationAfterChange } from '@/modules/cache/invalidate-public-data'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'
import { createIconFields, createLinkFields } from '@/modules/navigation/fields'

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
    group: 'Strona główna',
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      filterOptions: { mimeType: { contains: 'image/' } },
      label: 'Logo',
      relationTo: 'media',
    },
    {
      name: 'headerItems',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#NavigationItemRowLabel',
        },
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              admin: { width: '50%' },
              label: 'Etykieta',
              required: true,
            },
            {
              name: 'appearance',
              type: 'select',
              admin: {
                isClearable: false,
                width: '50%',
              },
              defaultValue: 'link',
              label: 'Wygląd',
              options: [
                { label: 'Link', value: 'link' },
                { label: 'Ikona', value: 'icon' },
                { label: 'Przycisk', value: 'button' },
              ],
              required: true,
            },
          ],
        },
        ...createLinkFields({ includeLabel: false }),
        ...createIconFields({ showWhenAppearanceIcon: true }),
      ],
      label: 'Elementy nagłówka',
      labels: {
        plural: 'Pozycje menu w nagłówku',
        singular: 'pozycję',
      },
    },
  ],
  hooks: { afterChange: [invalidateNavigationAfterChange] },
  label: 'Nagłówek',
}
