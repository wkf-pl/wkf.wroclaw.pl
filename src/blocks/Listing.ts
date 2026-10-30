import type { Block, Validate } from 'payload'

import { getFormRelationshipId } from '@/lib/relationships'
import { createContentPresentationFields } from '@/modules/content/content-presentation'
import { listingSources } from '@/modules/content/listing-conditions'

import { createListingConditionsField } from './listing-condition-fields'
import { createListingPaginationRow } from './listing-fields'

type ListingSiblingData = {
  selectionMode?: unknown
  sources?: unknown
}

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

  const itemKeys = value.map((row) => {
    if (!row || typeof row !== 'object' || !('item' in row)) {
      return null
    }

    const item = row.item
    if (!item || typeof item !== 'object' || !('relationTo' in item) || !('value' in item)) {
      return null
    }

    const id = getFormRelationshipId(item.value)
    return typeof item.relationTo === 'string' &&
      listingSources.some((source) => source === item.relationTo) &&
      id !== undefined
      ? `${item.relationTo}:${String(id)}`
      : null
  })

  if (itemKeys.some((itemKey) => itemKey === null)) {
    return 'Wybierz cel dla każdej treści.'
  }

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

  return true
}

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
          { label: 'Karuzela', value: 'carousel' },
          { label: 'Lista kompaktowa', value: 'compact' },
          { label: 'Siatka', value: 'grid' },
          { label: 'Kafelki', value: 'tiles' },
        ],
        required: true,
      },
    }),
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
    createListingPaginationRow({
      secondaryLeadingField: {
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
        ],
        required: true,
      },
    }),
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

export { listingSources }
