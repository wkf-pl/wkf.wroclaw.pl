import type { ArrayField, ArrayFieldValidation, FieldHook } from 'payload'

import { getFormRelationshipId } from '@/lib/relationships'
import {
  allListingSources,
  getApplicableListingSources,
  getListingConditionRelationshipCollection,
  isCalendarDate,
  isListingConditionField,
  isListingConditionOperator,
  isListingSource,
  listingConditionFieldLabels,
  listingConditionFields,
  listingConditionOperators,
  listingConditionOperatorsByField,
  normalizeListingTitle,
  type ListingConditionInput,
  type ContentListingSource,
} from '@/modules/content/listing-conditions'

type ListingConditionSiblingData = {
  selectionMode?: unknown
  sources?: unknown
}

const filtersCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.selectionMode === 'filters'

const relationshipValueCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  isListingConditionField(siblingData.field) &&
  getListingConditionRelationshipCollection(siblingData.field) !== undefined

const textValueCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.field === 'title'

const numberValueCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.field === 'significantDate' && siblingData.operator === 'notOlderThan'

const eventTimeValueCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.field === 'eventTime'

const dateValueCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.field === 'significantDate' &&
  ['after', 'before', 'between'].includes(String(siblingData.operator))

const endDateValueCondition = (_data: unknown, siblingData: Record<string, unknown>) =>
  siblingData.field === 'significantDate' && siblingData.operator === 'between'

export const validateListingConditions: ArrayFieldValidation = (value, { siblingData }) => {
  const listingSiblingData = siblingData as ListingConditionSiblingData
  if (listingSiblingData.selectionMode === 'manual') return true
  if (value === null || value === undefined) return true
  // Payload's client-side ArrayField validator receives the row count, while server validation
  // receives the array itself.
  if (typeof value === 'number') {
    if (!Number.isInteger(value) || value < 0) return 'Warunki muszą być listą.'
    return value <= 10 ? true : 'Możesz dodać najwyżej 10 warunków.'
  }
  if (!Array.isArray(value)) return 'Warunki muszą być listą.'
  if (value.length === 0) return true
  if (value.length > 10) return 'Możesz dodać najwyżej 10 warunków.'

  const conditions = value as ListingConditionInput[]

  const sources = Array.isArray(listingSiblingData.sources)
    ? listingSiblingData.sources.filter(isListingSource)
    : []
  const signatures = new Set<string>()

  for (let index = 0; index < conditions.length; index += 1) {
    const condition = conditions[index]
    const position = index + 1
    if (!condition || !isListingConditionField(condition.field)) {
      return `Wybierz pole w warunku ${position}.`
    }
    if (
      !isListingConditionOperator(condition.operator) ||
      !listingConditionOperatorsByField[condition.field].includes(condition.operator)
    ) {
      return `Wybierz poprawny operator w warunku ${position}.`
    }
    if (getApplicableListingSources(condition.field, sources).length === 0) {
      return `Warunek ${position} nie dotyczy żadnego wybranego źródła.`
    }

    const valueError = validateConditionValue(condition, position)
    if (valueError) return valueError

    const signature = getConditionSignature(condition)
    if (signatures.has(signature)) return `Warunek ${position} jest duplikatem.`
    signatures.add(signature)
  }

  return true
}

const normalizeListingConditions: FieldHook = ({ value }) => {
  if (!Array.isArray(value)) return value

  return value.map((rawCondition) => {
    if (!rawCondition || typeof rawCondition !== 'object') return rawCondition
    const condition = rawCondition as ListingConditionInput
    return {
      ...condition,
      dateValue: condition.dateValue?.trim() || null,
      endDateValue: condition.endDateValue?.trim() || null,
      textValue: condition.textValue?.trim() || null,
    }
  })
}

export function createListingConditionsField(): ArrayField {
  return {
    name: 'conditions',
    type: 'array',
    admin: {
      components: {
        Field: '/components/admin/ListingConditionsField#ListingConditionsField',
        RowLabel: '/components/admin/ListingConditionsField#ListingConditionRowLabel',
      },
      condition: filtersCondition,
      initCollapsed: false,
      isSortable: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'connector',
            type: 'ui',
            admin: {
              components: {
                Field: '/components/admin/ListingConditionsField#ListingConditionConnector',
              },
              width: '8%',
            },
          },
          {
            name: 'field',
            type: 'select',
            admin: {
              components: {
                Field: '/components/admin/ListingConditionsField#ListingConditionFieldSelect',
              },
              width: '21%',
            },
            label: 'Pole',
            options: listingConditionFields.map((field) => ({
              label: listingConditionFieldLabels[field],
              value: field,
            })),
            required: true,
          },
          {
            name: 'operator',
            type: 'select',
            admin: {
              components: {
                Field: '/components/admin/ListingConditionsField#ListingConditionOperatorSelect',
              },
              width: '23%',
            },
            label: 'Operator',
            options: [...listingConditionOperators],
            required: true,
          },
          {
            name: 'relationshipValue',
            type: 'relationship',
            admin: {
              components: {
                Field: '/components/admin/ListingConditionsField#ListingConditionRelationshipField',
              },
              condition: relationshipValueCondition,
              width: '48%',
            },
            label: 'Wartość',
            relationTo: ['categories', 'tags', 'pages', 'event-cycles'],
          },
          {
            name: 'textValue',
            type: 'text',
            admin: { condition: textValueCondition, width: '48%' },
            label: 'Wartość',
            maxLength: 200,
          },
          {
            name: 'numberValue',
            type: 'number',
            admin: { condition: numberValueCondition, step: 1, width: '48%' },
            label: 'Liczba dni',
            max: 366,
            min: 1,
          },
          {
            name: 'eventTimeValue',
            type: 'select',
            dbName: 'event_time',
            admin: { condition: eventTimeValueCondition, isClearable: false, width: '48%' },
            label: 'Wartość',
            options: [
              { label: 'Trwające i nadchodzące', value: 'upcoming' },
              { label: 'Minione', value: 'past' },
            ],
          },
          {
            name: 'dateValue',
            type: 'text',
            admin: {
              components: {
                Field: '/components/admin/ListingConditionsField#ListingConditionDateField',
              },
              condition: dateValueCondition,
              width: '24%',
            },
            label: 'Data',
          },
          {
            name: 'endDateValue',
            type: 'text',
            admin: {
              components: {
                Field: '/components/admin/ListingConditionsField#ListingConditionDateField',
              },
              condition: endDateValueCondition,
              width: '24%',
            },
            label: 'Data końcowa',
          },
        ],
      },
      {
        name: 'scope',
        type: 'ui',
        admin: {
          components: {
            Field: '/components/admin/ListingConditionsField#ListingConditionScope',
          },
        },
      },
    ],
    hooks: { beforeValidate: [normalizeListingConditions] },
    interfaceName: 'ListingCondition',
    label: 'Warunki',
    labels: { plural: 'Warunki', singular: 'Warunek' },
    maxRows: 10,
    validate: validateListingConditions,
  }
}

function validateConditionValue(condition: ListingConditionInput, position: number): string | null {
  const relationshipCollection = getListingConditionRelationshipCollection(condition.field!)
  if (relationshipCollection) {
    if (
      !condition.relationshipValue ||
      condition.relationshipValue.relationTo !== relationshipCollection ||
      getFormRelationshipId(condition.relationshipValue.value) === undefined
    ) {
      return `Wybierz poprawną wartość relacji w warunku ${position}.`
    }
    return null
  }

  if (condition.field === 'title') {
    return condition.textValue?.trim() ? null : `Wpisz fragment tytułu w warunku ${position}.`
  }

  if (condition.field === 'eventTime') {
    return condition.eventTimeValue === 'past' || condition.eventTimeValue === 'upcoming'
      ? null
      : `Wybierz termin wydarzenia w warunku ${position}.`
  }

  if (condition.operator === 'notOlderThan') {
    return Number.isInteger(condition.numberValue) &&
      condition.numberValue! >= 1 &&
      condition.numberValue! <= 366
      ? null
      : `Podaj liczbę dni od 1 do 366 w warunku ${position}.`
  }

  if (!isCalendarDate(condition.dateValue)) {
    return `Wybierz poprawną datę w warunku ${position}.`
  }
  if (condition.operator === 'between') {
    if (!isCalendarDate(condition.endDateValue)) {
      return `Wybierz poprawną datę końcową w warunku ${position}.`
    }
    if (condition.dateValue > condition.endDateValue) {
      return `Data początkowa warunku ${position} nie może być późniejsza od końcowej.`
    }
  }
  return null
}

function getConditionSignature(condition: ListingConditionInput): string {
  const relationshipId = condition.relationshipValue
    ? getFormRelationshipId(condition.relationshipValue.value)
    : undefined

  switch (condition.field) {
    case 'title':
      return JSON.stringify([
        condition.field,
        condition.operator,
        normalizeListingTitle(condition.textValue ?? ''),
      ])
    case 'category':
    case 'eventCycle':
    case 'parentPage':
    case 'tag':
      return JSON.stringify([
        condition.field,
        condition.operator,
        condition.relationshipValue?.relationTo,
        relationshipId,
      ])
    case 'eventTime':
      return JSON.stringify([condition.field, condition.operator, condition.eventTimeValue])
    case 'significantDate':
      return JSON.stringify([
        condition.field,
        condition.operator,
        condition.operator === 'notOlderThan' ? condition.numberValue : condition.dateValue,
        condition.operator === 'between' ? condition.endDateValue : undefined,
      ])
    default:
      return JSON.stringify([condition.field, condition.operator])
  }
}

export function getListingSources(value: unknown): ContentListingSource[] {
  return Array.isArray(value) ? value.filter(isListingSource) : []
}

export { allListingSources }
