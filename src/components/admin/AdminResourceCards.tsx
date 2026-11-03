import type { ClientUser, WidgetServerProps } from 'payload'

import { getTranslation } from '@payloadcms/translations'
import { Button, Card, Locked } from '@payloadcms/ui'
import { getGlobalData, getNavGroups, getVisibleEntities } from '@payloadcms/ui/shared'
import { EntityType, getAccessResults } from 'payload'
import { formatAdminURL } from 'payload/shared'

import {
  addCustomDestinationsToGroups,
  getAccessibleCustomAdminDestinations,
  isCustomAdminDestination,
} from '@/modules/admin/custom-admin-destinations'

const baseClass = 'collections'

export async function AdminResourceCards({ req }: WidgetServerProps) {
  const {
    i18n,
    payload,
    payload: {
      config: {
        routes: { admin: adminRoute },
      },
    },
    user,
  } = req
  const permissions = await getAccessResults({ req })
  const visibleEntities = getVisibleEntities({ req })
  const globalData = await getGlobalData(req)
  const navGroups = getNavGroups(permissions, visibleEntities, payload.config, i18n)
  const customDestinations = await getAccessibleCustomAdminDestinations(req)
  const resourceGroups = addCustomDestinationsToGroups(navGroups, customDestinations)

  return (
    <div className={baseClass}>
      <div className={`${baseClass}__wrap`}>
        {resourceGroups.map(({ entities, label }) => (
          <div className={`${baseClass}__group`} key={label}>
            <h2 className={`${baseClass}__label`}>{label}</h2>
            <ul className={`${baseClass}__card-list`}>
              {entities.map((entity) => {
                if (isCustomAdminDestination(entity)) {
                  const href = formatAdminURL({ adminRoute, path: entity.path })

                  return (
                    <li key={`custom-${entity.id}`}>
                      <Card
                        buttonAriaLabel={i18n.t('general:showAllLabel', {
                          label: entity.label,
                        })}
                        href={href}
                        id={`card-${entity.id}`}
                        title={entity.label}
                        titleAs="h3"
                      />
                    </li>
                  )
                }

                const title = getTranslation(entity.label, i18n)
                const isCollection = entity.type === EntityType.collection
                const href = formatAdminURL({
                  adminRoute,
                  path: isCollection ? `/collections/${entity.slug}` : `/globals/${entity.slug}`,
                })
                const createHref = isCollection
                  ? formatAdminURL({
                      adminRoute,
                      path: `/collections/${entity.slug}/create`,
                    })
                  : undefined
                const hasCreatePermission = isCollection
                  ? permissions.collections?.[entity.slug]?.create
                  : false
                const globalLock = !isCollection
                  ? getActiveGlobalLock(globalData, entity.slug)
                  : undefined

                return (
                  <li key={`${entity.type}-${entity.slug}`}>
                    <Card
                      actions={
                        globalLock && user?.id !== globalLock.user.id ? (
                          <Locked className={`${baseClass}__locked`} user={globalLock.user} />
                        ) : hasCreatePermission ? (
                          <Button
                            aria-label={i18n.t('general:createNewLabel', { label: title })}
                            buttonStyle="icon-label"
                            el="link"
                            icon="plus"
                            iconStyle="with-border"
                            round
                            to={createHref}
                          />
                        ) : undefined
                      }
                      buttonAriaLabel={
                        isCollection
                          ? i18n.t('general:showAllLabel', { label: title })
                          : i18n.t('general:editLabel', { label: title })
                      }
                      href={href}
                      id={`card-${entity.slug}`}
                      title={title}
                      titleAs="h3"
                    />
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function getActiveGlobalLock(
  globalData: Awaited<ReturnType<typeof getGlobalData>>,
  slug: string,
): { user: ClientUser } | undefined {
  const globalLockData = globalData.find((global) => global.slug === slug)

  if (
    !globalLockData?.data._isLocked ||
    !globalLockData.data._userEditing ||
    typeof globalLockData.data._userEditing !== 'object'
  ) {
    return undefined
  }

  const lockExpirationTime =
    new Date(globalLockData.data._lastEditedAt).getTime() +
    (globalLockData.lockDuration ?? 0) * 1000

  return lockExpirationTime > Date.now()
    ? { user: globalLockData.data._userEditing as ClientUser }
    : undefined
}
