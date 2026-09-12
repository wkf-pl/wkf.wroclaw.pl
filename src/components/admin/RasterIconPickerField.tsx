'use client'

import { FieldError, FieldLabel, ReactSelect, useField } from '@payloadcms/ui'
import type { SelectFieldClientProps } from 'payload'
import type { HTMLAttributes, Ref } from 'react'

import { RasterIcon } from '@/components/RasterIcon'
import { isSelectableRasterIconName, rasterIconCategoryLabels } from '@/modules/icons/icon-registry'
import {
  matchesRasterIconSearch,
  rasterIconPickerOptions,
  type RasterIconPickerOption,
} from '@/modules/icons/icon-picker-options'

type IconOptionComponentProperties = {
  data: RasterIconPickerOption
  innerProps: HTMLAttributes<HTMLDivElement>
  innerRef: Ref<HTMLDivElement>
  isFocused: boolean
  isSelected: boolean
}

const groupedIconOptions = Object.entries(rasterIconCategoryLabels).map(([category, label]) => ({
  label,
  options: rasterIconPickerOptions
    .filter((option) => option.category === category)
    .sort((first, second) => first.label.localeCompare(second.label, 'pl')),
}))

function IconOptionComponent({
  data,
  innerProps,
  innerRef,
  isFocused,
  isSelected,
}: IconOptionComponentProperties) {
  return (
    <div
      {...innerProps}
      className={[
        'raster-icon-picker__option',
        isFocused ? 'raster-icon-picker__option--focused' : '',
        isSelected ? 'raster-icon-picker__option--selected' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      ref={innerRef}
    >
      <RasterIcon name={data.name} size="medium" />
      <span className="raster-icon-picker__option-copy">
        <strong>{data.label}</strong>
        <small>{data.name}</small>
      </span>
    </div>
  )
}

function IconSingleValue({ data }: { data: RasterIconPickerOption }) {
  return (
    <span className="raster-icon-picker__value">
      <RasterIcon name={data.name} size="medium" />
      <span>{data.label}</span>
      <small>{data.name}</small>
    </span>
  )
}

export function RasterIconPickerField(properties: SelectFieldClientProps) {
  const { errorMessage, path, setValue, showError, value } = useField<string>({
    potentiallyStalePath: properties.path,
  })
  const selectedOption = rasterIconPickerOptions.find((option) => option.value === value)
  const fieldId = `field-${path.replaceAll('.', '__')}`

  function handleChange(option: unknown) {
    if (Array.isArray(option) || !option || typeof option !== 'object' || !('value' in option)) {
      return
    }

    if (isSelectableRasterIconName(option.value)) {
      setValue(option.value)
    }
  }

  return (
    <div className="field-type raster-icon-picker" id={fieldId}>
      <FieldLabel label={properties.field.label} path={path} required={properties.field.required} />
      <ReactSelect
        components={{ Option: IconOptionComponent, SingleValue: IconSingleValue }}
        disabled={properties.readOnly}
        filterOption={({ data }, search) =>
          matchesRasterIconSearch(data as RasterIconPickerOption, search)
        }
        inputId={path}
        isClearable={false}
        isSearchable
        noOptionsMessage={() => 'Nie znaleziono ikony.'}
        onChange={handleChange}
        options={groupedIconOptions}
        placeholder="Wyszukaj ikonę po nazwie…"
        showError={showError}
        value={selectedOption}
      />
      <FieldError message={errorMessage} path={path} showError={showError} />
    </div>
  )
}
