import type { AccessResult, Where } from 'payload'

import { getRelationshipId, type RelationshipReference } from '@/lib/relationships'
import {
  getCollectionPermissionResources,
  permissionResources,
  type PermissionOperation,
  type PermissionResource,
} from './permission-resources'

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

export function getUserIdentity(user: unknown): number | string | undefined {
  if (!user || typeof user !== 'object' || !('id' in user)) {
    return undefined
  }

  const id = user.id
  return typeof id === 'number' || typeof id === 'string' ? id : undefined
}

export function getUserRoleReferences(user: unknown): NonNullable<RelationshipReference>[] {
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
  return getUserRoleReferences(user).some(
    (role) => typeof role === 'object' && 'key' in role && role.key === roleKey,
  )
}

export function getPermissionGrant(
  permission: RolePermission,
  operation: PermissionOperation,
): PermissionGrant {
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
    conditions.push({ [ownershipField]: { equals: userId } })
  }

  if (grant.published && publishedField) {
    conditions.push({ [publishedField]: { equals: 'published' } })
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
      if (permission.resource !== resource) continue

      const grant = getPermissionGrant(permission, operation)
      if (!grant.allowed) continue
      if (operation === 'create') return true

      const scope = buildScope(resource, grant, userId)
      if (scope === true) return true
      scopes.push(scope)
    }
  }

  if (scopes.length === 0) return false
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
  if (results.some((result) => result === true)) return true

  const scopes = results.filter((result): result is Where => result !== false)
  if (scopes.length === 0) return false
  return scopes.length === 1 ? scopes[0] : { or: scopes }
}

export function combineAccessWithConstraint(
  result: AccessResult,
  constraint: true | Where,
): AccessResult {
  if (result === false) return false
  if (result === true) return constraint
  return constraint === true ? result : { and: [result, constraint] }
}

export function relationshipValueMatches(left: unknown, right: number | string): boolean {
  const relationshipId = getRelationshipId(left as RelationshipReference)
  return relationshipId !== undefined && String(relationshipId) === String(right)
}
