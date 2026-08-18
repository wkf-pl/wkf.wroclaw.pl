import { randomUUID } from 'node:crypto'

import type { Access, AccessResult, CollectionConfig, Field, Where } from 'payload'

import { createEditorialFields } from '@/modules/content/editorial-fields'
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
import { timeModeOptions, visibilityOptions } from '@/modules/events/constants'
import { isMember } from '@/modules/members/member-profile'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'
import {
  createRolePermissionAccess,
  websiteRequestContext,
} from '@/modules/membership/role-permissions'

const createCycles = createRolePermissionAccess({ operation: 'create', resource: 'event-cycles' })
const deleteCycles = createRolePermissionAccess({ operation: 'delete', resource: 'event-cycles' })
const readCyclesByRole = createRolePermissionAccess({ operation: 'read', resource: 'event-cycles' })
const updateCycles = createRolePermissionAccess({ operation: 'update', resource: 'event-cycles' })

function combineWithVisibility(result: AccessResult, visibility: true | Where): AccessResult {
  if (result === false) return false
  if (result === true) return visibility
  if (visibility === true) return result
  return { and: [result, visibility] }
}

const readCycles: Access = async (arguments_) => {
  const result = await readCyclesByRole(arguments_)
  if (arguments_.req.context?.website !== websiteRequestContext.website) return result
  return combineWithVisibility(
    result,
    (await isMember(arguments_.req)) ? true : { visibility: { equals: 'public' } },
  )
}

const editorialFields = createEditorialFields({ includeContent: false, includeTaxonomy: true })
function editorialField(name: string): Field {
  const field = editorialFields.find((candidate) => 'name' in candidate && candidate.name === name)
  if (!field) throw new Error(`Missing editorial field: ${name}`)
  return field
}

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
    defaultColumns: ['title', 'slug', 'visibility', '_status', 'publishedAt'],
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
            editorialField('title'),
            { type: 'row', fields: [editorialField('categories'), editorialField('tags')] },
            editorialField('heroImage'),
            { name: 'tagline', type: 'text', label: 'Hasło reklamowe', maxLength: 180 },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Streszczenie',
              maxLength: 500,
              required: true,
            },
            createContentLayoutField('Treści'),
            {
              name: 'visibility',
              type: 'select',
              admin: { isClearable: false },
              defaultValue: 'public',
              label: 'Widoczność cyklu',
              options: [...visibilityOptions],
              required: true,
            },
          ],
        },
        { label: 'SEO', fields: [editorialField('seo')] },
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
    editorialField('author'),
    editorialField('publishedAt'),
    {
      name: 'calendarFeedKey',
      type: 'text',
      admin: { hidden: true, readOnly: true },
      index: true,
      unique: true,
    },
  ],
  hooks: {
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
