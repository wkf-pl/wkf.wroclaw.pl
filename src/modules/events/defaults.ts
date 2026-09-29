import type { Data } from 'payload'

import type { EventCycle } from '@/payload-types'
import { getFormRelationshipId } from '@/lib/relationships'
import { isRichTextEmpty } from '@/modules/content/rich-text'

function isEmpty(value: unknown): boolean {
  return (
    value === undefined || value === null || value === '' || (Array.isArray(value) && !value.length)
  )
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
      [relationshipField]: getFormRelationshipId(row[relationshipField]) ?? row[relationshipField],
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
      row[field] = getFormRelationshipId(row[field]) ?? row[field]
    }
    return row
  })
}

function applyIfEmpty(data: Data, field: string, value: unknown): void {
  const currentValue = data[field]
  const isEmptyFormArray = Array.isArray(value) && currentValue === 0
  const isEmptyRichText = field === 'excerpt' && isRichTextEmpty(currentValue)
  const hasRichTextValue = field !== 'excerpt' || !isRichTextEmpty(value)
  if (
    (isEmpty(currentValue) || isEmptyFormArray || isEmptyRichText) &&
    !isEmpty(value) &&
    hasRichTextValue
  ) {
    data[field] = structuredClone(value)
  }
}

export function mergeEventCycleDefaults(currentData: Data, cycle: EventCycle): Data {
  const data = structuredClone(currentData)
  const defaults = cycle.eventDefaults

  applyIfEmpty(data, 'title', defaults.title)
  applyIfEmpty(data, 'eventType', getFormRelationshipId(defaults.eventType) ?? defaults.eventType)
  applyIfEmpty(data, 'heroImage', getFormRelationshipId(defaults.heroImage) ?? defaults.heroImage)
  applyIfEmpty(data, 'excerpt', defaults.excerpt)
  applyIfEmpty(data, 'layout', cloneWithoutInlineIDs(defaults.layout))
  applyIfEmpty(data, 'category', getFormRelationshipId(defaults.category) ?? defaults.category)
  applyIfEmpty(
    data,
    'tags',
    defaults.tags?.map((item) => getFormRelationshipId(item) ?? item),
  )
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
