import type { GlobalConfig } from 'payload'

import { invalidateSiteSettingsAfterChange } from '@/modules/cache/invalidate-public-data'
import { createGlobalDraftPreviewURL } from '@/modules/content/draft-preview'
import { preventAnonymousDraftRead } from '@/modules/content/global-drafts'
import { createRolePermissionAccess } from '@/modules/membership/role-access'

const readSiteSettings = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'site-settings',
})
const updateSiteSettings = createRolePermissionAccess({
  operation: 'update',
  resource: 'site-settings',
})
const readSiteSettingsVersions = createRolePermissionAccess({
  operation: 'read',
  resource: 'site-settings',
})

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: preventAnonymousDraftRead(readSiteSettings),
    readVersions: readSiteSettingsVersions,
    update: updateSiteSettings,
  },
  admin: {
    components: {
      elements: {
        PreviewButton: '/components/admin/DraftPreviewButton#DraftPreviewButton',
      },
    },
    group: 'Strona główna',
    preview: () => createGlobalDraftPreviewURL('site-settings'),
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
  versions: { drafts: true, max: 50 },
}
