import type { Block, Field, FieldHook, Validate } from 'payload'

import { createBooleanSwitchAdmin } from '@/components/admin/boolean-switch-config'
import {
  getListingViewReference,
  getSharedListingViewId,
  parseListingAppearance,
} from '@/modules/content/listing-view'
import { getFormRelationshipId } from '@/lib/relationships'
import { createContentPresentationFields } from '@/modules/content/content-presentation'
import {
  contentSearchFilterLabels,
  contentSearchFilterNames,
  supportsContentSearchFilter,
} from '@/modules/content/content-search-filters'
import {
  allListingSources,
  isListingSource,
  listingSourceLabels,
} from '@/modules/content/listing-conditions'
import { pageTemplateRegistry } from '@/modules/page-templates/page-template-registry'

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
  if (siblingData.selectionMode !== 'filters') {
    return true
  }

  return validateSources(value)
}

function validateSources(value: unknown): true | string {
  if (!Array.isArray(value) || value.length === 0) {
    return 'Wybierz co najmniej jedno źródło treści.'
  }

  const sources = value.filter((source): source is string => typeof source === 'string')
  if (new Set(sources).size !== sources.length) {
    return 'Każde źródło może zostać wybrane tylko raz.'
  }

  return true
}

function createListingBlock({
  includeContextRelations,
  interfaceName,
}: {
  includeContextRelations: boolean
  interfaceName: string
}): Block {
  const selectByFilters = filtersCondition
  const contentFields: Field[] = [
    {
      type: 'row',
      fields: [
        ...([
          {
            name: 'selectionMode',
            type: 'select',
            admin: { isClearable: false, width: '33.333%' },
            defaultValue: 'filters',
            label: 'Tryb wyboru',
            options: [
              { label: 'Ręczny', value: 'manual' },
              { label: 'Filtry', value: 'filters' },
              ...(includeContextRelations
                ? [{ label: 'Relacja bieżącego elementu', value: 'contextRelation' }]
                : []),
            ],
            required: true,
          },
        ] satisfies Field[]),
        {
          name: 'sources',
          type: 'select',
          admin: {
            condition: selectByFilters,
            isClearable: false,
            width: '66.667%',
          },
          hasMany: true,
          label: 'Źródła',
          options: allListingSources.map((source) => ({
            label: listingSourceLabels[source],
            value: source,
          })),
          validate: validateListingSources,
        },
        ...(includeContextRelations
          ? ([
              {
                name: 'contextRelation',
                type: 'select',
                admin: {
                  components: {
                    Field:
                      '/components/admin/PageTemplateFields#PageTemplateContextListingRelationSelect',
                  },
                  condition: (_data, siblingData) =>
                    siblingData.selectionMode === 'contextRelation',
                  isClearable: false,
                  width: '66.667%',
                },
                label: 'Relacja bieżącego elementu',
                options: uniquePageTemplateContextListingRelations(),
                validate: ((value, { siblingData }) =>
                  siblingData.selectionMode !== 'contextRelation' || value
                    ? true
                    : 'Wybierz relację bieżącego elementu.') satisfies Validate<
                  unknown,
                  unknown,
                  ListingSiblingData
                >,
              },
            ] satisfies Block['fields'])
          : []),
      ],
    },
    {
      name: 'includeInactiveLocations',
      type: 'checkbox',
      label: 'Uwzględnij nieaktywne miejsca',
      defaultValue: false,
      admin: {
        ...createBooleanSwitchAdmin(),
        condition: (data, siblingData) =>
          selectByFilters(data, siblingData) && siblingData.sources?.includes('locations'),
      },
    },
    ...([
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
    ] satisfies Field[]),
    createListingConditionsField(),
    createListingPaginationRow({
      contentListing: true,
      secondaryLeadingField: {
        name: 'sort',
        type: 'select',
        admin: { condition: selectByFilters, isClearable: false, width: '33.333%' },
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
      admin: {
        condition: (_data, siblingData) =>
          siblingData.hideWhenEmpty !== true || siblingData.searchEnabled === true,
      },
      label: 'Komunikat o braku wyników',
    },
  ]
  const presentationFields: Field[] = [
    {
      name: 'view',
      type: 'select',
      admin: { hidden: true },
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
    ...createContentPresentationFields().map(
      (field): Field =>
        ({
          ...field,
          admin: { ...field.admin, condition: () => false },
        }) as Field,
    ),
    {
      name: 'appearance',
      label: 'Wygląd',
      type: 'json',
      admin: { components: { Field: '/components/admin/ListingViewField#ListingViewField' } },
      hooks: {
        beforeValidate: [
          async ({ value, siblingData, req }) => {
            const reference = getListingViewReference(value, siblingData.view)
            const appearance = parseListingAppearance(value)
            if (!reference || 'id' in reference) return value == null ? value : appearance
            const { docs } = await req.payload.find({
              collection: 'listing-views',
              where: {
                presetKey: { equals: reference.presetKey },
                _status: { equals: 'published' },
              },
              limit: 1,
              depth: 0,
              req,
              overrideAccess: true,
            })
            return docs[0] ? { ...appearance, preset: `shared:${docs[0].id}` } : value
          },
        ],
      },
      validate: async (value, { req, previousValue }) => {
        const id = getSharedListingViewId(value)
        if (!id || id === getSharedListingViewId(previousValue)) return true
        const { docs } = await req.payload.find({
          collection: 'listing-views',
          depth: 0,
          limit: 1,
          req,
          overrideAccess: true,
          where: {
            id: { equals: id },
            _status: { equals: 'published' },
          },
        })
        return docs.length > 0 || 'Wybierz dostępny, opublikowany szablon widoku.'
      },
    },
  ]

  return {
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
      {
        type: 'tabs',
        tabs: [
          { label: 'Treści', fields: contentFields },
          { label: 'Wyszukiwanie', fields: createSearchFilterFields() },
          { label: 'Prezentacja', fields: presentationFields },
        ],
      },
    ],
    interfaceName,
    labels: {
      plural: 'Listingi',
      singular: 'Listing',
    },
  }
}

export const ListingBlock = createListingBlock({
  includeContextRelations: false,
  interfaceName: 'ListingBlock',
})

export const PageTemplateListingBlock = createListingBlock({
  includeContextRelations: true,
  interfaceName: 'PageTemplateListingBlock',
})

function createSearchFilterFields(): Field[] {
  const searchOptionsCondition = (data: unknown, siblingData: Record<string, unknown>) =>
    filtersCondition(data, siblingData) && siblingData.searchEnabled === true

  return [
    {
      name: 'searchEnabled',
      type: 'checkbox',
      label: 'Pozwól czytelnikowi przeszukiwać listę',
      defaultValue: false,
      admin: { ...createBooleanSwitchAdmin(), condition: filtersCondition },
    },
    {
      name: 'legacySearchParameters',
      type: 'checkbox',
      defaultValue: false,
      admin: { ...createBooleanSwitchAdmin(), hidden: true },
    },
    ...contentSearchFilterNames.map((name): Field => ({
      name: `filter${name[0].toUpperCase()}${name.slice(1)}`,
      type: 'checkbox',
      defaultValue: name !== 'branch',
      label: contentSearchFilterLabels[name],
      admin: {
        ...createBooleanSwitchAdmin(),
        condition: (data, siblingData) =>
          searchOptionsCondition(data, siblingData) &&
          supportsContentSearchFilter(
            name,
            Array.isArray(siblingData.sources) ? siblingData.sources.filter(isListingSource) : [],
          ),
      },
    })),
    {
      name: 'filterTagGroups',
      type: 'relationship',
      relationTo: 'tag-groups',
      hasMany: true,
      label: 'Grupy tagów',
      admin: {
        condition: (data, siblingData) =>
          searchOptionsCondition(data, siblingData) &&
          supportsContentSearchFilter(
            'tags',
            Array.isArray(siblingData.sources) ? siblingData.sources.filter(isListingSource) : [],
          ),
      },
    },
  ]
}

function uniquePageTemplateContextListingRelations(): Array<{ label: string; value: string }> {
  const relations = new Map<string, string>()
  for (const definition of pageTemplateRegistry) {
    for (const relation of definition.contextListingRelations ?? []) {
      if (!relations.has(relation.key)) relations.set(relation.key, relation.label)
    }
  }
  return [...relations].map(([value, label]) => ({ label, value }))
}
