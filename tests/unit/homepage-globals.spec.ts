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
      'Sekcje',
      'Stopka',
    ])
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

  it('uses the requested section tabs and fields', () => {
    expect(tabLabels(HomepageSections.fields)).toEqual(['Wydarzenia', 'Aktualności', 'Grupy'])
    expect(fieldsInTab(HomepageSections.fields, 'Wydarzenia')).toEqual([
      'eventsTitle',
      'eventsContent',
      'eventWindowWeeks',
      'eventSlideLimit',
    ])
    expect(fieldsInTab(HomepageSections.fields, 'Aktualności')).toEqual(['newsTitle', 'postCount'])
    expect(fieldsInTab(HomepageSections.fields, 'Grupy')).toEqual(['sectionsTitle', 'groups'])

    const groups = HomepageSections.fields
      .filter((field) => field.type === 'tabs')
      .flatMap((field) => field.tabs)
      .flatMap((tab) => tab.fields)
      .find((field) => 'name' in field && field.name === 'groups')
    expect(groups).toMatchObject({ label: 'Grupy', type: 'array' })
    expect(ClubSections.admin?.hidden).toBe(true)
  })

  it('uses the requested footer tabs and fields', () => {
    expect(tabLabels(Footer.fields)).toEqual(['Logo', 'Kontakt', 'Menu'])
    expect(fieldsInTab(Footer.fields, 'Logo')).toEqual(['copyright', 'content'])
    expect(fieldsInTab(Footer.fields, 'Kontakt')).toEqual(['contactHeading', 'socialItems'])
    expect(fieldsInTab(Footer.fields, 'Menu')).toEqual(['columns'])
  })
})
