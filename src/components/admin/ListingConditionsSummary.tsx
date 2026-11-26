'use client'

import { useConfig, useFormFields, usePayloadAPI, useRowLabel } from '@payloadcms/ui'
import type { FormState } from 'payload'
import { formatAdminURL } from 'payload/shared'
import { Fragment } from 'react'

import { getFormRelationshipId } from '@/lib/relationships'
import {
  getListingConditionOperatorLabel,
  isListingConditionField,
  isListingConditionOperator,
  listingConditionFieldLabels,
  listingConditionSupportedSources,
  listingSourceLabels,
  type ContentListingSource,
  type ListingConditionInput,
} from '@/modules/content/listing-conditions'

const conditionFieldNames = [
  'dateValue',
  'endDateValue',
  'eventTimeValue',
  'field',
  'numberValue',
  'operator',
  'relatedTargetMode',
  'relatedTargetValue',
  'relationshipValue',
  'textValue',
] as const satisfies readonly (keyof ListingConditionInput)[]

export function readListingCondition(
  fields: FormState,
  path: string,
  savedCondition: ListingConditionInput = {},
): ListingConditionInput {
  return Object.fromEntries(
    conditionFieldNames.map((name) => {
      const liveValue = fields[`${path}.${name}`]?.value
      return [name, liveValue === undefined ? savedCondition[name] : liveValue]
    }),
  ) as ListingConditionInput
}

export function ListingConditionRowLabel() {
  const { data, path } = useRowLabel<ListingConditionInput>()
  const condition = useFormFields(([fields]) => readListingCondition(fields, path, data ?? {}))
  const description = useConditionDescription(condition, false)
  const label = `Warunek: ${description}`

  return (
    <span className="wkf-listing-condition-row-label" title={label}>
      <strong>Warunek:</strong>
      <span>{description}</span>
    </span>
  )
}

export function ListingConditionsSummary({
  conditions,
  sources,
}: {
  conditions: ListingConditionInput[]
  sources: ContentListingSource[]
}) {
  if (!conditions.length || !sources.length) return null

  return (
    <aside className="wkf-listing-conditions__summary">
      <strong>Jak zadziała ten filtr</strong>
      <ul>
        {sources.map((source) => {
          const applicableConditions = conditions.filter(
            (condition) =>
              isListingConditionField(condition.field) &&
              listingConditionSupportedSources[condition.field].includes(source),
          )

          return (
            <li key={source}>
              {listingSourceLabels[source]}:{' '}
              {applicableConditions.length ? (
                <ListingConditionDescriptionList conditions={applicableConditions} />
              ) : (
                'bez dodatkowych warunków'
              )}
              .
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

function ListingConditionDescriptionList({ conditions }: { conditions: ListingConditionInput[] }) {
  return conditions.map((condition, conditionIndex) => (
    <Fragment key={condition.id || `${condition.field}-${condition.operator}-${conditionIndex}`}>
      {conditionIndex === 0 ? null : conditionIndex === conditions.length - 1 ? ' i ' : ', '}
      <ListingConditionDescription condition={condition} />
    </Fragment>
  ))
}

function ListingConditionDescription({ condition }: { condition: ListingConditionInput }) {
  return useConditionDescription(condition)
}

function useConditionDescription(condition: ListingConditionInput, lowercaseField = true): string {
  const relationshipLabel = useConditionRelationshipLabel(condition)
  return describeCondition(condition, lowercaseField, relationshipLabel)
}

function describeCondition(
  condition: ListingConditionInput,
  lowercaseField = true,
  relationshipLabel?: string,
): string {
  if (
    !isListingConditionField(condition.field) ||
    !isListingConditionOperator(condition.operator)
  ) {
    return 'niepełny warunek'
  }
  const fieldLabel = lowercaseField
    ? listingConditionFieldLabels[condition.field].toLocaleLowerCase('pl-PL')
    : listingConditionFieldLabels[condition.field]
  const operatorLabel = getListingConditionOperatorLabel(condition.field, condition.operator)
  if (condition.field === 'relatedTo') {
    const prefix = lowercaseField ? 'powiązane z' : 'Powiązane z'
    return condition.relatedTargetMode === 'current'
      ? `${prefix} bieżącym elementem`
      : `${prefix} ${relationshipLabel ? `„${relationshipLabel}”` : '…'}`
  }
  const valueLabel = getConditionValueLabel(condition, relationshipLabel)
  return `${fieldLabel} ${operatorLabel}${valueLabel ? ` ${valueLabel}` : ''}`
}

function getConditionValueLabel(
  condition: ListingConditionInput,
  relationshipLabel?: string,
): string {
  if (condition.operator === 'isEmpty') return ''
  if (condition.field === 'title') return `„${condition.textValue?.trim() || '…'}”`
  if (condition.field === 'eventTime') {
    if (condition.eventTimeValue === 'past') return 'minione'
    if (condition.eventTimeValue === 'upcoming') return 'trwające i nadchodzące'
    return '…'
  }
  if (condition.operator === 'notOlderThan') return `${condition.numberValue ?? '…'} dni`
  if (condition.operator === 'between') {
    return `${condition.dateValue || '…'} a ${condition.endDateValue || '…'}`
  }
  if (condition.dateValue) return condition.dateValue

  if (condition.field === 'contentParent' && condition.relatedTargetMode === 'current')
    return 'bieżącym elementem'
  const relatedValue = condition.relatedTargetValue?.value ?? condition.relationshipValue?.value
  const relatedLabel = relationshipLabel || getRelationshipLabel(relatedValue)
  return relatedLabel ? `„${relatedLabel}”` : '…'
}

function useConditionRelationshipLabel(condition: ListingConditionInput): string {
  const identity = getConditionRelationshipIdentity(condition)
  const {
    config: {
      routes: { api: apiRoute },
      serverURL,
    },
  } = useConfig()
  const relationshipURL = identity
    ? formatAdminURL({
        apiRoute,
        path: `/${identity.collection}/${identity.id}`,
        serverURL,
      })
    : ''
  const [{ data: loadedDocument }] = usePayloadAPI(relationshipURL, {
    initialParams: relationshipLabelQuery,
  })

  return getRelationshipLabel(loadedDocument) || getRelationshipLabel(identity?.value)
}

const relationshipTitleFields = {
  locations: 'venueName',
  topics: 'fullTitle',
  documents: 'title',
  'event-cycles': 'title',
  events: 'title',
  'member-profiles': 'publicName',
  pages: 'fullTitle',
  partners: 'name',
  posts: 'title',
  tags: 'name',
  'tag-groups': 'name',
} as const

const relationshipLabelQuery = {
  depth: 0,
  select: {
    fullTitle: true,
    name: true,
    publicName: true,
    venueName: true,
    slug: true,
    title: true,
  },
}

function getConditionRelationshipIdentity(condition: ListingConditionInput): {
  collection: keyof typeof relationshipTitleFields
  id: number | string
  value: unknown
} | null {
  if (condition.operator === 'isEmpty') return null

  const relationshipValue =
    condition.field === 'relatedTo' || condition.field === 'contentParent'
      ? condition.relatedTargetValue
      : condition.relationshipValue
  if (!relationshipValue || !(relationshipValue.relationTo in relationshipTitleFields)) return null

  const value = relationshipValue.value
  const id = getFormRelationshipId(value)
  return id === undefined ? null : { collection: relationshipValue.relationTo, id, value }
}

function getRelationshipLabel(value: unknown): string {
  if (typeof value === 'string' && value.trim() && Number.isNaN(Number(value))) return value.trim()
  if (!value || typeof value !== 'object') return ''
  const record = value as Record<string, unknown>
  for (const key of [
    'fullTitle',
    'title',
    'name',
    'publicName',
    'venueName',
    'label',
    'slug',
    'doc',
    'value',
  ]) {
    const label = getRelationshipLabel(record[key])
    if (label) return label
  }
  return ''
}
