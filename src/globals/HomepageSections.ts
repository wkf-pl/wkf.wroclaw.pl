import type { GlobalConfig } from 'payload'

import { invalidateSiteSettingsAfterChange } from '@/modules/cache/invalidate-public-data'
import { createContentLayoutField } from '@/modules/content/layout-field'
import { createRolePermissionAccess } from '@/modules/membership/role-access'

const readHomepageSections = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'site-settings',
})
const updateHomepageSections = createRolePermissionAccess({
  operation: 'update',
  resource: 'site-settings',
})

export const HomepageSections: GlobalConfig = {
  slug: 'homepage-sections',
  access: {
    read: readHomepageSections,
    update: updateHomepageSections,
  },
  admin: {
    group: 'Strona główna',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Wydarzenia',
          fields: [
            {
              name: 'eventsTitle',
              type: 'text',
              defaultValue: 'Wydarzenia',
              label: 'Tytuł',
              required: true,
            },
            {
              name: 'eventsContent',
              type: 'richText',
              label: 'Treść',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'eventWindowWeeks',
                  type: 'number',
                  admin: { width: '50%' },
                  defaultValue: 4,
                  label: 'Zakres Wydarzeń na stronie głównej (tygodnie)',
                  max: 52,
                  min: 1,
                },
                {
                  name: 'eventSlideLimit',
                  type: 'number',
                  admin: { width: '50%' },
                  defaultValue: 6,
                  label: 'Limit slajdów Wydarzeń',
                  max: 12,
                  min: 1,
                },
              ],
            },
          ],
        },
        {
          label: 'Aktualności',
          fields: [
            {
              name: 'newsTitle',
              type: 'text',
              defaultValue: 'Aktualności',
              label: 'Tytuł',
              required: true,
            },
            {
              name: 'postCount',
              type: 'select',
              admin: { isClearable: false },
              defaultValue: '2',
              label: 'Liczba Aktualności',
              options: [
                { label: '2', value: '2' },
                { label: '5', value: '5' },
                { label: '8', value: '8' },
              ],
            },
          ],
        },
        {
          label: 'Treść',
          fields: [createContentLayoutField('Treści')],
        },
      ],
    },
  ],
  hooks: { afterChange: [invalidateSiteSettingsAfterChange] },
  label: 'Sekcje',
}
