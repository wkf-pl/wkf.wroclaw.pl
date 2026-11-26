'use client'

import { useAuth } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import {
  adminNoticeRefreshIntervalMs,
  type ActiveAdminNoticeResponse,
} from '@/modules/admin-notice/schedule'

const maximumTimeoutMs = 2_147_483_647

export function AdminNoticeBanner() {
  const { user } = useAuth()
  return user ? <AuthenticatedAdminNoticeBanner key={user.id} /> : null
}

function AuthenticatedAdminNoticeBanner() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | undefined
    let expirationTimer: ReturnType<typeof setTimeout> | undefined
    let request: AbortController | undefined
    let expiresAt = 0
    let stopped = false

    function hideNotice() {
      clearTimeout(expirationTimer)
      expiresAt = 0
      setMessage(null)
    }

    function scheduleExpiration() {
      const remainingMs = expiresAt - Date.now()
      if (remainingMs <= 0) {
        hideNotice()
        return
      }
      expirationTimer = setTimeout(scheduleExpiration, Math.min(remainingMs, maximumTimeoutMs))
    }

    async function refresh() {
      if (expiresAt && Date.now() >= expiresAt) hideNotice()
      if (request || document.hidden) return

      clearTimeout(refreshTimer)
      const controller = new AbortController()
      request = controller
      const requestTimeout = setTimeout(() => controller.abort(), 10_000)
      const requestStartedAt = Date.now()
      let refreshAfterMs: number | null = adminNoticeRefreshIntervalMs

      try {
        const response = await fetch('/api/globals/admin-notice/active', {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (stopped) return
        if (response.status === 401) {
          hideNotice()
          refreshAfterMs = null
          return
        }
        if (!response.ok) throw new Error('Unable to load the admin notice.')

        const result: ActiveAdminNoticeResponse = await response.json()
        if (stopped) return
        refreshAfterMs = result.refreshAfterMs
        if (!result.notice) {
          hideNotice()
        } else {
          // Treat time spent fetching as elapsed so a delayed response cannot prolong the notice.
          clearTimeout(expirationTimer)
          expiresAt = requestStartedAt + result.notice.expiresInMs
          setMessage(result.notice.message)
          scheduleExpiration()
        }
      } catch {
        // A transient failure leaves the last successful notice visible only until its deadline.
      } finally {
        clearTimeout(requestTimeout)
        request = undefined
        if (refreshAfterMs !== null && !stopped && !document.hidden) {
          const intervalRemainingMs = adminNoticeRefreshIntervalMs - (Date.now() - requestStartedAt)
          refreshTimer = setTimeout(
            refresh,
            Math.max(1, Math.min(refreshAfterMs, intervalRemainingMs)),
          )
        }
      }
    }

    void refresh()
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
      stopped = true
      request?.abort()
      clearTimeout(refreshTimer)
      clearTimeout(expirationTimer)
    }
  }, [])

  return (
    <div aria-live="polite" aria-atomic="true">
      {message && <p className="wkf-admin-notice">{message}</p>}
    </div>
  )
}
