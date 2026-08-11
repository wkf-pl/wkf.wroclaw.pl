import type { CollectionConfig } from 'payload'

import { editorOrAdmin } from '@/access/editorOrAdmin'
import { populateSlugFromName } from '@/modules/content/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: editorOrAdmin,
    delete: editorOrAdmin,
    read: () => true,
    update: editorOrAdmin,
  },
  admin: {
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['name', 'slug'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nazwa',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Adres jest tworzony automatycznie z nazwy.',
      },
      hooks: {
        beforeValidate: [populateSlugFromName],
      },
      index: true,
      label: 'Adres URL',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Opis',
    },
  ],
  labels: {
    plural: 'Kategorie',
    singular: 'Kategoria',
  },
}
