export const adminNoticeRefreshIntervalMs = 60_000

type AdminNoticeSchedule = {
  enabled?: boolean | null
  message?: string | null
  startsAt?: string | null
  endsAt?: string | null
}

export type ActiveAdminNoticeResponse = {
  notice: { message: string; expiresInMs: number } | null
  refreshAfterMs: number
}

export function parseNoticeTimestamp(value: unknown): number {
  return typeof value === 'string' ? Date.parse(value) : Number.NaN
}

export function getActiveAdminNotice(
  settings: AdminNoticeSchedule,
  now: number,
): ActiveAdminNoticeResponse {
  const inactive = { notice: null, refreshAfterMs: adminNoticeRefreshIntervalMs }
  const message = settings.message?.trim()
  if (!settings.enabled || !message || !settings.startsAt || !settings.endsAt) return inactive

  const startsAt = parseNoticeTimestamp(settings.startsAt)
  const endsAt = parseNoticeTimestamp(settings.endsAt)
  if (
    !Number.isFinite(startsAt) ||
    !Number.isFinite(endsAt) ||
    endsAt <= startsAt ||
    now >= endsAt
  ) {
    return inactive
  }

  if (now < startsAt) {
    return { ...inactive, refreshAfterMs: Math.min(startsAt - now, adminNoticeRefreshIntervalMs) }
  }

  const expiresInMs = endsAt - now
  return {
    notice: { message, expiresInMs },
    refreshAfterMs: Math.min(expiresInMs, adminNoticeRefreshIntervalMs),
  }
}
