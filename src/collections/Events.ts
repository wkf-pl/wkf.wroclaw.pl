import {
  lockContentHierarchyForWrite,
  createContentParentField,
  clearCyclicEventParent,
  eventCycleParentPathField,
} from '@/modules/content/content-parent'
import { createContentOwnersField } from '@/modules/content/content-owners-field'
import {
  confirmLegacyLocation,
  createLegacyLocationFields,
} from '@/modules/locations/legacy-fields'
import type { CollectionConfig } from 'payload'

import { validateVenueWebsite } from '@/modules/events/validation'

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
import {
  createExternalLinksField,
  createOrganizerField,
  createPartnersField,
  createEventLocationRow,
  createScheduleFields,
} from '@/modules/events/fields'
import { applyEventCycleDefaults, updateEventCalendarMetadata } from '@/modules/events/hooks'
import { createNextEventEndpoint } from '@/modules/events/create-next-event'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'
import { publishedPublicAccess } from '@/modules/content/public-access'
import {
  createTrashDeleteAccess,
  createTrashReadAccess,
  createTrashUpdateAccess,
  markTrashMutation,
} from '@/modules/content/trash-access'
import { createRolePermissionAccess } from '@/modules/membership/role-access'

const createEvents = createRolePermissionAccess({ operation: 'create', resource: 'events' })
const deleteEvents = createTrashDeleteAccess(
  createRolePermissionAccess({ operation: 'delete', resource: 'events' }),
  createRolePermissionAccess({ operation: 'permanentDelete', resource: 'events' }),
)
const readEvents = createTrashReadAccess(
  createRolePermissionAccess({
    operation: 'read',
    publicAccess: publishedPublicAccess,
    resource: 'events',
  }),
)
const updateEvents = createTrashUpdateAccess(
  createRolePermissionAccess({ operation: 'update', resource: 'events' }),
  createRolePermissionAccess({ operation: 'restore', resource: 'events' }),
)

const editorialFields = createEditorialFields({ includeContent: false, includeTaxonomy: true })

export const Events: CollectionConfig = {
  slug: 'events',
  trash: true,
  access: {
    create: createEvents,
    delete: deleteEvents,
    readVersions: createRolePermissionAccess({
      operation: 'read',
      resource: 'events',
      versions: true,
    }),
    read: readEvents,
    update: updateEvents,
  },
  admin: {
    components: {
      edit: {
        beforeDocumentControls: [
          '/components/admin/CollectionLabels#EventCreateLabel',
          '/components/admin/EventCycleDefaultsApplier#EventCycleDefaultsApplier',
          '/components/admin/EventActions#EventActions',
        ],
      },
    },
    defaultColumns: ['title', 'cycle', 'eventType', 'topics', 'tags', 'startAt', '_status'],
    group: 'Treści',
    listSearchableFields: ['title', 'cycle', 'slug', 'eventType', 'author', 'topics', 'location'],
    useAsTitle: 'title',
    pagination: {
      limits: [10, 25, 50],
    },
  },
  defaultSort: 'startAt',
  endpoints: [createNextEventEndpoint],
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Treść',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'cycle',
                  type: 'relationship',
                  admin: { placeholder: '<brak>', width: '33%' },
                  label: 'Cykl wydarzeń',
                  relationTo: 'event-cycles',
                },
                withFieldWidth(getEditorialField(editorialFields, 'title'), '34%'),
                {
                  name: 'eventType',
                  type: 'relationship',
                  admin: { width: '33%' },
                  label: 'Rodzaj',
                  relationTo: 'event-types',
                  required: true,
                },
              ],
            },
            getEditorialField(editorialFields, 'heroImage'),
            {
              name: 'excerpt',
              type: 'richText',
              label: 'Streszczenie',
              required: true,
            },
            createContentLayoutField('Treści'),
            { type: 'collapsible', label: 'Termin', fields: createScheduleFields() },
            createEventLocationRow(),
            {
              name: 'onlineEventURL',
              type: 'text',
              label: 'Link do wydarzenia online',
              validate: validateVenueWebsite,
            },
            ...createLegacyLocationFields(),
            createOrganizerField(),
            createPartnersField(),
            createExternalLinksField(),
          ],
        },
        { label: 'SEO', fields: [getEditorialField(editorialFields, 'seo')] },
      ],
    },
    getEditorialField(editorialFields, 'slug'),
    createContentParentField(true),
    eventCycleParentPathField,
    getEditorialField(editorialFields, 'topics'),
    getEditorialField(editorialFields, 'tags'),
    getEditorialField(editorialFields, 'author'),
    createContentOwnersField(),
    {
      name: 'defaultsAppliedCycle',
      type: 'relationship',
      admin: { hidden: true, readOnly: true },
      relationTo: 'event-cycles',
    },
    {
      name: 'calendarUID',
      type: 'text',
      admin: { hidden: true, readOnly: true },
      index: true,
      unique: true,
    },
    {
      name: 'calendarRevision',
      type: 'number',
      admin: { hidden: true, readOnly: true },
      defaultValue: 0,
      required: true,
    },
    { name: 'calendarFingerprint', type: 'text', admin: { hidden: true, readOnly: true } },
    getEditorialField(editorialFields, 'publishedAt'),
  ],
  hooks: {
    afterChange: [syncContentListingAfterChange],
    afterDelete: [removeContentListingAfterDelete],
    beforeChange: [confirmLegacyLocation, updateEventCalendarMetadata, setPublishedAt],
    beforeOperation: [markTrashMutation],
    beforeValidate: [
      lockContentHierarchyForWrite,
      clearCyclicEventParent,
      applyEventCycleDefaults,
      validateMediaBlocks,
    ],
  },
  labels: { plural: 'Wydarzenia', singular: 'Wydarzenie' },
  versions: { drafts: true, maxPerDoc: 50 },
}
