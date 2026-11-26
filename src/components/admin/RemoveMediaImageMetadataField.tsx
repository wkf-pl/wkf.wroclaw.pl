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
  const isImage = file instanceof File && isWebRasterImageMimeType(file.type)

  useEffect(() => {
    if (file instanceof File) setValue(true, true)
  }, [file, setValue])

  if (!isImage) return null

  return <BooleanSwitchField {...properties} checked={value !== false} />
}
