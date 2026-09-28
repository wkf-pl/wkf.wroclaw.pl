import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import {
  EventHeroEyebrow,
  EventSidebar,
  EventSummary,
} from '@/app/(frontend)/events/[slug]/EventDetails'
import type { Event, EventType, MemberProfile, Partner } from '@/payload-types'

const eventType = {
  id: 1,
  name: 'Sesje RPG',
  iconName: 'dice',
  iconColor: 'lantern-glow',
  createdAt: '2026-09-01T12:00:00.000Z',
  updatedAt: '2026-09-01T12:00:00.000Z',
} satisfies EventType

describe('event detail presentation', () => {
  it('uses the CMS-managed event type icon and displays the event status', () => {
    const markup = renderToStaticMarkup(
      createElement(EventHeroEyebrow, {
        eventStatus: 'scheduled',
        eventType,
      }),
    )

    expect(markup).toContain('data-icon-name="dice"')
    expect(markup).toContain('data-event-type-color="lantern-glow"')
    expect(markup).toContain('Sesje RPG')
    expect(markup).toContain('Zaplanowane')
  })

  it('puts the event decision facts and actions in one summary panel', () => {
    const markup = renderToStaticMarkup(
      createElement(EventSummary, {
        event: {
          capacityMode: 'approximate',
          capacity: 24,
          endAt: '2026-09-29T20:00:00.000Z',
          location: {
            city: 'Wrocław',
            country: 'Polska',
            postalCode: '50-141',
            streetAddress: 'pl. Nowy Targ 28',
            venueName: 'Wiking Club',
          },
          participation: 'public',
          slug: 'erpegowy-wtorek-v',
          startAt: '2026-09-29T16:00:00.000Z',
          timeMode: 'timed',
        } satisfies Pick<
          Event,
          | 'capacity'
          | 'capacityMode'
          | 'endAt'
          | 'location'
          | 'participation'
          | 'slug'
          | 'startAt'
          | 'timeMode'
        >,
        mapURL: 'https://www.google.com/maps/search/?api=1&query=Wiking+Club',
      }),
    )

    expect(markup).toContain('Kiedy')
    expect(markup).toContain('<strong class="eventFactPrimary">29 września 2026</strong>')
    expect(markup).toContain('<span class="eventFactSecondary">18:00–22:00</span>')
    expect(markup).toContain('<strong class="eventFactPrimary">Wiking Club</strong>')
    expect(markup).toContain(
      '<span class="eventFactSecondary">pl. Nowy Targ 28, 50-141 Wrocław</span>',
    )
    expect(markup).toContain('class="eventFact eventFact--combined"')
    expect(markup).toContain('Wydarzenie publiczne')
    expect(markup).toContain('Około 24')
    expect(markup).toContain('href="/events/erpegowy-wtorek-v/calendar.ics"')
    expect(markup).toContain('Dodaj do kalendarza')
    expect(markup).toContain('Otwórz w Mapach')
  })

  it('renders organizers and partners as separate sidebar sections', () => {
    const organizer = {
      id: 2,
      publicName: 'Alicja Kowalska',
      slug: 'alicja-kowalska',
      contactChannels: [{ id: 'email', type: 'email', url: 'alicja@example.test' }],
    } as MemberProfile
    const partner = {
      id: 3,
      name: 'Wiking Club',
      slug: 'wiking-club',
    } as Partner
    const markup = renderToStaticMarkup(
      createElement(EventSidebar, {
        organizers: [
          {
            id: 'organizer',
            profile: organizer,
            role: 'Prowadząca',
            showContactChannels: true,
          },
        ],
        partners: [
          {
            id: 'partner',
            partner,
            roles: ['venueHost'],
          },
        ],
      }),
    )

    expect(markup).toContain('<h2>Organizatorzy</h2>')
    expect(markup).toContain('href="/members/alicja-kowalska"')
    expect(markup).toContain('Alicja Kowalska')
    expect(markup).toContain('mailto:alicja@example.test')
    expect(markup).toContain('<h2>Partnerzy</h2>')
    expect(markup).toContain('href="/partners/wiking-club"')
    expect(markup).toContain('Gospodarz miejsca')
  })

  it('defines four summary columns and a responsive event body with a quieter sidebar', () => {
    const styles = readFileSync('src/app/(frontend)/styles.css', 'utf8')
    const eventPage = readFileSync('src/app/(frontend)/events/[slug]/page.tsx', 'utf8')

    expect(styles).toMatch(
      /\.eventFacts \{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/,
    )
    expect(styles).toMatch(/\.eventFact > dd \{[\s\S]*?padding-left:/)
    expect(styles).toMatch(
      /\.eventPrimaryAction,[\s\S]*?\.eventSecondaryAction \{[\s\S]*?grid-template-columns: 1rem minmax\(0, 1fr\);[\s\S]*?text-align: left;/,
    )
    expect(styles).toContain('.eventPageColumns')
    expect(styles).toContain('.eventSidebarSection')
    expect(styles).toMatch(
      /@media \(width <= 62rem\)[\s\S]*?\.eventPageColumns \{[\s\S]*?grid-template-columns: minmax\(0, 1fr\);/,
    )
    expect(styles).not.toContain('.eventMap {')
    expect(eventPage).not.toContain('GoogleMapEmbed')
    expect(eventPage).not.toContain('heroVariant=')
  })
})
