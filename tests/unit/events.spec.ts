import { readFileSync } from 'node:fs'

import type { Field } from 'payload'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import type { Event } from '@/payload-types'
import { EventCycles } from '@/collections/EventCycles'
import { Events } from '@/collections/Events'
import {
  validateCapacity,
  validateEventEnd,
  validatePostalCode,
  validateVenueWebsite,
} from '@/modules/events/fields'
import { mergeEventCycleDefaults } from '@/modules/events/defaults'
import { copyEventCycleContentToDefaults } from '@/modules/events/hooks'
import { createEventsCalendar } from '@/modules/events/ics'
import {
  normalizeGoogleMapsEmbed,
  normalizeGoogleMapsEmbedField,
  validateGoogleMapsEmbed,
} from '@/modules/events/map-embed'
import { GoogleMapEmbed } from '@/components/maps/GoogleMapEmbed'
import { formatEventDate } from '@/modules/events/presentation'

function flattenFields(fields: Field[]): Field[] {
  return fields.flatMap((field) => {
    if (field.type === 'tabs') {
      return [field, ...field.tabs.flatMap((tab) => flattenFields(tab.fields))]
    }
    if ('fields' in field && Array.isArray(field.fields)) {
      return [field, ...flattenFields(field.fields)]
    }
    return [field]
  })
}

function eventFixture(overrides: Partial<Event> = {}): Event {
  return {
    id: 1,
    title: 'Erpegowy wtorek',
    excerpt: 'Spotkanie przy grach fabularnych.',
    layout: [],
    timeMode: 'timed',
    eventStatus: 'scheduled',
    startAt: '2026-09-08T16:00:00.000Z',
    participation: 'public',
    capacityMode: 'unlimited',
    location: { country: 'Polska' },
    slug: 'erpegowy-wtorek',
    author: 1,
    calendarUID: 'event@example.test',
    calendarRevision: 2,
    updatedAt: '2026-08-18T12:00:00.000Z',
    createdAt: '2026-08-18T12:00:00.000Z',
    ...overrides,
  }
}

describe('events model', () => {
  it('keeps participation as the only audience-related Event field', () => {
    const row = flattenFields(Events.fields).find(
      (field) =>
        field.type === 'row' &&
        field.fields.some((item) => 'name' in item && item.name === 'participation'),
    )
    expect(row?.type).toBe('row')
    if (row?.type !== 'row') throw new Error('Missing participation row')
    expect(row.fields.map((field) => ('name' in field ? field.name : null))).toEqual([
      'participation',
    ])
  })

  it('organizes cycle fields into tabs and includes a default Event title', () => {
    const tabs = EventCycles.fields.find((field) => field.type === 'tabs')
    expect(tabs?.type).toBe('tabs')
    if (tabs?.type !== 'tabs') throw new Error('Missing Event Cycle tabs')

    expect(tabs.tabs.map((tab) => tab.label)).toEqual([
      'Opis cyklu',
      'SEO',
      'Domyślne dane Wydarzenia',
    ])
    const defaultsTab = tabs.tabs[2]
    const defaultsGroup = defaultsTab?.fields.find(
      (field) => 'name' in field && field.name === 'eventDefaults',
    )
    expect(defaultsGroup).toMatchObject({ type: 'group' })
    if (!defaultsGroup || defaultsGroup.type !== 'group') throw new Error('Missing Event defaults')
    expect(defaultsGroup.label).toBe(false)
    expect(defaultsGroup.fields.some((field) => 'name' in field && field.name === 'title')).toBe(
      true,
    )
  })

  it('keeps the main Cycle taxonomy in the sidebar and nested Event defaults in the form', () => {
    const categoryFields = EventCycles.fields.flatMap((field) => {
      if ('name' in field && field.name === 'category') return [field]
      if (field.type !== 'tabs') return []
      return field.tabs.flatMap((tab) =>
        tab.fields.flatMap((tabField) => {
          if (tabField.type !== 'group') return []
          return tabField.fields.flatMap((groupField) =>
            groupField.type === 'row'
              ? groupField.fields.filter(
                  (rowField) => 'name' in rowField && rowField.name === 'category',
                )
              : [],
          )
        }),
      )
    })

    expect(categoryFields).toHaveLength(2)
    expect(categoryFields.filter((field) => field.admin?.position === 'sidebar')).toHaveLength(1)
    expect(categoryFields.filter((field) => field.admin?.position !== 'sidebar')).toHaveLength(1)
  })

  it('uses expanded relationship rows, grammatical add labels and shared link targets', () => {
    const fields = flattenFields(Events.fields)
    const organizers = fields.find((field) => 'name' in field && field.name === 'organizers')
    const partners = fields.find((field) => 'name' in field && field.name === 'partners')
    const links = fields.find((field) => 'name' in field && field.name === 'externalLinks')

    expect(organizers).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/EventRelationshipRowLabel#EventOrganizerRowLabel',
        },
        initCollapsed: false,
      },
      labels: { singular: 'Organizatora' },
    })
    expect(partners).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/EventRelationshipRowLabel#EventPartnerRowLabel',
        },
        initCollapsed: false,
      },
      labels: { singular: 'Partnera' },
    })
    expect(links).toMatchObject({ admin: { initCollapsed: false }, label: 'Linki' })
    if (!links || links.type !== 'array') throw new Error('Missing Event links')
    expect(
      links.fields.map((field) =>
        field.type === 'row'
          ? field.fields.map((rowField) => ('name' in rowField ? rowField.name : null))
          : 'name' in field
            ? field.name
            : null,
      ),
    ).toEqual([
      'label',
      [
        'targetType',
        'eventCycle',
        'document',
        'category',
        'partner',
        'page',
        'tag',
        'post',
        'event',
      ],
      ['customScheme', 'customAddress'],
      'openInNewTab',
    ])
  })

  it('copies Cycle editorial content to empty Event defaults on creation', () => {
    const data = {
      eventDefaults: {},
      excerpt: 'Opis cyklu',
      heroImage: 3,
      tagline: 'Hasło cyklu',
      title: 'Cykl',
    }
    copyEventCycleContentToDefaults({ data, operation: 'create' } as never)
    expect(data.eventDefaults).toEqual({
      excerpt: 'Opis cyklu',
      heroImage: 3,
      tagline: 'Hasło cyklu',
      title: 'Cykl',
    })
  })

  it('copies complete organizer, partner and link rows into Event form data', () => {
    const merged = mergeEventCycleDefaults({ externalLinks: 0, organizers: 0, partners: 0 }, {
      id: 7,
      eventDefaults: {
        organizers: [{ id: 'organizer-row', profile: { id: 11, publicName: 'Anna' } }],
        partners: [{ id: 'partner-row', partner: { id: 12, name: 'Partner' }, roles: ['partner'] }],
        externalLinks: [
          {
            customAddress: 'example.com',
            customScheme: 'https',
            id: 'link-row',
            label: 'Informacje',
            targetType: 'custom',
          },
        ],
        layout: [
          {
            blockType: 'columnLayout',
            columns: [
              {
                blocks: [{ blockType: 'richText', id: 'nested-block-row' }],
                id: 'column-row',
                width: 6,
              },
              { blocks: [], id: 'empty-column-row', width: 6 },
            ],
            id: 'block-row',
          },
        ] as never,
        location: { country: 'Polska' },
        participation: 'public',
        capacityMode: 'unlimited',
      },
    } as never)

    expect(merged.organizers).toEqual([{ profile: 11 }])
    expect(merged.partners).toEqual([{ partner: 12, roles: ['partner'] }])
    expect(merged.externalLinks).toEqual([
      {
        customAddress: 'example.com',
        customScheme: 'https',
        label: 'Informacje',
        targetType: 'custom',
      },
    ])
    expect(merged.layout).toEqual([
      {
        blockType: 'columnLayout',
        columns: [
          { blocks: [{ blockType: 'richText' }], width: 6 },
          { blocks: [], width: 6 },
        ],
      },
    ])
    expect(merged.defaultsAppliedCycle).toBe(7)
  })

  it('formats one-day and multi-day Event dates for presentation', () => {
    expect(formatEventDate(eventFixture({ endAt: '2026-09-08T19:00:00.000Z' }))).toBe(
      '8 września 2026, 18:00 - 21:00',
    )
    expect(formatEventDate(eventFixture({ endAt: null }))).toBe('8 września 2026, od 18:00')
    expect(formatEventDate(eventFixture({ endAt: '2026-09-10T19:00:00.000Z' }))).toBe(
      '8 września 2026, 18:00 - 10 września 2026, 21:00',
    )
  })

  it('accepts HTTP and HTTPS venue websites only', () => {
    expect(validateVenueWebsite('http://example.test')).toBe(true)
    expect(validateVenueWebsite('https://example.test')).toBe(true)
    expect(validateVenueWebsite('ftp://example.test')).toBeTypeOf('string')
    expect(validateVenueWebsite('not a URL')).toBeTypeOf('string')
    expect(validateVenueWebsite('https://wiking.')).toBeTypeOf('string')
    expect(validateVenueWebsite('https://wiking.".')).toBeTypeOf('string')
  })

  it('accepts only Polish postal code formatting', () => {
    expect(validatePostalCode('50-001')).toBe(true)
    expect(validatePostalCode('5-001')).toBeTypeOf('string')
    expect(validatePostalCode('50001')).toBeTypeOf('string')
  })

  it('validates capacity and chronological order', () => {
    expect(validateCapacity(undefined, { siblingData: { capacityMode: 'exact' } })).toBeTypeOf(
      'string',
    )
    expect(validateCapacity(20, { siblingData: { capacityMode: 'approximate' } })).toBe(true)
    expect(
      validateEventEnd('2026-09-08T15:00:00Z', {
        siblingData: { startAt: '2026-09-08T16:00:00Z' },
      }),
    ).toBeTypeOf('string')
  })
})

describe('Google Maps embed sanitization', () => {
  it('fills the complete map preview container in the admin form', () => {
    const markup = renderToStaticMarkup(
      createElement(GoogleMapEmbed, { src: 'https://www.google.com/maps/embed?pb=test' }),
    )
    const adminField = readFileSync('src/components/admin/GoogleMapEmbedField.tsx', 'utf8')

    expect(markup).toContain('width:100%')
    expect(markup).toContain('height:100%')
    expect(adminField).toContain("width: '100%'")
    expect(adminField).not.toContain('maxWidth')
  })

  it('extracts a permitted iframe source', () => {
    expect(
      normalizeGoogleMapsEmbed('<iframe src="https://www.google.com/maps/embed?pb=test"></iframe>'),
    ).toBe('https://www.google.com/maps/embed?pb=test')
  })

  it('rejects scripts, non-HTTPS URLs and unrelated paths', () => {
    expect(normalizeGoogleMapsEmbed('<script>alert(1)</script>')).toBeNull()
    expect(normalizeGoogleMapsEmbed('http://www.google.com/maps/embed?pb=test')).toBeNull()
    expect(normalizeGoogleMapsEmbed('https://www.google.com/maps/search/?api=1')).toBeNull()
  })

  it('keeps an invalid value so validation can report the failed extraction', () => {
    const invalidValue = '<iframe src="https://example.test/map"></iframe>'
    expect(normalizeGoogleMapsEmbedField({ value: invalidValue } as never)).toBe(invalidValue)
    expect(validateGoogleMapsEmbed(invalidValue)).toBeTypeOf('string')
  })
})

describe('ICS generation', () => {
  it('includes a stable UID, revision, Warsaw time and escaped content', () => {
    const calendar = createEventsCalendar([eventFixture({ title: 'Gry, rozmowy; zabawa' })], 'WKF')
    expect(calendar).toContain('UID:event@example.test')
    expect(calendar).toContain('SEQUENCE:2')
    expect(calendar).toContain('DTSTART;TZID=Europe/Warsaw:20260908T180000')
    expect(calendar).toContain('SUMMARY:Gry\\, rozmowy\\; zabawa')
    expect(calendar.endsWith('\r\n')).toBe(true)
  })

  it('uses exclusive end dates for all-day events', () => {
    const calendar = createEventsCalendar([eventFixture({ timeMode: 'allDay' })], 'WKF')
    expect(calendar).toContain('DTSTART;VALUE=DATE:20260908')
    expect(calendar).toContain('DTEND;VALUE=DATE:20260909')
  })
})
