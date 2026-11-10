import { renderToReadableStream } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { EventTemplateDocument } from '@/app/(frontend)/events/[slug]/EventTemplateDocument'
import type { Event, EventCycle, EventType, PageTemplate, Partner } from '@/payload-types'

import { createLexicalDocument } from '../helpers/lexical-document'

const eventType = {
  createdAt: '2026-11-04T12:00:00.000Z',
  iconColor: 'lantern-glow',
  iconName: 'dice',
  id: 1,
  name: 'Sesje RPG',
  updatedAt: '2026-11-04T12:00:00.000Z',
} satisfies EventType

const partner = {
  createdAt: '2026-11-04T12:00:00.000Z',
  id: 2,
  name: 'Przystań Wyobraźni',
  slug: 'przystan-wyobrazni',
  updatedAt: '2026-11-04T12:00:00.000Z',
} as Partner

const cycle = {
  calendarFeedKey: 'pierwsza-wyprawa-feed',
  id: 5,
  slug: 'wyprawy',
  title: 'Wyprawy',
} as EventCycle

const event = {
  author: 1,
  capacity: 24,
  capacityMode: 'approximate',
  calendarRevision: 0,
  cycle,
  createdAt: '2026-11-04T12:00:00.000Z',
  endAt: '2040-02-18T20:00:00.000Z',
  eventStatus: 'scheduled',
  eventType,
  excerpt: createLexicalDocument('Opis wydarzenia z Hero.'),
  id: 3,
  layout: [
    {
      blockType: 'richText',
      content: createLexicalDocument('Właściwa treść wydarzenia.'),
    },
  ],
  location: {
    city: 'Wrocław',
    country: 'Polska',
    postalCode: '50-001',
    streetAddress: 'ul. Wyobraźni 12',
    venueName: 'Przystań Wyobraźni',
  },
  participation: 'public',
  partners: [{ contribution: 'Sala oraz materiały do gry', partner, roles: ['venueHost'] }],
  slug: 'pierwsza-wyprawa',
  startAt: '2040-02-18T16:00:00.000Z',
  timeMode: 'timed',
  title: 'Pierwsza wyprawa',
  updatedAt: '2026-11-04T12:00:00.000Z',
} as Event

const template = {
  _status: 'published',
  content: [
    { blockType: 'currentItemContent' },
    { blockType: 'currentItemField', field: 'partners', variant: 'list' },
  ],
  createdAt: '2026-11-04T12:00:00.000Z',
  hero: [
    {
      blockType: 'currentItemFieldRow',
      items: [
        { blockType: 'currentItemField', field: 'eventType', variant: 'badge' },
        {
          blockType: 'fieldRowText',
          style: 'badge',
          text: createLexicalDocument('—'),
        },
        { blockType: 'currentItemField', field: 'eventStatus', variant: 'badge' },
      ],
    },
    { blockType: 'currentItemField', field: 'title', variant: 'primaryHeading' },
    { blockType: 'currentItemField', field: 'excerpt', variant: 'lead' },
    {
      blockType: 'currentItemFieldRow',
      items: [
        { blockType: 'currentItemField', field: 'eventCycle', variant: 'inline' },
        {
          alignment: 'start',
          blockType: 'actionLinks',
          items: [
            {
              appearance: 'link',
              contextAction: 'eventCycleCalendar',
              iconName: 'calendar',
              label: '',
              actionSource: 'contextAction',
            },
          ],
          layout: 'inline',
        },
      ],
    },
  ],
  id: 4,
  informationPanel: [
    {
      blockType: 'infoColumns',
      columnSeparators: 'none',
      columns: [
        {
          blocks: [{ blockType: 'currentItemField', field: 'eventTime', variant: 'icon' }],
          width: 6,
        },
        {
          blocks: [
            { blockType: 'currentItemField', field: 'eventLocation', variant: 'icon' },
            { blockType: 'currentItemField', field: 'eventAudience', variant: 'plain' },
            { blockType: 'currentItemField', field: 'eventCapacity', variant: 'plain' },
          ],
          width: 6,
        },
      ],
      verticalAlignment: 'start',
    },
    {
      alignment: 'start',
      blockType: 'actionLinks',
      items: [
        {
          appearance: 'link',
          contextAction: 'eventCalendar',
          iconName: 'calendar',
          label: 'Dodaj do kalendarza',
          actionSource: 'contextAction',
        },
      ],
      layout: 'inline',
    },
    {
      alignment: 'start',
      blockType: 'actionLinks',
      items: [
        {
          appearance: 'link',
          contextAction: 'eventMap',
          iconName: 'location',
          label: 'Otwórz w Mapach',
          actionSource: 'contextAction',
        },
      ],
      layout: 'inline',
    },
  ],
  renderingMode: 'template',
  templateKey: 'event-detail',
  updatedAt: '2026-11-04T12:00:00.000Z',
} as PageTemplate

describe('event page template document', () => {
  it('places configured event fields in the hero, information panel, and content regions', async () => {
    const rendered = await EventTemplateDocument({
      event,
      searchParams: {},
      template,
    })
    const markup = await new Response(await renderToReadableStream(rendered)).text()

    expect(markup).toContain('class="contentHeroPage pageTemplatePage"')
    expect(markup).toContain('<h1>Pierwsza wyprawa</h1>')
    expect(markup).toContain('Sesje RPG')
    expect(markup).toContain('Zaplanowane')
    expect(markup).toContain('class="pageTemplateFieldRow"')
    expect(markup).toMatch(
      /Sesje RPG.*class="pageTemplateFieldRowText pageTemplateBadge">—<\/span>.*Zaplanowane/,
    )
    expect(markup).toContain('Opis wydarzenia z Hero.')
    expect(markup).toContain('href="/events/series/wyprawy"')
    expect(markup).toContain('aria-label="Subskrybuj cykl"')
    expect(markup).toContain('href="/events/calendar.ics?series=pierwsza-wyprawa-feed"')
    expect(markup).toContain('aria-label="Panel informacyjny"')
    expect(markup).not.toContain('Kiedy')
    expect(markup).not.toContain('Gdzie')
    expect(markup).not.toContain('data-icon-name="dice"')
    expect(markup).toContain('Przystań Wyobraźni')
    expect(markup).toContain('Wydarzenie publiczne')
    expect(markup).toContain('Około 24')
    expect(markup).toContain('href="/events/pierwsza-wyprawa/calendar.ics"')
    expect(markup).toContain('Otwórz w Mapach')
    expect(markup).toContain('Właściwa treść wydarzenia.')
    expect(markup).toContain('href="/partners/przystan-wyobrazni"')
    expect(markup).not.toContain('class="eventDetails"')
  })
})
