'use client'

import { useDocumentInfo, useField, useFormFields } from '@payloadcms/ui'
import { useEffect, useRef } from 'react'

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

type FieldBinding = {
  setValue: (value: unknown) => void
  value: unknown
}

function valuesEqual(first: unknown, second: unknown): boolean {
  if (Object.is(first, second)) return true
  if (first === undefined || second === undefined) return false
  try {
    return JSON.stringify(first) === JSON.stringify(second)
  } catch {
    return false
  }
}

export function EventCycleDefaultsMirror() {
  const { isEditing } = useDocumentInfo()
  const title = useFormFields(([fields]) => fields.title?.value)
  const heroImage = useFormFields(([fields]) => fields.heroImage?.value)
  const tagline = useFormFields(([fields]) => fields.tagline?.value)
  const excerpt = useFormFields(([fields]) => fields.excerpt?.value)
  const defaultTitle = useField<unknown>({ potentiallyStalePath: 'eventDefaults.title' })
  const defaultHeroImage = useField<unknown>({ potentiallyStalePath: 'eventDefaults.heroImage' })
  const defaultTagline = useField<unknown>({ potentiallyStalePath: 'eventDefaults.tagline' })
  const defaultExcerpt = useField<unknown>({ potentiallyStalePath: 'eventDefaults.excerpt' })
  const lastMirroredValues = useRef<Record<string, unknown>>({})

  useEffect(() => {
    if (isEditing) return

    const mirror = (name: string, source: unknown, destination: FieldBinding) => {
      const lastMirroredValue = lastMirroredValues.current[name]
      if (
        !isEmpty(source) &&
        (isEmpty(destination.value) || valuesEqual(destination.value, lastMirroredValue))
      ) {
        if (!valuesEqual(destination.value, source)) destination.setValue(source)
        lastMirroredValues.current[name] = source
      }
    }

    mirror('title', title, defaultTitle)
    mirror('heroImage', heroImage, defaultHeroImage)
    mirror('tagline', tagline, defaultTagline)
    mirror('excerpt', excerpt, defaultExcerpt)
  }, [
    defaultExcerpt,
    defaultHeroImage,
    defaultTagline,
    defaultTitle,
    excerpt,
    heroImage,
    isEditing,
    tagline,
    title,
  ])

  return null
}
