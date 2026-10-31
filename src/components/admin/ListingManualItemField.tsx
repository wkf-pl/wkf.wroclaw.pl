'use client'

import { FieldLabel, ReactSelect, RelationshipField, useField } from '@payloadcms/ui'
import type { RelationshipFieldClientProps } from 'payload'
import type { CSSProperties } from 'react'
import { useState } from 'react'

import {
  allListingSources,
  listingSourceSingularLabels,
  type ContentListingSource,
} from '@/modules/content/listing-conditions'

const listingSourceOptions: Array<{ label: string; value: ContentListingSource }> =
  allListingSources.map((source) => ({
    label: listingSourceSingularLabels[source],
    value: source,
  }))

type ListingItemValue = {
  relationTo?: unknown
}

function getListingSource(value: unknown): ContentListingSource | undefined {
  if (!value || typeof value !== 'object' || !('relationTo' in value)) return undefined

  const relationTo = (value as ListingItemValue).relationTo
  return listingSourceOptions.some((option) => option.value === relationTo)
    ? (relationTo as ContentListingSource)
    : undefined
}

function getSelectedOption(value: ContentListingSource) {
  return listingSourceOptions.find((option) => option.value === value) ?? listingSourceOptions[0]
}

export function ListingManualItemField(properties: RelationshipFieldClientProps) {
  const { setValue, value } = useField<unknown>({ potentiallyStalePath: properties.path })
  const relatedSource = getListingSource(value)
  const [selectedSource, setSelectedSource] = useState<ContentListingSource>(
    relatedSource ?? listingSourceOptions[0].value,
  )
  const activeSource = relatedSource ?? selectedSource

  function handleSourceChange(option: unknown) {
    if (Array.isArray(option) || !option || typeof option !== 'object' || !('value' in option)) {
      return
    }

    const nextSource = option.value
    if (!listingSourceOptions.some((sourceOption) => sourceOption.value === nextSource)) return

    const normalizedSource = nextSource as ContentListingSource
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
