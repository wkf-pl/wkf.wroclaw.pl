export const venueWebsiteError = 'Podaj poprawny adres HTTP lub HTTPS.'
export const postalCodeError = 'Podaj kod pocztowy w formacie 00-000.'

function hasValidHostname(url: URL): boolean {
  const hostname = url.hostname.toLowerCase()
  if (!hostname || hostname.startsWith('.') || hostname.endsWith('.') || hostname.includes('..')) {
    return false
  }

  if (hostname === 'localhost' || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
    return true
  }

  const labels = hostname.split('.')
  return (
    labels.length >= 2 &&
    labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)) &&
    /^(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(labels.at(-1) ?? '')
  )
}

export function validateVenueWebsite(value: unknown): true | string {
  if (!value) return true
  if (typeof value !== 'string' || /[\s"'<>\[\]]/.test(value)) return venueWebsiteError

  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return 'Adres musi używać protokołu HTTP lub HTTPS.'
    }

    return !url.username && !url.password && hasValidHostname(url) ? true : venueWebsiteError
  } catch {
    return venueWebsiteError
  }
}

export function validatePostalCode(value: unknown): true | string {
  if (!value) return true
  return typeof value === 'string' && /^\d{2}-\d{3}$/.test(value) ? true : postalCodeError
}
