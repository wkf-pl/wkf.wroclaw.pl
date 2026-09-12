import { describe, expect, it } from 'vitest'

import {
  createPrivacyConsentPreferences,
  parsePrivacyConsentPreferences,
  PRIVACY_CONSENT_STORAGE_KEY,
  readPrivacyConsentPreferences,
  writePrivacyConsentPreferences,
} from '@/modules/privacy/consent'

describe('privacy consent preferences', () => {
  const decidedAt = new Date('2026-09-12T10:00:00.000Z')

  it('creates a versioned decision that expires after six calendar months', () => {
    expect(createPrivacyConsentPreferences(true, decidedAt)).toEqual({
      decidedAt: '2026-09-12T10:00:00.000Z',
      expiresAt: '2027-03-12T10:00:00.000Z',
      functional: true,
      version: 1,
    })
  })

  it('rejects expired, malformed and unknown-version preferences', () => {
    const preferences = createPrivacyConsentPreferences(false, decidedAt)

    expect(
      parsePrivacyConsentPreferences(
        JSON.stringify(preferences),
        new Date('2027-03-12T10:00:00.000Z'),
      ),
    ).toBeNull()
    expect(parsePrivacyConsentPreferences('{invalid')).toBeNull()
    expect(
      parsePrivacyConsentPreferences(JSON.stringify({ ...preferences, version: 2 })),
    ).toBeNull()
  })

  it('stores a decision and removes an invalid saved value', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      removeItem: (key: string) => values.delete(key),
      setItem: (key: string, value: string) => values.set(key, value),
    }

    const saved = writePrivacyConsentPreferences(storage, true, decidedAt)
    expect(readPrivacyConsentPreferences(storage, decidedAt)).toEqual(saved)

    values.set(PRIVACY_CONSENT_STORAGE_KEY, JSON.stringify({ ...saved, version: 99 }))
    expect(readPrivacyConsentPreferences(storage, decidedAt)).toBeNull()
    expect(values.has(PRIVACY_CONSENT_STORAGE_KEY)).toBe(false)
  })
})
