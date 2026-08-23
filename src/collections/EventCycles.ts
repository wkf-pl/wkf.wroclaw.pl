import { randomUUID } from 'node:crypto'

import type { CollectionConfig, Field } from 'payload'

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
  createLocationFields,
  createOrganizerField,
  createPartnersField,
  createParticipationFields,
} from '@/modules/events/fields'
import { copyEventCycleContentToDefaults } from '@/modules/events/hooks'
import { createEventFromCycleEndpoint } from '@/modules/events/create-event-from-cycle'
import { timeModeOptions } from '@/modules/events/constants'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'
import { publishedPublicAccess } from '@/modules/content/public-access'
import { createRolePermissionAccess } from '@/modules/membership/role-permissions'

const createCycles = createRolePermissionAccess({ operation: 'create', resource: 'event-cycles' })
const deleteCycles = createRolePermissionAccess({ operation: 'delete', resource: 'event-cycles' })
const readCycles = createRolePermissionAccess({
  operation: 'read',
  publicAccess: publishedPublicAccess,
  resource: 'event-cycles',
})
const updateCycles = createRolePermissionAccess({ operation: 'update', resource: 'event-cycles' })

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
  label: 'Adres URL',
  required: true,
  unique: true,
}

export const EventCycles: CollectionConfig = {
  slug: 'event-cycles',
  access: { create: createCycles, delete: deleteCycles, read: readCycles, update: updateCycles },
  admin: {
    components: {
      edit: {
        beforeDocumentControls: [
          '/components/admin/CollectionLabels#EventCycleCreateLabel',
          '/components/admin/EventCycleDefaultsMirror#EventCycleDefaultsMirror',
          '/components/admin/EventCycleActions#EventCycleActions',
        ],
      },
    },
    defaultColumns: ['title', 'slug', '_status', 'publishedAt'],
    group: 'Treści',
    listSearchableFields: ['title', 'slug', 'excerpt'],
    useAsTitle: 'title',
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
            {
              type: 'row',
              fields: [
                getEditorialField(editorialFields, 'categories'),
                getEditorialField(editorialFields, 'tags'),
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
                { name: 'title', type: 'text', label: 'Tytuł', maxLength: 180 },
                { name: 'heroImage', type: 'upload', label: 'Obraz główny', relationTo: 'media' },
                { name: 'tagline', type: 'text', label: 'Hasło reklamowe', maxLength: 180 },
                { name: 'excerpt', type: 'textarea', label: 'Streszczenie', maxLength: 500 },
                createContentLayoutField('Treści'),
                { type: 'row', fields: createTaxonomyFields() },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'defaultTimeMode',
                      type: 'select',
                      admin: { isClearable: false, width: '50%' },
                      defaultValue: 'timed',
                      label: 'Sposób podania czasu',
                      options: [...timeModeOptions],
                    },
                    {
                      name: 'defaultStartTime',
                      type: 'text',
                      admin: { description: 'Format GG:MM, np. 18:00', width: '25%' },
                      label: 'Typowa godzina rozpoczęcia',
                      validate: (value: unknown) =>
                        !value ||
                        (typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value))
                          ? true
                          : 'Podaj godzinę w formacie GG:MM.',
                    },
                    {
                      name: 'defaultDurationMinutes',
                      type: 'number',
                      admin: { width: '25%' },
                      label: 'Typowy czas trwania w minutach',
                      min: 1,
                    },
                  ],
                },
                {
                  name: 'location',
                  type: 'group',
                  label: 'Miejsce',
                  fields: createLocationFields(),
                },
                ...createParticipationFields(),
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
    getEditorialField(editorialFields, 'author'),
    getEditorialField(editorialFields, 'publishedAt'),
    {
      name: 'calendarFeedKey',
      type: 'text',
      admin: { hidden: true, readOnly: true },
      index: true,
      unique: true,
    },
  ],
  hooks: {
    afterChange: [syncContentListingAfterChange],
    afterDelete: [removeContentListingAfterDelete],
    beforeChange: [
      ({ data }) => {
        data.calendarFeedKey ||= randomUUID()
        return data
      },
      setPublishedAt,
    ],
    beforeValidate: [copyEventCycleContentToDefaults, validateMediaBlocks],
  },
  labels: { plural: 'Cykle wydarzeń', singular: 'Cykl wydarzeń' },
  versions: { drafts: true, maxPerDoc: 50 },
}
