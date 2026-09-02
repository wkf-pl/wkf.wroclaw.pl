import type { GlobalConfig } from 'payload'

import { invalidateNavigationAfterChange } from '@/modules/cache/invalidate-public-data'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'
import { createIconFields, createLinkFields } from '@/modules/navigation/fields'

const readFooter = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'navigation',
})
const updateFooter = createRolePermissionAccess({
  operation: 'update',
  resource: 'navigation',
})

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: readFooter,
    update: updateFooter,
  },
  admin: {
    group: 'Strona główna',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Logo',
          fields: [
            {
              name: 'copyright',
              type: 'richText',
              label: 'Copyright',
            },
            {
              name: 'content',
              type: 'richText',
              label: 'Treść',
            },
          ],
        },
        {
          label: 'Kontakt',
          fields: [
            {
              name: 'contactHeading',
              type: 'text',
              label: 'Nagłówek',
            },
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
              labels: {
                plural: 'Media społecznościowe',
                singular: 'medium społecznościowe',
              },
            },
          ],
        },
        {
          label: 'Menu',
          fields: [
            {
              name: 'columns',
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
                  labels: {
                    plural: 'Pozycje menu',
                    singular: 'pozycję menu',
                  },
                },
              ],
              label: 'Menu kolumnowe',
              labels: {
                plural: 'Kolumny menu w stopce',
                singular: 'kolumnę menu w stopce',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: { afterChange: [invalidateNavigationAfterChange] },
  label: 'Stopka',
}
