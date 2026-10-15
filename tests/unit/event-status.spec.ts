import { describe, expect, it } from 'vitest'

import { resolveEventStatus } from '@/modules/events/event-status'

describe('automatic Event status', () => {
  const now = new Date('2026-10-15T18:00:00.000Z')

  it.each(['scheduled', 'rescheduled'] as const)(
    'marks an ended %s Event as completed',
    (eventStatus) => {
      expect(resolveEventStatus(eventStatus, { endAt: '2026-10-15T17:59:59.999Z' }, now)).toBe(
        'completed',
      )
    },
  )

  it('keeps an active Event status until its end', () => {
    expect(resolveEventStatus('scheduled', { endAt: '2026-10-15T18:00:00.001Z' }, now)).toBe(
      'scheduled',
    )
  })

  it.each(['cancelled', 'postponed', 'completed'] as const)(
    'does not overwrite the %s status',
    (eventStatus) => {
      expect(resolveEventStatus(eventStatus, { endAt: '2026-10-15T17:59:59.999Z' }, now)).toBe(
        eventStatus,
      )
    },
  )

  it('does not infer completion without a valid end date', () => {
    expect(resolveEventStatus('scheduled', {}, now)).toBe('scheduled')
    expect(resolveEventStatus('scheduled', { endAt: 'invalid' }, now)).toBe('scheduled')
  })
})
