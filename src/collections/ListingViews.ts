import type { CollectionConfig } from 'payload'

import { invalidatePublicCacheTags } from '@/modules/cache/invalidate-public-data'
import { publicCacheTags } from '@/modules/cache/public-data-cache'
import { listingPresets, resolveListingView } from '@/modules/content/listing-view'
import {
  listingViewPreviewEndpoint,
  listingViewUsageEndpoint,
} from '@/modules/content/listing-view-endpoints'
import { isAdministrator } from '@/modules/membership/role-access'

export const ListingViews: CollectionConfig = {
  slug: 'listing-views',
  labels: { singular: 'Szablon widoku listingu', plural: 'Szablony widoków listingu' },
  admin: {
    group: 'Administracja',
    useAsTitle: 'name',
    defaultColumns: ['name', '_status', 'retired'],
  },
  access: {
    create: ({ req }) => isAdministrator(req),
    update: ({ req }) => isAdministrator(req),
    delete: () => false,
    read: async ({ req }) =>
      (await isAdministrator(req)) || (req.user ? { _status: { equals: 'published' } } : false),
    readVersions: ({ req }) => isAdministrator(req),
  },
  endpoints: [listingViewPreviewEndpoint, listingViewUsageEndpoint],
  versions: { drafts: true },
  hooks: {
    afterChange: [
      ({ doc }) => {
        if (doc._status === 'published') invalidatePublicCacheTags([publicCacheTags.listingViews])
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nazwa', required: true, maxLength: 160 },
    {
      name: 'settings',
      type: 'json',
      label: 'Wygląd',
      required: true,
      defaultValue: listingPresets.upcoming.view,
      admin: {
        components: { Field: '/components/admin/ListingViewField#ListingViewTemplateField' },
      },
      hooks: {
        beforeValidate: [({ value }) => resolveListingView({ overrides: value }, 'upcoming').view],
      },
    },
    {
      name: 'retired',
      type: 'checkbox',
      label: 'Wycofaj z wyboru dla nowych bloków',
      defaultValue: false,
    },
    {
      name: 'usage',
      type: 'ui',
      admin: { components: { Field: '/components/admin/ListingViewUsage#ListingViewUsage' } },
    },
  ],
}
