import type { CollectionConfig } from 'payload'

import {
  invalidateHomepageAfterChange,
  invalidateHomepageAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { populateSlugFromName } from '@/modules/content/slug'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { publishedPublicAccess } from '@/modules/content/public-access'
import {
  createTrashDeleteAccess,
  createTrashReadAccess,
  createTrashUpdateAccess,
  markTrashMutation,
} from '@/modules/content/trash-access'
import { webRasterImageMimeTypes } from '@/modules/media/media-categories'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import { createPresentedLinkFields, validatePresentedLinkItems } from '@/modules/navigation/fields'

const createClubSections = createRolePermissionAccess({
  operation: 'create',
  resource: 'club-sections',
})
const deleteClubSections = createTrashDeleteAccess(
  createRolePermissionAccess({
    operation: 'delete',
    resource: 'club-sections',
  }),
  createRolePermissionAccess({
    operation: 'permanentDelete',
    resource: 'club-sections',
  }),
)
const readClubSections = createTrashReadAccess(
  createRolePermissionAccess({
    operation: 'read',
    publicAccess: publishedPublicAccess,
    resource: 'club-sections',
  }),
)
const updateClubSections = createTrashUpdateAccess(
  createRolePermissionAccess({
    operation: 'update',
    resource: 'club-sections',
  }),
  createRolePermissionAccess({
    operation: 'restore',
    resource: 'club-sections',
  }),
)

export const ClubSections: CollectionConfig = {
  slug: 'club-sections',
  trash: true,
  access: {
    create: createClubSections,
    delete: deleteClubSections,
    read: readClubSections,
    update: updateClubSections,
  },
  admin: {
    defaultColumns: ['name', 'displayOrder', '_status', 'updatedAt'],
    group: 'Klubowe',
    hidden: true,
    listSearchableFields: ['name', 'slug'],
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Karta',
          fields: [
            {
              name: 'name',
              type: 'text',
              label: 'Nazwa',
              required: true,
            },
            {
              name: 'backgroundImage',
              type: 'upload',
              filterOptions: { mimeType: { in: [...webRasterImageMimeTypes] } },
              label: 'Obraz tła',
              relationTo: 'media',
            },
            {
              name: 'destinationPage',
              type: 'relationship',
              filterOptions: { _status: { equals: 'published' } },
              label: 'Strona docelowa tytułu',
              relationTo: 'pages',
            },
          ],
        },
        {
          label: 'Menu karty',
          fields: [
            {
              name: 'menuItems',
              type: 'array',
              admin: {
                components: {
                  RowLabel: '/components/admin/DynamicRowLabel#FooterColumnItemRowLabel',
                },
              },
              fields: createPresentedLinkFields(),
              label: 'Elementy menu',
              validate: validatePresentedLinkItems,
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Identyfikator techniczny tworzony automatycznie z nazwy.',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [populateSlugFromName],
      },
      index: true,
      label: 'Slug',
      required: true,
      unique: true,
    },
    {
      name: 'displayOrder',
      type: 'number',
      admin: {
        description: 'Niższa liczba oznacza wcześniejszą pozycję.',
        position: 'sidebar',
      },
      defaultValue: 0,
      label: 'Kolejność',
      required: true,
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      label: 'Data publikacji',
    },
  ],
  hooks: {
    afterChange: [invalidateHomepageAfterChange],
    afterDelete: [invalidateHomepageAfterDelete],
    beforeChange: [setPublishedAt],
    beforeOperation: [markTrashMutation],
  },
  labels: {
    plural: 'Sekcje',
    singular: 'Sekcja',
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}
