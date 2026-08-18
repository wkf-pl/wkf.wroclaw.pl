'use client'

import { useDocumentInfo, useForm, useFormFields, useServerFunctions } from '@payloadcms/ui'
import { useEffect, useRef } from 'react'

import type { EventCycle } from '@/payload-types'
import { getEventRelationshipID, mergeEventCycleDefaults } from '@/modules/events/defaults'

export function EventCycleDefaultsApplier() {
  const { docPermissions, getDocPreferences, isEditing } = useDocumentInfo()
  const { getData, replaceState, setModified } = useForm()
  const { getFormState } = useServerFunctions()
  const cycle = useFormFields(([fields]) => fields.cycle?.value)
  const appliedCycle = useRef<number | string | undefined>(undefined)

  useEffect(() => {
    const cycleID = getEventRelationshipID(cycle)
    if (isEditing || cycleID === undefined || String(cycleID) === String(appliedCycle.current)) {
      return
    }

    const controller = new AbortController()
    void fetch(`/api/event-cycles/${cycleID}?depth=0`, {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (response) => (response.ok ? ((await response.json()) as EventCycle) : null))
      .then(async (eventCycle) => {
        if (!eventCycle) return
        const data = mergeEventCycleDefaults(getData(), eventCycle)
        const result = await getFormState({
          collectionSlug: 'events',
          data,
          docPermissions,
          docPreferences: await getDocPreferences(),
          operation: 'create',
          renderAllFields: true,
          schemaPath: 'events',
          signal: controller.signal,
          skipValidation: true,
        })
        if (!('state' in result) || !result.state) {
          throw new Error('Unable to build the Event form state.')
        }

        replaceState(result.state)
        setModified(true)
        appliedCycle.current = cycleID
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('Unable to apply Event Cycle defaults.', error)
        }
      })

    return () => controller.abort()
  }, [
    cycle,
    docPermissions,
    getData,
    getDocPreferences,
    getFormState,
    isEditing,
    replaceState,
    setModified,
  ])

  return null
}
