export const PRIVACY_CONSENT_STORAGE_KEY = 'wkf-privacy-consent'
export const PRIVACY_CONSENT_VERSION = 1 as const

export interface PrivacyConsentPreferences {
  version: typeof PRIVACY_CONSENT_VERSION
  functional: boolean
  decidedAt: string
  expiresAt: string
}

export function createPrivacyConsentPreferences(
  functional: boolean,
  decidedAt = new Date(),
): PrivacyConsentPreferences {
  const expiresAt = new Date(decidedAt)
  expiresAt.setUTCMonth(expiresAt.getUTCMonth() + 6)

  return {
    version: PRIVACY_CONSENT_VERSION,
    functional,
    decidedAt: decidedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
}

export function parsePrivacyConsentPreferences(
  serializedPreferences: null | string,
  now = new Date(),
): null | PrivacyConsentPreferences {
  if (!serializedPreferences) return null

  try {
    const value: unknown = JSON.parse(serializedPreferences)
    if (!isPrivacyConsentPreferences(value)) return null

    const decidedAt = Date.parse(value.decidedAt)
    const expiresAt = Date.parse(value.expiresAt)
    if (!Number.isFinite(decidedAt) || !Number.isFinite(expiresAt) || expiresAt <= now.getTime()) {
      return null
    }

    return value
  } catch {
    return null
  }
}

export function readPrivacyConsentPreferences(
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  now = new Date(),
): null | PrivacyConsentPreferences {
  const serializedPreferences = storage.getItem(PRIVACY_CONSENT_STORAGE_KEY)
  const preferences = parsePrivacyConsentPreferences(serializedPreferences, now)

  if (serializedPreferences && !preferences) {
    storage.removeItem(PRIVACY_CONSENT_STORAGE_KEY)
  }

  return preferences
}

export function writePrivacyConsentPreferences(
  storage: Pick<Storage, 'setItem'>,
  functional: boolean,
  decidedAt = new Date(),
): PrivacyConsentPreferences {
  const preferences = createPrivacyConsentPreferences(functional, decidedAt)
  storage.setItem(PRIVACY_CONSENT_STORAGE_KEY, JSON.stringify(preferences))
  return preferences
}

function isPrivacyConsentPreferences(value: unknown): value is PrivacyConsentPreferences {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>
  return (
    candidate.version === PRIVACY_CONSENT_VERSION &&
    typeof candidate.functional === 'boolean' &&
    typeof candidate.decidedAt === 'string' &&
    typeof candidate.expiresAt === 'string'
  )
}
