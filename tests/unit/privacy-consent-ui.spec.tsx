// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { GoogleMapEmbed } from '@/components/maps/GoogleMapEmbed'
import { PrivacyConsentProvider, PrivacySettingsButton } from '@/components/privacy/PrivacyConsent'
import { PRIVACY_CONSENT_STORAGE_KEY } from '@/modules/privacy/consent'

describe('privacy consent interface', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true
    window.localStorage.clear()
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
  })

  it('offers equal top-level choices and persists rejection of optional features', async () => {
    await renderInterface()

    expect(container.querySelectorAll('.privacyBannerActions button')).toHaveLength(3)
    expect(container.textContent).toContain('Akceptuję wszystkie')
    expect(container.textContent).toContain('Odrzucam opcjonalne')
    expect(container.textContent).toContain('Dostosuj')

    await clickButton('Odrzucam opcjonalne')

    expect(container.querySelector('.privacyBanner')).toBeNull()
    expect(
      JSON.parse(window.localStorage.getItem(PRIVACY_CONSENT_STORAGE_KEY) ?? '{}'),
    ).toMatchObject({
      functional: false,
      version: 1,
    })
  })

  it('moves focus into the settings dialog and restores it when Escape closes the dialog', async () => {
    await renderInterface()

    const customizeButton = findButton('Dostosuj')
    customizeButton.focus()
    await act(async () => customizeButton.click())

    const dialog = container.querySelector<HTMLElement>('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(document.activeElement?.getAttribute('aria-label')).toBe(
      'Zamknij ustawienia prywatności',
    )
    const functionalCheckbox = container.querySelector<HTMLInputElement>(
      '.privacyCategory input:not([disabled])',
    )
    expect(functionalCheckbox?.labels?.[0]?.textContent?.trim()).toBe('Zezwalam na Mapy Google')
    expect(functionalCheckbox?.getAttribute('aria-describedby')).toBe(
      'privacy-functional-description',
    )

    await act(async () => {
      dialog?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement?.textContent?.trim()).toBe('Dostosuj')
  })

  it('never mounts Google Maps before functional consent and removes it after withdrawal', async () => {
    await renderInterface()

    expect(container.querySelector('iframe')).toBeNull()
    expect(container.textContent).toContain('Mapa czeka na Twoją zgodę')

    await clickButton('Akceptuję wszystkie')
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://www.google.com/maps/embed?pb=test',
    )

    await clickButton('Ustawienia prywatności')
    const functionalCheckbox = container.querySelector<HTMLInputElement>(
      '.privacyCategory input:not([disabled])',
    )
    if (!functionalCheckbox) throw new Error('Missing functional consent checkbox')
    await act(async () => functionalCheckbox.click())
    await clickButton('Zapisz wybór')

    expect(container.querySelector('iframe')).toBeNull()
    expect(container.textContent).toContain('Mapa czeka na Twoją zgodę')
  })

  async function renderInterface(): Promise<void> {
    await act(async () => {
      root.render(
        <PrivacyConsentProvider>
          <PrivacySettingsButton />
          <GoogleMapEmbed
            externalMapURL="https://www.google.com/maps/search/?api=1&query=WKF"
            src="https://www.google.com/maps/embed?pb=test"
          />
        </PrivacyConsentProvider>,
      )
    })
  }

  async function clickButton(label: string): Promise<void> {
    const button = findButton(label)
    await act(async () => button.click())
  }

  function findButton(label: string): HTMLButtonElement {
    const button = [...container.querySelectorAll('button')].find(
      (candidate) => candidate.textContent?.trim() === label,
    )
    if (!button) throw new Error(`Missing button: ${label}`)
    return button
  }
})
