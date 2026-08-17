import { describe, expect, it } from 'vitest'

import type { Category, Media, Page, Tag } from '@/payload-types'
import { ClubSections } from '@/collections/ClubSections'
import { Navigation } from '@/globals/Navigation'
import {
  isCategoryTarget,
  isCustomTarget,
  isPageTarget,
  isTagTarget,
  usesCustomIcon,
  usesIconAppearance,
  usesSystemIcon,
  systemIconOptions,
} from '@/modules/navigation/fields'
import {
  buildCustomTarget,
  parseCustomTarget,
  validateCustomAddressValue,
} from '@/modules/navigation/custom-target'
import { getCustomIconURL, hasRenderableIcon, resolveLink } from '@/modules/navigation/links'

function findArrayField(fields: typeof Navigation.fields, name: string) {
  for (const field of fields) {
    if (field.type !== 'tabs') continue
    for (const tab of field.tabs) {
      const result = tab.fields.find((tabField) => 'name' in tabField && tabField.name === name)
      if (result) return result
    }
  }

  throw new Error(`Missing array field: ${name}`)
}

function createPage(overrides: Partial<Page> = {}): Page {
  return {
    _status: 'published',
    author: 1,
    createdAt: new Date(0).toISOString(),
    id: 1,
    layout: [],
    slug: 'o-nas',
    title: 'O nas',
    updatedAt: new Date(0).toISOString(),
    ...overrides,
  }
}

describe('navigation links', () => {
  it('uses descriptive row labels for menu configuration', () => {
    expect(findArrayField(Navigation.fields, 'headerItems')).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#NavigationItemRowLabel',
        },
      },
    })
    expect(findArrayField(Navigation.fields, 'heroItems')).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#NavigationItemRowLabel',
        },
      },
    })
    expect(findArrayField(Navigation.fields, 'socialItems')).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#SocialItemRowLabel',
        },
      },
    })
    expect(findArrayField(Navigation.fields, 'footerColumns')).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#FooterColumnRowLabel',
        },
      },
    })

    const menuItems = ClubSections.fields
      .filter((field) => field.type === 'tabs')
      .flatMap((field) => field.tabs)
      .flatMap((tab) => tab.fields)
      .find((field) => 'name' in field && field.name === 'menuItems')
    expect(menuItems).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#FooterColumnItemRowLabel',
        },
      },
    })
  })

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
    expect(isCategoryTarget(null, { targetType: 'category' })).toBe(true)
    expect(isTagTarget(null, { targetType: 'tag' })).toBe(true)
    expect(isCustomTarget(null, { targetType: 'page' })).toBe(false)
    expect(usesIconAppearance(null, { appearance: 'icon' })).toBe(true)
    expect(usesSystemIcon(null, { iconSource: 'system' })).toBe(true)
    expect(usesCustomIcon(null, { iconSource: 'media' })).toBe(true)
  })

  it.each([
    ['https://wkf.example/blog', 'https', 'wkf.example/blog'],
    ['http://wkf.example', 'http', 'wkf.example'],
    ['mailto:kontakt@example.com', 'mailto', 'kontakt@example.com'],
    ['tel:+48123456789', 'tel', '+48123456789'],
    ['/blog', 'path', 'blog'],
    ['#kontakt', 'anchor', 'kontakt'],
  ] as const)('parses the supported custom target %s', (target, scheme, address) => {
    expect(parseCustomTarget(target)).toEqual({ address, scheme })
    expect(buildCustomTarget(scheme, address)).toBe(target)
    expect(validateCustomAddressValue(scheme, address)).toBe(true)
  })

  it('rejects unsafe or malformed custom targets', () => {
    expect(parseCustomTarget('//wkf.example')).toBeNull()
    expect(validateCustomAddressValue('https', 'javascript:alert(1)')).toBeTypeOf('string')
    expect(validateCustomAddressValue('https', 'ftp://wkf.example')).toBeTypeOf('string')
    expect(validateCustomAddressValue('https', 'wkf.example:8080')).toBe(true)
    expect(validateCustomAddressValue('mailto', 'wkf.example')).toBeTypeOf('string')
  })

  it('resolves a published page and ignores an unavailable page', () => {
    expect(resolveLink({ page: createPage(), targetType: 'page' })).toEqual({ href: '/o-nas' })
    expect(resolveLink({ page: createPage({ _status: 'draft' }), targetType: 'page' })).toBeNull()
    expect(resolveLink({ page: 1, targetType: 'page' })).toBeNull()
  })

  it('adds safe attributes when opening a custom link in a new tab', () => {
    expect(
      resolveLink({
        customAddress: 'wkf.example',
        customScheme: 'https',
        openInNewTab: true,
        targetType: 'custom',
      }),
    ).toEqual({
      href: 'https://wkf.example',
      rel: 'noopener noreferrer',
      target: '_blank',
    })
  })

  it('resolves category and tag targets', () => {
    const category = { id: 1, name: 'Aktualności', slug: 'aktualnosci' } as Category
    const tag = { id: 1, name: 'WKF', slug: 'wkf' } as Tag

    expect(resolveLink({ category, targetType: 'category' })).toEqual({
      href: '/category/aktualnosci',
    })
    expect(resolveLink({ tag, targetType: 'tag' })).toEqual({ href: '/tag/wkf' })
  })

  it('recognizes only populated system or media icons', () => {
    const media = { id: 1, url: '/api/media/file/icon.svg' } as Media

    expect(getCustomIconURL(media)).toBe('/api/media/file/icon.svg')
    expect(hasRenderableIcon({ iconSource: 'system', systemIcon: 'dice' })).toBe(true)
    expect(hasRenderableIcon({ customIcon: media, iconSource: 'media' })).toBe(true)
    expect(hasRenderableIcon({ customIcon: 1, iconSource: 'media' })).toBe(false)
  })
})
