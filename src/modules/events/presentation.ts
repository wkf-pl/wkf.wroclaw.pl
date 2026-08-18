import type { Event } from '@/payload-types'

import { eventStatusOptions, partnerRoleOptions } from './constants'

const dateFormatter = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'long',
  timeZone: 'Europe/Warsaw',
})
const timeFormatter = new Intl.DateTimeFormat('pl-PL', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Warsaw',
})

export function formatEventDate(event: Pick<Event, 'endAt' | 'startAt' | 'timeMode'>): string {
  const start = new Date(event.startAt)
  const startDate = dateFormatter.format(start)
  if (!event.endAt) {
    return event.timeMode === 'allDay'
      ? `${startDate}, cały dzień`
      : `${startDate}, od ${timeFormatter.format(start)}`
  }

  const end = new Date(event.endAt)
  const endDate = dateFormatter.format(end)
  if (startDate === endDate) {
    return event.timeMode === 'allDay'
      ? `${startDate}, cały dzień`
      : `${startDate}, ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`
  }

  return event.timeMode === 'allDay'
    ? `${startDate} - ${endDate}`
    : `${startDate}, ${timeFormatter.format(start)} - ${endDate}, ${timeFormatter.format(end)}`
}

export function getEventStatusLabel(status: Event['eventStatus']): string {
  return eventStatusOptions.find((option) => option.value === status)?.label ?? status
}

export function getPartnerRoleLabel(
  role: NonNullable<Event['partners']>[number]['roles'][number],
): string {
  return partnerRoleOptions.find((option) => option.value === role)?.label ?? role
}
