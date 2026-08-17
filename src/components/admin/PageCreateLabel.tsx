'use client'

import { useDocumentInfo } from '@payloadcms/ui'
import { useEffect } from 'react'

export function PageCreateLabel() {
  const { isEditing } = useDocumentInfo()

  useEffect(() => {
    if (isEditing) {
      return
    }

    const createLabel = document.querySelector<HTMLElement>(
      '.collection-edit--pages .doc-controls__meta .doc-controls__value',
    )

    if (createLabel) {
      createLabel.textContent = 'Tworzenie nowej Strony'
    }
  }, [isEditing])

  return null
}
