import type { Where } from 'payload'

import { documentTypeOptions, type DocumentType } from '@/modules/documents/document-types'

type PermissionResourceDefinition = {
  collection?: string
  global?: string
  kind: 'collection' | 'global'
  label: string
  ownershipField?: string
  publishedField?: string
  website?: boolean
  where?: Where
}

const documentPermissionResources = documentTypeOptions.reduce<
  Record<`documents-${DocumentType}`, PermissionResourceDefinition>
>(
  (resources, { label, value }) => {
    resources[`documents-${value}`] = {
      collection: 'documents',
      kind: 'collection',
      label: `Dokumenty: ${label}`,
      ownershipField: 'author',
      publishedField: '_status',
      website: true,
      where: { documentType: { equals: value } },
    }
    return resources
  },
  {} as Record<`documents-${DocumentType}`, PermissionResourceDefinition>,
)

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
    website: true,
  },
  'member-profiles': {
    collection: 'member-profiles',
    kind: 'collection',
    label: 'Wizytówki klubowiczów',
    ownershipField: 'owner',
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
    website: true,
  },
  posts: {
    collection: 'posts',
    kind: 'collection',
    label: 'Wpisy',
    ownershipField: 'author',
    publishedField: '_status',
    website: true,
  },
  events: {
    collection: 'events',
    kind: 'collection',
    label: 'Wydarzenia',
    ownershipField: 'author',
    publishedField: '_status',
    website: true,
  },
  'event-cycles': {
    collection: 'event-cycles',
    kind: 'collection',
    label: 'Cykle wydarzeń',
    ownershipField: 'author',
    publishedField: '_status',
    website: true,
  },
  partners: {
    collection: 'partners',
    kind: 'collection',
    label: 'Partnerzy',
    ownershipField: 'author',
    publishedField: '_status',
    website: true,
  },
  ...documentPermissionResources,
  'document-files': {
    collection: 'document-files',
    kind: 'collection',
    label: 'Pliki dokumentów',
  },
  'club-sections': {
    collection: 'club-sections',
    kind: 'collection',
    label: 'Sekcje klubowe',
    publishedField: '_status',
    website: true,
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
    label: 'Menu strony',
  },
  'site-settings': {
    global: 'site-settings',
    kind: 'global',
    label: 'Ustawienia strony',
  },
} as const satisfies Record<string, PermissionResourceDefinition>

export type PermissionResource = keyof typeof permissionResources
export type PermissionOperation = 'create' | 'read' | 'update' | 'delete'
export type WebsitePermissionResource = {
  [Resource in PermissionResource]: (typeof permissionResources)[Resource] extends {
    website: true
  }
    ? Resource
    : never
}[PermissionResource]

export const permissionResourceOptions = Object.entries(permissionResources).map(
  ([value, resource]) => ({ label: resource.label, value }),
)

export const websitePermissionResourceOptions = permissionResourceOptions.filter(({ value }) =>
  resourceSupportsWebsite(value),
)

export function isPermissionResource(value: unknown): value is PermissionResource {
  return typeof value === 'string' && value in permissionResources
}

export function isWebsitePermissionResource(value: unknown): value is WebsitePermissionResource {
  return isPermissionResource(value) && resourceSupportsWebsite(value)
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

export function resourceSupportsWebsite(resource: unknown): resource is WebsitePermissionResource {
  return isPermissionResource(resource) && 'website' in permissionResources[resource]
}

export function getCollectionPermissionResources(collection: string): PermissionResource[] {
  return (Object.keys(permissionResources) as PermissionResource[]).filter(
    (resource) =>
      'collection' in permissionResources[resource] &&
      permissionResources[resource].collection === collection,
  )
}

export function getWebsitePermissionResourcesForCollection(
  collection: string,
): WebsitePermissionResource[] {
  return getCollectionPermissionResources(collection).filter(isWebsitePermissionResource)
}

export function getDocumentPermissionResource(
  documentType: DocumentType,
): `documents-${DocumentType}` {
  return `documents-${documentType}`
}
