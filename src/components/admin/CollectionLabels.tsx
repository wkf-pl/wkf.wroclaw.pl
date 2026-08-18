'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useEffect } from 'react'

function useCreateLabel(collectionSlug: string, label: string) {
  const { isEditing } = useDocumentInfo()

  useEffect(() => {
    if (isEditing) return

    const createLabel = document.querySelector<HTMLElement>(
      `.collection-edit--${collectionSlug} .doc-controls__meta .doc-controls__value`,
    )

    if (createLabel) createLabel.textContent = label
  }, [collectionSlug, isEditing, label])
}

export function EventCycleCreateLabel() {
  useCreateLabel('event-cycles', 'Tworzenie nowego Cyklu wydarzeń')
  return null
}

export function EventCreateLabel() {
  useCreateLabel('events', 'Tworzenie nowego Wydarzenia')
  return null
}

export function PartnerCreateLabel() {
  useCreateLabel('partners', 'Tworzenie nowego Partnera')
  return null
}
