import type { Block } from 'payload'

import { createContentPresentationFields } from '@/modules/content/content-presentation'

import { listingSources, validateListingSources, validateManualListingItems } from './Listing'
import { createListingConditionsField } from './listing-condition-fields'

const filtersCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.selectionMode === 'filters'

export const CarouselBlock: Block = {
  slug: 'carousel',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#CarouselBlockLabel',
    },
    disableBlockName: true,
    group: 'Treści',
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona slajdów karuzeli z przełącznikiem',
        url: '/assets/block-thumbnails/carousel.png',
      },
    },
  },
  fields: [
    ...createContentPresentationFields(),
    {
      type: 'row',
      fields: [
        {
          name: 'selectionMode',
          type: 'select',
          admin: { isClearable: false, width: '33.333%' },
          defaultValue: 'filters',
          label: 'Tryb wyboru',
          options: [
            { label: 'Ręczny', value: 'manual' },
            { label: 'Filtry', value: 'filters' },
          ],
          required: true,
        },
        {
          name: 'sources',
          type: 'select',
          admin: { condition: filtersCondition, isClearable: false, width: '66.667%' },
          hasMany: true,
          label: 'Źródła',
          options: listingSources.map((source) => {
            const labels = {
              documents: 'Dokumenty',
              'event-cycles': 'Cykle wydarzeń',
              events: 'Wydarzenia',
              pages: 'Strony',
              posts: 'Wpisy',
            }
            return { label: labels[source], value: source }
          }),
          validate: validateListingSources,
        },
      ],
    },
    {
      name: 'items',
      type: 'array',
      admin: {
        condition: (_data, siblingData) => siblingData.selectionMode === 'manual',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'item',
          type: 'relationship',
          admin: {
            components: {
              Field: '/components/admin/ListingManualItemField#ListingManualItemField',
            },
          },
          filterOptions: { _status: { equals: 'published' } },
          label: 'Treść',
          relationTo: [...listingSources],
          required: true,
        },
      ],
      label: 'Treści',
      labels: {
        plural: 'Treści',
        singular: 'Treść',
      },
      validate: validateManualListingItems,
    },
    createListingConditionsField(),
    {
      type: 'row',
      fields: [
        {
          name: 'sort',
          type: 'select',
          admin: { condition: filtersCondition, isClearable: false, width: '50%' },
          defaultValue: 'newest',
          label: 'Sortowanie',
          options: [
            { label: 'Najnowsze', value: 'newest' },
            { label: 'Najstarsze', value: 'oldest' },
            { label: 'Tytuł A–Z', value: 'titleAscending' },
            { label: 'Tytuł Z–A', value: 'titleDescending' },
          ],
          required: true,
        },
        {
          name: 'slideLimit',
          type: 'number',
          admin: { width: '50%' },
          defaultValue: 5,
          label: 'Maksymalna liczba slajdów',
          max: 20,
          min: 1,
          required: true,
        },
      ],
    },
    {
      name: 'emptyMessage',
      type: 'text',
      label: 'Komunikat pustej karuzeli',
    },
  ],
  interfaceName: 'CarouselBlock',
  labels: {
    plural: 'Karuzele',
    singular: 'Karuzela',
  },
}
