'use client'

import { Popup, PopupList, useAuth, useConfig } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { formatAdminURL } from 'payload/shared'
import { useState } from 'react'

import type { User } from '@/payload-types'

export function UserMenu() {
  const { logOut, user } = useAuth<User>()
  const {
    config: {
      admin: {
        routes: { account: accountRoute, login: loginRoute },
      },
      routes: { admin: adminRoute },
    },
  } = useConfig()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const userName = user?.displayName?.trim() || user?.email || 'Konto'
  const accountURL = formatAdminURL({ adminRoute, path: accountRoute })
  const loginURL = formatAdminURL({ adminRoute, path: loginRoute })
  const profileURL = formatAdminURL({ adminRoute, path: '/profile' })
  const hasMemberRole = Boolean(
    user?.roles?.some((role) => typeof role === 'object' && role !== null && role.key === 'member'),
  )

  async function handleLogOut() {
    if (isLoggingOut) {
      return
    }

    setIsLoggingOut(true)
    await logOut()
    router.replace(loginURL)
    router.refresh()
  }

  return (
    <Popup
      button={<span className="wkf-user-menu__label">{userName}</span>}
      buttonClassName="wkf-user-menu__trigger"
      buttonType="default"
      horizontalAlign="right"
      id="wkf-user-menu"
      portalClassName="wkf-user-menu__popup"
      size="small"
    >
      <PopupList.ButtonGroup>
        <PopupList.Button href={accountURL}>Konto</PopupList.Button>
        {hasMemberRole ? <PopupList.Button href={profileURL}>Wizytówka</PopupList.Button> : null}
        <PopupList.Divider />
        <PopupList.Button disabled={isLoggingOut} onClick={() => void handleLogOut()}>
          {isLoggingOut ? 'Wylogowywanie…' : 'Wyloguj'}
        </PopupList.Button>
      </PopupList.ButtonGroup>
    </Popup>
  )
}
