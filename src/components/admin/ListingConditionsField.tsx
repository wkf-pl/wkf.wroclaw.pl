'use client'

import {
  ArrayField,
  FieldError,
  FieldLabel,
  ReactSelect,
  RelationshipField,
  useConfig,
  useField,
  useFieldPath,
  useFormFields,
  usePayloadAPI,
  useRowLabel,
} from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'
import type {
  ArrayFieldClientProps,
  RelationshipFieldClientProps,
  SelectFieldClientProps,
  TextFieldClientProps,
  UIFieldClientProps,
} from 'payload'
import { formatAdminURL } from 'payload/shared'
import type { ChangeEvent } from 'react'
import { Fragment, useMemo } from 'react'

import { getFormRelationshipId } from '@/lib/relationships'
import {
  getApplicableListingSources,
  formatPolishListingConditionCount,
  getListingConditionOperatorLabel,
  getListingConditionRelationshipCollection,
  isListingConditionField,
  isListingConditionOperator,
  isListingSource,
  listingConditionFieldLabels,
  listingConditionFields,
  listingConditionOperatorsByField,
  listingConditionSupportedSources,
  listingSourceLabels,
  type ListingConditionField,
  type ListingConditionInput,
  type ListingConditionOperator,
  type ContentListingSource,
} from '@/modules/content/listing-conditions'

type SelectOption<T extends string> = {
  label: string
  value: T
}

const fieldOptions = listingConditionFields.map<SelectOption<ListingConditionField>>((field) => ({
  label: listingConditionFieldLabels[field],
  value: field,
}))

export function ListingConditionsField(properties: ArrayFieldClientProps) {
  const path = useFieldPath() || properties.path
  const conditions = useFormFields(([fields]) =>
    (fields[path]?.rows ?? []).map((_, rowIndex) => {
      const rowPath = `${path}.${rowIndex}`
      return {
        dateValue: fields[`${rowPath}.dateValue`]?.value as ListingConditionInput['dateValue'],
        endDateValue: fields[`${rowPath}.endDateValue`]
          ?.value as ListingConditionInput['endDateValue'],
        eventTimeValue: fields[`${rowPath}.eventTimeValue`]
          ?.value as ListingConditionInput['eventTimeValue'],
        field: fields[`${rowPath}.field`]?.value as ListingConditionInput['field'],
        numberValue: fields[`${rowPath}.numberValue`]
          ?.value as ListingConditionInput['numberValue'],
        operator: fields[`${rowPath}.operator`]?.value as ListingConditionInput['operator'],
        relationshipValue: fields[`${rowPath}.relationshipValue`]
          ?.value as ListingConditionInput['relationshipValue'],
        textValue: fields[`${rowPath}.textValue`]?.value as ListingConditionInput['textValue'],
      }
    }),
  )
  const sources = useListingSources(path)
  return (
    <div
      className={[
        'wkf-listing-conditions',
        sources.length === 0 ? 'wkf-listing-conditions--no-sources' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="wkf-listing-conditions__intro">
        <div>
          <strong>Warunki</strong>
          <p>Treść musi spełnić wszystkie warunki, które dotyczą jej typu.</p>
        </div>
        <span>{formatPolishListingConditionCount(conditions.length)}</span>
      </div>
      <div className="wkf-listing-conditions__array">
        <ArrayField {...properties} />
        {sources.length === 0 ? (
          <button className="wkf-listing-conditions__disabled-add" disabled type="button">
            Najpierw wybierz źródło
          </button>
        ) : null}
      </div>
      <ListingConditionsSummary conditions={conditions} sources={sources} />
    </div>
  )
}

export function ListingConditionRowLabel() {
  const { data, path } = useRowLabel<ListingConditionInput>()
  const liveCondition = useFormFields(([fields]) => ({
    dateValue: fields[`${path}.dateValue`]?.value as ListingConditionInput['dateValue'],
    endDateValue: fields[`${path}.endDateValue`]?.value as ListingConditionInput['endDateValue'],
    eventTimeValue: fields[`${path}.eventTimeValue`]
      ?.value as ListingConditionInput['eventTimeValue'],
    field: fields[`${path}.field`]?.value as ListingConditionInput['field'],
    numberValue: fields[`${path}.numberValue`]?.value as ListingConditionInput['numberValue'],
    operator: fields[`${path}.operator`]?.value as ListingConditionInput['operator'],
    relationshipValue: fields[`${path}.relationshipValue`]
      ?.value as ListingConditionInput['relationshipValue'],
    textValue: fields[`${path}.textValue`]?.value as ListingConditionInput['textValue'],
  }))
  const condition = mergeConditionData(data ?? {}, liveCondition)
  const description = useConditionDescription(condition, false)
  const label = `Warunek: ${description}`

  return (
    <span className="wkf-listing-condition-row-label" title={label}>
      <strong>Warunek:</strong>
      <span>{description}</span>
    </span>
  )
}

export function ListingConditionConnector(properties: UIFieldClientProps) {
  const rowIndex = getConditionRowIndex(properties.path)
  return (
    <div className="wkf-listing-condition__connector" aria-hidden="true">
      {rowIndex === 0 ? 'JEŚLI' : 'ORAZ'}
    </div>
  )
}

export function ListingConditionFieldSelect(properties: SelectFieldClientProps) {
  const { errorMessage, path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: properties.path,
  })
  const sources = useListingSources(properties.path)
  const operator = useField<string>({ path: siblingPath(properties.path, 'operator') })
  const relationshipValue = useField<unknown>({
    path: siblingPath(properties.path, 'relationshipValue'),
  })
  const textValue = useField<unknown>({ path: siblingPath(properties.path, 'textValue') })
  const numberValue = useField<unknown>({ path: siblingPath(properties.path, 'numberValue') })
  const eventTimeValue = useField<unknown>({
    path: siblingPath(properties.path, 'eventTimeValue'),
  })
  const dateValue = useField<unknown>({ path: siblingPath(properties.path, 'dateValue') })
  const endDateValue = useField<unknown>({ path: siblingPath(properties.path, 'endDateValue') })
  const selectedField = isListingConditionField(value) ? value : undefined
  const availableOptions = fieldOptions.filter(
    (option) =>
      option.value === selectedField ||
      getApplicableListingSources(option.value, sources).length > 0,
  )
  const selectedOption = availableOptions.find((option) => option.value === selectedField)
  const styles = useMemo(() => mergeFieldStyles(properties.field), [properties.field])

  function handleChange(option: unknown) {
    if (Array.isArray(option) || !option || typeof option !== 'object' || !('value' in option)) {
      return
    }
    if (!isListingConditionField(option.value)) return

    setValue(option.value)
    operator.setValue(listingConditionOperatorsByField[option.value][0])
    relationshipValue.setValue(null)
    textValue.setValue(null)
    numberValue.setValue(null)
    eventTimeValue.setValue(null)
    dateValue.setValue(null)
    endDateValue.setValue(null)
  }

  return (
    <div className="field-type select" style={styles}>
      <FieldLabel label={properties.field.label} path={path} required />
      <ReactSelect
        disabled={properties.readOnly || sources.length === 0}
        inputId={path}
        isClearable={false}
        isSearchable={false}
        onChange={handleChange}
        options={availableOptions}
        placeholder={sources.length ? 'Wybierz pole' : 'Najpierw wybierz źródło'}
        showError={showError}
        value={selectedOption}
      />
      <FieldError message={errorMessage} path={path} showError={showError} />
    </div>
  )
}

export function ListingConditionOperatorSelect(properties: SelectFieldClientProps) {
  const { errorMessage, path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: properties.path,
  })
  const conditionFieldValue = useFormFields(
    ([fields]) => fields[siblingPath(properties.path, 'field')]?.value,
  )
  const conditionField = isListingConditionField(conditionFieldValue)
    ? conditionFieldValue
    : undefined
  const options = conditionField
    ? listingConditionOperatorsByField[conditionField].map<SelectOption<ListingConditionOperator>>(
        (operator) => ({
          label: getListingConditionOperatorLabel(conditionField, operator),
          value: operator,
        }),
      )
    : []
  const selectedOption = options.find((option) => option.value === value)
  const styles = useMemo(() => mergeFieldStyles(properties.field), [properties.field])

  function handleChange(option: unknown) {
    if (Array.isArray(option) || !option || typeof option !== 'object' || !('value' in option)) {
      return
    }
    if (isListingConditionOperator(option.value)) setValue(option.value)
  }

  return (
    <div className="field-type select" style={styles}>
      <FieldLabel label={properties.field.label} path={path} required />
      <ReactSelect
        disabled={properties.readOnly || !conditionField}
        inputId={path}
        isClearable={false}
        isSearchable={false}
        onChange={handleChange}
        options={options}
        placeholder="Wybierz operator"
        showError={showError}
        value={selectedOption}
      />
      <FieldError message={errorMessage} path={path} showError={showError} />
    </div>
  )
}

export function ListingConditionRelationshipField(properties: RelationshipFieldClientProps) {
  const conditionFieldValue = useFormFields(
    ([fields]) => fields[siblingPath(properties.path, 'field')]?.value,
  )
  const conditionField = isListingConditionField(conditionFieldValue)
    ? conditionFieldValue
    : undefined
  const collection = conditionField
    ? getListingConditionRelationshipCollection(conditionField)
    : undefined
  if (!collection) return null

  const targetField = {
    ...properties.field,
    relationTo: [collection],
  }
  return <RelationshipField {...properties} field={targetField} key={collection} />
}

export function ListingConditionDateField(properties: TextFieldClientProps) {
  const { errorMessage, path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: properties.path,
  })
  const styles = useMemo(() => mergeFieldStyles(properties.field), [properties.field])

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value || null)
  }

  return (
    <div className="field-type text wkf-listing-condition__date" style={styles}>
      <FieldLabel label={properties.field.label} path={path} />
      <input
        aria-invalid={showError || undefined}
        disabled={properties.readOnly}
        id={path}
        onChange={handleChange}
        type="date"
        value={typeof value === 'string' ? value : ''}
      />
      <FieldError message={errorMessage} path={path} showError={showError} />
    </div>
  )
}

export function ListingConditionScope(properties: UIFieldClientProps) {
  const conditionFieldValue = useFormFields(
    ([fields]) => fields[siblingPath(properties.path, 'field')]?.value,
  )
  const conditionField = isListingConditionField(conditionFieldValue)
    ? conditionFieldValue
    : undefined
  const sources = useListingSources(properties.path)
  if (!conditionField) return null

  const applicableSources = getApplicableListingSources(conditionField, sources)
  const inactive = applicableSources.length === 0
  const allSources = applicableSources.length === sources.length
  const sourceLabels = formatPolishList(
    applicableSources.map((source) => listingSourceLabels[source]),
  )

  return (
    <p
      className={[
        'wkf-listing-condition__scope',
        inactive ? 'wkf-listing-condition__scope--error' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role={inactive ? 'alert' : undefined}
    >
      <strong>
        {inactive
          ? 'Ten warunek nie dotyczy żadnego wybranego źródła.'
          : allSources
            ? 'Dotyczy wszystkich źródeł:'
            : 'Dotyczy tylko:'}
      </strong>{' '}
      {inactive ? 'Zmień źródła albo usuń warunek.' : `${sourceLabels}.`}
      {!inactive && !allSources
        ? ` Pozostałe źródła przechodzą ten warunek bez sprawdzania.`
        : null}
    </p>
  )
}

function ListingConditionsSummary({
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
      <p>
        {sources.map((source, sourceIndex) => {
          const applicableConditions = conditions.filter(
            (condition) =>
              isListingConditionField(condition.field) &&
              listingConditionSupportedSources[condition.field].includes(source),
          )

          return (
            <Fragment key={source}>
              {sourceIndex > 0 ? '. ' : null}
              {listingSourceLabels[source]}:{' '}
              {applicableConditions.length ? (
                <ListingConditionDescriptionList conditions={applicableConditions} />
              ) : (
                'bez dodatkowych warunków'
              )}
            </Fragment>
          )
        })}
        .
      </p>
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
  const valueLabel = getConditionValueLabel(condition, relationshipLabel)
  return `${fieldLabel} ${operatorLabel}${valueLabel ? ` ${valueLabel}` : ''}`
}

function mergeConditionData(
  initialCondition: ListingConditionInput,
  liveCondition: ListingConditionInput,
): ListingConditionInput {
  return {
    dateValue:
      liveCondition.dateValue === undefined ? initialCondition.dateValue : liveCondition.dateValue,
    endDateValue:
      liveCondition.endDateValue === undefined
        ? initialCondition.endDateValue
        : liveCondition.endDateValue,
    eventTimeValue:
      liveCondition.eventTimeValue === undefined
        ? initialCondition.eventTimeValue
        : liveCondition.eventTimeValue,
    field: liveCondition.field === undefined ? initialCondition.field : liveCondition.field,
    numberValue:
      liveCondition.numberValue === undefined
        ? initialCondition.numberValue
        : liveCondition.numberValue,
    operator:
      liveCondition.operator === undefined ? initialCondition.operator : liveCondition.operator,
    relationshipValue:
      liveCondition.relationshipValue === undefined
        ? initialCondition.relationshipValue
        : liveCondition.relationshipValue,
    textValue:
      liveCondition.textValue === undefined ? initialCondition.textValue : liveCondition.textValue,
  }
}

function getConditionValueLabel(
  condition: ListingConditionInput,
  relationshipLabel?: string,
): string {
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

  const relatedValue = condition.relationshipValue?.value
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
  categories: 'fullTitle',
  'event-cycles': 'title',
  pages: 'fullTitle',
  tags: 'name',
} as const

const relationshipLabelQuery = {
  depth: 0,
  select: {
    fullTitle: true,
    name: true,
    slug: true,
    title: true,
  },
}

function getConditionRelationshipIdentity(condition: ListingConditionInput): {
  collection: keyof typeof relationshipTitleFields
  id: number | string
  value: unknown
} | null {
  const relationshipValue = condition.relationshipValue
  if (!relationshipValue || !(relationshipValue.relationTo in relationshipTitleFields)) return null

  const value = relationshipValue.value
  const id = getFormRelationshipId(value)
  return id === undefined ? null : { collection: relationshipValue.relationTo, id, value }
}

function getRelationshipLabel(value: unknown): string {
  if (typeof value === 'string' && value.trim() && Number.isNaN(Number(value))) return value.trim()
  if (!value || typeof value !== 'object') return ''
  const record = value as Record<string, unknown>
  for (const key of ['fullTitle', 'title', 'name', 'label', 'slug', 'doc', 'value']) {
    const label = getRelationshipLabel(record[key])
    if (label) return label
  }
  return ''
}

function useListingSources(path: string): ContentListingSource[] {
  const value = useFormFields(([fields]) => fields[getSourcesPath(path)]?.value)
  return Array.isArray(value) ? value.filter(isListingSource) : []
}

function getSourcesPath(path: string): string {
  const markerIndex = path.lastIndexOf('.conditions')
  return markerIndex === -1 ? 'sources' : `${path.slice(0, markerIndex)}.sources`
}

function siblingPath(path: string, fieldName: string): string {
  const lastSeparator = path.lastIndexOf('.')
  return lastSeparator === -1 ? fieldName : `${path.slice(0, lastSeparator)}.${fieldName}`
}

function getConditionRowIndex(path: string): number {
  const match = path.match(/\.conditions\.(\d+)\./)
  return match ? Number(match[1]) : 0
}

function formatPolishList(values: string[]): string {
  return new Intl.ListFormat('pl', { style: 'long', type: 'conjunction' }).format(values)
}
