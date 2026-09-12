'use client'

import { useMemo, useSyncExternalStore } from 'react'

import {
  parsePrivacyConsentPreferences,
  PRIVACY_CONSENT_STORAGE_KEY,
  type PrivacyConsentPreferences,
} from '@/modules/privacy/consent'

const privacyConsentUpdatedEvent = 'wkf:privacy-consent-updated'

export function notifyPrivacyConsentUpdated(): void {
  window.dispatchEvent(new Event(privacyConsentUpdatedEvent))
}

export function useStoredPrivacyConsent(): null | PrivacyConsentPreferences {
  const serializedPreferences = useSyncExternalStore(
    subscribeToPrivacyConsent,
    getPrivacyConsentSnapshot,
    getServerPrivacyConsentSnapshot,
  )

  return useMemo(
    () => parsePrivacyConsentPreferences(serializedPreferences),
    [serializedPreferences],
  )
}

function subscribeToPrivacyConsent(onStoreChange: () => void): () => void {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(privacyConsentUpdatedEvent, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(privacyConsentUpdatedEvent, onStoreChange)
  }
}

function getPrivacyConsentSnapshot(): null | string {
  try {
    return window.localStorage.getItem(PRIVACY_CONSENT_STORAGE_KEY)
  } catch {
    return null
  }
}

function getServerPrivacyConsentSnapshot(): null {
  return null
}
