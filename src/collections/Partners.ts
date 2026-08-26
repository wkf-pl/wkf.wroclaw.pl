import type { CollectionConfig } from 'payload'

import {
  invalidatePartnersAfterChange,
  invalidatePartnersAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { createEditorialFields, getEditorialField } from '@/modules/content/editorial-fields'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { createContentLayoutField } from '@/modules/content/layout-field'
import { populateSlugFromName } from '@/modules/content/slug'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'
import { publishedPublicAccess } from '@/modules/content/public-access'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const createPartners = createRolePermissionAccess({ operation: 'create', resource: 'partners' })
const deletePartners = createRolePermissionAccess({ operation: 'delete', resource: 'partners' })
const readPartners = createRolePermissionAccess({
  operation: 'read',
  publicAccess: publishedPublicAccess,
  resource: 'partners',
})
const updatePartners = createRolePermissionAccess({ operation: 'update', resource: 'partners' })

const editorialFields = createEditorialFields({ includeContent: false })

export const Partners: CollectionConfig = {
  slug: 'partners',
  access: {
    create: createPartners,
    delete: deletePartners,
    read: readPartners,
    update: updatePartners,
  },
  admin: {
    components: {
      edit: { beforeDocumentControls: ['/components/admin/CollectionLabels#PartnerCreateLabel'] },
    },
    defaultColumns: ['name', 'slug', '_status', 'publishedAt', 'updatedAt'],
    group: 'Klubowe',
    listSearchableFields: ['name', 'slug', 'excerpt'],
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Treść',
          fields: [
            { name: 'name', type: 'text', label: 'Nazwa', required: true },
            getEditorialField(editorialFields, 'heroImage'),
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Streszczenie',
              maxLength: 500,
              required: true,
            },
            {
              name: 'website',
              type: 'text',
              label: 'Strona WWW',
              validate: (value: unknown) => {
                if (!value) return true
                try {
                  return typeof value === 'string' && new URL(value).protocol === 'https:'
                    ? true
                    : 'Adres musi używać protokołu HTTPS.'
                } catch {
                  return 'Podaj poprawny adres HTTPS.'
                }
              },
            },
            createContentLayoutField('Treści'),
          ],
        },
        { label: 'SEO', fields: [getEditorialField(editorialFields, 'seo')] },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Adres jest tworzony automatycznie z nazwy, ale można go zmienić.',
        position: 'sidebar',
      },
      hooks: { beforeValidate: [populateSlugFromName] },
      index: true,
      label: 'Slug',
      required: true,
      unique: true,
    },
    getEditorialField(editorialFields, 'author'),
    getEditorialField(editorialFields, 'publishedAt'),
  ],
  hooks: {
    afterChange: [invalidatePartnersAfterChange],
    afterDelete: [invalidatePartnersAfterDelete],
    beforeChange: [setPublishedAt],
    beforeValidate: [validateMediaBlocks],
  },
  labels: { plural: 'Partnerzy', singular: 'Partnera' },
  versions: { drafts: true, maxPerDoc: 50 },
}
