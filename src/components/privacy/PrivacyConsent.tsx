'use client'

import Link from 'next/link'
import {
  createContext,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  createPrivacyConsentPreferences,
  type PrivacyConsentPreferences,
  writePrivacyConsentPreferences,
} from '@/modules/privacy/consent'
import { notifyPrivacyConsentUpdated, useStoredPrivacyConsent } from './useStoredPrivacyConsent'

type PrivacyConsentContextValue = {
  openSettings: () => void
  preferences: null | PrivacyConsentPreferences | undefined
}

const PrivacyConsentContext = createContext<PrivacyConsentContextValue>({
  openSettings: () => undefined,
  preferences: undefined,
})

export function PrivacyConsentProvider({ children }: { children: ReactNode }) {
  const storedPreferences = useStoredPrivacyConsent()
  const [sessionPreferences, setSessionPreferences] = useState<null | PrivacyConsentPreferences>(
    null,
  )
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsTriggerReference = useRef<HTMLElement | null>(null)
  const preferences = sessionPreferences ?? storedPreferences

  function openSettings(): void {
    settingsTriggerReference.current = document.activeElement as HTMLElement | null
    setSettingsOpen(true)
  }

  function decide(functional: boolean): void {
    try {
      writePrivacyConsentPreferences(window.localStorage, functional)
      setSessionPreferences(null)
      notifyPrivacyConsentUpdated()
    } catch {
      setSessionPreferences(createPrivacyConsentPreferences(functional))
    }
    setSettingsOpen(false)
  }

  return (
    <PrivacyConsentContext.Provider value={{ openSettings, preferences }}>
      {children}
      {preferences === null && !settingsOpen ? (
        <PrivacyConsentBanner
          onAcceptAll={() => decide(true)}
          onCustomize={openSettings}
          onRejectOptional={() => decide(false)}
        />
      ) : null}
      {settingsOpen ? (
        <PrivacySettingsDialog
          initialFunctional={preferences?.functional ?? false}
          onClose={() => setSettingsOpen(false)}
          onSave={decide}
          returnFocusReference={settingsTriggerReference}
        />
      ) : null}
    </PrivacyConsentContext.Provider>
  )
}

export function PrivacySettingsButton() {
  const { openSettings } = usePrivacyConsent()
  return (
    <button className="privacySettingsButton" onClick={openSettings} type="button">
      Ustawienia prywatności
    </button>
  )
}

export function usePrivacyConsent(): PrivacyConsentContextValue {
  return useContext(PrivacyConsentContext)
}

function PrivacyConsentBanner({
  onAcceptAll,
  onCustomize,
  onRejectOptional,
}: {
  onAcceptAll: () => void
  onCustomize: () => void
  onRejectOptional: () => void
}) {
  return (
    <aside aria-labelledby="privacy-banner-heading" aria-live="polite" className="privacyBanner">
      <div className="privacyBannerCopy">
        <h2 id="privacy-banner-heading">Szanujemy Twoją prywatność</h2>
        <p>
          Strona działa bez reklam i profilowania. Dopiero po Twojej zgodzie możemy wczytać mapy
          Google, które łączą się z zewnętrzną usługą. Więcej wyjaśniamy w{' '}
          <Link href="/dokumenty/polityka-prywatnosci">polityce prywatności</Link>.
        </p>
      </div>
      <div aria-label="Decyzja dotycząca prywatności" className="privacyBannerActions">
        <button onClick={onAcceptAll} type="button">
          Akceptuję wszystkie
        </button>
        <button onClick={onRejectOptional} type="button">
          Odrzucam opcjonalne
        </button>
        <button data-privacy-settings-trigger="banner" onClick={onCustomize} type="button">
          Dostosuj
        </button>
      </div>
    </aside>
  )
}

function PrivacySettingsDialog({
  initialFunctional,
  onClose,
  onSave,
  returnFocusReference,
}: {
  initialFunctional: boolean
  onClose: () => void
  onSave: (functional: boolean) => void
  returnFocusReference: RefObject<HTMLElement | null>
}) {
  const [functional, setFunctional] = useState(initialFunctional)
  const dialogReference = useRef<HTMLDivElement>(null)
  const closeButtonReference = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const returnFocusTo = returnFocusReference.current
    document.body.style.overflow = 'hidden'
    closeButtonReference.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      if (returnFocusTo?.isConnected) {
        returnFocusTo.focus()
      } else {
        document.querySelector<HTMLElement>('[data-privacy-settings-trigger="banner"]')?.focus()
      }
    }
  }, [returnFocusReference])

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') return
    const focusableElements = dialogReference.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), a[href]',
    )
    if (!focusableElements?.length) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement?.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement?.focus()
    }
  }

  return (
    <div className="privacyDialogBackdrop">
      <div
        aria-labelledby="privacy-settings-heading"
        aria-modal="true"
        className="privacyDialog"
        onKeyDown={handleKeyDown}
        ref={dialogReference}
        role="dialog"
      >
        <div className="privacyDialogHeader">
          <h2 id="privacy-settings-heading">Ustawienia prywatności</h2>
          <button
            aria-label="Zamknij ustawienia prywatności"
            className="privacyDialogClose"
            onClick={onClose}
            ref={closeButtonReference}
            type="button"
          >
            Zamknij
          </button>
        </div>
        <p>
          Niezbędne mechanizmy utrzymują bezpieczeństwo strony i zapamiętują Twój wybór. Opcjonalne
          funkcje uruchamiamy tylko za Twoją zgodą.
        </p>
        <div className="privacyCategory">
          <div>
            <strong>Niezbędne</strong>
            <p>
              Potrzebne do działania strony, bezpiecznego logowania osób redagujących treści i
              zapamiętania tej decyzji.
            </p>
          </div>
          <label>
            <input checked disabled type="checkbox" />
            Zawsze aktywne
          </label>
        </div>
        <div className="privacyCategory">
          <div>
            <strong>Funkcjonalne - Mapy Google</strong>
            <p id="privacy-functional-description">
              Pozwalają wyświetlać osadzone mapy. Google może otrzymać między innymi adres IP oraz
              informacje o przeglądarce i urządzeniu.
            </p>
          </div>
          <label>
            <input
              aria-describedby="privacy-functional-description"
              checked={functional}
              onChange={(event) => setFunctional(event.target.checked)}
              type="checkbox"
            />
            Zezwalam na Mapy Google
          </label>
        </div>
        <p className="privacyDialogDetails">
          Wybór możesz później zmienić. Szczegóły znajdziesz w{' '}
          <Link href="/dokumenty/polityka-prywatnosci">polityce prywatności</Link>.
        </p>
        <div className="privacyDialogActions">
          <button onClick={() => onSave(functional)} type="button">
            Zapisz wybór
          </button>
          <button onClick={onClose} type="button">
            Anuluj
          </button>
        </div>
      </div>
    </div>
  )
}
