import { describe, expect, it } from 'vitest'

import { adminNoticeRefreshIntervalMs, getActiveAdminNotice } from '@/modules/admin-notice/schedule'

const schedule = {
  enabled: true,
  message: 'Przerwa serwisowa',
  startsAt: '2026-07-18T20:00:00+02:00',
  endsAt: '2026-07-18T20:01:00+02:00',
}
const startsAt = Date.parse(schedule.startsAt)
const endsAt = Date.parse(schedule.endsAt)

describe('administrative notice schedule', () => {
  it('does not expose disabled, incomplete or invalid notices', () => {
    for (const settings of [
      { ...schedule, enabled: false },
      { ...schedule, message: '  ' },
      { ...schedule, endsAt: null },
      { ...schedule, endsAt: 'invalid' },
      { ...schedule, endsAt: schedule.startsAt },
    ]) {
      expect(getActiveAdminNotice(settings, startsAt)).toEqual({
        notice: null,
        refreshAfterMs: adminNoticeRefreshIntervalMs,
      })
    }
  })

  it('includes the start instant and excludes the end instant', () => {
    expect(getActiveAdminNotice(schedule, startsAt - 1)).toEqual({
      notice: null,
      refreshAfterMs: 1,
    })
    expect(getActiveAdminNotice(schedule, startsAt)).toEqual({
      notice: { message: schedule.message, expiresInMs: 60_000 },
      refreshAfterMs: 60_000,
    })
    expect(getActiveAdminNotice(schedule, endsAt - 1)).toEqual({
      notice: { message: schedule.message, expiresInMs: 1 },
      refreshAfterMs: 1,
    })
    expect(getActiveAdminNotice(schedule, endsAt)).toEqual({
      notice: null,
      refreshAfterMs: adminNoticeRefreshIntervalMs,
    })
  })

  it('rechecks distant schedules within one refresh interval', () => {
    expect(getActiveAdminNotice(schedule, startsAt - 360_000).refreshAfterMs).toBe(
      adminNoticeRefreshIntervalMs,
    )
    expect(
      getActiveAdminNotice({ ...schedule, endsAt: '2026-07-18T23:00:00+02:00' }, startsAt)
        .refreshAfterMs,
    ).toBe(adminNoticeRefreshIntervalMs)
  })
})
