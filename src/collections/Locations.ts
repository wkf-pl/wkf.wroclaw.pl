import { createBooleanSwitchAdmin } from '@/components/admin/boolean-switch-config'
import { beforeLocationChange, protectLocationDeletion } from '@/modules/locations/hooks'
import type { CollectionConfig, FieldHook } from 'payload'

import {
  invalidateAllPublicDataAfterChange,
  invalidateAllPublicDataAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import {
  removeContentListingAfterDelete,
  syncContentListingAfterChange,
} from '@/modules/content/content-listing-index'
import { publishedPublicAccess } from '@/modules/content/public-access'
import {
  createTrashDeleteAccess,
  createTrashReadAccess,
  createTrashUpdateAccess,
  markTrashMutation,
} from '@/modules/content/trash-access'
import { normalizeGoogleMapsEmbedField, validateGoogleMapsEmbed } from '@/modules/events/map-embed'
import { validatePostalCode, validateVenueWebsite } from '@/modules/events/validation'
import { createRolePermissionAccess } from '@/modules/membership/role-access'
import { combineAccessResults } from '@/modules/membership/permission-resolution'

const readLocations = createRolePermissionAccess({
  resource: 'locations',
  operation: 'read',
  publicAccess: publishedPublicAccess,
})

const trimText: FieldHook = ({ value }) => (typeof value === 'string' ? value.trim() : value)

export const Locations: CollectionConfig = {
  slug: 'locations',
  labels: { singular: 'Miejsce', plural: 'Miejsca' },
  trash: true,
  versions: { drafts: true, maxPerDoc: 50 },
  admin: {
    group: 'Klubowe',
    useAsTitle: 'venueName',
    listSearchableFields: ['venueName', 'streetAddress', 'city'],
    defaultColumns: ['venueName', 'streetAddress', 'city', 'isActive', '_status'],
  },
  access: {
    create: createRolePermissionAccess({ resource: 'locations', operation: 'create' }),
    read: createTrashReadAccess(async (arguments_) =>
      combineAccessResults(publishedPublicAccess, await readLocations(arguments_)),
    ),
    readVersions: createRolePermissionAccess({
      resource: 'locations',
      operation: 'read',
      versions: true,
    }),
    update: createTrashUpdateAccess(
      createRolePermissionAccess({ resource: 'locations', operation: 'update' }),
      createRolePermissionAccess({ resource: 'locations', operation: 'restore' }),
    ),
    delete: createTrashDeleteAccess(
      createRolePermissionAccess({ resource: 'locations', operation: 'delete' }),
      createRolePermissionAccess({ resource: 'locations', operation: 'permanentDelete' }),
    ),
  },
  fields: [
    {
      name: 'venueName',
      type: 'text',
      hooks: { beforeValidate: [trimText] },
      label: 'Nazwa',
      required: true,
    },
    {
      name: 'venueWebsite',
      type: 'text',
      label: 'Strona WWW',
      validate: validateVenueWebsite,
      hooks: { beforeValidate: [trimText] },
      admin: {
        components: { Field: '/components/admin/BlurValidatedTextField#BlurValidatedTextField' },
        custom: { validationKind: 'venueWebsite' },
      },
    },
    {
      name: 'streetAddress',
      type: 'text',
      hooks: { beforeValidate: [trimText] },
      label: 'Adres',
      required: true,
    },
    {
      name: 'postalCode',
      type: 'text',
      hooks: { beforeValidate: [trimText] },
      label: 'Kod pocztowy',
      required: true,
      validate: (value: unknown, { siblingData }: { siblingData: { country?: unknown } }) => {
        if (typeof value !== 'string' || !value.trim()) return 'Podaj kod pocztowy.'
        return typeof siblingData.country === 'string' &&
          siblingData.country.trim().toLowerCase() === 'polska'
          ? validatePostalCode(value)
          : true
      },
    },
    {
      name: 'city',
      type: 'text',
      hooks: { beforeValidate: [trimText] },
      label: 'Miejscowość',
      required: true,
      defaultValue: 'Wrocław',
    },
    {
      name: 'country',
      type: 'text',
      hooks: { beforeValidate: [trimText] },
      label: 'Kraj',
      required: true,
      defaultValue: 'Polska',
    },
    {
      name: 'mapEmbedURL',
      type: 'text',
      label: 'Mapa Google',
      required: true,
      admin: {
        components: { Field: '/components/admin/GoogleMapEmbedField#GoogleMapEmbedField' },
        description:
          'W Mapach Google wybierz „Udostępnij → Umieść mapę” i wklej skopiowany kod HTML.',
      },
      hooks: { beforeValidate: [normalizeGoogleMapsEmbedField] },
      validate: (value: unknown) => (value ? validateGoogleMapsEmbed(value) : 'Podaj mapę Google.'),
    },
    {
      name: 'isActive',
      admin: createBooleanSwitchAdmin(),
      type: 'checkbox',
      label: 'Aktywne miejsce',
      defaultValue: true,
      index: true,
    },
  ],
  hooks: {
    beforeChange: [beforeLocationChange],
    beforeDelete: [protectLocationDeletion],
    beforeOperation: [
      markTrashMutation,
      ({ args, operation, req }) => {
        if (operation === 'update' || operation === 'restoreVersion') {
          req.context.savingLocationDraft = Boolean(args.draft)
        }
      },
    ],
    afterChange: [syncContentListingAfterChange, invalidateAllPublicDataAfterChange],
    afterDelete: [removeContentListingAfterDelete, invalidateAllPublicDataAfterDelete],
  },
}
