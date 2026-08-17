'use client'

import type { groupNavItems } from '@payloadcms/ui/shared'
import type { NavPreferences } from 'payload'

import { getTranslation } from '@payloadcms/translations'
import { Link, NavGroup, useAuth, useConfig, useTranslation } from '@payloadcms/ui'
import { EntityType } from '@payloadcms/ui/shared'
import { usePathname } from 'next/navigation.js'
import { formatAdminURL } from 'payload/shared'
import React, { Fragment } from 'react'

import type { User } from '@/payload-types'

const baseClass = 'nav'

export function AdminNavClient({
  groups,
  navPreferences,
}: {
  groups: ReturnType<typeof groupNavItems>
  navPreferences: NavPreferences
}) {
  const pathname = usePathname()
  const { user } = useAuth<User>()
  const {
    config: {
      admin: {
        routes: { account: accountRoute },
      },
      routes: { admin: adminRoute },
    },
  } = useConfig()
  const { i18n } = useTranslation()
  const hasMemberRole = Boolean(
    user?.roles?.some((role) => typeof role === 'object' && role !== null && role.key === 'member'),
  )

  return (
    <Fragment>
      {groups.map(({ entities, label }, key) => (
        <NavGroup isOpen={navPreferences?.groups?.[label]?.open} key={key} label={label}>
          {entities.map(({ slug, type, label: entityLabel }, index) => {
            const href = formatAdminURL({
              adminRoute,
              path: type === EntityType.collection ? `/collections/${slug}` : `/globals/${slug}`,
            })
            return (
              <AdminNavLink
                href={href}
                id={type === EntityType.collection ? `nav-${slug}` : `nav-global-${slug}`}
                isActive={isActivePath(pathname, href)}
                isExact={pathname === href}
                key={index}
                label={getTranslation(entityLabel, i18n)}
              />
            )
          })}
        </NavGroup>
      ))}
      <NavGroup label="Użytkownik">
        <AdminNavLink
          href={formatAdminURL({ adminRoute, path: accountRoute })}
          id="nav-account"
          isActive={isActivePath(pathname, formatAdminURL({ adminRoute, path: accountRoute }))}
          isExact={pathname === formatAdminURL({ adminRoute, path: accountRoute })}
          label="Konto"
        />
        {hasMemberRole ? (
          <AdminNavLink
            href={formatAdminURL({ adminRoute, path: '/profile' })}
            id="nav-profile"
            isActive={isActivePath(pathname, formatAdminURL({ adminRoute, path: '/profile' }))}
            isExact={pathname === formatAdminURL({ adminRoute, path: '/profile' })}
            label="Wizytówka"
          />
        ) : null}
      </NavGroup>
    </Fragment>
  )
}

function AdminNavLink({
  href,
  id,
  isActive,
  isExact,
  label,
}: {
  href: string
  id: string
  isActive: boolean
  isExact: boolean
  label: string
}) {
  const content = (
    <>
      {isActive && <div className={`${baseClass}__link-indicator`} />}
      <span className={`${baseClass}__link-label`}>{label}</span>
    </>
  )

  if (isExact) {
    return (
      <div className={`${baseClass}__link`} id={id}>
        {content}
      </div>
    )
  }

  return (
    <Link className={`${baseClass}__link`} href={href} id={id} prefetch={false}>
      {content}
    </Link>
  )
}

function isActivePath(pathname: string, href: string) {
  return pathname.startsWith(href) && ['/', undefined].includes(pathname[href.length])
}
