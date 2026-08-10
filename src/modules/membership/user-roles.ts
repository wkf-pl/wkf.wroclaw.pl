export const userRoles = [
  'user',
  'member',
  'game_master',
  'author',
  'editor',
  'moderator',
  'administrator',
] as const

export type UserRole = (typeof userRoles)[number]

type UserWithRoles = {
  id: number | string
  roles?: UserRole[] | null
}

export function isUserWithRoles(user: unknown): user is UserWithRoles {
  if (!user || typeof user !== 'object' || !('id' in user)) {
    return false
  }

  if (!('roles' in user) || user.roles === null || user.roles === undefined) {
    return true
  }

  return Array.isArray(user.roles) && user.roles.every((role) => userRoles.includes(role))
}

export function userHasAnyRole(user: unknown, allowedRoles: readonly UserRole[]): boolean {
  return isUserWithRoles(user) && Boolean(user.roles?.some((role) => allowedRoles.includes(role)))
}
