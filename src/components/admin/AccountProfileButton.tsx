'use client'

import { Button, useAuth } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'

import type { User } from '@/payload-types'
import { userHasRole } from '@/modules/membership/user-roles'

export function AccountProfileButton() {
  const { user } = useAuth<User>()
  const pathname = usePathname()

  if (pathname !== '/admin/account' || !userHasRole(user, 'member')) {
    return null
  }

  return (
    <Button buttonStyle="secondary" el="link" margin={false} size="medium" to="/admin/profile">
      Wizytówka publiczna
    </Button>
  )
}
