import type { GlobalConfig } from 'payload'

import { invalidateNavigationAfterChange } from '@/modules/cache/invalidate-public-data'
import { createGlobalDraftPreviewURL } from '@/modules/content/draft-preview'
import { preventAnonymousDraftRead } from '@/modules/content/global-drafts'
import { webRasterImageMimeTypes } from '@/modules/media/media-categories'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import { createSiteMenuLinkFields, validatePresentedLinkItems } from '@/modules/navigation/fields'

const readNavigation = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'navigation',
})
const updateNavigation = createRolePermissionAccess({
  operation: 'update',
  resource: 'navigation',
})
const readNavigationVersions = createRolePermissionAccess({
  operation: 'read',
  resource: 'navigation',
})

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: preventAnonymousDraftRead(readNavigation),
    readVersions: readNavigationVersions,
    update: updateNavigation,
  },
  admin: {
    components: {
      elements: {
        PreviewButton: '/components/admin/DraftPreviewButton#DraftPreviewButton',
      },
    },
    group: 'Strona główna',
    preview: () => createGlobalDraftPreviewURL('navigation'),
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      filterOptions: { mimeType: { in: [...webRasterImageMimeTypes] } },
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
      fields: createSiteMenuLinkFields(),
      label: 'Elementy nagłówka',
      labels: {
        plural: 'Pozycje menu w nagłówku',
        singular: 'pozycję',
      },
      validate: validatePresentedLinkItems,
    },
  ],
  hooks: { afterChange: [invalidateNavigationAfterChange] },
  label: 'Nagłówek',
  versions: { drafts: true, max: 50 },
}
