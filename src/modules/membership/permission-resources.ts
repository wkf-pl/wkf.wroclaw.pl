type PermissionResourceDefinition = {
  collection?: string
  global?: string
  kind: 'collection' | 'global'
  label: string
  ownershipField?: string
  publishedField?: string
  trash?: boolean
}

export const permissionResources = {
  users: {
    collection: 'users',
    kind: 'collection',
    label: 'Użytkownicy',
    ownershipField: 'id',
  },
  media: {
    collection: 'media',
    kind: 'collection',
    label: 'Media',
    ownershipField: 'uploadedBy',
  },
  'member-profiles': {
    collection: 'member-profiles',
    kind: 'collection',
    label: 'Wizytówki klubowiczów',
    ownershipField: 'owner',
    trash: true,
  },
  'member-profile-images': {
    collection: 'member-profile-images',
    kind: 'collection',
    label: 'Zdjęcia wizytówek',
    ownershipField: 'owner',
  },
  pages: {
    collection: 'pages',
    kind: 'collection',
    label: 'Strony',
    ownershipField: 'author',
    publishedField: '_status',
    trash: true,
  },
  posts: {
    collection: 'posts',
    kind: 'collection',
    label: 'Wpisy',
    ownershipField: 'author',
    publishedField: '_status',
    trash: true,
  },
  events: {
    collection: 'events',
    kind: 'collection',
    label: 'Wydarzenia',
    ownershipField: 'author',
    publishedField: '_status',
    trash: true,
  },
  'event-cycles': {
    collection: 'event-cycles',
    kind: 'collection',
    label: 'Cykle wydarzeń',
    ownershipField: 'author',
    publishedField: '_status',
    trash: true,
  },
  'event-types': {
    collection: 'event-types',
    kind: 'collection',
    label: 'Rodzaje wydarzeń',
  },
  partners: {
    collection: 'partners',
    kind: 'collection',
    label: 'Partnerzy',
    ownershipField: 'author',
    publishedField: '_status',
    trash: true,
  },
  documents: {
    collection: 'documents',
    kind: 'collection',
    label: 'Dokumenty',
    ownershipField: 'author',
    publishedField: '_status',
    trash: true,
  },
  'url-aliases': {
    collection: 'url-aliases',
    kind: 'collection',
    label: 'Aliasy adresów',
  },
  'club-sections': {
    collection: 'club-sections',
    kind: 'collection',
    label: 'Sekcje klubowe',
    publishedField: '_status',
    trash: true,
  },
  categories: {
    collection: 'categories',
    kind: 'collection',
    label: 'Kategorie',
  },
  tags: {
    collection: 'tags',
    kind: 'collection',
    label: 'Tagi',
  },
  navigation: {
    global: 'navigation',
    kind: 'global',
    label: 'Nagłówek, Hero i Stopka',
  },
  'site-settings': {
    global: 'site-settings',
    kind: 'global',
    label: 'Strona główna',
  },
} as const satisfies Record<string, PermissionResourceDefinition>

export type PermissionResource = keyof typeof permissionResources
export type PermissionOperation =
  'create' | 'read' | 'update' | 'delete' | 'restore' | 'permanentDelete'
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

export function resourceSupportsTrash(resource: unknown): boolean {
  return (
    isPermissionResource(resource) &&
    'trash' in permissionResources[resource] &&
    permissionResources[resource].trash === true
  )
}

export function getCollectionPermissionResources(collection: string): PermissionResource[] {
  return (Object.keys(permissionResources) as PermissionResource[]).filter(
    (resource) =>
      'collection' in permissionResources[resource] &&
      permissionResources[resource].collection === collection,
  )
}
