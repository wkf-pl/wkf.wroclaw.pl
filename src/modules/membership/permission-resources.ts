export const permissionResources = {
  users: {
    kind: 'collection',
    label: 'Użytkownicy',
    ownershipField: 'id',
  },
  media: {
    kind: 'collection',
    label: 'Media',
    ownershipField: 'uploadedBy',
  },
  pages: {
    kind: 'collection',
    label: 'Strony',
    ownershipField: 'author',
    publishedField: '_status',
  },
  posts: {
    kind: 'collection',
    label: 'Wpisy',
    ownershipField: 'author',
    publishedField: '_status',
  },
  'club-sections': {
    kind: 'collection',
    label: 'Sekcje klubowe',
    publishedField: '_status',
  },
  categories: {
    kind: 'collection',
    label: 'Kategorie',
  },
  tags: {
    kind: 'collection',
    label: 'Tagi',
  },
  navigation: {
    kind: 'global',
    label: 'Menu strony',
  },
  footer: {
    kind: 'global',
    label: 'Stopka',
  },
  'site-settings': {
    kind: 'global',
    label: 'Ustawienia strony',
  },
} as const

export type PermissionResource = keyof typeof permissionResources
export type PermissionOperation = 'create' | 'read' | 'update' | 'delete'

export const permissionResourceOptions = Object.entries(permissionResources).map(
  ([value, resource]) => ({ label: resource.label, value }),
)

export function isPermissionResource(value: unknown): value is PermissionResource {
  return typeof value === 'string' && value in permissionResources
}

export function resourceSupportsOwnership(resource: unknown): boolean {
  return isPermissionResource(resource) && 'ownershipField' in permissionResources[resource]
}

export function resourceSupportsPublishedStatus(resource: unknown): boolean {
  return isPermissionResource(resource) && 'publishedField' in permissionResources[resource]
}

export function resourceSupportsCreateAndDelete(resource: unknown): boolean {
  return isPermissionResource(resource) && permissionResources[resource].kind === 'collection'
}
