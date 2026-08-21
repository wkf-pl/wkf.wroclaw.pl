import type { Access, AccessResult, PayloadRequest, Where } from 'payload'

import { getRelationshipId, type RelationshipReference } from '@/lib/relationships'
import {
  getCollectionPermissionResources,
  getWebsitePermissionResourcesForCollection,
  isPermissionResource,
  isWebsitePermissionResource,
  permissionResources,
  type PermissionOperation,
  type PermissionResource,
  type WebsitePermissionResource,
} from './permission-resources'

export const administratorRoleKey = 'administrator'
export const defaultUserRoleKey = 'user'
export const websiteRequestContext = { website: true } as const

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

type WebsitePermission = {
  anonymousAllowed?: boolean | null
  resource?: string | null
  roles?: RelationshipReference[] | null
}

type WebsitePermissionSettings = {
  permissions?: WebsitePermission[] | null
}

const rolesByRequest = new WeakMap<PayloadRequest, Promise<RoleRecord[]>>()
const websitePermissionsByRequest = new WeakMap<PayloadRequest, Promise<WebsitePermission[]>>()

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

async function getWebsitePermissions(req: PayloadRequest): Promise<WebsitePermission[]> {
  const cachedPermissions = websitePermissionsByRequest.get(req)
  if (cachedPermissions) {
    return cachedPermissions
  }

  const permissionsPromise = req.payload
    .findGlobal({
      slug: 'website-permissions',
      depth: 0,
      overrideAccess: true,
      req,
    })
    .then((settings) =>
      ((settings as WebsitePermissionSettings).permissions ?? []).filter(
        (permission): permission is WebsitePermission => Boolean(permission),
      ),
    )

  websitePermissionsByRequest.set(req, permissionsPromise)
  return permissionsPromise
}

export async function hasAnonymousWebsiteAccess(
  req: PayloadRequest,
  resource: WebsitePermissionResource,
): Promise<boolean> {
  const permissions = await getWebsitePermissions(req)
  return permissions.some(
    (permission) => permission.resource === resource && permission.anonymousAllowed === true,
  )
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

function getBaseScope(resource: PermissionResource): true | Where {
  const definition = permissionResources[resource]
  return 'where' in definition && definition.where ? definition.where : true
}

function buildScope(
  resource: PermissionResource,
  grant: PermissionGrant,
  userId: number | string,
  forcePublished = false,
): true | Where {
  const definition = permissionResources[resource]
  const conditions: (true | Where)[] = [getBaseScope(resource)]
  const ownershipField = 'ownershipField' in definition ? definition.ownershipField : undefined
  const publishedField = 'publishedField' in definition ? definition.publishedField : undefined

  if (grant.own && ownershipField) {
    conditions.push({
      [ownershipField]: {
        equals: userId,
      },
    })
  }

  if ((forcePublished || grant.published) && publishedField) {
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

function roleIdsMatch(permission: WebsitePermission, userRoleIds: Set<string>): boolean {
  return (permission.roles ?? []).some((role) => userRoleIds.has(String(getRelationshipId(role))))
}

function getWebsiteScope(resource: WebsitePermissionResource): true | Where {
  return buildScope(resource, {}, 0, true)
}

async function resolveWebsiteResourcePermission(
  req: PayloadRequest,
  resource: WebsitePermissionResource,
): Promise<AccessResult> {
  const [roles, websitePermissions] = await Promise.all([
    getRequestRoles(req),
    getWebsitePermissions(req),
  ])
  const userId = getUserIdentity(req.user)
  const userRoleIds = new Set(roles.map((role) => String(role.id)))
  const policy = websitePermissions.find((permission) => permission.resource === resource)
  const scopes: AccessResult[] = []

  if (policy?.anonymousAllowed || (policy && roleIdsMatch(policy, userRoleIds))) {
    scopes.push(getWebsiteScope(resource))
  }

  if (userId !== undefined) {
    for (const role of roles) {
      for (const permission of role.permissions ?? []) {
        if (permission.resource !== resource || !permission.readAllowed) continue
        scopes.push(
          buildScope(
            resource,
            {
              allowed: true,
              own: permission.readOwn,
            },
            userId,
            true,
          ),
        )
      }
    }
  }

  return combineAccessResults(...scopes)
}

async function resolveWebsiteCollectionPermission(
  req: PayloadRequest,
  collection: string,
): Promise<AccessResult> {
  return combineAccessResults(
    ...(await Promise.all(
      getWebsitePermissionResourcesForCollection(collection).map((resource) =>
        resolveWebsiteResourcePermission(req, resource),
      ),
    )),
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

function isWebsiteRequest(req: PayloadRequest, isReadingStaticFile?: boolean): boolean {
  return req.context?.website === true || isReadingStaticFile === true
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
  return async ({ isReadingStaticFile, req }) => {
    if (
      operation === 'read' &&
      isWebsitePermissionResource(resource) &&
      isWebsiteRequest(req, isReadingStaticFile)
    ) {
      return resolveWebsiteResourcePermission(req, resource)
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
}: {
  collection: string
  operation: PermissionOperation
}): Access {
  return async ({ isReadingStaticFile, req }) => {
    if (operation === 'read' && isWebsiteRequest(req, isReadingStaticFile)) {
      return resolveWebsiteCollectionPermission(req, collection)
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

export function validateWebsitePermissions(value: unknown): true | string {
  return validateUniquePermissionResources(
    value,
    'Każdy zasób może wystąpić w ustawieniach WWW tylko raz.',
  )
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
