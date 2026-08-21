import type { GlobalConfig } from 'payload'

import { invalidateSiteSettingsAfterChange } from '@/modules/cache/invalidate-public-data'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const readSiteSettings = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'site-settings',
})
const updateSiteSettings = createRolePermissionAccess({
  operation: 'update',
  resource: 'site-settings',
})

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: readSiteSettings,
    update: updateSiteSettings,
  },
  admin: {
    group: 'Ustawienia strony',
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
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Obrazek Hero',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'homepageEventWindowWeeks',
          type: 'number',
          admin: { width: '33%' },
          defaultValue: 4,
          label: 'Zakres Wydarzeń na stronie głównej (tygodnie)',
          max: 52,
          min: 1,
        },
        {
          name: 'homepageEventSlideLimit',
          type: 'number',
          admin: { width: '33%' },
          defaultValue: 6,
          label: 'Limit slajdów Wydarzeń',
          max: 12,
          min: 1,
        },
        {
          name: 'homepagePostCount',
          type: 'select',
          admin: { isClearable: false, width: '33%' },
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
      name: 'copyrightText',
      type: 'richText',
      label: 'Tekst praw autorskich',
    },
  ],
  hooks: { afterChange: [invalidateSiteSettingsAfterChange] },
  label: 'Podstawowe',
}
