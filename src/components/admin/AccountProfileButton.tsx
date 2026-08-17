'use client'

import { Button, useAuth } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'

import type { User } from '@/payload-types'

function userIsMember(user: User | null | undefined): boolean {
  return Boolean(
    user?.roles?.some((role) => typeof role === 'object' && role !== null && role.key === 'member'),
  )
}

export function AccountProfileButton() {
  const { user } = useAuth<User>()
  const pathname = usePathname()

  if (pathname !== '/admin/account' || !userIsMember(user)) {
    return null
  }

  return (
    <Button buttonStyle="secondary" el="link" margin={false} size="medium" to="/admin/profile">
      Wizytówka publiczna
    </Button>
  )
}
