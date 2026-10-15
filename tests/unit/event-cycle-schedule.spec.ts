import { describe, expect, it } from 'vitest'

import {
  calculateNextEventDates,
  type EventCycleScheduleDefaults,
} from '@/modules/events/event-cycle-schedule'

const baseDefaults: EventCycleScheduleDefaults = {
  defaultDayCount: 1,
  defaultEndTime: '22:00',
  defaultStartTime: '18:00',
  recurrenceType: 'weekly',
  recurrenceWeekday: 'tuesday',
  weekInterval: 2,
}

describe('Event Cycle schedule', () => {
  it('leaves dates empty when the Cycle has no previous dated Event', () => {
    expect(calculateNextEventDates(undefined, baseDefaults)).toBeNull()
  })

  it('schedules every second Tuesday using Warsaw local time', () => {
    expect(calculateNextEventDates('2026-10-06T16:00:00.000Z', baseDefaults)).toEqual({
      endAt: '2026-10-20T20:00:00.000Z',
      startAt: '2026-10-20T16:00:00.000Z',
    })
  })

  it('keeps the configured local time across the daylight-saving transition', () => {
    expect(
      calculateNextEventDates('2026-03-28T17:00:00.000Z', {
        ...baseDefaults,
        recurrenceType: 'daily',
      }),
    ).toEqual({
      endAt: '2026-03-29T20:00:00.000Z',
      startAt: '2026-03-29T16:00:00.000Z',
    })
  })

  it('uses the last day of a shorter month for a missing configured date', () => {
    expect(
      calculateNextEventDates('2027-01-31T17:00:00.000Z', {
        ...baseDefaults,
        monthDay: 31,
        recurrenceType: 'monthlyDate',
      }),
    ).toEqual({
      endAt: '2027-02-28T21:00:00.000Z',
      startAt: '2027-02-28T17:00:00.000Z',
    })
  })

  it('schedules a weekday in the configured week of the following month', () => {
    expect(
      calculateNextEventDates('2026-10-13T16:00:00.000Z', {
        ...baseDefaults,
        recurrenceType: 'monthlyWeekday',
        weekOfMonth: 2,
      }),
    ).toEqual({
      endAt: '2026-11-10T21:00:00.000Z',
      startAt: '2026-11-10T17:00:00.000Z',
    })
  })

  it('places the end time on the last configured day', () => {
    expect(
      calculateNextEventDates('2026-10-06T16:00:00.000Z', {
        ...baseDefaults,
        defaultDayCount: 3,
      }),
    ).toEqual({
      endAt: '2026-10-22T20:00:00.000Z',
      startAt: '2026-10-20T16:00:00.000Z',
    })
  })

  it('does not impose an undocumented maximum event length', () => {
    expect(
      calculateNextEventDates('2026-10-06T16:00:00.000Z', {
        ...baseDefaults,
        defaultDayCount: 366,
      }),
    ).toEqual({
      endAt: '2027-10-20T20:00:00.000Z',
      startAt: '2026-10-20T16:00:00.000Z',
    })
  })
})
