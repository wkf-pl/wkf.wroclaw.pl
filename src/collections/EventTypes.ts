import { APIError, type CollectionConfig } from 'payload'

import {
  invalidateEventTypesAfterChange,
  invalidateEventTypesAfterDelete,
} from '@/modules/cache/invalidate-public-data'
import { eventTypeIconColors } from '@/modules/events/event-types'
import { rasterIconPickerOptions } from '@/modules/icons/icon-picker-options'
import { createRolePermissionAccess } from '@/modules/membership/role-access'

const createEventTypes = createRolePermissionAccess({
  operation: 'create',
  resource: 'event-types',
})
const deleteEventTypes = createRolePermissionAccess({
  operation: 'delete',
  resource: 'event-types',
})
const readEventTypes = createRolePermissionAccess({
  anonymousAccess: true,
  operation: 'read',
  resource: 'event-types',
})
const updateEventTypes = createRolePermissionAccess({
  operation: 'update',
  resource: 'event-types',
})

export const EventTypes: CollectionConfig = {
  slug: 'event-types',
  access: {
    create: createEventTypes,
    delete: deleteEventTypes,
    read: readEventTypes,
    update: updateEventTypes,
  },
  admin: {
    defaultColumns: ['name', 'iconName', 'iconColor', 'updatedAt'],
    group: 'Treści',
    listSearchableFields: ['name'],
    useAsTitle: 'name',
    pagination: {
      limits: [10, 25, 50],
    },
  },
  defaultSort: 'name',
  fields: [
    {
      name: 'name',
      type: 'text',
      index: true,
      label: 'Nazwa',
      required: true,
      unique: true,
    },
    {
      name: 'iconName',
      type: 'select',
      admin: {
        components: {
          Field: '/components/admin/RasterIconPickerField#RasterIconPickerField',
        },
        isClearable: false,
      },
      label: 'Ikona',
      options: rasterIconPickerOptions.map(({ label, value }) => ({ label, value })),
      required: true,
    },
    {
      name: 'iconColor',
      type: 'select',
      admin: { isClearable: false },
      label: 'Kolor ikony',
      options: [...eventTypeIconColors],
      required: true,
    },
  ],
  hooks: {
    afterChange: [invalidateEventTypesAfterChange],
    afterDelete: [invalidateEventTypesAfterDelete],
    beforeDelete: [
      async ({ id, req }) => {
        const [events, eventCycles] = await Promise.all([
          req.payload.count({
            collection: 'events',
            overrideAccess: true,
            req,
            where: { eventType: { equals: id } },
          }),
          req.payload.count({
            collection: 'event-cycles',
            overrideAccess: true,
            req,
            where: { 'eventDefaults.eventType': { equals: id } },
          }),
        ])

        if (events.totalDocs > 0 || eventCycles.totalDocs > 0) {
          throw new APIError(
            'Nie można usunąć rodzaju używanego przez Wydarzenie lub Cykl wydarzeń.',
            400,
          )
        }
      },
    ],
  },
  labels: {
    plural: 'Rodzaje wydarzeń',
    singular: 'Rodzaj wydarzenia',
  },
}
