import type { Field } from 'payload'

import { createBooleanSwitchAdmin } from '@/components/admin/boolean-switch-config'

const filtersCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.selectionMode === 'filters'

export function createListingTaxonomyRow({
  conditional = false,
  trailingField,
}: { conditional?: boolean; trailingField?: Field } = {}): Field {
  const taxonomyFieldWidth = trailingField ? '33.333%' : '50%'

  return {
    type: 'row',
    fields: [
      {
        name: 'category',
        type: 'relationship',
        admin: {
          condition: conditional ? filtersCondition : undefined,
          placeholder: '<brak>',
          width: taxonomyFieldWidth,
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
          width: taxonomyFieldWidth,
        },
        label: 'Tag',
        relationTo: 'tags',
      },
      ...(trailingField ? [trailingField] : []),
    ],
  }
}

export function createListingPaginationRow({ leadingField }: { leadingField?: Field } = {}): Field {
  const fieldWidth = leadingField ? '33.333%' : '50%'

  return {
    type: 'row',
    fields: [
      ...(leadingField ? [leadingField] : []),
      {
        name: 'pageSize',
        type: 'number',
        admin: { width: fieldWidth },
        defaultValue: 12,
        label: 'Elementy na stronę',
        max: 100,
        min: 1,
        required: true,
      },
      {
        name: 'pagination',
        type: 'checkbox',
        admin: createBooleanSwitchAdmin({ width: fieldWidth }),
        defaultValue: true,
        label: 'Włącz paginację',
      },
    ],
  }
}
