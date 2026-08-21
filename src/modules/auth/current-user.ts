import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { cache } from 'react'

import config from '@payload-config'

import type { User } from '@/payload-types'

export const getCurrentUser = cache(async (): Promise<null | User> => {
  const requestHeaders = await headers()
  const payload = await getPayload({ config })
  const authentication = await payload.auth({ headers: requestHeaders })

  return authentication.user
})

export function normalizeLocalReturnPath(value: unknown, fallback = '/dokumenty'): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return fallback
  }

  return value
}
