'use client'

import { FieldLabel, ReactSelect } from '@payloadcms/ui'
import { useId } from 'react'

import styles from './ListingViewField.module.css'

export function ListingViewSelect({
  label,
  options,
  value,
  onChange,
  inherited,
  placeholder,
  readOnly,
}: {
  label: string
  options: Record<string, string>
  value?: string | number
  onChange: (value: string) => void
  inherited?: string | number
  placeholder?: string
  readOnly?: boolean
}) {
  const inputId = useId()
  const selectOptions = Object.entries(options).map(([option, text]) => ({
    label: text,
    value: option,
  }))

  return (
    <div className={`field-type select ${styles.control}`}>
      <FieldLabel htmlFor={inputId} label={label} />
      <ReactSelect
        disabled={readOnly}
        inputId={inputId}
        isClearable={false}
        isSearchable={false}
        options={selectOptions}
        placeholder={placeholder}
        value={selectOptions.find((option) => option.value === String(value ?? inherited ?? ''))}
        onChange={(option) => {
          if (
            readOnly ||
            !option ||
            Array.isArray(option) ||
            typeof option !== 'object' ||
            !('value' in option)
          )
            return
          if (typeof option.value === 'string') onChange(option.value)
        }}
      />
    </div>
  )
}
