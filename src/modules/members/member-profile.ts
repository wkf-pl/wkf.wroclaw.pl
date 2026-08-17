import type { PayloadRequest, Validate } from 'payload'

import { formatSlug } from '@/modules/content/slug'
import { getRequestRoles, getUserIdentity } from '@/modules/membership/role-permissions'

export const memberRoleKey = 'member'

export const contactChannelOptions = [
  { label: 'E-mail', value: 'email' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Messenger', value: 'messenger' },
  { label: 'Discord', value: 'discord' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Bluesky', value: 'bluesky' },
  { label: 'Mastodon', value: 'mastodon' },
  { label: 'LinkedIn', value: 'linkedin' },
  { label: 'YouTube', value: 'youtube' },
  { label: 'Twitch', value: 'twitch' },
  { label: 'Strona WWW', value: 'website' },
  { label: 'Inny link', value: 'other' },
] as const

export type ContactChannelType = (typeof contactChannelOptions)[number]['value']

export async function requestHasRole(req: PayloadRequest, roleKey: string): Promise<boolean> {
  const roles = await getRequestRoles(req)
  return roles.some((role) => role.key === roleKey)
}

export async function isMember(req: PayloadRequest): Promise<boolean> {
  return requestHasRole(req, memberRoleKey)
}

export function clientUserHasRole(user: unknown, roleKeys: readonly string[]): boolean {
  if (!user || typeof user !== 'object' || !('roles' in user) || !Array.isArray(user.roles)) {
    return false
  }

  return user.roles.some(
    (role) =>
      role &&
      typeof role === 'object' &&
      'key' in role &&
      typeof role.key === 'string' &&
      roleKeys.includes(role.key),
  )
}

export function getRelationshipID(value: unknown): number | string | undefined {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const id = value.id
    return typeof id === 'number' || typeof id === 'string' ? id : undefined
  }

  return undefined
}

export function normalizeContactAddress(type: ContactChannelType, value: string): string {
  const trimmedValue = value.trim()
  if (type === 'email') {
    return trimmedValue.toLowerCase().startsWith('mailto:')
      ? trimmedValue
      : `mailto:${trimmedValue}`
  }

  return trimmedValue
}

export function validateContactAddress(
  value: null | string | undefined,
  { siblingData }: { siblingData: { type?: ContactChannelType | null } },
): string | true {
  if (!value?.trim()) {
    return 'Podaj adres kanału kontaktu.'
  }

  if (value.length > 500) {
    return 'Adres kanału kontaktu może mieć najwyżej 500 znaków.'
  }

  if (siblingData.type === 'email') {
    const email = value.replace(/^mailto:/i, '')
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? true : 'Podaj poprawny adres e-mail.'
  }

  try {
    return new URL(value).protocol === 'https:' ? true : 'Link musi używać protokołu HTTPS.'
  } catch {
    return 'Podaj poprawny adres HTTPS.'
  }
}

export const validateGame: Validate = (_value, { siblingData }) =>
  siblingData.plays || siblingData.runs ? true : 'Zaznacz „Gram” lub „Prowadzę” dla tej gry.'

export function validateUniqueGames(value: unknown): string | true {
  if (!Array.isArray(value)) {
    return true
  }

  const titles = value
    .map((item) =>
      item && typeof item === 'object' && 'title' in item && typeof item.title === 'string'
        ? item.title.trim().toLocaleLowerCase('pl')
        : '',
    )
    .filter(Boolean)

  return new Set(titles).size === titles.length
    ? true
    : 'Każda gra może wystąpić na wizytówce tylko raz.'
}

export function createBaseProfileSlug(publicName: unknown): string {
  const formattedName = typeof publicName === 'string' ? formatSlug(publicName) : ''
  return formattedName || 'member'
}

export function isEffectivelyPublic(profile: { _status?: null | string }): boolean {
  return profile._status === 'published'
}

export function ownDocumentConstraint(req: PayloadRequest, field = 'owner') {
  const userID = getUserIdentity(req.user)
  return userID === undefined ? false : { [field]: { equals: userID } }
}
