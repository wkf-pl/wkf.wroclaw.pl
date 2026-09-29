import { isPermissionResource, type PermissionResource } from './permission-resources'

export const administratorRoleKey = 'administrator'
export const defaultUserRoleKey = 'user'

export function validateRolePermissions(value: unknown): true | string {
  if (!Array.isArray(value)) return true

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
