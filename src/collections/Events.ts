import type { Access, AccessResult, CollectionConfig, Field, Where } from 'payload'

import { createEditorialFields } from '@/modules/content/editorial-fields'
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
import { isMember } from '@/modules/members/member-profile'
import { validateMediaBlocks } from '@/modules/media/validate-media-blocks'
import {
  createRolePermissionAccess,
  websiteRequestContext,
} from '@/modules/membership/role-permissions'

const createEvents = createRolePermissionAccess({ operation: 'create', resource: 'events' })
const deleteEvents = createRolePermissionAccess({ operation: 'delete', resource: 'events' })
const readEventsByRole = createRolePermissionAccess({ operation: 'read', resource: 'events' })
const updateEvents = createRolePermissionAccess({ operation: 'update', resource: 'events' })

function combineWithVisibility(result: AccessResult, visibility: true | Where): AccessResult {
  if (result === false) return false
  if (result === true) return visibility
  if (visibility === true) return result
  return { and: [result, visibility] }
}

const readEvents: Access = async (arguments_) => {
  const result = await readEventsByRole(arguments_)
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

function halfWidth(field: Field): Field {
  return {
    ...field,
    admin: { ...('admin' in field ? field.admin : undefined), width: '50%' },
  } as Field
}

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
    defaultColumns: ['title', 'startAt', 'eventStatus', 'visibility', '_status'],
    group: 'Treści',
    listSearchableFields: ['title', 'slug', 'excerpt'],
    useAsTitle: 'title',
  },
  defaultSort: 'startAt',
  endpoints: [createNextEventEndpoint],
  fields: [
    {
      type: 'row',
      fields: [
        halfWidth(editorialField('title')),
        {
          name: 'cycle',
          type: 'relationship',
          admin: { placeholder: '<brak>', width: '50%' },
          label: 'Cykl wydarzeń',
          relationTo: 'event-cycles',
        },
      ],
    },
    {
      type: 'row',
      fields: [halfWidth(editorialField('categories')), halfWidth(editorialField('tags'))],
    },
    editorialField('heroImage'),
    { name: 'tagline', type: 'text', label: 'Hasło reklamowe', maxLength: 180 },
    { name: 'excerpt', type: 'textarea', label: 'Streszczenie', maxLength: 500, required: true },
    createContentLayoutField('Treści'),
    { type: 'collapsible', label: 'Termin', fields: createScheduleFields() },
    { name: 'location', type: 'group', label: 'Miejsce', fields: createLocationFields() },
    ...createParticipationFields(),
    createOrganizerField(),
    createPartnersField(),
    createExternalLinksField(),
    editorialField('seo'),
    editorialField('slug'),
    editorialField('author'),
    editorialField('publishedAt'),
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
  ],
  hooks: {
    beforeChange: [updateEventCalendarMetadata, setPublishedAt],
    beforeValidate: [applyEventCycleDefaults, validateMediaBlocks],
  },
  labels: { plural: 'Wydarzenia', singular: 'Wydarzenie' },
  versions: { drafts: true, maxPerDoc: 50 },
}
