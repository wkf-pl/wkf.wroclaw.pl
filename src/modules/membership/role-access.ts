import type { Access, AccessResult, PayloadRequest } from 'payload'

import { isPublicRequest } from '@/modules/content/public-access'
import {
  combineAccessResults,
  getPermissionGrant,
  getUserIdentity,
  getUserRoleReferences,
  relationshipValueMatches,
  resolveCollectionRolePermission,
  resolveRolePermission,
  type RoleRecord,
} from './permission-resolution'
import {
  permissionResources,
  type PermissionOperation,
  type PermissionResource,
} from './permission-resources'
import { administratorRoleKey } from './role-configuration'

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
}: {
  anonymousAccess?: AccessResult
  operation: PermissionOperation
  publicAccess?: AccessResult
  resource: PermissionResource
  selfAccess?: boolean
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

    const roleAccess = resolveRolePermission(
      await getRequestRoles(req),
      resource,
      operation,
      userId,
    )

    if (!selfAccess || (operation !== 'read' && operation !== 'update')) return roleAccess
    return combineAccessResults(roleAccess, { id: { equals: userId } })
  }
}

export function createCollectionRolePermissionAccess({
  collection,
  operation,
  publicAccess,
}: {
  collection: string
  operation: PermissionOperation
  publicAccess?: AccessResult
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
    if (userId === undefined) return false
    return resolveCollectionRolePermission(
      await getRequestRoles(req),
      collection,
      operation,
      userId,
    )
  }
}

export async function userCanPerformResourceOperation({
  data,
  operation,
  req,
  resource,
}: {
  data: Record<string, unknown>
  operation: PermissionOperation
  req: PayloadRequest
  resource: PermissionResource
}): Promise<boolean> {
  const userId = getUserIdentity(req.user)
  if (userId === undefined) return false

  const definition = permissionResources[resource]
  const ownershipField = 'ownershipField' in definition ? definition.ownershipField : undefined
  const publishedField = 'publishedField' in definition ? definition.publishedField : undefined
  const roles = await getRequestRoles(req)

  return roles.some((role) =>
    (role.permissions ?? []).some((permission) => {
      if (permission.resource !== resource) return false
      const grant = getPermissionGrant(permission, operation)
      if (!grant.allowed) return false
      if (grant.own && ownershipField) {
        if (!relationshipValueMatches(data[ownershipField], userId)) return false
      }
      if (grant.published && publishedField) {
        if (data[publishedField] !== 'published') return false
      }
      return true
    }),
  )
}
