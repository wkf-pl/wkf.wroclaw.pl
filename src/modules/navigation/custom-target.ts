import type { FieldHook, Validate } from 'payload'

export const customSchemeValues = ['https', 'http', 'mailto', 'tel', 'path', 'anchor'] as const

export type CustomScheme = (typeof customSchemeValues)[number]

export type ParsedCustomTarget = {
  address: string
  scheme: CustomScheme
}

const schemePrefixes: Record<CustomScheme, string> = {
  anchor: '#',
  http: 'http://',
  https: 'https://',
  mailto: 'mailto:',
  path: '/',
  tel: 'tel:',
}

export function isCustomScheme(value: unknown): value is CustomScheme {
  return typeof value === 'string' && customSchemeValues.includes(value as CustomScheme)
}

export function parseCustomTarget(value: string): ParsedCustomTarget | null {
  const trimmedValue = value.trim()

  if (!trimmedValue || trimmedValue.startsWith('//')) {
    return null
  }

  for (const scheme of customSchemeValues) {
    const prefix = schemePrefixes[scheme]
    if (trimmedValue.toLocaleLowerCase('en').startsWith(prefix)) {
      return {
        address: trimmedValue.slice(prefix.length),
        scheme,
      }
    }
  }

  return null
}

export function buildCustomTarget(
  scheme: CustomScheme | null | undefined,
  address: null | string | undefined,
): string | null {
  if (!scheme || !address?.trim()) {
    return null
  }

  return `${schemePrefixes[scheme]}${address.trim()}`
}

export function validateCustomAddressValue(scheme: CustomScheme, address: string): true | string {
  const trimmedAddress = address.trim()
  if (!trimmedAddress) {
    return 'Podaj właściwy adres.'
  }

  if (/^(?:javascript|data):/i.test(trimmedAddress) || trimmedAddress.startsWith('//')) {
    return 'Ten rodzaj adresu nie jest obsługiwany.'
  }

  if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(trimmedAddress)) {
    return 'Usuń protokół z adresu albo wybierz obsługiwany schemat.'
  }

  if (scheme === 'https' || scheme === 'http') {
    try {
      const url = new URL(buildCustomTarget(scheme, trimmedAddress) ?? '')
      return url.protocol === `${scheme}:` && Boolean(url.hostname)
        ? true
        : 'Podaj poprawny adres HTTP(S).'
    } catch {
      return 'Podaj poprawny adres HTTP(S).'
    }
  }

  if (scheme === 'mailto') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedAddress) ? true : 'Podaj poprawny adres e-mail.'
  }

  if (scheme === 'tel') {
    return /^\+?[0-9][0-9 ()-]{4,}$/.test(trimmedAddress) ? true : 'Podaj poprawny numer telefonu.'
  }

  if (scheme === 'path') {
    return !trimmedAddress.startsWith('/') && !trimmedAddress.startsWith('#')
      ? true
      : 'Podaj ścieżkę bez początkowego ukośnika.'
  }

  return !trimmedAddress.startsWith('#') ? true : 'Podaj kotwicę bez początkowego znaku #.'
}

type CustomTargetSiblingData = {
  customScheme?: unknown
  id: number | string
  targetType?: unknown
}

export const normalizeCustomAddress: FieldHook<
  CustomTargetSiblingData,
  null | string | undefined,
  CustomTargetSiblingData
> = ({ siblingData, value }) => {
  if (typeof value !== 'string') {
    return value
  }

  const parsedTarget = parseCustomTarget(value)
  if (parsedTarget) {
    siblingData.customScheme = parsedTarget.scheme
    return parsedTarget.address
  }

  return value.trim()
}

export const validateCustomAddress: Validate<
  null | string | undefined,
  unknown,
  CustomTargetSiblingData
> = (value, { siblingData }) => {
  if (siblingData.targetType !== 'custom') {
    return true
  }

  if (!isCustomScheme(siblingData.customScheme)) {
    return 'Wybierz schemat adresu.'
  }

  return validateCustomAddressValue(siblingData.customScheme, value ?? '')
}
