'use client'

import {
  ArrayField,
  FieldError,
  FieldLabel,
  ReactSelect,
  RelationshipField,
  RelationshipInput,
  useField,
  useFieldPath,
  useFormFields,
} from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'
import type {
  ArrayFieldClientProps,
  RelationshipFieldClientProps,
  SelectFieldClientProps,
  TextFieldClientProps,
  UIFieldClientProps,
  ValueWithRelation,
} from 'payload'
import type { ChangeEvent } from 'react'
import { useMemo } from 'react'

import {
  getApplicableListingSources,
  getTaxonomyTemplateCollection,
  formatPolishListingConditionCount,
  getListingConditionOperatorLabel,
  getListingConditionRelationshipCollection,
  allListingSources,
  isListingConditionField,
  isListingConditionOperator,
  isListingSource,
  listingConditionFieldLabels,
  listingConditionFields,
  listingConditionOperatorsByField,
  listingSourceLabels,
  type ListingConditionField,
  type ListingConditionOperator,
  type ContentListingSource,
} from '@/modules/content/listing-conditions'

import {
  getPageTemplateDefinition,
  isPageTemplateID,
} from '@/modules/page-templates/page-template-registry'

import { ListingConditionsSummary, readListingCondition } from './ListingConditionsSummary'

export { ListingConditionRowLabel } from './ListingConditionsSummary'

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
    (fields[path]?.rows ?? []).map((_, rowIndex) =>
      readListingCondition(fields, `${path}.${rowIndex}`),
    ),
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
  const taxonomyContext = useFormFields(([fields]) =>
    Boolean(getTaxonomyTemplateCollection(fields.templateKey?.value)),
  )
  const operator = useField<string>({ path: siblingPath(properties.path, 'operator') })
  const relationshipValue = useField<unknown>({
    path: siblingPath(properties.path, 'relationshipValue'),
  })
  const relatedTargetMode = useField<unknown>({
    path: siblingPath(properties.path, 'relatedTargetMode'),
  })
  const relatedTargetValue = useField<unknown>({
    path: siblingPath(properties.path, 'relatedTargetValue'),
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
      option.value !== 'parentPage' &&
      (option.value === selectedField ||
        getApplicableListingSources(option.value, sources, taxonomyContext).length > 0),
  )
  const selectedOption = fieldOptions.find((option) => option.value === selectedField)
  const styles = useMemo(() => mergeFieldStyles(properties.field), [properties.field])

  function handleChange(option: unknown) {
    if (Array.isArray(option) || !option || typeof option !== 'object' || !('value' in option)) {
      return
    }
    if (!isListingConditionField(option.value) || option.value === 'parentPage') return

    setValue(option.value)
    operator.setValue(listingConditionOperatorsByField[option.value][0])
    relationshipValue.setValue(null)
    relatedTargetMode.setValue(
      option.value === 'relatedTo' || option.value === 'contentParent' ? 'current' : null,
    )
    relatedTargetValue.setValue(null)
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

const currentRelatedTargetSentinel = '__wkf_current_element__'

type RelatedTargetOption = {
  allowEdit: boolean
  label: string
  options?: RelatedTargetOption[]
  relationTo?: string
  value: number | string
}

type RelatedTargetOptionGroup = {
  label: string
  options: RelatedTargetOption[]
}

const currentRelatedTargetOption: RelatedTargetOption = {
  allowEdit: false,
  label: 'Bieżący element',
  relationTo: allListingSources[0],
  value: currentRelatedTargetSentinel,
}

function prependCurrentRelatedTargetOption(
  optionGroups: RelatedTargetOptionGroup[],
): RelatedTargetOptionGroup[] {
  return [{ label: 'Kontekst strony', options: [currentRelatedTargetOption] }, ...optionGroups]
}

function isRelatedTargetValue(value: unknown): value is ValueWithRelation {
  if (!value || typeof value !== 'object') return false
  if (!('relationTo' in value) || !isListingSource(value.relationTo)) return false
  if (!('value' in value)) return false
  return typeof value.value === 'number' || typeof value.value === 'string'
}

export function ListingConditionRelatedTargetModeSelect(properties: SelectFieldClientProps) {
  const { path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: properties.path,
  })
  const relatedTargetField = useField<unknown>({
    path: siblingPath(properties.path, 'relatedTargetValue'),
  })
  const styles = useMemo(() => mergeFieldStyles(properties.field), [properties.field])
  const isParentCondition = useFormFields(
    ([fields]) => fields[siblingPath(properties.path, 'field')]?.value === 'contentParent',
  )
  const allowsCurrentTarget = useFormFields(([fields]) => {
    const templateKey = fields.templateKey?.value
    if (isParentCondition) {
      return (
        templateKey === 'event-cycle-detail' ||
        (!isPageTemplateID(templateKey) &&
          !fields.cycle &&
          !fields.eventDefaults &&
          !fields.relatedContent)
      )
    }
    return (
      !isPageTemplateID(templateKey) ||
      getPageTemplateDefinition(templateKey)?.routeKind === 'collectionItem'
    )
  })
  const selectedTarget =
    value === 'selected' && isRelatedTargetValue(relatedTargetField.value)
      ? relatedTargetField.value
      : null

  function handleChange(target: ValueWithRelation | null) {
    if (!target || target.value === currentRelatedTargetSentinel) {
      setValue(allowsCurrentTarget ? 'current' : 'selected')
      relatedTargetField.setValue(null)
      return
    }

    setValue('selected')
    relatedTargetField.setValue(target)
  }

  return (
    <div className="wkf-listing-condition__related-value" style={styles}>
      <RelationshipInput
        allowCreate
        allowEdit
        formatDisplayedOptions={allowsCurrentTarget ? prependCurrentRelatedTargetOption : undefined}
        hasMany={false}
        initialValue={selectedTarget}
        label={properties.field.label}
        onChange={handleChange}
        path={path}
        placeholder={allowsCurrentTarget ? 'Bieżący element' : 'Wybierz element'}
        readOnly={properties.readOnly}
        relationTo={isParentCondition ? ['pages', 'event-cycles'] : [...allListingSources]}
        required
        showError={showError}
        value={selectedTarget}
      />
    </div>
  )
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
  const relatedTargetModeValue = useFormFields(
    ([fields]) => fields[siblingPath(properties.path, 'relatedTargetMode')]?.value,
  )
  const taxonomyContext = useFormFields(([fields]) =>
    Boolean(getTaxonomyTemplateCollection(fields.templateKey?.value)),
  )
  if (!conditionField) return null

  const applicableSources = getApplicableListingSources(
    conditionField,
    sources,
    taxonomyContext && relatedTargetModeValue === 'current',
  )
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
      {conditionField === 'relatedTo' && relatedTargetModeValue === 'current'
        ? ' Bieżący element oznacza element, na którego stronie wyświetlany jest Listing.'
        : null}
    </p>
  )
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
