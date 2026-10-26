import type { GlobalConfig } from 'payload'

import { invalidateSiteSettingsAfterChange } from '@/modules/cache/invalidate-public-data'
import { createGlobalDraftPreviewURL } from '@/modules/content/draft-preview'
import { preventAnonymousDraftRead } from '@/modules/content/global-drafts'
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
const readHomepageSectionsVersions = createRolePermissionAccess({
  operation: 'read',
  resource: 'site-settings',
})

export const HomepageSections: GlobalConfig = {
  slug: 'homepage-sections',
  access: {
    read: preventAnonymousDraftRead(readHomepageSections),
    readVersions: readHomepageSectionsVersions,
    update: updateHomepageSections,
  },
  admin: {
    components: {
      elements: {
        PreviewButton: '/components/admin/DraftPreviewButton#DraftPreviewButton',
      },
    },
    group: 'Strona główna',
    preview: () => createGlobalDraftPreviewURL('homepage-sections'),
  },
  fields: [createContentLayoutField('Treści')],
  hooks: { afterChange: [invalidateSiteSettingsAfterChange] },
  label: 'Treści',
  versions: { drafts: true, max: 50 },
}
