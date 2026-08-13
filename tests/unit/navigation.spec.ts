import { describe, expect, it } from 'vitest'

import type { Media, Page } from '@/payload-types'
import {
  isCustomTarget,
  isPageTarget,
  usesCustomIcon,
  usesIconAppearance,
  usesSystemIcon,
  systemIconOptions,
  validateCustomURL,
} from '@/modules/navigation/fields'
import { getCustomIconURL, hasRenderableIcon, resolveLink } from '@/modules/navigation/links'

const validationContext = {} as Parameters<typeof validateCustomURL>[1]

function createPage(overrides: Partial<Page> = {}): Page {
  return {
    _status: 'published',
    attachments: [],
    author: 1,
    content: {
      root: {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    createdAt: new Date(0).toISOString(),
    id: 1,
    slug: 'o-nas',
    title: 'O nas',
    updatedAt: new Date(0).toISOString(),
    ...overrides,
  }
}

describe('navigation links', () => {
  it('lists system icons alphabetically by their admin labels', () => {
    expect(systemIconOptions.map(({ label }) => label)).toEqual([
      'Czas',
      'Discord',
      'E-mail',
      'Facebook',
      'Gwiazda',
      'Instagram',
      'Kalendarz',
      'Kolekcja',
      'Kość',
      'Książka',
      'Lokalizacja',
      'Pionek',
      'Recenzja',
      'Slack',
      'Użytkownicy',
    ])
  })

  it('shows conditional target and icon fields only for the selected variants', () => {
    expect(isPageTarget(null, { targetType: 'page' })).toBe(true)
    expect(isCustomTarget(null, { targetType: 'page' })).toBe(false)
    expect(usesIconAppearance(null, { appearance: 'icon' })).toBe(true)
    expect(usesSystemIcon(null, { iconSource: 'system' })).toBe(true)
    expect(usesCustomIcon(null, { iconSource: 'media' })).toBe(true)
  })

  it.each(['/blog', '#kontakt', 'mailto:kontakt@example.com', 'tel:+48123456789'])(
    'accepts the supported custom target %s',
    (target) => {
      expect(validateCustomURL(target, validationContext)).toBe(true)
    },
  )

  it('accepts HTTP(S) and rejects unsupported or malformed protocols', () => {
    expect(validateCustomURL('https://wkf.example', validationContext)).toBe(true)
    expect(validateCustomURL('javascript:alert(1)', validationContext)).toBeTypeOf('string')
    expect(validateCustomURL('wkf.example', validationContext)).toBeTypeOf('string')
  })

  it('resolves a published page and ignores an unavailable page', () => {
    expect(resolveLink({ page: createPage(), targetType: 'page' })).toEqual({ href: '/o-nas' })
    expect(resolveLink({ page: createPage({ _status: 'draft' }), targetType: 'page' })).toBeNull()
    expect(resolveLink({ page: 1, targetType: 'page' })).toBeNull()
  })

  it('adds safe attributes when opening a custom link in a new tab', () => {
    expect(
      resolveLink({ openInNewTab: true, targetType: 'custom', url: 'https://wkf.example' }),
    ).toEqual({
      href: 'https://wkf.example',
      rel: 'noopener noreferrer',
      target: '_blank',
    })
  })

  it('recognizes only populated system or media icons', () => {
    const media = { id: 1, url: '/api/media/file/icon.svg' } as Media

    expect(getCustomIconURL(media)).toBe('/api/media/file/icon.svg')
    expect(hasRenderableIcon({ iconSource: 'system', systemIcon: 'dice' })).toBe(true)
    expect(hasRenderableIcon({ customIcon: media, iconSource: 'media' })).toBe(true)
    expect(hasRenderableIcon({ customIcon: 1, iconSource: 'media' })).toBe(false)
  })
})
