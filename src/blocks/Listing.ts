import type { Block, Validate } from 'payload'

type ListingSiblingData = {
  parentFilter?: unknown
  sources?: unknown
}

export const validateListingSources: Validate<unknown, unknown, ListingSiblingData> = (
  value,
  { siblingData },
) => {
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
  siblingData.parentFilter !== 'specific' || value ? true : 'Wybierz stronę nadrzędną dla listingu.'

export const ListingBlock: Block = {
  slug: 'listing',
  admin: {
    components: {
      Label: '/components/admin/ContentBlockLabel#ListingBlockLabel',
    },
    disableBlockName: true,
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Nagłówek',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sources',
          type: 'select',
          admin: { isClearable: false, width: '50%' },
          hasMany: true,
          label: 'Źródła',
          options: [
            { label: 'Strony', value: 'pages' },
            { label: 'Wpisy', value: 'posts' },
          ],
          required: true,
          validate: validateListingSources,
        },
        {
          name: 'parentPage',
          type: 'relationship',
          admin: {
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
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'relationship',
          admin: { placeholder: '<brak>', width: '50%' },
          label: 'Kategoria',
          relationTo: 'categories',
        },
        {
          name: 'tag',
          type: 'relationship',
          admin: { placeholder: '<brak>', width: '50%' },
          label: 'Tag',
          relationTo: 'tags',
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'sort',
          type: 'select',
          admin: { isClearable: false, width: '50%' },
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
          name: 'view',
          type: 'select',
          admin: { isClearable: false, width: '50%' },
          defaultValue: 'cards',
          label: 'Widok',
          options: [
            { label: 'Karty', value: 'cards' },
            { label: 'Lista kompaktowa', value: 'compact' },
            { label: 'Siatka', value: 'grid' },
          ],
          required: true,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'pageSize',
          type: 'number',
          admin: { width: '50%' },
          defaultValue: 12,
          label: 'Elementy na stronę',
          max: 100,
          min: 1,
          required: true,
        },
        {
          name: 'pagination',
          type: 'checkbox',
          admin: { width: '50%' },
          defaultValue: true,
          label: 'Włącz paginację',
        },
      ],
    },
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
      label: 'Komunikat pustego listingu',
    },
  ],
  interfaceName: 'ListingBlock',
  labels: {
    plural: 'Listingi',
    singular: 'Listing',
  },
}
