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
    group: 'Strona główna',
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
  hooks: { afterChange: [invalidateSiteSettingsAfterChange] },
  label: 'Podstawowe',
}
