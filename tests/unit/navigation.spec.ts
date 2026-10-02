import { describe, expect, it } from 'vitest'

import type { Category, Document, Page, Post, Tag } from '@/payload-types'
import { Footer, HomepageHero, HomepageSections, Navigation } from '@/globals'
import {
  createLinkFields,
  createPresentedLinkFields,
  isCategoryTarget,
  isCustomTarget,
  isPageTarget,
  isTagTarget,
  iconNameOptions,
  presentedLinkAppearanceOptions,
  validatePresentedLinkItems,
} from '@/modules/navigation/fields'
import {
  buildCustomTarget,
  parseCustomTarget,
  validateCustomAddressValue,
} from '@/modules/navigation/custom-target'
import {
  hasRenderableIcon,
  resolveLink,
  resolveLinkTargetName,
  resolvePresentedLink,
} from '@/modules/navigation/links'

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
  it('sorts link targets alphabetically and places each destination beside the selector', () => {
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
        { label: 'Cykl wydarzeń', value: 'eventCycle' },
        { label: 'Dokument', value: 'document' },
        { label: 'Kategoria', value: 'category' },
        { label: 'Partner', value: 'partner' },
        { label: 'Strona', value: 'page' },
        { label: 'Tag', value: 'tag' },
        { label: 'Własny adres', value: 'custom' },
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

  it('sorts the site contact target alphabetically with the other destinations', () => {
    const fields = createLinkFields({ includeSiteContactEmail: true })
    const targetRow = fields.find((field) => field.type === 'row')
    if (!targetRow || targetRow.type !== 'row') throw new Error('Missing link target row.')

    const targetType = targetRow.fields.find(
      (field) => 'name' in field && field.name === 'targetType',
    )
    if (!targetType || targetType.type !== 'select') throw new Error('Missing target selector.')

    expect(targetType.options).toEqual([
      { label: 'Cykl wydarzeń', value: 'eventCycle' },
      { label: 'Dokument', value: 'document' },
      { label: 'Główny adres serwisu', value: 'siteContactEmail' },
      { label: 'Kategoria', value: 'category' },
      { label: 'Partner', value: 'partner' },
      { label: 'Strona', value: 'page' },
      { label: 'Tag', value: 'tag' },
      { label: 'Własny adres', value: 'custom' },
      { label: 'Wpis', value: 'post' },
      { label: 'Wydarzenie', value: 'event' },
    ])
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

  it('lists all named icons alphabetically by their admin labels', () => {
    expect(iconNameOptions).toHaveLength(63)
    expect(iconNameOptions.map(({ label }) => label)).toEqual(
      [...iconNameOptions.map(({ label }) => label)].sort((first, second) =>
        first.localeCompare(second, 'pl'),
      ),
    )
  })

  it('shows fields for the selected target while keeping the optional icon independent', () => {
    expect(isPageTarget(null, { targetType: 'page' })).toBe(true)
    expect(isCategoryTarget(null, { targetType: 'category' })).toBe(true)
    expect(isTagTarget(null, { targetType: 'tag' })).toBe(true)
    expect(isCustomTarget(null, { targetType: 'page' })).toBe(false)
    const iconField = createPresentedLinkFields().find(
      (field) => 'name' in field && field.name === 'iconName',
    )
    expect(iconField).toMatchObject({ admin: { components: expect.any(Object) } })
    expect(iconField?.admin?.condition).toBeUndefined()
  })

  it('uses one appearance contract in every editable menu', () => {
    for (const [fields, name] of [
      [Navigation.fields, 'headerItems'],
      [HomepageHero.fields, 'items'],
      [HomepageSections.fields, 'menuItems'],
      [Footer.fields, 'socialItems'],
      [Footer.fields, 'items'],
    ] as const) {
      const arrayField = findArrayField(fields, name)
      if (arrayField.type !== 'array') throw new Error(`Missing menu array: ${name}`)
      const appearance = findField(arrayField.fields, 'appearance')
      expect(appearance).toMatchObject({
        defaultValue: 'link',
        options: [...presentedLinkAppearanceOptions],
        required: true,
      })
    }
  })

  it('allows at most one primary action in a presented-link group', () => {
    expect(
      validatePresentedLinkItems([
        { appearance: 'primaryButton' },
        { appearance: 'secondaryButton' },
      ]),
    ).toBe(true)
    expect(
      validatePresentedLinkItems([
        { appearance: 'primaryButton' },
        { appearance: 'primaryButton' },
      ]),
    ).toBe('W jednej grupie może znajdować się najwyżej jeden przycisk główny.')
  })

  it('requires an icon but no separate accessible-name field when visible text is empty', async () => {
    const fields = createPresentedLinkFields()
    const labelField = findField(fields, 'label')
    const iconField = findField(fields, 'iconName')
    const accessibleLabelField = findField(fields, 'accessibleLabel')
    if (
      !labelField ||
      !('validate' in labelField) ||
      typeof labelField.validate !== 'function' ||
      !iconField ||
      !('validate' in iconField) ||
      typeof iconField.validate !== 'function'
    ) {
      throw new Error('Missing presented-link validators')
    }

    expect(await labelField.validate('', { siblingData: {} } as never)).toBeTypeOf('string')
    expect(await labelField.validate('', { siblingData: { iconName: 'mail' } } as never)).toBe(true)
    expect(await iconField.validate(null, { siblingData: { label: '' } } as never)).toBeTypeOf(
      'string',
    )
    expect(accessibleLabelField).toBeUndefined()
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

  it('builds an encoded contact action from site settings and omits it without an address', () => {
    const target = {
      emailBody: 'Pierwsza linia\nDruga linia',
      emailSubject: 'Dołączenie do WKF',
      targetType: 'siteContactEmail',
    }

    expect(resolveLink(target, { siteContactEmail: 'kontakt@example.com' })).toEqual({
      href: 'mailto:kontakt@example.com?subject=Do%C5%82%C4%85czenie+do+WKF&body=Pierwsza+linia%0ADruga+linia',
    })
    expect(resolveLink(target)).toBeNull()
  })

  it('resolves text, icon with text and icon-only links without placeholder targets', () => {
    const target = {
      appearance: 'link',
      customAddress: 'kontakt',
      customScheme: 'path',
      targetType: 'custom',
    }

    expect(resolvePresentedLink({ ...target, label: 'Kontakt' })).toMatchObject({
      accessibleName: 'Kontakt',
      iconOnly: false,
      label: 'Kontakt',
    })
    expect(resolvePresentedLink({ ...target, iconName: 'mail', label: 'Kontakt' })).toMatchObject({
      iconName: 'mail',
      iconOnly: false,
    })
    expect(
      resolvePresentedLink({
        ...target,
        iconName: 'mail',
        label: '',
      }),
    ).toMatchObject({ accessibleName: 'Kontakt', iconOnly: true, label: '' })
    expect(resolvePresentedLink({ ...target, label: '' })).toBeNull()
    expect(resolvePresentedLink({ ...target, customAddress: '', label: 'Brak celu' })).toBeNull()
  })

  it('derives icon-only accessible names from each target kind', () => {
    expect(resolveLinkTargetName({ page: createPage(), targetType: 'page' })).toBe('O nas')
    expect(
      resolveLinkTargetName({
        customAddress: 'www.wkf.example/spotkania',
        customScheme: 'https',
        targetType: 'custom',
      }),
    ).toBe('wkf.example')
    expect(
      resolveLinkTargetName(
        { targetType: 'siteContactEmail' },
        { siteContactEmail: 'kontakt@example.com' },
      ),
    ).toBe('kontakt@example.com')
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

  it('recognizes only valid named icons', () => {
    expect(hasRenderableIcon({ iconName: 'dice' })).toBe(true)
    expect(hasRenderableIcon({ iconName: 'not-in-the-library' })).toBe(false)
    expect(hasRenderableIcon({ iconName: null })).toBe(false)
  })
})
