'use client'

import { useConfig, useField } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { useEffect, useState } from 'react'

import { getFormRelationshipId } from '@/lib/relationships'
import type { EventCycle } from '@/payload-types'

export function EventCycleParentPath() {
  const { value } = useField<unknown>({ path: 'cycle' })
  const cycle = getFormRelationshipId(value)
  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()
  const [result, setResult] = useState<{ id: typeof cycle; path: string }>()

  useEffect(() => {
    if (cycle === undefined) return
    const controller = new AbortController()
    void (async () => {
      try {
        const url = formatAdminURL({ apiRoute: api, path: `/event-cycles/${cycle}`, serverURL })
        const response = await fetch(`${url}?depth=1&draft=true`, {
          signal: controller.signal,
        })
        if (!response.ok) return
        const document = (await response.json()) as EventCycle
        const page = typeof document.parent === 'object' ? document.parent : null
        const path = [page?.fullTitle || page?.title, document.title].filter(Boolean).join(' › ')
        if (!controller.signal.aborted) setResult({ id: cycle, path })
      } catch {
        // The cycle control still displays the selection if its path is inaccessible.
      }
    })()
    return () => controller.abort()
  }, [api, cycle, serverURL])

  return (
    <div className="field-type">
      <p className="field-label">Element nadrzędny</p>
      <p>{result?.id === cycle && result?.path ? result.path : 'Wybrany cykl'}</p>
    </div>
  )
}
