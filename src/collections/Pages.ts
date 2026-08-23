import type { Access, AccessResult, CollectionConfig, Field, Where } from 'payload'

import {
  createEditorialFields,
  getEditorialField,
  withFieldWidth,
} from '@/modules/content/editorial-fields'
import {
  removeContentListingAfterDelete,
  syncContentListingAfterChange,
} from '@/modules/content/content-listing-index'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { createContentLayoutField } from '@/modules/content/layout-field'
import { populateListingExcerptOnPublish } from '@/modules/content/listing-excerpt'
import { validatePageStructure } from '@/modules/content/page-validation'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'
import { publishedPublicAccess } from '@/modules/content/public-access'
import {
  combineAccessWithConstraint,
  createRolePermissionAccess,
} from '@/modules/membership/role-permissions'

const createPages = createRolePermissionAccess({ operation: 'create', resource: 'pages' })
const deletePagesByRole = createRolePermissionAccess({ operation: 'delete', resource: 'pages' })
const readPages = createRolePermissionAccess({
  operation: 'read',
  publicAccess: publishedPublicAccess,
  resource: 'pages',
})
const updatePages = createRolePermissionAccess({ operation: 'update', resource: 'pages' })

function combineWithNonSystemPageConstraint(result: AccessResult): AccessResult {
  const nonSystemPage: Where = {
    or: [{ systemKey: { exists: false } }, { systemKey: { not_in: ['blog', 'events'] } }],
  }

  return combineAccessWithConstraint(result, nonSystemPage)
}

const deletePages: Access = async (arguments_) =>
  combineWithNonSystemPageConstraint(await deletePagesByRole(arguments_))

const editorialFields = createEditorialFields({
  includeContent: false,
  includeTaxonomy: true,
  reserveApplicationSlugs: true,
})

const pageParentField: Field = {
  name: 'parent',
  type: 'relationship',
  admin: {
    placeholder: '<brak>',
  },
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
    components: {
      edit: {
        beforeDocumentControls: ['/components/admin/PageCreateLabel#PageCreateLabel'],
      },
    },
    defaultColumns: ['title', 'slug', '_status', 'publishedAt', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['title', 'slug'],
    useAsTitle: 'title',
  },
  fields: [
    {
      type: 'row',
      fields: [
        withFieldWidth(getEditorialField(editorialFields, 'title'), '50%'),
        withFieldWidth(pageParentField, '50%'),
      ],
    },
    {
      type: 'row',
      fields: [
        withFieldWidth(getEditorialField(editorialFields, 'categories'), '50%'),
        withFieldWidth(getEditorialField(editorialFields, 'tags'), '50%'),
      ],
    },
    getEditorialField(editorialFields, 'heroImage'),
    {
      name: 'listingExcerpt',
      type: 'textarea',
      admin: {
        description:
          'Opcjonalny opis karty. Bez niego użyty zostanie początek pierwszego bloku treści.',
      },
      label: 'Streszczenie',
      maxLength: 500,
    },
    createContentLayoutField('Treści'),
    getEditorialField(editorialFields, 'seo'),
    getEditorialField(editorialFields, 'slug'),
    getEditorialField(editorialFields, 'author'),
    getEditorialField(editorialFields, 'publishedAt'),
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
    afterChange: [syncContentListingAfterChange],
    afterDelete: [removeContentListingAfterDelete],
    beforeChange: [populateListingExcerptOnPublish, setPublishedAt],
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
