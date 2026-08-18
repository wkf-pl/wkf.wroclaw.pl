import { randomUUID } from 'node:crypto'

import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'

import { getEventRelationshipID, mergeEventCycleDefaults } from './defaults'

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

function cloneValue<T>(value: T): T {
  return value === undefined ? value : structuredClone(value)
}

export const applyEventCycleDefaults: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data

  const cycleID = getEventRelationshipID(data.cycle ?? originalDoc?.cycle)
  const appliedCycleID = getEventRelationshipID(
    data.defaultsAppliedCycle ?? originalDoc?.defaultsAppliedCycle,
  )
  if (cycleID === undefined || String(cycleID) === String(appliedCycleID)) return data

  const cycle = await req.payload.findByID({
    collection: 'event-cycles',
    depth: 0,
    id: cycleID,
    overrideAccess: true,
    req,
  })
  data = mergeEventCycleDefaults(data, cycle)

  if (
    data.startAt &&
    !data.endAt &&
    typeof cycle.eventDefaults.defaultDurationMinutes === 'number'
  ) {
    const start = new Date(String(data.startAt))
    if (!Number.isNaN(start.getTime())) {
      data.endAt = new Date(
        start.getTime() + cycle.eventDefaults.defaultDurationMinutes * 60_000,
      ).toISOString()
    }
  }

  return data
}

export const copyEventCycleContentToDefaults: CollectionBeforeValidateHook = ({
  data,
  operation,
}) => {
  if (!data || operation !== 'create') return data

  const eventDefaults =
    data.eventDefaults && typeof data.eventDefaults === 'object'
      ? (data.eventDefaults as Record<string, unknown>)
      : {}

  for (const field of ['title', 'heroImage', 'tagline', 'excerpt'] as const) {
    if (isEmpty(eventDefaults[field]) && !isEmpty(data[field])) {
      eventDefaults[field] = cloneValue(data[field])
    }
  }

  data.eventDefaults = eventDefaults
  return data
}

const calendarFields = ['title', 'startAt', 'endAt', 'timeMode', 'eventStatus', 'location'] as const

export const updateEventCalendarMetadata: CollectionBeforeChangeHook = ({
  data,
  operation,
  originalDoc,
}) => {
  if (operation === 'create' && !data.calendarUID) {
    data.calendarUID = `${randomUUID()}@wkf.wroclaw.pl`
  }

  if (data._status !== 'published') return data

  const calendarFingerprint = JSON.stringify(
    Object.fromEntries(calendarFields.map((field) => [field, data[field]])),
  )
  const calendarChanged =
    operation === 'create' || calendarFingerprint !== originalDoc?.calendarFingerprint

  if (calendarChanged) {
    data.calendarRevision = Number(originalDoc?.calendarRevision ?? 0) + 1
  }

  if (
    data.eventStatus === 'rescheduled' &&
    originalDoc?.publishedStartAt &&
    data.startAt !== originalDoc.publishedStartAt
  ) {
    data.previousStartAt = originalDoc.publishedStartAt
  }

  data.publishedStartAt = data.startAt
  data.calendarFingerprint = calendarFingerprint

  return data
}
