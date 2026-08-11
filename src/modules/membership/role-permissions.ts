import type { Access, AccessResult, PayloadRequest, Where } from 'payload'

import {
  isPermissionResource,
  permissionResources,
  type PermissionOperation,
  type PermissionResource,
} from './permission-resources'

export const administratorRoleKey = 'administrator'
export const defaultUserRoleKey = 'user'

type RelationshipReference = number | string | { id: number | string }

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

function getUserRoleReferences(user: unknown): RelationshipReference[] {
  if (!user || typeof user !== 'object' || !('roles' in user) || !Array.isArray(user.roles)) {
    return []
  }

  return user.roles.filter((role): role is RelationshipReference => {
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

function getRelationshipId(reference: RelationshipReference): number | string {
  return typeof reference === 'object' ? reference.id : reference
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

function buildScope(
  resource: PermissionResource,
  grant: PermissionGrant,
  userId: number | string,
): true | Where {
  const resourceDefinition = permissionResources[resource]
  const conditions: Where[] = []

  if (grant.own && 'ownershipField' in resourceDefinition) {
    conditions.push({
      [resourceDefinition.ownershipField]: {
        equals: userId,
      },
    })
  }

  if (grant.published && 'publishedField' in resourceDefinition) {
    conditions.push({
      [resourceDefinition.publishedField]: {
        equals: 'published',
      },
    })
  }

  if (conditions.length === 0) {
    return true
  }

  return conditions.length === 1 ? conditions[0] : { and: conditions }
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

function combineAccessResults(...results: AccessResult[]): AccessResult {
  if (results.some((result) => result === true)) {
    return true
  }

  const scopes = results.filter((result): result is Where => result !== false)
  if (scopes.length === 0) {
    return false
  }

  return scopes.length === 1 ? scopes[0] : { or: scopes }
}

export function createRolePermissionAccess({
  anonymousAccess = false,
  operation,
  resource,
  selfAccess = false,
}: {
  anonymousAccess?: AccessResult
  operation: PermissionOperation
  resource: PermissionResource
  selfAccess?: boolean
}): Access {
  return async ({ req }) => {
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

export function validateRolePermissions(value: unknown): true | string {
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

  return new Set(resources).size === resources.length
    ? true
    : 'Każdy zasób może wystąpić w roli tylko raz.'
}
