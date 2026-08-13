import type { CollectionConfig } from 'payload'

import { populateSlugFromName } from '@/modules/content/slug'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'
import { createIconFields, createLinkFields } from '@/modules/navigation/fields'

const createClubSections = createRolePermissionAccess({
  operation: 'create',
  resource: 'club-sections',
})
const deleteClubSections = createRolePermissionAccess({
  operation: 'delete',
  resource: 'club-sections',
})
const readClubSections = createRolePermissionAccess({
  anonymousAccess: { _status: { equals: 'published' } },
  operation: 'read',
  resource: 'club-sections',
})
const updateClubSections = createRolePermissionAccess({
  operation: 'update',
  resource: 'club-sections',
})

export const ClubSections: CollectionConfig = {
  slug: 'club-sections',
  access: {
    create: createClubSections,
    delete: deleteClubSections,
    read: readClubSections,
    update: updateClubSections,
  },
  admin: {
    defaultColumns: ['name', 'displayOrder', '_status', 'updatedAt'],
    group: 'Treści',
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
              filterOptions: { mimeType: { contains: 'image/' } },
              label: 'Obraz tła',
              relationTo: 'media',
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
              fields: [...createLinkFields(), ...createIconFields({ required: true })],
              label: 'Elementy menu',
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
    beforeChange: [setPublishedAt],
  },
  labels: {
    plural: 'Sekcje klubowe',
    singular: 'Sekcja klubowa',
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}
