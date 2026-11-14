import { getRelationshipId } from '@/lib/relationships'

export const groupAuthoredCollections = [
  'pages',
  'posts',
  'events',
  'event-cycles',
  'media',
  'partners',
] as const

export function isGroupAuthoredCollection(
  slug: string,
): slug is (typeof groupAuthoredCollections)[number] {
  return groupAuthoredCollections.some((collection) => collection === slug)
}

export type ContentAuthorReference = {
  relationTo: 'users' | 'user-groups'
  value: number
}

export function getContentAuthorReference(value: unknown): ContentAuthorReference | undefined {
  const relationTo =
    value && typeof value === 'object' && 'relationTo' in value ? value.relationTo : 'users'
  if (relationTo !== 'users' && relationTo !== 'user-groups') return undefined

  const identifier = getRelationshipId(
    value && typeof value === 'object' && 'value' in value ? value.value : value,
  )
  if (identifier === undefined || !/^\d+$/.test(String(identifier))) return undefined

  const id = Number(identifier)
  return Number.isSafeInteger(id) && id > 0 ? { relationTo, value: id } : undefined
}

export function getContentAuthorName(author: unknown): string | null {
  if (!author || typeof author !== 'object') return null
  const value = 'value' in author ? author.value : author
  if (!value || typeof value !== 'object') return null

  const name = 'displayName' in value ? value.displayName : 'name' in value ? value.name : null
  return typeof name === 'string' ? name : null
}

export function getDefaultEventAuthor(group: unknown): ContentAuthorReference | undefined {
  return getContentAuthorReference({ relationTo: 'user-groups', value: group })
}
