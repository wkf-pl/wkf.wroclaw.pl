import { describe, expect, it } from 'vitest'

import type { Category, Document, Media, Page, Post, Tag } from '@/payload-types'
import { Footer, HomepageHero, HomepageSections, Navigation } from '@/globals'
import {
  createLinkFields,
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
  const result = findField(fields, name)
  if (result) return result

  throw new Error(`Missing array field: ${name}`)
}

function findField(
  fields: typeof Navigation.fields,
  name: string,
): (typeof fields)[number] | undefined {
  for (const field of fields) {
    if ('name' in field && field.name === name) return field
    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const result = findField(tab.fields, name)
        if (result) return result
      }
    }
    if ('fields' in field && Array.isArray(field.fields)) {
      const result = findField(field.fields, name)
      if (result) return result
    }
  }
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
  it('places the custom address first and each destination beside the selector', () => {
    const fields = createLinkFields()
    const targetRow = fields.find((field) => field.type === 'row')

    if (!targetRow || targetRow.type !== 'row') {
      throw new Error('Missing link target row.')
    }

    const targetType = targetRow.fields.find(
      (field) => 'name' in field && field.name === 'targetType',
    )
    expect(targetType).toMatchObject({
      admin: { isClearable: false, width: '50%' },
      options: [
        { label: 'Własny adres', value: 'custom' },
        { label: 'Cykl wydarzeń', value: 'eventCycle' },
        { label: 'Dokument', value: 'document' },
        { label: 'Kategoria', value: 'category' },
        { label: 'Partner', value: 'partner' },
        { label: 'Strona', value: 'page' },
        { label: 'Tag', value: 'tag' },
        { label: 'Wpis', value: 'post' },
        { label: 'Wydarzenie', value: 'event' },
      ],
      type: 'select',
    })

    expect(
      targetRow.fields
        .filter((field) => 'name' in field && field.name !== 'targetType')
        .map((field) => ('name' in field ? field.name : '')),
    ).toEqual(['eventCycle', 'document', 'category', 'partner', 'page', 'tag', 'post', 'event'])
    expect(
      targetRow.fields
        .filter((field) => 'name' in field && field.name !== 'targetType')
        .every((field) => field.admin?.width === '50%'),
    ).toBe(true)
  })

  it('does not allow clearing a selected custom URL scheme', () => {
    const customSchemeField = createLinkFields()
      .flatMap((field) => ('fields' in field ? field.fields : [field]))
      .find((field) => 'name' in field && field.name === 'customScheme')

    expect(customSchemeField).toMatchObject({
      admin: { isClearable: false },
    })
  })

  it('uses the requested add-button labels for navigation arrays', () => {
    expect(findArrayField(Navigation.fields, 'headerItems')).toMatchObject({
      labels: { singular: 'pozycję' },
    })
    expect(findArrayField(HomepageHero.fields, 'items')).toMatchObject({
      labels: { singular: 'pozycję menu w sekcji Hero' },
    })
    expect(findArrayField(Footer.fields, 'socialItems')).toMatchObject({
      labels: { singular: 'medium społecznościowe' },
    })
    expect(findArrayField(Footer.fields, 'columns')).toMatchObject({
      labels: { singular: 'kolumnę menu w stopce' },
    })
  })

  it('uses descriptive row labels for menu configuration', () => {
    expect(findArrayField(Navigation.fields, 'headerItems')).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#NavigationItemRowLabel',
        },
      },
    })
    expect(findArrayField(HomepageHero.fields, 'items')).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#NavigationItemRowLabel',
        },
      },
    })
    expect(findArrayField(Footer.fields, 'socialItems')).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#SocialItemRowLabel',
        },
      },
    })
    expect(findArrayField(Footer.fields, 'columns')).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#FooterColumnRowLabel',
        },
      },
    })

    const menuItems = findArrayField(HomepageSections.fields, 'menuItems')
    expect(menuItems).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DynamicRowLabel#FooterColumnItemRowLabel',
        },
      },
    })
  })

  it('places the header label and appearance beside each other', () => {
    const headerItems = findArrayField(Navigation.fields, 'headerItems')
    if (headerItems.type !== 'array') throw new Error('Missing header items array.')

    const firstRow = headerItems.fields.find((field) => field.type === 'row')
    if (!firstRow || firstRow.type !== 'row') throw new Error('Missing header item row.')

    expect(
      firstRow.fields.map((field) => ('name' in field ? [field.name, field.admin?.width] : [])),
    ).toEqual([
      ['label', '50%'],
      ['appearance', '50%'],
    ])
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

  it('resolves published document and post targets', () => {
    const document = {
      _status: 'published',
      id: 1,
      slug: 'regulamin-klubu',
    } as Document
    const post = {
      _status: 'published',
      id: 2,
      slug: 'nowy-wpis',
    } as Post

    expect(resolveLink({ document, targetType: 'document' })).toEqual({
      href: '/dokumenty/regulamin-klubu',
    })
    expect(resolveLink({ post, targetType: 'post' })).toEqual({ href: '/blog/nowy-wpis' })
  })

  it('recognizes only populated system or media icons', () => {
    const media = { id: 1, url: '/api/media/file/icon.svg' } as Media

    expect(getCustomIconURL(media)).toBe('/api/media/file/icon.svg')
    expect(hasRenderableIcon({ iconSource: 'system', systemIcon: 'dice' })).toBe(true)
    expect(hasRenderableIcon({ customIcon: media, iconSource: 'media' })).toBe(true)
    expect(hasRenderableIcon({ customIcon: 1, iconSource: 'media' })).toBe(false)
  })
})
