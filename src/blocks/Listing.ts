import type { Block, Validate } from 'payload'

import { getFormRelationshipId } from '@/lib/relationships'
import { createContentPresentationFields } from '@/modules/content/content-presentation'

import { createListingPaginationRow, createListingTaxonomyRow } from './listing-fields'

type ListingSiblingData = {
  parentFilter?: unknown
  selectionMode?: unknown
  sources?: unknown
}

export const listingSources = ['pages', 'posts', 'events', 'event-cycles'] as const

const filtersCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.selectionMode === 'filters'

export const validateManualListingItems: Validate<unknown, unknown, ListingSiblingData> = (
  value,
  { siblingData },
) => {
  if (siblingData.selectionMode !== 'manual') {
    return true
  }

  if (!Array.isArray(value) || value.length === 0) {
    return 'Wybierz co najmniej jedną treść.'
  }

  const itemKeys = value.flatMap((row) => {
    if (!row || typeof row !== 'object' || !('item' in row)) {
      return []
    }

    const item = row.item
    if (!item || typeof item !== 'object' || !('relationTo' in item) || !('value' in item)) {
      return []
    }

    const id = getFormRelationshipId(item.value)
    return typeof item.relationTo === 'string' && id !== undefined
      ? [`${item.relationTo}:${String(id)}`]
      : []
  })

  return new Set(itemKeys).size === itemKeys.length
    ? true
    : 'Każda treść może zostać wybrana tylko raz.'
}

export const validateListingSources: Validate<unknown, unknown, ListingSiblingData> = (
  value,
  { siblingData },
) => {
  if (siblingData.selectionMode === 'manual') {
    return true
  }

  if (!Array.isArray(value) || value.length === 0) {
    return 'Wybierz co najmniej jedno źródło treści.'
  }

  const sources = value.filter((source): source is string => typeof source === 'string')
  if (new Set(sources).size !== sources.length) {
    return 'Każde źródło może zostać wybrane tylko raz.'
  }

  if (siblingData.parentFilter && siblingData.parentFilter !== 'none') {
    return sources.length === 1 && sources[0] === 'pages'
      ? true
      : 'Filtr strony nadrzędnej wymaga, aby jedynym źródłem były Strony.'
  }

  return true
}

export const validateParentPage: Validate<unknown, unknown, ListingSiblingData> = (
  value,
  { siblingData },
) =>
  siblingData.selectionMode === 'manual' || siblingData.parentFilter !== 'specific' || value
    ? true
    : 'Wybierz stronę nadrzędną dla listingu.'

export const ListingBlock: Block = {
  slug: 'listing',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#ListingBlockLabel',
    },
    disableBlockName: true,
    group: 'Treści',
    images: {
      thumbnail: {
        alt: 'Schematyczna ikona uporządkowanych kart i filtra',
        url: '/assets/block-thumbnails/listing.png',
      },
    },
  },
  fields: [
    ...createContentPresentationFields({
      leadingField: {
        name: 'view',
        type: 'select',
        admin: { isClearable: false, width: '33.333%' },
        defaultValue: 'cards',
        label: 'Widok',
        options: [
          { label: 'Karty', value: 'cards' },
          { label: 'Lista kompaktowa', value: 'compact' },
          { label: 'Siatka', value: 'grid' },
        ],
        required: true,
      },
    }),
    {
      name: 'selectionMode',
      type: 'select',
      admin: { isClearable: false },
      defaultValue: 'filters',
      label: 'Tryb wyboru',
      options: [
        { label: 'Ręczny', value: 'manual' },
        { label: 'Filtry', value: 'filters' },
      ],
      required: true,
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
    {
      type: 'row',
      fields: [
        {
          name: 'sources',
          type: 'select',
          admin: { condition: filtersCondition, isClearable: false, width: '50%' },
          hasMany: true,
          label: 'Źródła',
          options: listingSources.map((source) => {
            const labels = {
              'event-cycles': 'Cykle wydarzeń',
              events: 'Wydarzenia',
              pages: 'Strony',
              posts: 'Wpisy',
            }
            return { label: labels[source], value: source }
          }),
          validate: validateListingSources,
        },
        {
          name: 'parentPage',
          type: 'relationship',
          admin: {
            condition: filtersCondition,
            components: {
              Field: '/components/admin/ListingParentPageField#ListingParentPageField',
            },
            width: '50%',
          },
          label: 'Strona nadrzędna',
          relationTo: 'pages',
          validate: validateParentPage,
        },
      ],
    },
    createListingTaxonomyRow({ conditional: true }),
    {
      type: 'row',
      fields: [
        {
          name: 'eventTimeFilter',
          type: 'select',
          admin: { condition: filtersCondition, isClearable: false, width: '50%' },
          defaultValue: 'all',
          label: 'Terminy Wydarzeń',
          options: [
            { label: 'Wszystkie', value: 'all' },
            { label: 'Trwające i nadchodzące', value: 'upcoming' },
            { label: 'Minione', value: 'past' },
          ],
        },
        {
          name: 'eventCycle',
          type: 'relationship',
          admin: {
            condition: filtersCondition,
            placeholder: '<bieżący cykl lub brak>',
            width: '50%',
          },
          label: 'Wskazany Cykl wydarzeń',
          relationTo: 'event-cycles',
        },
      ],
    },
    createListingPaginationRow({
      leadingField: {
        name: 'sort',
        type: 'select',
        admin: { condition: filtersCondition, isClearable: false, width: '33.333%' },
        defaultValue: 'newest',
        label: 'Sortowanie',
        options: [
          { label: 'Najnowsze', value: 'newest' },
          { label: 'Najstarsze', value: 'oldest' },
          { label: 'Tytuł A–Z', value: 'titleAscending' },
          { label: 'Tytuł Z–A', value: 'titleDescending' },
          { label: 'Termin wydarzenia', value: 'eventDateAscending' },
        ],
        required: true,
      },
    }),
    {
      name: 'parentFilter',
      type: 'select',
      admin: { hidden: true },
      defaultValue: 'none',
      options: [
        { label: 'Bez filtra', value: 'none' },
        { label: 'Bieżąca strona', value: 'current' },
        { label: 'Wybrana strona', value: 'specific' },
      ],
      required: true,
    },
    {
      name: 'emptyMessage',
      type: 'text',
      admin: { condition: filtersCondition },
      label: 'Komunikat pustego listingu',
    },
  ],
  interfaceName: 'ListingBlock',
  labels: {
    plural: 'Listingi',
    singular: 'Listing',
  },
}
