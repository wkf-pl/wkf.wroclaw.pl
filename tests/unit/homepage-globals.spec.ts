import { describe, expect, it } from 'vitest'

import { ClubSections } from '@/collections/ClubSections'
import { Footer, HomepageHero, HomepageSections, Navigation, SiteSettings } from '@/globals'

const homepageGlobals = [SiteSettings, Navigation, HomepageHero, HomepageSections, Footer]

function namedFields(fields: typeof SiteSettings.fields): string[] {
  return fields.flatMap((field) => {
    if ('name' in field && field.name) return [field.name]
    if (field.type === 'row') return namedFields(field.fields)
    return []
  })
}

function tabLabels(fields: typeof HomepageSections.fields): string[] {
  return fields.flatMap((field) =>
    field.type === 'tabs' ? field.tabs.map((tab) => String(tab.label)) : [],
  )
}

function fieldsInTab(fields: typeof HomepageSections.fields, label: string): string[] {
  for (const field of fields) {
    if (field.type !== 'tabs') continue
    const tab = field.tabs.find((candidate) => candidate.label === label)
    if (tab) return namedFields(tab.fields)
  }

  throw new Error(`Missing tab: ${label}`)
}

describe('homepage globals', () => {
  it('shows the five requested entries in the Strona główna group', () => {
    expect(homepageGlobals.map((global) => global.admin?.group)).toEqual(
      Array.from({ length: 5 }, () => 'Strona główna'),
    )
    expect(homepageGlobals.map((global) => global.label)).toEqual([
      'Podstawowe',
      'Nagłówek',
      'Hero',
      'Treści',
      'Stopka',
    ])
  })

  it('keeps drafts and the latest 50 versions with authenticated history access', () => {
    const previewButton = '/components/admin/DraftPreviewButton#DraftPreviewButton'

    for (const global of homepageGlobals) {
      expect(global.versions).toEqual({ drafts: true, max: 50 })
      expect(global.access?.readVersions).toBeTypeOf('function')
      expect(global.admin?.components?.elements?.PreviewButton).toBe(previewButton)
      expect(global.admin?.preview).toBeTypeOf('function')
    }
  })

  it('does not expose saved global drafts to anonymous API requests', async () => {
    for (const global of homepageGlobals) {
      const readAccess = global.access?.read
      expect(readAccess).toBeTypeOf('function')

      await expect(
        readAccess?.({ req: { query: { draft: true }, user: null } } as never),
      ).resolves.toBe(false)
      await expect(readAccess?.({ req: { query: {}, user: null } } as never)).resolves.toBe(true)
    }
  })

  it('keeps only general and SEO fields in Podstawowe', () => {
    expect(namedFields(SiteSettings.fields)).toEqual([
      'siteName',
      'siteDescription',
      'contactEmail',
    ])
  })

  it('places the logo and header menu in Nagłówek', () => {
    expect(namedFields(Navigation.fields)).toEqual(['logo', 'headerItems'])
  })

  it('places editable media, formatted title, content and menu in Hero', () => {
    expect(namedFields(HomepageHero.fields)).toEqual(['image', 'title', 'content', 'items'])
    expect(
      HomepageHero.fields.find((field) => 'name' in field && field.name === 'title'),
    ).toMatchObject({ label: 'Tytuł', required: true, type: 'richText' })
  })

  it('shows only the content layout in Treści', () => {
    expect(tabLabels(HomepageSections.fields)).toEqual([])
    expect(namedFields(HomepageSections.fields)).toEqual(['layout'])

    const layout = HomepageSections.fields.find(
      (field) => 'name' in field && field.name === 'layout',
    )
    expect(layout).toMatchObject({ label: 'Treści', type: 'blocks' })
    expect(ClubSections.admin?.hidden).toBe(true)
  })

  it('uses the requested footer tabs and fields', () => {
    expect(tabLabels(Footer.fields)).toEqual(['Logo', 'Kontakt', 'Menu'])
    expect(fieldsInTab(Footer.fields, 'Logo')).toEqual(['copyright', 'content'])
    expect(fieldsInTab(Footer.fields, 'Kontakt')).toEqual(['contactHeading', 'socialItems'])
    expect(fieldsInTab(Footer.fields, 'Menu')).toEqual(['columns'])
  })
})
