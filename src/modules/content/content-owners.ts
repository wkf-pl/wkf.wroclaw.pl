import { getFormRelationshipId } from '@/lib/relationships'

export const contentOwnerCollections = [
  'pages',
  'posts',
  'events',
  'event-cycles',
  'media',
  'partners',
  'documents',
] as const

export function supportsContentOwners(
  slug: string,
): slug is (typeof contentOwnerCollections)[number] {
  return contentOwnerCollections.some((collection) => collection === slug)
}

export type ContentOwner = {
  relationTo: 'users' | 'user-groups'
  value: number
}

export function contentOwnerKey(owner: ContentOwner): string {
  return `${owner.relationTo}:${owner.value}`
}

export function getContentOwners(value: unknown): ContentOwner[] {
  if (!Array.isArray(value)) return []

  const owners = new Map<string, ContentOwner>()
  for (const reference of value) {
    if (!reference || typeof reference !== 'object') continue
    const relationTo: unknown = reference.relationTo
    if (relationTo !== 'users' && relationTo !== 'user-groups') continue
    const id = Number(getFormRelationshipId(reference.value))
    if (!Number.isSafeInteger(id) || id < 1) continue
    const owner: ContentOwner = { relationTo, value: id }
    owners.set(contentOwnerKey(owner), owner)
  }
  return [...owners.values()]
}
