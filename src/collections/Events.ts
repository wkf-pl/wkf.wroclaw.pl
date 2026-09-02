import type { CollectionConfig } from 'payload'

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
  createLocationFields,
  createOrganizerField,
  createPartnersField,
  createParticipationFields,
  createScheduleFields,
} from '@/modules/events/fields'
import { applyEventCycleDefaults, updateEventCalendarMetadata } from '@/modules/events/hooks'
import { createNextEventEndpoint } from '@/modules/events/create-next-event'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'
import { publishedPublicAccess } from '@/modules/content/public-access'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const createEvents = createRolePermissionAccess({ operation: 'create', resource: 'events' })
const deleteEvents = createRolePermissionAccess({ operation: 'delete', resource: 'events' })
const readEvents = createRolePermissionAccess({
  operation: 'read',
  publicAccess: publishedPublicAccess,
  resource: 'events',
})
const updateEvents = createRolePermissionAccess({ operation: 'update', resource: 'events' })

const editorialFields = createEditorialFields({ includeContent: false, includeTaxonomy: true })

export const Events: CollectionConfig = {
  slug: 'events',
  access: { create: createEvents, delete: deleteEvents, read: readEvents, update: updateEvents },
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
    defaultColumns: ['title', 'cycle', 'category', 'tags', 'startAt', 'eventStatus', '_status'],
    group: 'Treści',
    listSearchableFields: ['title', 'cycle', 'slug', 'excerpt'],
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
                  admin: { placeholder: '<brak>', width: '50%' },
                  label: 'Cykl wydarzeń',
                  relationTo: 'event-cycles',
                },
                withFieldWidth(getEditorialField(editorialFields, 'title'), '50%'),
              ],
            },
            getEditorialField(editorialFields, 'heroImage'),
            { name: 'tagline', type: 'text', label: 'Hasło reklamowe', maxLength: 180 },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Streszczenie',
              maxLength: 500,
              required: true,
            },
            createContentLayoutField('Treści'),
            { type: 'collapsible', label: 'Termin', fields: createScheduleFields() },
            { name: 'location', type: 'group', label: 'Miejsce', fields: createLocationFields() },
            ...createParticipationFields(),
            createOrganizerField(),
            createPartnersField(),
            createExternalLinksField(),
          ],
        },
        { label: 'SEO', fields: [getEditorialField(editorialFields, 'seo')] },
      ],
    },
    getEditorialField(editorialFields, 'slug'),
    getEditorialField(editorialFields, 'category'),
    getEditorialField(editorialFields, 'tags'),
    getEditorialField(editorialFields, 'author'),
    {
      name: 'defaultsAppliedCycle',
      type: 'relationship',
      admin: { hidden: true, readOnly: true },
      relationTo: 'event-cycles',
    },
    { name: 'previousStartAt', type: 'date', admin: { hidden: true, readOnly: true } },
    { name: 'publishedStartAt', type: 'date', admin: { hidden: true, readOnly: true } },
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
    beforeChange: [updateEventCalendarMetadata, setPublishedAt],
    beforeValidate: [applyEventCycleDefaults, validateMediaBlocks],
  },
  labels: { plural: 'Wydarzenia', singular: 'Wydarzenie' },
  versions: { drafts: true, maxPerDoc: 50 },
}
