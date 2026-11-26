import { createDraftPreviewURL } from '@/modules/content/draft-preview'
import {
  lockContentHierarchyForWrite,
  createContentParentField,
  preventDeletingContentParent,
} from '@/modules/content/content-parent'
import { createContentOwnersField } from '@/modules/content/content-owners-field'
import {
  confirmLegacyLocation,
  createLegacyLocationFields,
} from '@/modules/locations/legacy-fields'
import { randomUUID } from 'node:crypto'

import { type CollectionConfig, type Field } from 'payload'

import { createEditorialFields, getEditorialField } from '@/modules/content/editorial-fields'
import {
  removeContentListingAfterDelete,
  syncContentListingAfterChange,
} from '@/modules/content/content-listing-index'
import { setPublishedAt } from '@/modules/content/hooks/set-published-at'
import { createContentLayoutField } from '@/modules/content/layout-field'
import { populateSlug } from '@/modules/content/slug'
import { createTaxonomyFields } from '@/modules/content/taxonomy-fields'
import {
  createExternalLinksField,
  createOrganizerField,
  createPartnersField,
  createEventLocationRow,
  validateClockTime,
  validateDefaultEndTime,
} from '@/modules/events/fields'
import { copyEventCycleContentToDefaults } from '@/modules/events/hooks'
import { createEventFromCycleEndpoint } from '@/modules/events/create-event-from-cycle'
import {
  recurrenceTypeOptions,
  recurrenceWeekdayOptions,
} from '@/modules/events/event-cycle-schedule'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'
import { publishedPublicAccess } from '@/modules/content/public-access'
import {
  createTrashDeleteAccess,
  createTrashReadAccess,
  createTrashUpdateAccess,
  markTrashMutation,
} from '@/modules/content/trash-access'
import { createRolePermissionAccess } from '@/modules/membership/role-access'

const createCycles = createRolePermissionAccess({ operation: 'create', resource: 'event-cycles' })
const deleteCycles = createTrashDeleteAccess(
  createRolePermissionAccess({ operation: 'delete', resource: 'event-cycles' }),
  createRolePermissionAccess({ operation: 'permanentDelete', resource: 'event-cycles' }),
)
const readCycles = createTrashReadAccess(
  createRolePermissionAccess({
    operation: 'read',
    publicAccess: publishedPublicAccess,
    resource: 'event-cycles',
  }),
)
const updateCycles = createTrashUpdateAccess(
  createRolePermissionAccess({ operation: 'update', resource: 'event-cycles' }),
  createRolePermissionAccess({ operation: 'restore', resource: 'event-cycles' }),
)

const editorialFields = createEditorialFields({ includeContent: false, includeTaxonomy: true })

const eventCycleSlugField: Field = {
  name: 'slug',
  type: 'text',
  admin: {
    components: { Field: '/components/admin/AutoSlugField#AutoSlugField' },
    description: 'Adres jest tworzony automatycznie z tytułu, ale można go zmienić.',
    position: 'sidebar',
  },
  hooks: { beforeValidate: [populateSlug] },
  index: true,
  label: 'Slug',
  required: true,
  unique: true,
}

export const EventCycles: CollectionConfig = {
  slug: 'event-cycles',
  trash: true,
  access: {
    create: createCycles,
    delete: deleteCycles,
    readVersions: createRolePermissionAccess({
      operation: 'read',
      resource: 'event-cycles',
      versions: true,
    }),
    read: readCycles,
    update: updateCycles,
  },
  admin: {
    custom: { wkfPreviewAutosaveOnly: true },
    components: {
      edit: {
        beforeDocumentControls: [
          '/components/admin/CollectionLabels#EventCycleCreateLabel',
          '/components/admin/EventCycleDefaultsMirror#EventCycleDefaultsMirror',
          '/components/admin/EventCycleActions#EventCycleActions',
        ],
        PreviewButton: '/components/admin/DraftPreviewButton#DraftPreviewButton',
      },
    },
    defaultColumns: ['title', 'slug', 'topics', 'tags', '_status', 'publishedAt'],
    group: 'Treści',
    listSearchableFields: ['title', 'slug', 'topics'],
    preview: (document) => createDraftPreviewURL('event-cycles', document),
    useAsTitle: 'title',
    pagination: {
      limits: [10, 25, 50],
    },
  },
  endpoints: [createEventFromCycleEndpoint],
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Opis cyklu',
          fields: [
            getEditorialField(editorialFields, 'title'),
            getEditorialField(editorialFields, 'heroImage'),
            {
              name: 'excerpt',
              type: 'richText',
              label: 'Streszczenie',
              required: true,
            },
            createContentLayoutField('Treści'),
          ],
        },
        { label: 'SEO', fields: [getEditorialField(editorialFields, 'seo')] },
        {
          label: 'Domyślne dane Wydarzenia',
          fields: [
            {
              name: 'eventDefaults',
              type: 'group',
              label: false,
              fields: [
                createContentOwnersField({ eventDefaults: true }),
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      admin: { width: '67%' },
                      label: 'Tytuł',
                      maxLength: 180,
                    },
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
                { name: 'heroImage', type: 'upload', label: 'Obraz główny', relationTo: 'media' },
                { name: 'excerpt', type: 'richText', label: 'Streszczenie' },
                createContentLayoutField('Treści'),
                {
                  type: 'row',
                  fields: createTaxonomyFields({ position: 'main', width: '50%' }),
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'recurrenceType',
                      type: 'select',
                      admin: { isClearable: false, width: '50%' },
                      defaultValue: 'weekly',
                      label: 'Interwał',
                      options: [...recurrenceTypeOptions],
                    },
                    {
                      name: 'weekInterval',
                      type: 'number',
                      admin: {
                        condition: (_data, siblingData) => siblingData.recurrenceType === 'weekly',
                        width: '25%',
                      },
                      defaultValue: 2,
                      label: 'Co ile tygodni',
                      max: 4,
                      min: 1,
                    },
                    {
                      name: 'monthDay',
                      type: 'number',
                      admin: {
                        condition: (_data, siblingData) =>
                          siblingData.recurrenceType === 'monthlyDate',
                        width: '25%',
                      },
                      defaultValue: 1,
                      label: 'Dzień miesiąca',
                      max: 31,
                      min: 1,
                    },
                    {
                      name: 'weekOfMonth',
                      type: 'number',
                      admin: {
                        condition: (_data, siblingData) =>
                          siblingData.recurrenceType === 'monthlyWeekday',
                        width: '25%',
                      },
                      defaultValue: 1,
                      label: 'Tydzień miesiąca',
                      max: 4,
                      min: 1,
                    },
                    {
                      name: 'recurrenceWeekday',
                      type: 'select',
                      admin: {
                        condition: (_data, siblingData) =>
                          siblingData.recurrenceType === 'weekly' ||
                          siblingData.recurrenceType === 'monthlyWeekday',
                        isClearable: false,
                        width: '25%',
                      },
                      defaultValue: 'tuesday',
                      label: 'Dzień tygodnia',
                      options: [...recurrenceWeekdayOptions],
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'defaultDayCount',
                      type: 'number',
                      admin: { width: '33.333%' },
                      defaultValue: 1,
                      label: 'Ilość dni',
                      min: 1,
                    },
                    {
                      name: 'defaultStartTime',
                      type: 'text',
                      admin: {
                        components: {
                          Field: '/components/admin/TimeTextField#TimeTextField',
                        },
                        width: '33.333%',
                      },
                      label: 'Godzina rozpoczęcia',
                      validate: validateClockTime,
                    },
                    {
                      name: 'defaultEndTime',
                      type: 'text',
                      admin: {
                        components: {
                          Field: '/components/admin/TimeTextField#TimeTextField',
                        },
                        width: '33.333%',
                      },
                      label: 'Godzina zakończenia',
                      validate: validateDefaultEndTime,
                    },
                  ],
                },
                createEventLocationRow(),
                ...createLegacyLocationFields(),
                createOrganizerField(),
                createPartnersField(),
                createExternalLinksField(),
              ],
            },
          ],
        },
      ],
    },
    eventCycleSlugField,
    createContentParentField(),
    getEditorialField(editorialFields, 'topics'),
    getEditorialField(editorialFields, 'tags'),
    getEditorialField(editorialFields, 'author'),
    createContentOwnersField(),
    {
      name: 'calendarFeedKey',
      type: 'text',
      admin: { hidden: true, readOnly: true },
      index: true,
      unique: true,
    },
    getEditorialField(editorialFields, 'publishedAt'),
  ],
  hooks: {
    afterChange: [syncContentListingAfterChange],
    afterDelete: [removeContentListingAfterDelete],
    beforeChange: [
      confirmLegacyLocation,
      ({ data }) => {
        data.calendarFeedKey ||= randomUUID()
        return data
      },
      setPublishedAt,
    ],
    beforeOperation: [markTrashMutation],
    beforeDelete: [preventDeletingContentParent],
    beforeValidate: [
      lockContentHierarchyForWrite,
      copyEventCycleContentToDefaults,
      validateMediaBlocks,
    ],
  },
  labels: { plural: 'Cykle wydarzeń', singular: 'Cykl wydarzeń' },
  versions: { drafts: { autosave: { showSaveDraftButton: true } }, maxPerDoc: 50 },
}
