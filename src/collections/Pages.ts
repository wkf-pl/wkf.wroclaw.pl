import type { Access, AccessResult, CollectionConfig, Field, Where } from 'payload'

import { createEditorialFields } from '@/modules/content/editorial-fields'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { createContentLayoutField } from '@/modules/content/layout-field'
import { validatePageStructure } from '@/modules/content/page-validation'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const createPages = createRolePermissionAccess({ operation: 'create', resource: 'pages' })
const deletePagesByRole = createRolePermissionAccess({ operation: 'delete', resource: 'pages' })
const readPages = createRolePermissionAccess({
  operation: 'read',
  resource: 'pages',
})
const updatePages = createRolePermissionAccess({ operation: 'update', resource: 'pages' })

function combineWithNonSystemPageConstraint(result: AccessResult): AccessResult {
  const nonSystemPage: Where = {
    or: [{ systemKey: { exists: false } }, { systemKey: { not_equals: 'blog' } }],
  }

  if (result === false) {
    return false
  }

  return result === true ? nonSystemPage : { and: [result, nonSystemPage] }
}

const deletePages: Access = async (arguments_) =>
  combineWithNonSystemPageConstraint(await deletePagesByRole(arguments_))

const editorialFields = createEditorialFields({
  includeContent: false,
  includeTaxonomy: true,
  reserveApplicationSlugs: true,
})

function getEditorialField(name: string): Field {
  const field = editorialFields.find((candidate) => 'name' in candidate && candidate.name === name)

  if (!field) {
    throw new Error(`Missing editorial field: ${name}`)
  }

  return field
}

function setFieldWidth(field: Field): Field {
  return {
    ...field,
    admin: {
      ...('admin' in field && field.admin ? field.admin : {}),
      width: '50%',
    },
  } as Field
}

const pageParentField: Field = {
  name: 'parent',
  type: 'relationship',
  filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
  label: 'Strona nadrzędna',
  relationTo: 'pages',
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: createPages,
    delete: deletePages,
    read: readPages,
    update: updatePages,
  },
  admin: {
    defaultColumns: ['title', 'slug', '_status', 'publishedAt', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['title', 'slug'],
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'row',
      fields: [setFieldWidth(getEditorialField('title')), setFieldWidth(pageParentField)],
    },
    {
      type: 'row',
      fields: [
        setFieldWidth(getEditorialField('categories')),
        setFieldWidth(getEditorialField('tags')),
      ],
    },
    getEditorialField('heroImage'),
    {
      name: 'listingExcerpt',
      type: 'textarea',
      admin: {
        description:
          'Opcjonalny opis karty. Bez niego użyty zostanie początek pierwszego bloku treści.',
      },
      label: 'Streszczenie listingu',
      maxLength: 500,
    },
    createContentLayoutField('Treści'),
    getEditorialField('seo'),
    getEditorialField('slug'),
    getEditorialField('author'),
    getEditorialField('publishedAt'),
    {
      name: 'systemKey',
      type: 'text',
      admin: {
        hidden: true,
      },
      index: true,
      unique: true,
    },
  ],
  hooks: {
    beforeChange: [setPublishedAt],
    beforeValidate: [validateMediaBlocks, validatePageStructure],
  },
  labels: {
    plural: 'Strony',
    singular: 'Strona',
  },
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
}
