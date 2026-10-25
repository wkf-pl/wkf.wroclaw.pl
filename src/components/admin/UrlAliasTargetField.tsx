'use client'

import { FieldLabel, ReactSelect, RelationshipField, useField } from '@payloadcms/ui'
import type { RelationshipFieldClientProps } from 'payload'
import type { CSSProperties } from 'react'
import { useState } from 'react'

import type { UrlAliasTargetCollection } from '@/modules/url-aliases/url-aliases'

const targetTypeOptions: Array<{ label: string; value: UrlAliasTargetCollection }> = [
  { label: 'Strona', value: 'pages' },
  { label: 'Wpis', value: 'posts' },
  { label: 'Wydarzenie', value: 'events' },
  { label: 'Cykl wydarzeń', value: 'event-cycles' },
  { label: 'Partner', value: 'partners' },
  { label: 'Kategoria', value: 'categories' },
  { label: 'Tag', value: 'tags' },
  { label: 'Dokument', value: 'documents' },
]

type UrlAliasTargetValue = {
  relationTo?: unknown
}

function getTargetType(value: unknown): UrlAliasTargetCollection | undefined {
  if (!value || typeof value !== 'object' || !('relationTo' in value)) return undefined

  const relationTo = (value as UrlAliasTargetValue).relationTo
  return targetTypeOptions.some((option) => option.value === relationTo)
    ? (relationTo as UrlAliasTargetCollection)
    : undefined
}

function getSelectedOption(value: UrlAliasTargetCollection) {
  return targetTypeOptions.find((option) => option.value === value) ?? targetTypeOptions[0]
}

export function UrlAliasTargetField(properties: RelationshipFieldClientProps) {
  const { setValue, value } = useField<unknown>({ potentiallyStalePath: properties.path })
  const relatedTargetType = getTargetType(value)
  const [selectedTargetType, setSelectedTargetType] = useState<UrlAliasTargetCollection>(
    relatedTargetType ?? targetTypeOptions[0].value,
  )
  const activeTargetType = relatedTargetType ?? selectedTargetType

  function handleTargetTypeChange(option: unknown) {
    if (Array.isArray(option) || !option || typeof option !== 'object' || !('value' in option)) {
      return
    }

    const nextTargetType = option.value
    if (!targetTypeOptions.some((targetTypeOption) => targetTypeOption.value === nextTargetType)) {
      return
    }

    const normalizedTargetType = nextTargetType as UrlAliasTargetCollection
    setSelectedTargetType(normalizedTargetType)
    if (relatedTargetType !== normalizedTargetType) setValue(null)
  }

  const rowStyle = {
    '--field-width': properties.field.admin?.width ?? '100%',
  } as CSSProperties
  const typeFieldStyle = { '--field-width': '50%' } as CSSProperties
  const targetField = {
    ...properties.field,
    admin: {
      ...properties.field.admin,
      width: '50%',
    },
    label: 'Cel',
    relationTo: [activeTargetType],
  }

  return (
    <div className="field-type row wkf-url-alias-target" style={rowStyle}>
      <div className="row__fields">
        <div className="field-type select" style={typeFieldStyle}>
          <FieldLabel label="Typ" path={`${properties.path}__relationTo`} required />
          <ReactSelect
            disabled={properties.readOnly}
            inputId={`${properties.path}__relationTo`}
            isClearable={false}
            isSearchable={false}
            onChange={handleTargetTypeChange}
            options={targetTypeOptions}
            value={getSelectedOption(activeTargetType)}
          />
        </div>
        <RelationshipField {...properties} field={targetField} key={activeTargetType} />
      </div>
    </div>
  )
}
