import type { Field } from 'payload'

import { createBooleanSwitchAdmin } from '@/components/admin/boolean-switch-config'

const filtersCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.selectionMode === 'filters'

export function createMaxAgeDaysField(width: string): Field {
  return {
    name: 'maxAgeDays',
    type: 'number',
    admin: {
      condition: filtersCondition,
      description: '0 wyłącza filtr wieku; wyższa wartość określa maksymalny wiek w dniach.',
      step: 1,
      width,
    },
    defaultValue: 0,
    label: 'Zakres czasu',
    max: 366,
    min: 0,
    required: true,
  }
}

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

export function createListingPaginationRow({
  leadingField,
  secondaryLeadingField,
}: { leadingField?: Field; secondaryLeadingField?: Field } = {}): Field {
  const fieldWidth = secondaryLeadingField ? '25%' : leadingField ? '33.333%' : '50%'

  return {
    type: 'row',
    fields: [
      ...(leadingField ? [leadingField] : []),
      ...(secondaryLeadingField ? [secondaryLeadingField] : []),
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
