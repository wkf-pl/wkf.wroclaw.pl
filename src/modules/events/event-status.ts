import type { FieldHook } from 'payload'

import type { EventStatus } from './constants'

type EventTiming = {
  endAt?: null | string
}

type EventStatusDocument = EventTiming & {
  id: number | string
}

const automaticallyCompletedStatuses = new Set<EventStatus>(['scheduled', 'rescheduled'])

export function resolveEventStatus(
  eventStatus: EventStatus,
  event: EventTiming,
  now = new Date(),
): EventStatus {
  if (!automaticallyCompletedStatuses.has(eventStatus) || !event.endAt) return eventStatus

  const endTimestamp = new Date(event.endAt).getTime()
  if (!Number.isFinite(endTimestamp) || endTimestamp > now.getTime()) return eventStatus

  return 'completed'
}

export const resolveEventStatusField: FieldHook<
  EventStatusDocument,
  EventStatus | undefined,
  EventTiming
> = ({ siblingData, value }) =>
  value === undefined ? value : resolveEventStatus(value, siblingData)
