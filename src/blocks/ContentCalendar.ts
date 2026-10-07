import type { Block, Validate } from 'payload'

import { createContentPresentationFields } from '@/modules/content/content-presentation'
import { contentCalendarSources } from '@/modules/content/content-calendar-presentation'

import { createListingTaxonomyRow } from './listing-fields'

export const validateContentCalendarSources: Validate = (value) =>
  Array.isArray(value) && value.length > 0 ? true : 'Wybierz co najmniej jeden typ treści.'

export const ContentCalendarBlock: Block = {
  slug: 'contentCalendar',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#ContentCalendarBlockLabel',
    },
    disableBlockName: true,
    group: 'Elementy',
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona kalendarza z siatką dni',
        url: '/assets/block-thumbnails/calendar.png',
      },
    },
  },
  fields: [
    ...createContentPresentationFields(),
    {
      name: 'sources',
      type: 'select',
      admin: { isClearable: false },
      defaultValue: ['events', 'posts'],
      hasMany: true,
      label: 'Typy treści',
      options: contentCalendarSources.map((source) => ({
        label: source === 'events' ? 'Wydarzenia' : 'Wpisy',
        value: source,
      })),
      required: true,
      validate: validateContentCalendarSources,
    },
    createListingTaxonomyRow({
      trailingField: {
        name: 'eventCycle',
        type: 'relationship',
        admin: { placeholder: '<brak>', width: '33.333%' },
        label: 'Cykl wydarzeń',
        relationTo: 'event-cycles',
      },
    }),
  ],
  interfaceName: 'ContentCalendarBlock',
  labels: {
    plural: 'Kalendarze',
    singular: 'Kalendarz',
  },
}
