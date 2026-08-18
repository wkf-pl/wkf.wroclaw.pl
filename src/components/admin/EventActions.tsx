'use client'

import { Button, useDocumentInfo, useOperation } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type CreateNextEventResponse = {
  doc?: { id?: number | string }
  message?: string
}

export function EventActions() {
  const { id, isEditing } = useDocumentInfo()
  const operation = useOperation()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  if (!isEditing || !id || operation === 'create') return null

  async function createNextEvent() {
    const startAt = window.prompt('Podaj początek następnego wydarzenia (RRRR-MM-DD GG:MM):')
    if (!startAt) return

    setIsCreating(true)
    try {
      const response = await fetch(`/api/events/${id}/next`, {
        body: JSON.stringify({ startAt }),
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = (await response.json()) as CreateNextEventResponse
      if (!response.ok || !result.doc?.id) {
        throw new Error(result.message || 'Nie udało się utworzyć następnego wydarzenia.')
      }
      router.push(`/admin/collections/events/${result.doc.id}`)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Nie udało się utworzyć wydarzenia.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Button buttonStyle="secondary" disabled={isCreating} onClick={createNextEvent} size="small">
      {isCreating ? 'Tworzenie…' : 'Dodaj następne'}
    </Button>
  )
}
