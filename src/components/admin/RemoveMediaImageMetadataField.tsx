'use client'

import { useField, useFormFields } from '@payloadcms/ui'
import type { CheckboxFieldClientComponent } from 'payload'
import { useEffect } from 'react'

import { isWebRasterImageMimeType } from '@/modules/media/media-categories'

import { BooleanSwitchField } from './BooleanSwitchField'

export const RemoveMediaImageMetadataField: CheckboxFieldClientComponent = (properties) => {
  const { path } = properties
  const file = useFormFields(([fields]) => fields.file?.value)
  const { value, setValue } = useField<boolean>({ path })
  const canRemoveMetadata =
    file instanceof File &&
    file.type !== 'image/avif' &&
    !/\.avif$/i.test(file.name) &&
    isWebRasterImageMimeType(file.type)

  useEffect(() => {
    if (file instanceof File) setValue(true, true)
  }, [file, setValue])

  if (!canRemoveMetadata) return null

  return <BooleanSwitchField {...properties} checked={value !== false} />
}
