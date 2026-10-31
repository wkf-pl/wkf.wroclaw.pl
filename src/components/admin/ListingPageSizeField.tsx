'use client'

import { NumberField, useField, useFormFields } from '@payloadcms/ui'
import type { NumberFieldClientProps } from 'payload'
import { useEffect, useRef } from 'react'

export function ListingPageSizeField(properties: NumberFieldClientProps) {
  const viewPath = properties.path.replace(/\.pageSize$/, '.view')
  const view = useFormFields(([fields]) => fields[viewPath]?.value)
  const { setValue, value } = useField<number>({ potentiallyStalePath: properties.path })
  const previousView = useRef(view)
  const isCarousel = view === 'carousel'

  useEffect(() => {
    if (previousView.current === view) return

    if (view === 'carousel' && value === 12) setValue(5)
    if (previousView.current === 'carousel' && view !== 'carousel' && value === 5) setValue(12)
    previousView.current = view
  }, [setValue, value, view])

  return (
    <NumberField
      {...properties}
      field={{
        ...properties.field,
        label: isCarousel ? 'Maksymalna liczba slajdów' : 'Elementy na stronę',
        max: isCarousel ? 20 : 100,
      }}
    />
  )
}
