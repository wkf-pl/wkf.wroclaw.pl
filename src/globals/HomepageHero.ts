import type { GlobalConfig } from 'payload'

import { invalidateNavigationAfterChange } from '@/modules/cache/invalidate-public-data'
import { createGlobalDraftPreviewURL } from '@/modules/content/draft-preview'
import { preventAnonymousDraftRead } from '@/modules/content/global-drafts'
import { defaultHomepageHeroTitle, homepageTitleEditor } from '@/modules/content/homepage-rich-text'
import { webRasterImageMimeTypes } from '@/modules/media/media-categories'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import { createPresentedLinkFields, validatePresentedLinkItems } from '@/modules/navigation/fields'

const readHomepageHero = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'navigation',
})
const updateHomepageHero = createRolePermissionAccess({
  operation: 'update',
  resource: 'navigation',
})
const readHomepageHeroVersions = createRolePermissionAccess({
  operation: 'read',
  resource: 'navigation',
})

export const HomepageHero: GlobalConfig = {
  slug: 'homepage-hero',
  access: {
    read: preventAnonymousDraftRead(readHomepageHero),
    readVersions: readHomepageHeroVersions,
    update: updateHomepageHero,
  },
  admin: {
    components: {
      elements: {
        PreviewButton: '/components/admin/DraftPreviewButton#DraftPreviewButton',
      },
    },
    group: 'Strona główna',
    preview: () => createGlobalDraftPreviewURL('homepage-hero'),
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      filterOptions: { mimeType: { in: [...webRasterImageMimeTypes] } },
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
      fields: createPresentedLinkFields(),
      label: 'Elementy Hero',
      labels: {
        plural: 'Pozycje menu w sekcji Hero',
        singular: 'pozycję menu w sekcji Hero',
      },
      validate: validatePresentedLinkItems,
    },
  ],
  hooks: { afterChange: [invalidateNavigationAfterChange] },
  label: 'Hero',
  versions: { drafts: true, max: 50 },
}
