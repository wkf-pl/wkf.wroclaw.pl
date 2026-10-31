import type { Block, FieldHook, Validate } from 'payload'

import { createBooleanSwitchAdmin } from '@/components/admin/boolean-switch-config'
import { getFormRelationshipId } from '@/lib/relationships'
import { createContentPresentationFields } from '@/modules/content/content-presentation'
import { allListingSources, listingSourceLabels } from '@/modules/content/listing-conditions'

import { createListingConditionsField } from './listing-condition-fields'
import { createListingPaginationRow } from './listing-fields'

type ListingSiblingData = {
  selectionMode?: unknown
  sources?: unknown
}

type ListingItemSiblingData = {
  item?: unknown
}

const filtersCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.selectionMode === 'filters'

const memberProfileContextCondition = (
  _data: unknown,
  siblingData: Record<string, unknown>,
): boolean => {
  const item = siblingData.item
  return Boolean(
    item &&
    typeof item === 'object' &&
    'relationTo' in item &&
    item.relationTo === 'member-profiles',
  )
}

const normalizeContextLabel: FieldHook<
  { id: number | string },
  unknown,
  ListingItemSiblingData
> = ({ siblingData, value }) => {
  if (!memberProfileContextCondition(null, siblingData as Record<string, unknown>)) return null
  return typeof value === 'string' ? value.trim() || null : null
}

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
      allListingSources.some((source) => source === item.relationTo) &&
      id !== undefined
      ? `${item.relationTo}:${String(id)}`
      : null
  })

  if (itemKeys.some((itemKey) => itemKey === null)) {
    return 'Wybierz cel dla każdej treści.'
  }

  const uniqueItemKeys = itemKeys.filter((itemKey) => !itemKey?.startsWith('member-profiles:'))

  return new Set(uniqueItemKeys).size === uniqueItemKeys.length
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
          { label: 'Kafelki', value: 'tiles' },
          { label: 'Karty', value: 'cards' },
          { label: 'Karuzela', value: 'carousel' },
          { label: 'Lista kompaktowa', value: 'compact' },
          { label: 'Siatka', value: 'grid' },
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
          options: allListingSources.map((source) => ({
            label: listingSourceLabels[source],
            value: source,
          })),
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
          relationTo: [...allListingSources],
          required: true,
        },
        {
          name: 'contextLabel',
          type: 'text',
          admin: {
            condition: memberProfileContextCondition,
            description: 'Opcjonalna funkcja w kontekście tej strony, np. „Prezes Zarządu”.',
          },
          hooks: { beforeValidate: [normalizeContextLabel] },
          label: 'Podpis funkcji',
          maxLength: 160,
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
      contentListing: true,
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
      name: 'hideWhenEmpty',
      type: 'checkbox',
      admin: createBooleanSwitchAdmin(),
      defaultValue: false,
      label: 'Ukryj blok, gdy brak treści',
    },
    {
      name: 'emptyMessage',
      type: 'text',
      admin: { condition: (_data, siblingData) => siblingData.hideWhenEmpty !== true },
      label: 'Komunikat pustego listingu',
    },
  ],
  interfaceName: 'ListingBlock',
  labels: {
    plural: 'Listingi',
    singular: 'Listing',
  },
}
