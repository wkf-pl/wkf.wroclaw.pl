import type { Field, FieldHook, NumberFieldValidation } from 'payload'

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

export function createListingPaginationRow({
  contentListing = false,
  leadingField,
  secondaryLeadingField,
}: {
  contentListing?: boolean
  leadingField?: Field
  secondaryLeadingField?: Field
} = {}): Field {
  const fieldWidth =
    leadingField && secondaryLeadingField
      ? '25%'
      : leadingField || secondaryLeadingField
        ? '33.333%'
        : '50%'

  return {
    type: 'row',
    fields: [
      ...(leadingField ? [leadingField] : []),
      ...(secondaryLeadingField ? [secondaryLeadingField] : []),
      {
        name: 'pageSize',
        type: 'number',
        admin: {
          ...(contentListing
            ? {
                components: {
                  Field: '/components/admin/ListingPageSizeField#ListingPageSizeField',
                },
              }
            : {}),
          width: fieldWidth,
        },
        defaultValue: 12,
        label: 'Elementy na stronę',
        max: 100,
        min: 1,
        required: true,
        ...(contentListing
          ? {
              hooks: { beforeValidate: [normalizeContentListingPageSize] },
              validate: validateContentListingPageSize,
            }
          : {}),
      },
      {
        name: 'pagination',
        type: 'checkbox',
        admin: {
          ...createBooleanSwitchAdmin({ width: fieldWidth }),
          ...(contentListing
            ? { condition: (_data, siblingData) => siblingData.view !== 'carousel' }
            : {}),
        },
        defaultValue: true,
        ...(contentListing ? { hooks: { beforeValidate: [disableCarouselPagination] } } : {}),
        label: 'Włącz paginację',
      },
    ],
  }
}

type ContentListingWindowSiblingData = {
  view?: unknown
}

const normalizeContentListingPageSize: FieldHook<
  { id: number | string },
  number | null | undefined,
  ContentListingWindowSiblingData
> = ({ siblingData, value }) => {
  const defaultValue = siblingData.view === 'carousel' ? 5 : 12
  return typeof value === 'number' && Number.isFinite(value) ? value : defaultValue
}

const disableCarouselPagination: FieldHook<
  { id: number | string },
  boolean | null | undefined,
  ContentListingWindowSiblingData
> = ({ siblingData, value }) => (siblingData.view === 'carousel' ? false : Boolean(value))

export const validateContentListingPageSize: NumberFieldValidation = (value, { siblingData }) => {
  const maximum = (siblingData as ContentListingWindowSiblingData).view === 'carousel' ? 20 : 100
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= maximum
    ? true
    : `Podaj liczbę od 1 do ${maximum}.`
}
