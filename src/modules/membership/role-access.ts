import type { Access, AccessResult, Payload, PayloadRequest } from 'payload'
import { cache } from 'react'

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

async function loadRoles(payload: Payload, ...roleIds: (number | string)[]): Promise<RoleRecord[]> {
  const { docs } = await payload.find({
    collection: 'roles',
    depth: 0,
    limit: roleIds.length,
    overrideAccess: true,
    pagination: false,
    select: { key: true, permissions: true },
    where: { id: { in: roleIds } },
  })
  return docs
}

// Payload creates separate request objects for layout, page, and relationship operations.
// React shares this read only within the current server render.
const loadRenderRoles = cache(loadRoles)

export async function getRequestRoles(req: PayloadRequest): Promise<RoleRecord[]> {
  if (!req.user) return []

  const cachedRoles = rolesByRequest.get(req)
  if (cachedRoles) return cachedRoles

  const roleIds = [
    ...new Set(
      getUserRoleReferences(req.user).map((role) => (typeof role === 'object' ? role.id : role)),
    ),
  ].sort()
  if (roleIds.length === 0) return []

  const readRoles =
    req.transactionID || req.headers?.has('next-action') ? loadRoles : loadRenderRoles
  const rolesPromise = readRoles(req.payload, ...roleIds)

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
