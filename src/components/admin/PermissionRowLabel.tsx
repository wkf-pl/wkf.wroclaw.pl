'use client'

import { useRowLabel } from '@payloadcms/ui'

import {
  isPermissionResource,
  permissionResources,
} from '@/modules/membership/permission-resources'

type PermissionRowData = {
  resource?: unknown
}

export function PermissionRowLabel() {
  const { data, rowNumber } = useRowLabel<PermissionRowData>()
  const label = isPermissionResource(data.resource)
    ? permissionResources[data.resource].label
    : `Uprawnienie ${(rowNumber ?? 0) + 1}`

  return <span>{label}</span>
}
