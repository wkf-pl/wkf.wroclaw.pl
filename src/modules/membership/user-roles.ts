type UserRoleReference = { id?: number | string; key?: string | null } | number | string | null

type UserWithRoles = {
  roles?: UserRoleReference[] | null
}

export function userHasRole(user: UserWithRoles | null | undefined, roleKey: string): boolean {
  return Boolean(
    user?.roles?.some((role) => typeof role === 'object' && role !== null && role.key === roleKey),
  )
}
