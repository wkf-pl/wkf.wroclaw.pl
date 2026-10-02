import type { GlobalConfig } from 'payload'

import { invalidateNavigationAfterChange } from '@/modules/cache/invalidate-public-data'
import { webRasterImageMimeTypes } from '@/modules/media/media-categories'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import { createPresentedLinkFields, validatePresentedLinkItems } from '@/modules/navigation/fields'

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
      fields: createPresentedLinkFields(),
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
}
