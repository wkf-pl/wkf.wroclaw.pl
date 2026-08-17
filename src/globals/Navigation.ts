import type { GlobalConfig } from 'payload'

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
    group: 'Ustawienia strony',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Nagłówek',
          fields: [
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
                  name: 'appearance',
                  type: 'select',
                  admin: {
                    isClearable: false,
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
                ...createLinkFields(),
                ...createIconFields({ showWhenAppearanceIcon: true }),
              ],
              label: 'Elementy nagłówka',
            },
          ],
        },
        {
          label: 'Hero',
          fields: [
            {
              name: 'heroItems',
              type: 'array',
              admin: {
                components: {
                  RowLabel: '/components/admin/DynamicRowLabel#NavigationItemRowLabel',
                },
              },
              fields: createLinkFields(),
              label: 'Elementy Hero',
            },
          ],
        },
        {
          label: 'Stopka',
          fields: [
            {
              name: 'socialItems',
              type: 'array',
              admin: {
                components: {
                  RowLabel: '/components/admin/DynamicRowLabel#SocialItemRowLabel',
                },
              },
              fields: [...createLinkFields(), ...createIconFields({ required: true })],
              label: 'Media społecznościowe',
            },
            {
              name: 'footerColumns',
              type: 'array',
              admin: {
                components: {
                  RowLabel: '/components/admin/DynamicRowLabel#FooterColumnRowLabel',
                },
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Tytuł kolumny',
                  required: true,
                },
                {
                  name: 'items',
                  type: 'array',
                  admin: {
                    components: {
                      RowLabel: '/components/admin/DynamicRowLabel#FooterColumnItemRowLabel',
                    },
                  },
                  fields: createLinkFields(),
                  label: 'Odnośniki',
                },
              ],
              label: 'Kolumny linków',
            },
          ],
        },
      ],
    },
  ],
  label: 'Menu',
}
