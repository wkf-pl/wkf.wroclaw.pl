import type { DefaultServerCellComponentProps, SelectFieldClient, TextFieldClient } from 'payload'
import { formatAdminURL } from 'payload/shared'

import {
  auditedCollections,
  auditedGlobals,
  isAuditedCollection,
  isAuditedGlobal,
} from '@/modules/content-audit/targets'

export function AuditTitleCell({
  cellData,
  payload,
  rowData,
}: DefaultServerCellComponentProps<TextFieldClient, string>) {
  const { action, target, targetId } = rowData
  if (typeof target !== 'string' || action === 'delete') return <span>{cellData}</span>

  let path: `/${string}`
  if (isAuditedGlobal(target)) {
    path = `/globals/${target}`
  } else if (isAuditedCollection(target) && typeof targetId === 'string') {
    const section = action === 'trash' ? '/trash' : ''
    path = `/collections/${target}${section}/${encodeURIComponent(targetId)}`
  } else {
    return <span>{cellData}</span>
  }

  return <a href={formatAdminURL({ adminRoute: payload.config.routes.admin, path })}>{cellData}</a>
}

export function AuditActorCell({
  cellData,
  payload,
  rowData,
}: DefaultServerCellComponentProps<TextFieldClient, string>) {
  const actorId: unknown = rowData.actorId
  if (typeof actorId !== 'string' || !actorId) return <span>{cellData}</span>

  return (
    <a
      href={formatAdminURL({
        adminRoute: payload.config.routes.admin,
        path: `/collections/${payload.config.admin.user}/${encodeURIComponent(actorId)}`,
      })}
    >
      {cellData}
    </a>
  )
}

export function AuditTargetCell({
  cellData,
  payload,
}: DefaultServerCellComponentProps<SelectFieldClient, string>) {
  const adminRoute = payload.config.routes.admin
  if (isAuditedCollection(cellData)) {
    return (
      <a href={formatAdminURL({ adminRoute, path: `/collections/${cellData}` })}>
        {auditedCollections[cellData].label}
      </a>
    )
  }
  if (isAuditedGlobal(cellData)) {
    return (
      <a href={formatAdminURL({ adminRoute, path: `/globals/${cellData}` })}>
        {auditedGlobals[cellData].label}
      </a>
    )
  }
  return <span>{cellData}</span>
}

export function AuditVersionCell({
  cellData,
  payload,
  rowData,
}: DefaultServerCellComponentProps<TextFieldClient, string | null>) {
  const { action, target, targetId } = rowData
  if (!cellData || typeof target !== 'string') return <span>—</span>

  const versionPath = `versions/${encodeURIComponent(cellData)}`
  let path: `/${string}`
  if (isAuditedGlobal(target)) {
    path = `/globals/${target}/${versionPath}`
  } else if (isAuditedCollection(target) && typeof targetId === 'string') {
    const section = action === 'trash' ? '/trash' : ''
    path = `/collections/${target}${section}/${encodeURIComponent(targetId)}/${versionPath}`
  } else {
    return <span>—</span>
  }
  return (
    <a href={formatAdminURL({ adminRoute: payload.config.routes.admin, path })}>Otwórz wersję</a>
  )
}
