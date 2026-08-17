'use client'

import { SelectField, useFormFields } from '@payloadcms/ui'
import type { Option, SelectFieldClientProps } from 'payload'
import { useMemo } from 'react'

function getOptionValue(option: Option): string {
  return typeof option === 'string' ? option : option.value
}

export function PermissionResourceField(properties: SelectFieldClientProps) {
  const currentValue = properties.value
  const arrayPath = properties.path.replace(/\.\d+\.resource$/, '')
  const selectedResources = useFormFields(([fields]) =>
    Object.entries(fields)
      .filter(
        ([path, field]) =>
          path.startsWith(`${arrayPath}.`) &&
          path.endsWith('.resource') &&
          typeof field.value === 'string',
      )
      .map(([, field]) => String(field.value)),
  )
  const options = useMemo(
    () =>
      properties.field.options.filter((option) => {
        const value = getOptionValue(option)
        return value === currentValue || !selectedResources.includes(value)
      }),
    [currentValue, properties.field.options, selectedResources],
  )

  return <SelectField {...properties} field={{ ...properties.field, options }} />
}
