import { describe, expect, it } from 'vitest'

import {
  resolvePageTemplateActionLinks,
  resolvePageTemplateListingItems,
} from '@/modules/page-templates/page-template-context'
import type { Event, EventCycle, Partner } from '@/payload-types'

const partner = {
  id: 12,
  name: 'Przystań Wyobraźni',
  slug: 'przystan-wyobrazni',
} as Partner

const cycle = {
  calendarFeedKey: 'cycle-feed',
  id: 13,
  slug: 'wyprawy',
  title: 'Wyprawy',
} as EventCycle

function createEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: 14,
    location: {
      city: 'Wrocław',
      country: 'Polska',
      postalCode: '50-001',
      streetAddress: 'ul. Wyobraźni 12',
      venueName: 'Przystań Wyobraźni',
    },
    partners: [{ contribution: 'Sala oraz materiały do gry', partner, roles: ['venueHost'] }],
    slug: 'pierwsza-wyprawa',
    title: 'Pierwsza wyprawa',
    ...overrides,
  } as Event
}

describe('page template context', () => {
  it('keeps standard action targets and adds event-specific actions', () => {
    const items = resolvePageTemplateActionLinks(
      [
        {
          appearance: 'link',
          customAddress: 'kontakt',
          customScheme: 'path',
          iconName: 'mail',
          label: 'Kontakt',
          targetType: 'custom',
        },
        {
          appearance: 'link',
          contextAction: 'eventCalendar',
          iconName: 'calendar',
          label: '',
          actionSource: 'contextAction',
        },
        {
          appearance: 'link',
          contextAction: 'eventMap',
          iconName: 'location',
          label: 'Mapa',
          actionSource: 'contextAction',
        },
        {
          appearance: 'link',
          contextAction: 'eventCycleCalendar',
          iconName: 'calendar',
          label: '',
          actionSource: 'contextAction',
        },
      ],
      createEvent({ cycle }),
    )

    expect(items.map(({ link }) => link.href)).toEqual([
      '/kontakt',
      '/events/pierwsza-wyprawa/calendar.ics',
      expect.stringContaining('google.com/maps'),
      '/events/calendar.ics?series=cycle-feed',
    ])
    expect(items[1]).toMatchObject({
      accessibleName: 'Dodaj do kalendarza',
      iconOnly: true,
    })
    expect(items[3]).toMatchObject({
      accessibleName: 'Subskrybuj cykl',
      iconOnly: true,
    })
  })

  it('omits unavailable contextual actions', () => {
    const items = resolvePageTemplateActionLinks(
      [
        {
          appearance: 'link',
          contextAction: 'eventMap',
          iconName: 'location',
          label: 'Mapa',
          actionSource: 'contextAction',
        },
        {
          appearance: 'link',
          contextAction: 'eventCycleCalendar',
          iconName: 'calendar',
          label: 'Subskrybuj',
          actionSource: 'contextAction',
        },
      ],
      createEvent({
        cycle: null,
        location: {
          city: '',
          country: 'Polska',
          postalCode: '',
          streetAddress: '',
          venueName: '',
        },
      }),
    )

    expect(items).toEqual([])
  })

  it('resolves partners from the current event with their roles and contribution labels', () => {
    expect(resolvePageTemplateListingItems('eventPartners', createEvent())).toEqual([
      {
        contextLabel: 'Sala oraz materiały do gry',
        partnerRoles: ['venueHost'],
        relationTo: 'partners',
        value: partner,
      },
    ])
  })
})
