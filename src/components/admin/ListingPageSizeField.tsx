'use client'

import { NumberField, useFormFields } from '@payloadcms/ui'
import type { NumberFieldClientProps } from 'payload'
import { getSharedListingViewId, resolveListingView } from '@/modules/content/listing-view'

export function ListingPageSizeField(properties: NumberFieldClientProps) {
  const viewPath = properties.path.replace(/\.pageSize$/, '.view')
  const view = useFormFields(([fields]) => fields[viewPath]?.value)
  const appearancePath = properties.path.replace(/\.pageSize$/, '.appearance')
  const appearance = useFormFields(([fields]) => fields[appearancePath]?.value)
  const shared = getSharedListingViewId(appearance)
  const resolved = resolveListingView(appearance, view)
  const legacyCarousel = !shared && resolved.legacy === 'carousel'
  const carousel = !shared && resolved.view.layout === 'carousel'

  return (
    <NumberField
      {...properties}
      field={{
        ...properties.field,
        label: carousel ? 'Limit wyników karuzeli' : 'Elementy na stronę',
        max: legacyCarousel ? 20 : 100,
      }}
    />
  )
}
