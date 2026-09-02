import type { GlobalConfig } from 'payload'

import { invalidateNavigationAfterChange } from '@/modules/cache/invalidate-public-data'
import { defaultHomepageHeroTitle, homepageTitleEditor } from '@/modules/content/homepage-rich-text'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'
import { createLinkFields } from '@/modules/navigation/fields'

const readHomepageHero = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'navigation',
})
const updateHomepageHero = createRolePermissionAccess({
  operation: 'update',
  resource: 'navigation',
})

export const HomepageHero: GlobalConfig = {
  slug: 'homepage-hero',
  access: {
    read: readHomepageHero,
    update: updateHomepageHero,
  },
  admin: {
    group: 'Strona główna',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      filterOptions: { mimeType: { contains: 'image/' } },
      label: 'Obrazek Hero',
      relationTo: 'media',
    },
    {
      name: 'title',
      type: 'richText',
      defaultValue: defaultHomepageHeroTitle,
      editor: homepageTitleEditor,
      label: 'Tytuł',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Treść',
    },
    {
      name: 'items',
      type: 'array',
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#NavigationItemRowLabel',
        },
      },
      fields: createLinkFields(),
      label: 'Elementy Hero',
      labels: {
        plural: 'Pozycje menu w sekcji Hero',
        singular: 'pozycję menu w sekcji Hero',
      },
    },
  ],
  hooks: { afterChange: [invalidateNavigationAfterChange] },
  label: 'Hero',
}
