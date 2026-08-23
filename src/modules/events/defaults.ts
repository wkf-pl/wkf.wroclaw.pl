import type { Data } from 'payload'

import type { EventCycle } from '@/payload-types'

export function getEventRelationshipID(value: unknown): number | string | undefined {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = value.id
    return typeof id === 'number' || typeof id === 'string' ? id : undefined
  }
  if (value && typeof value === 'object' && 'value' in value) {
    return getEventRelationshipID(value.value)
  }
  return undefined
}

function isEmpty(value: unknown): boolean {
  return (
    value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)
  )
}

function relationshipIDs(value: unknown): unknown {
  if (!Array.isArray(value)) return value
  return value.map((item) => getEventRelationshipID(item) ?? item)
}

function cloneWithoutInlineIDs(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneWithoutInlineIDs)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, nestedValue]) =>
      key === 'id' ? [] : [[key, cloneWithoutInlineIDs(nestedValue)]],
    ),
  )
}

function normalizeRelationshipRows(
  value: unknown,
  relationshipField: 'partner' | 'profile',
): unknown {
  if (!Array.isArray(value)) return value
  return value.map((item) => {
    if (!item || typeof item !== 'object' || !(relationshipField in item)) return item
    const row = { ...(item as Record<string, unknown>) }
    delete row.id
    return {
      ...row,
      [relationshipField]: getEventRelationshipID(row[relationshipField]) ?? row[relationshipField],
    }
  })
}

function normalizeLinkRows(value: unknown): unknown {
  if (!Array.isArray(value)) return value
  const relationshipFields = ['category', 'event', 'eventCycle', 'page', 'partner', 'tag'] as const

  return value.map((item) => {
    if (!item || typeof item !== 'object') return item
    const row = { ...(item as Record<string, unknown>) }
    delete row.id
    for (const field of relationshipFields) {
      row[field] = getEventRelationshipID(row[field]) ?? row[field]
    }
    return row
  })
}

function applyIfEmpty(data: Data, field: string, value: unknown): void {
  const currentValue = data[field]
  const isEmptyFormArray = Array.isArray(value) && currentValue === 0
  if ((isEmpty(currentValue) || isEmptyFormArray) && !isEmpty(value)) {
    data[field] = structuredClone(value)
  }
}

export function mergeEventCycleDefaults(currentData: Data, cycle: EventCycle): Data {
  const data = structuredClone(currentData)
  const defaults = cycle.eventDefaults

  applyIfEmpty(data, 'title', defaults.title)
  applyIfEmpty(data, 'heroImage', getEventRelationshipID(defaults.heroImage) ?? defaults.heroImage)
  applyIfEmpty(data, 'tagline', defaults.tagline)
  applyIfEmpty(data, 'excerpt', defaults.excerpt)
  applyIfEmpty(data, 'layout', cloneWithoutInlineIDs(defaults.layout))
  applyIfEmpty(data, 'categories', relationshipIDs(defaults.categories))
  applyIfEmpty(data, 'tags', relationshipIDs(defaults.tags))
  applyIfEmpty(data, 'timeMode', defaults.defaultTimeMode)
  applyIfEmpty(data, 'participation', defaults.participation)
  applyIfEmpty(data, 'capacityMode', defaults.capacityMode)
  applyIfEmpty(data, 'capacity', defaults.capacity)
  applyIfEmpty(data, 'organizers', normalizeRelationshipRows(defaults.organizers, 'profile'))
  applyIfEmpty(data, 'partners', normalizeRelationshipRows(defaults.partners, 'partner'))
  applyIfEmpty(data, 'externalLinks', normalizeLinkRows(defaults.externalLinks))

  const currentLocation =
    data.location && typeof data.location === 'object'
      ? (data.location as Record<string, unknown>)
      : {}
  const defaultLocation = defaults.location
  if (defaultLocation) {
    for (const [field, value] of Object.entries(defaultLocation)) {
      if (isEmpty(currentLocation[field]) && !isEmpty(value)) {
        currentLocation[field] = structuredClone(value)
      }
    }
  }
  data.location = currentLocation
  data.defaultsAppliedCycle = cycle.id

  return data
}
