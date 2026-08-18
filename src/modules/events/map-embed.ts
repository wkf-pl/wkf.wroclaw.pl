import type { FieldHook } from 'payload'

const allowedMapHosts = new Set(['www.google.com', 'google.com', 'maps.google.com'])

export function normalizeGoogleMapsEmbed(value: unknown): null | string {
  if (typeof value !== 'string' || !value.trim()) {
    return null
  }

  const trimmedValue = value.trim()
  const iframeSource = trimmedValue.match(/<iframe\b[^>]*\bsrc=(['"])(.*?)\1/i)?.[2]
  const candidate = (iframeSource ?? trimmedValue).replaceAll('&amp;', '&')

  try {
    const url = new URL(candidate)
    if (
      url.protocol !== 'https:' ||
      !allowedMapHosts.has(url.hostname.toLowerCase()) ||
      url.pathname !== '/maps/embed'
    ) {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}

export const normalizeGoogleMapsEmbedField: FieldHook = ({ value }) => {
  if (!value) return value
  return normalizeGoogleMapsEmbed(value) ?? value
}

export function validateGoogleMapsEmbed(value: unknown): true | string {
  return !value || normalizeGoogleMapsEmbed(value)
    ? true
    : 'Wklej kod osadzenia mapy Google albo adres HTTPS z domeny google.com/maps/embed.'
}

export function buildGoogleMapsURL(location: {
  city?: null | string
  name?: null | string
  postalCode?: null | string
  streetAddress?: null | string
}): string {
  const query = [location.name, location.streetAddress, location.postalCode, location.city]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ')

  const url = new URL('https://www.google.com/maps/search/')
  url.searchParams.set('api', '1')
  url.searchParams.set('query', query)
  return url.toString()
}
