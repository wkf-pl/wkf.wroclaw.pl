import type { Access, AccessResult, PayloadRequest } from 'payload'

import { supportsContentOwners } from '@/modules/content/content-owners'
import { isPublicRequest } from '@/modules/content/public-access'
import {
  combineAccessResults,
  getPermissionGrant,
  getUserIdentity,
  getUserRoleReferences,
  resolveRolePermission,
  type RoleRecord,
} from './permission-resolution'
import { type PermissionOperation, type PermissionResource } from './permission-resources'
import { administratorRoleKey } from './role-configuration'
import { getUserGroupIds } from './user-group-membership'

const rolesByRequest = new WeakMap<PayloadRequest, Promise<RoleRecord[]>>()

export async function getRequestRoles(req: PayloadRequest): Promise<RoleRecord[]> {
  if (!req.user) return []

  const cachedRoles = rolesByRequest.get(req)
  if (cachedRoles) return cachedRoles

  const roleIds = getUserRoleReferences(req.user).flatMap((role) => {
    if (typeof role === 'number' || typeof role === 'string') return [role]
    return [role.id]
  })
  if (roleIds.length === 0) return []

  const rolesPromise = req.payload
    .find({
      collection: 'roles',
      depth: 0,
      limit: roleIds.length,
      overrideAccess: true,
      pagination: false,
      where: { id: { in: roleIds } },
    })
    .then(({ docs }) => docs as RoleRecord[])

  rolesByRequest.set(req, rolesPromise)
  return rolesPromise
}

export async function isAdministrator(req: PayloadRequest): Promise<boolean> {
  return (await getRequestRoles(req)).some((role) => role.key === administratorRoleKey)
}

export function createRolePermissionAccess({
  anonymousAccess = false,
  operation,
  publicAccess,
  resource,
  selfAccess = false,
  versions = false,
}: {
  anonymousAccess?: AccessResult
  operation: PermissionOperation
  publicAccess?: AccessResult
  resource: PermissionResource
  selfAccess?: boolean
  versions?: boolean
}): Access {
  return async ({ isReadingStaticFile, req }) => {
    if (
      operation === 'read' &&
      publicAccess !== undefined &&
      isPublicRequest(req, isReadingStaticFile)
    ) {
      return publicAccess
    }

    const userId = getUserIdentity(req.user)
    if (userId === undefined) return operation === 'read' ? anonymousAccess : false

    const roles = await getRequestRoles(req)
    const groupIds = await getScopedGroupIds(req, roles, resource, operation)
    const roleAccess = resolveRolePermission(roles, resource, operation, userId, groupIds, versions)

    if (!selfAccess || (operation !== 'read' && operation !== 'update')) return roleAccess
    return combineAccessResults(roleAccess, { id: { equals: userId } })
  }
}

async function getScopedGroupIds(
  req: PayloadRequest,
  roles: RoleRecord[],
  resource: string,
  operation: PermissionOperation,
): Promise<number[]> {
  if (!supportsContentOwners(resource)) return []
  const hasOwnGrant = roles.some((role) =>
    role.permissions?.some((permission) => {
      if (permission.resource !== resource) return false
      const grant = getPermissionGrant(permission, operation)
      return grant.allowed && grant.own
    }),
  )
  return hasOwnGrant ? getUserGroupIds(req) : []
}
