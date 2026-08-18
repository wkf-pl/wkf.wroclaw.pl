'use client'

import { Button, useDocumentInfo, useOperation } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type CreateEventResponse = {
  doc?: { id?: number | string }
  message?: string
}

export function EventCycleActions() {
  const { id, isEditing } = useDocumentInfo()
  const operation = useOperation()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  if (!isEditing || !id || operation === 'create') return null

  async function createEvent() {
    setIsCreating(true)
    try {
      const response = await fetch(`/api/event-cycles/${id}/create-event`, {
        credentials: 'include',
        method: 'POST',
      })
      const result = (await response.json()) as CreateEventResponse
      if (!response.ok || !result.doc?.id) {
        throw new Error(result.message || 'Nie udało się utworzyć wydarzenia.')
      }
      router.push(`/admin/collections/events/${result.doc.id}`)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Nie udało się utworzyć wydarzenia.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Button buttonStyle="secondary" disabled={isCreating} onClick={createEvent} size="small">
      {isCreating ? 'Tworzenie…' : 'Dodaj kolejne Wydarzenie'}
    </Button>
  )
}
