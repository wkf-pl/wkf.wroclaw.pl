import Link from 'next/link'
import type { DefaultServerCellComponentProps, TextFieldClient } from 'payload'
import { formatAdminURL } from 'payload/shared'

import { isAuditedCollection, isAuditedGlobal } from '@/modules/content-audit/targets'

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

  return (
    <Link href={formatAdminURL({ adminRoute: payload.config.routes.admin, path })}>{cellData}</Link>
  )
}
