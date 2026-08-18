'use client'

import { TextField, useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'
import { useEffect, useRef } from 'react'

import { formatSlug } from '@/modules/content/slug'

export function AutoSlugField(properties: TextFieldClientProps) {
  const { isEditing } = useDocumentInfo()
  const title = useFormFields(([fields]) => fields.title?.value)
  const slug = useField<null | string>({ potentiallyStalePath: properties.path })
  const lastGeneratedSlug = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (isEditing || typeof title !== 'string' || !title.trim()) return

    const generatedSlug = formatSlug(title)
    if (!generatedSlug || (slug.value && slug.value !== lastGeneratedSlug.current)) return

    lastGeneratedSlug.current = generatedSlug
    if (slug.value !== generatedSlug) slug.setValue(generatedSlug)
  }, [isEditing, slug, title])

  return <TextField {...properties} />
}
