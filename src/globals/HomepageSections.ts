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
  fields: [createContentLayoutField('Treści')],
  hooks: { afterChange: [invalidateSiteSettingsAfterChange] },
  label: 'Treści',
}
