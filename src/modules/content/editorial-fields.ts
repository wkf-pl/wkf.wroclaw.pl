import type { Field } from 'payload'

import { populateSlug, validatePageSlug } from './slug'
import { createTaxonomyFields } from './taxonomy-fields'

type EditorialFieldsOptions = {
  includeContent?: boolean
  includeExcerpt?: boolean
  includeTaxonomy?: boolean
  reserveApplicationSlugs?: boolean
}

export function createEditorialFields({
  includeContent = true,
  includeExcerpt = false,
  includeTaxonomy = false,
  reserveApplicationSlugs = false,
}: EditorialFieldsOptions = {}): Field[] {
  const fields: Field[] = [
    {
      name: 'title',
      type: 'text',
      label: 'Tytuł',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Adres jest tworzony automatycznie z tytułu, ale można go zmienić.',
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [populateSlug],
      },
      index: true,
      label: 'Adres URL',
      required: true,
      unique: true,
      validate: reserveApplicationSlugs ? validatePageSlug : undefined,
    },
  ]

  if (includeExcerpt) {
    fields.push({
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Krótkie wprowadzenie wyświetlane na listach wpisów.',
      },
      label: 'Streszczenie',
      maxLength: 500,
      required: true,
    })
  }

  fields.push({
    name: 'heroImage',
    type: 'upload',
    label: 'Obraz główny',
    relationTo: 'media',
  })

  if (includeContent) {
    fields.push({
      name: 'content',
      type: 'richText',
      label: 'Treść',
      required: true,
    })
  }

  if (includeTaxonomy) {
    fields.push(...createTaxonomyFields())
  }

  fields.push(
    {
      name: 'author',
      type: 'relationship',
      defaultValue: ({ user }) => user?.id,
      label: 'Autor',
      relationTo: 'users',
      required: true,
      admin: {
        components: {
          Cell: '/components/admin/UserIdentity#UserRelationshipCell',
          Field: '/components/admin/UserIdentity#UserRelationshipField',
        },
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'd MMMM yyyy, HH:mm',
          pickerAppearance: 'dayAndTime',
          timeFormat: 'HH:mm',
        },
        description: 'Ustawiana automatycznie przy pierwszej publikacji.',
        position: 'sidebar',
      },
      index: true,
      label: 'Data publikacji',
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'title',
          type: 'text',
          admin: {
            description:
              'Opcjonalny tytuł wyniku wyszukiwania. Domyślnie używany jest tytuł treści.',
          },
          label: 'Tytuł SEO',
          maxLength: 70,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Opis SEO',
          maxLength: 170,
        },
        {
          name: 'image',
          type: 'upload',
          admin: {
            description: 'Opcjonalny obraz dla udostępnień. Domyślnie używany jest obraz główny.',
          },
          label: 'Obraz SEO',
          relationTo: 'media',
        },
      ],
    },
  )

  return fields
}
