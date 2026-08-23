import type { Access, AccessResult, PayloadRequest, Where } from 'payload'

import { getRelationshipId, type RelationshipReference } from '@/lib/relationships'
import { isPublicRequest } from '@/modules/content/public-access'
import {
  getCollectionPermissionResources,
  isPermissionResource,
  permissionResources,
  type PermissionOperation,
  type PermissionResource,
} from './permission-resources'

export const administratorRoleKey = 'administrator'
export const defaultUserRoleKey = 'user'

export type PermissionGrant = {
  allowed?: boolean | null
  own?: boolean | null
  published?: boolean | null
}

export type RolePermission = {
  resource?: string | null
  canCreate?: boolean | null
  readAllowed?: boolean | null
  readOwn?: boolean | null
  readPublished?: boolean | null
  updateAllowed?: boolean | null
  updateOwn?: boolean | null
  updatePublished?: boolean | null
  deleteAllowed?: boolean | null
  deleteOwn?: boolean | null
  deletePublished?: boolean | null
}

export type RoleRecord = {
  id: number | string
  key?: string | null
  permissions?: RolePermission[] | null
}

const rolesByRequest = new WeakMap<PayloadRequest, Promise<RoleRecord[]>>()

export function getUserIdentity(user: unknown): number | string | undefined {
  if (!user || typeof user !== 'object' || !('id' in user)) {
    return undefined
  }

  const id = user.id
  return typeof id === 'number' || typeof id === 'string' ? id : undefined
}

function getUserRoleReferences(user: unknown): NonNullable<RelationshipReference>[] {
  if (!user || typeof user !== 'object' || !('roles' in user) || !Array.isArray(user.roles)) {
    return []
  }

  return user.roles.filter((role): role is NonNullable<RelationshipReference> => {
    if (typeof role === 'number' || typeof role === 'string') {
      return true
    }

    return Boolean(
      role &&
      typeof role === 'object' &&
      'id' in role &&
      (typeof role.id === 'number' || typeof role.id === 'string'),
    )
  })
}

export async function getRequestRoles(req: PayloadRequest): Promise<RoleRecord[]> {
  if (!req.user) {
    return []
  }

  const cachedRoles = rolesByRequest.get(req)
  if (cachedRoles) {
    return cachedRoles
  }

  const roleIds = getUserRoleReferences(req.user).map(getRelationshipId)
  if (roleIds.length === 0) {
    return []
  }

  const rolesPromise = req.payload
    .find({
      collection: 'roles',
      depth: 0,
      limit: roleIds.length,
      overrideAccess: true,
      pagination: false,
      where: {
        id: {
          in: roleIds,
        },
      },
    })
    .then(({ docs }) => docs as RoleRecord[])

  rolesByRequest.set(req, rolesPromise)
  return rolesPromise
}

export async function isAdministrator(req: PayloadRequest): Promise<boolean> {
  const roles = await getRequestRoles(req)
  return roles.some((role) => role.key === administratorRoleKey)
}

export function clientUserHasResourcePermission(
  user: unknown,
  resource: PermissionResource,
  operation: PermissionOperation,
): boolean {
  const userId = getUserIdentity(user)
  if (userId === undefined) {
    return false
  }

  const roles = getUserRoleReferences(user).filter(
    (role): role is RoleRecord => typeof role === 'object' && 'permissions' in role,
  )

  return resolveRolePermission(roles, resource, operation, userId) !== false
}

export function clientUserHasCollectionPermission(
  user: unknown,
  collection: string,
  operation: PermissionOperation,
): boolean {
  return getCollectionPermissionResources(collection).some((resource) =>
    clientUserHasResourcePermission(user, resource, operation),
  )
}

export function clientUserHasRole(user: unknown, roleKey: string): boolean {
  if (!user || typeof user !== 'object' || !('roles' in user) || !Array.isArray(user.roles)) {
    return false
  }

  return user.roles.some(
    (role) => role && typeof role === 'object' && 'key' in role && role.key === roleKey,
  )
}

function getGrant(permission: RolePermission, operation: PermissionOperation): PermissionGrant {
  if (operation === 'create') {
    return { allowed: permission.canCreate }
  }

  return {
    allowed: permission[`${operation}Allowed`],
    own: permission[`${operation}Own`],
    published: permission[`${operation}Published`],
  }
}

function combineWithAnd(...conditions: (true | Where)[]): true | Where {
  const filters = conditions.filter((condition): condition is Where => condition !== true)
  if (filters.length === 0) return true
  return filters.length === 1 ? filters[0] : { and: filters }
}

function buildScope(
  resource: PermissionResource,
  grant: PermissionGrant,
  userId: number | string,
): true | Where {
  const definition = permissionResources[resource]
  const conditions: (true | Where)[] = []
  const ownershipField = 'ownershipField' in definition ? definition.ownershipField : undefined
  const publishedField = 'publishedField' in definition ? definition.publishedField : undefined

  if (grant.own && ownershipField) {
    conditions.push({
      [ownershipField]: {
        equals: userId,
      },
    })
  }

  if (grant.published && publishedField) {
    conditions.push({
      [publishedField]: {
        equals: 'published',
      },
    })
  }

  return combineWithAnd(...conditions)
}

export function resolveRolePermission(
  roles: readonly RoleRecord[],
  resource: PermissionResource,
  operation: PermissionOperation,
  userId: number | string,
): AccessResult {
  const scopes: Where[] = []

  for (const role of roles) {
    for (const permission of role.permissions ?? []) {
      if (permission.resource !== resource) {
        continue
      }

      const grant = getGrant(permission, operation)
      if (!grant.allowed) {
        continue
      }

      if (operation === 'create') {
        return true
      }

      const scope = buildScope(resource, grant, userId)
      if (scope === true) {
        return true
      }

      scopes.push(scope)
    }
  }

  if (scopes.length === 0) {
    return false
  }

  return scopes.length === 1 ? scopes[0] : { or: scopes }
}

export function resolveCollectionRolePermission(
  roles: readonly RoleRecord[],
  collection: string,
  operation: PermissionOperation,
  userId: number | string,
): AccessResult {
  return combineAccessResults(
    ...getCollectionPermissionResources(collection).map((resource) =>
      resolveRolePermission(roles, resource, operation, userId),
    ),
  )
}

export function combineAccessResults(...results: AccessResult[]): AccessResult {
  if (results.some((result) => result === true)) {
    return true
  }

  const scopes = results.filter((result): result is Where => result !== false)
  if (scopes.length === 0) {
    return false
  }

  return scopes.length === 1 ? scopes[0] : { or: scopes }
}

export function combineAccessWithConstraint(
  result: AccessResult,
  constraint: true | Where,
): AccessResult {
  if (result === false) {
    return false
  }

  if (result === true) {
    return constraint
  }

  return constraint === true ? result : { and: [result, constraint] }
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
    if (userId === undefined) {
      return operation === 'read' ? anonymousAccess : false
    }

    const roles = await getRequestRoles(req)
    const roleAccess = resolveRolePermission(roles, resource, operation, userId)

    if (!selfAccess || (operation !== 'read' && operation !== 'update')) {
      return roleAccess
    }

    return combineAccessResults(roleAccess, {
      id: {
        equals: userId,
      },
    })
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

function valuesMatch(left: unknown, right: number | string): boolean {
  if (left && typeof left === 'object' && 'id' in left) {
    return String(left.id) === String(right)
  }

  return String(left) === String(right)
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
      const grant = getGrant(permission, operation)
      if (!grant.allowed) return false
      if (grant.own && ownershipField) {
        if (!valuesMatch(data[ownershipField], userId)) return false
      }
      if (grant.published && publishedField) {
        if (data[publishedField] !== 'published') return false
      }
      return true
    }),
  )
}

export function validateRolePermissions(value: unknown): true | string {
  return validateUniquePermissionResources(value, 'Każdy zasób może wystąpić w roli tylko raz.')
}

function validateUniquePermissionResources(value: unknown, message: string): true | string {
  if (!Array.isArray(value)) {
    return true
  }

  const resources = value
    .map((permission) => {
      if (!permission || typeof permission !== 'object' || !('resource' in permission)) {
        return undefined
      }

      return isPermissionResource(permission.resource) ? permission.resource : undefined
    })
    .filter((resource): resource is PermissionResource => Boolean(resource))

  return new Set(resources).size === resources.length ? true : message
}
