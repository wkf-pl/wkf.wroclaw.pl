import type { Field } from 'payload'

const filtersCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.selectionMode === 'filters'

export function createListingTaxonomyRow({ conditional = false } = {}): Field {
  return {
    type: 'row',
    fields: [
      {
        name: 'category',
        type: 'relationship',
        admin: {
          condition: conditional ? filtersCondition : undefined,
          placeholder: '<brak>',
          width: '50%',
        },
        label: 'Kategoria',
        relationTo: 'categories',
      },
      {
        name: 'tag',
        type: 'relationship',
        admin: {
          condition: conditional ? filtersCondition : undefined,
          placeholder: '<brak>',
          width: '50%',
        },
        label: 'Tag',
        relationTo: 'tags',
      },
    ],
  }
}

export function createListingPaginationRow(): Field {
  return {
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
  }
}
