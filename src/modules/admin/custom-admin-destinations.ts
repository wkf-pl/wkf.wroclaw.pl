import type { NavGroupType } from '@payloadcms/ui/shared'
import type { PayloadRequest } from 'payload'

import {
  permissionResources,
  type PermissionResource,
} from '@/modules/membership/permission-resources'
import { userCanPerformResourceOperation } from '@/modules/membership/role-access'

export type CustomAdminDestination = {
  group: string
  iconName: string
  id: string
  label: string
  path: `/${string}`
  resource: PermissionResource
}

export type AdminDestinationGroup = Omit<NavGroupType, 'entities'> & {
  entities: Array<NavGroupType['entities'][number] | CustomAdminDestination>
}

export const customAdminDestinations = [
  {
    group: 'Administracja',
    iconName: 'page-templates',
    id: 'page-templates',
    label: permissionResources['page-templates'].label,
    path: '/page-templates',
    resource: 'page-templates',
  },
] as const satisfies readonly CustomAdminDestination[]

export async function getAccessibleCustomAdminDestinations(
  request: PayloadRequest | undefined,
): Promise<CustomAdminDestination[]> {
  if (!request) {
    return []
  }

  const accessResults = await Promise.all(
    customAdminDestinations.map(async (destination) => ({
      destination,
      canRead: await userCanPerformResourceOperation({
        data: {},
        operation: 'read',
        req: request,
        resource: destination.resource,
      }),
    })),
  )

  return accessResults
    .filter(({ canRead }) => canRead)
    .map(({ destination }) => ({ ...destination }))
}

export function addCustomDestinationsToGroups(
  groups: NavGroupType[],
  destinations: CustomAdminDestination[],
): AdminDestinationGroup[] {
  const destinationGroups = groups.map((group) => ({
    ...group,
    entities: [...group.entities],
  })) as AdminDestinationGroup[]

  for (const destination of destinations) {
    const matchingGroup = destinationGroups.find(({ label }) => label === destination.group)

    if (matchingGroup) {
      matchingGroup.entities.push(destination)
    } else {
      destinationGroups.push({ entities: [destination], label: destination.group })
    }
  }

  return destinationGroups
}

export function isCustomAdminDestination(
  entity: AdminDestinationGroup['entities'][number],
): entity is CustomAdminDestination {
  return 'path' in entity
}
