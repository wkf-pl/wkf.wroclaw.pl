'use client'

import { FieldLabel, ReactSelect, RelationshipField, useField } from '@payloadcms/ui'
import type { RelationshipFieldClientProps } from 'payload'
import type { CSSProperties } from 'react'
import { useState } from 'react'

type ListingSource = 'event-cycles' | 'events' | 'pages' | 'posts'

const listingSourceOptions: Array<{ label: string; value: ListingSource }> = [
  { label: 'Strona', value: 'pages' },
  { label: 'Wpis', value: 'posts' },
  { label: 'Wydarzenie', value: 'events' },
  { label: 'Cykl wydarzeń', value: 'event-cycles' },
]

type ListingItemValue = {
  relationTo?: unknown
}

function getListingSource(value: unknown): ListingSource | undefined {
  if (!value || typeof value !== 'object' || !('relationTo' in value)) return undefined

  const relationTo = (value as ListingItemValue).relationTo
  return listingSourceOptions.some((option) => option.value === relationTo)
    ? (relationTo as ListingSource)
    : undefined
}

function getSelectedOption(value: ListingSource) {
  return listingSourceOptions.find((option) => option.value === value) ?? listingSourceOptions[0]
}

export function ListingManualItemField(properties: RelationshipFieldClientProps) {
  const { setValue, value } = useField<unknown>({ potentiallyStalePath: properties.path })
  const relatedSource = getListingSource(value)
  const [selectedSource, setSelectedSource] = useState<ListingSource>(
    relatedSource ?? listingSourceOptions[0].value,
  )
  const activeSource = relatedSource ?? selectedSource

  function handleSourceChange(option: unknown) {
    if (Array.isArray(option) || !option || typeof option !== 'object' || !('value' in option)) {
      return
    }

    const nextSource = option.value
    if (!listingSourceOptions.some((sourceOption) => sourceOption.value === nextSource)) return

    const normalizedSource = nextSource as ListingSource
    setSelectedSource(normalizedSource)
    if (relatedSource !== normalizedSource) setValue(null)
  }

  const typeFieldStyle = { '--field-width': '50%' } as CSSProperties
  const targetField = {
    ...properties.field,
    admin: {
      ...properties.field.admin,
      width: '50%',
    },
    label: 'Cel',
    relationTo: [activeSource],
  }

  return (
    <div className="field-type row wkf-listing-manual-item">
      <div className="row__fields">
        <div className="field-type select" style={typeFieldStyle}>
          <FieldLabel label="Typ treści" path={`${properties.path}__relationTo`} required />
          <ReactSelect
            disabled={properties.readOnly}
            inputId={`${properties.path}__relationTo`}
            isClearable={false}
            isSearchable={false}
            onChange={handleSourceChange}
            options={listingSourceOptions}
            value={getSelectedOption(activeSource)}
          />
        </div>
        <RelationshipField {...properties} field={targetField} key={activeSource} />
      </div>
    </div>
  )
}
