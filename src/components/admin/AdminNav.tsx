import type { EntityToGroup } from '@payloadcms/ui/shared'
import type { NavPreferences, PayloadRequest, ServerProps } from 'payload'

import { Logout } from '@payloadcms/ui'
import { RenderServerComponent } from '@payloadcms/ui/elements/RenderServerComponent'
import { EntityType, groupNavItems } from '@payloadcms/ui/shared'
import React from 'react'
import { PREFERENCE_KEYS } from 'payload/shared'

import { AdminNavClient } from './AdminNavClient'
import { AdminNavHamburger, AdminNavWrapper } from './AdminNavChrome'

const baseClass = 'nav'
const desiredGroupOrder = ['Treści', 'Klubowe', 'Ustawienia strony', 'Administracja']

export type AdminNavProperties = {
  req?: PayloadRequest
} & ServerProps

export async function AdminNav(properties: AdminNavProperties) {
  const {
    documentSubViewType,
    i18n,
    locale,
    params,
    payload,
    permissions,
    req: _req,
    searchParams,
    user,
    viewType,
    visibleEntities,
  } = properties

  if (!payload?.config || !permissions || !visibleEntities) {
    return null
  }

  const {
    admin: {
      components: { afterNav, afterNavLinks, beforeNav, beforeNavLinks, logout, settingsMenu },
    },
    collections,
    globals,
  } = payload.config

  const groups = groupNavItems(
    [
      ...collections
        .filter(({ slug }) => visibleEntities.collections.includes(slug))
        .map(
          (collection) =>
            ({ type: EntityType.collection, entity: collection }) satisfies EntityToGroup,
        ),
      ...globals
        .filter(({ slug }) => visibleEntities.globals.includes(slug))
        .map((global) => ({ type: EntityType.global, entity: global }) satisfies EntityToGroup),
    ],
    permissions,
    i18n,
  )

  const orderedGroups = desiredGroupOrder.flatMap((label) => {
    const group = groups.find((candidate) => candidate.label === label)
    return group ? [group] : []
  })
  const remainingGroups = groups.filter((group) => !desiredGroupOrder.includes(group.label))
  const navPreferences = await getNavPreferences(_req)

  const logoutComponent = RenderServerComponent({
    clientProps: { documentSubViewType, viewType },
    Component: logout?.Button,
    Fallback: Logout,
    importMap: payload.importMap,
    serverProps: { i18n, locale, params, payload, permissions, searchParams, user },
  })
  const renderedSettingsMenu =
    settingsMenu && Array.isArray(settingsMenu)
      ? settingsMenu.map((item, index) =>
          RenderServerComponent({
            clientProps: { documentSubViewType, viewType },
            Component: item,
            importMap: payload.importMap,
            key: `settings-menu-item-${index}`,
            serverProps: { i18n, locale, params, payload, permissions, searchParams, user },
          }),
        )
      : []
  const renderComponent = (component: typeof beforeNav | typeof afterNav) =>
    RenderServerComponent({
      clientProps: { documentSubViewType, viewType },
      Component: component,
      importMap: payload.importMap,
      serverProps: { i18n, locale, params, payload, permissions, searchParams, user },
    })

  return (
    <AdminNavWrapper>
      {renderComponent(beforeNav)}
      <nav className={`${baseClass}__wrap`}>
        {renderComponent(beforeNavLinks)}
        <AdminNavClient
          groups={[...orderedGroups, ...remainingGroups]}
          navPreferences={navPreferences}
        />
        {renderComponent(afterNavLinks)}
        <div className={`${baseClass}__controls`}>
          {renderedSettingsMenu}
          {logoutComponent}
        </div>
      </nav>
      {renderComponent(afterNav)}
      <div className={`${baseClass}__header`}>
        <div className={`${baseClass}__header-content`}>
          <AdminNavHamburger />
        </div>
      </div>
    </AdminNavWrapper>
  )
}

async function getNavPreferences(request: PayloadRequest | undefined): Promise<NavPreferences> {
  if (!request?.user?.collection) {
    return { groups: {}, open: true }
  }

  const result = await request.payload.find({
    collection: 'payload-preferences',
    depth: 0,
    limit: 1,
    pagination: false,
    req: request,
    where: {
      and: [
        { key: { equals: PREFERENCE_KEYS.NAV } },
        { 'user.relationTo': { equals: request.user.collection } },
        { 'user.value': { equals: request.user.id } },
      ],
    },
  })

  return (result.docs[0]?.value as NavPreferences | undefined) ?? { groups: {}, open: true }
}
