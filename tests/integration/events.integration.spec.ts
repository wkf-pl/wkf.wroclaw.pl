import { createLocationFixture, deleteLocationFixture } from '../helpers/location-fixture'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload, type PayloadRequest } from 'payload'

import config from '@/payload.config'
import { createRichTextDocument, extractRichTextText } from '@/modules/content/rich-text'
import type { Event, Partner, Role, User } from '@/payload-types'
import { findPublicContent } from '@/modules/content/content-listing'
import { createEventFromCycleEndpoint } from '@/modules/events/create-event-from-cycle'
import { createEventsCalendar } from '@/modules/events/ics'
import { createNextEventEndpoint } from '@/modules/events/create-next-event'
import {
  findCurrentAndUpcomingEvents,
  findEventsForPartner,
  findPastEvents,
  findPublishedPartnerBySlug,
} from '@/modules/events/public-events'
import { publicRequestContext } from '@/modules/content/public-access'
import { GET as getCalendar } from '@/app/(frontend)/events/calendar.json/route'

import { createIntegrationAuthor, deleteIntegrationAuthor } from '../helpers/integration-author'

const slugs = {
  other: 'integration-other-event',
  locationEvent: 'integration-location-event',
  completed: 'integration-completed-event',
  cycle: 'integration-event-cycle',
  cycleEvent: 'integration-cycle-event',
  cycleEventSecond: 'integration-cycle-event-second',
  draft: 'integration-draft-event',
  endpointCycle: 'integration-endpoint-event-cycle',
  endpointScheduleCycle: 'integration-endpoint-schedule-cycle',
  endpointSchedulePrevious: 'integration-endpoint-schedule-previous',
  members: 'integration-members-event',
  partner: 'integration-events-partner',
  public: 'integration-public-event',
}

let payload: Payload
let author: User
let partner: Partner
let userRole: Role
let scheduleGroupId: number | undefined

function createEndpointRequest({
  body,
  id,
  user,
}: {
  body?: Record<string, unknown>
  id: number | string
  user: null | User
}): PayloadRequest {
  return {
    context: {},
    headers: new Headers(),
    json: async () => body ?? {},
    payload,
    routeParams: { id },
    user,
  } as unknown as PayloadRequest
}

function layout() {
  return [
    {
      blockType: 'richText' as const,
      content: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Integration event content',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: null,
              format: '' as const,
              indent: 0,
              textFormat: 0,
              textStyle: '',
              type: 'paragraph' as const,
              version: 1,
            },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          type: 'root' as const,
          version: 1,
        },
      },
    },
  ]
}

async function cleanup() {
  if (!payload) {
    return
  }

  await payload.delete({
    collection: 'events',
    overrideAccess: true,
    where: {
      slug: {
        in: [
          slugs.other,
          slugs.completed,
          slugs.public,
          slugs.members,
          slugs.draft,
          slugs.cycleEvent,
          slugs.cycleEventSecond,
          slugs.endpointSchedulePrevious,
        ],
      },
    },
  })
  await payload.delete({
    collection: 'event-cycles',
    overrideAccess: true,
    where: {
      slug: { in: [slugs.cycle, slugs.endpointCycle, slugs.endpointScheduleCycle] },
    },
  })
  await payload.delete({
    collection: 'partners',
    overrideAccess: true,
    where: { slug: { equals: slugs.partner } },
  })
}

beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanup()
  author = await createIntegrationAuthor(payload, 'events')
  const roles = await payload.find({
    collection: 'roles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { key: { equals: 'user' } },
  })
  const migratedUserRole = roles.docs[0]
  if (!migratedUserRole) {
    throw new Error('Integration test requires the migrated user role.')
  }
  userRole = migratedUserRole
  partner = await payload.create({
    collection: 'partners',
    data: {
      _status: 'published',
      author: { relationTo: 'users', value: author.id },
      excerpt: 'Integration events partner',
      layout: layout(),
      name: 'Integration events partner',
      slug: slugs.partner,
    },
    draft: false,
    overrideAccess: true,
  })
})

afterAll(async () => {
  await cleanup()
  if (scheduleGroupId) await payload.delete({ collection: 'user-groups', id: scheduleGroupId })
  await deleteLocationFixture(payload, 'Cycle venue integration')
  await deleteIntegrationAuthor(payload, author)
})

function eventData(
  slug: string,
  participation: 'members' | 'public',
  status: 'draft' | 'published',
) {
  return {
    _status: status,
    author: { relationTo: 'users' as const, value: author.id },
    calendarRevision: 0,
    capacityMode: 'unlimited' as const,
    eventType: 1,
    excerpt: createRichTextDocument([`Integration event ${slug}`]),
    layout: layout(),

    participation,
    slug,
    startAt: '2030-09-10T16:00:00.000Z',
    timeMode: 'timed' as const,
    title: slug,
  }
}

describe('events integration', () => {
  it('keeps the published event and its dates in the calendar after it ends', async () => {
    const event = await payload.create({
      collection: 'events',
      data: {
        ...eventData(slugs.completed, 'public', 'published'),
        endAt: '2020-01-01T18:00:00.000Z',
        startAt: '2020-01-01T16:00:00.000Z',
      },
      draft: false,
      overrideAccess: true,
    })

    expect(event).not.toHaveProperty('eventStatus')

    const rereadEvent = await payload.findByID({
      collection: 'events',
      depth: 0,
      id: event.id,
      overrideAccess: true,
    })
    expect(rereadEvent).toMatchObject({ startAt: event.startAt, endAt: event.endAt })

    const calendarResponse = await getCalendar(
      new Request('http://localhost/events/calendar.json?month=2020-01'),
    )
    const calendarData = (await calendarResponse.json()) as { events: { slug: string }[] }
    expect(calendarData.events.map(({ slug }) => slug)).toContain(slugs.completed)
  })

  it('enforces collection access in Event creation endpoints', async () => {
    const anonymousCycleResponse = await createEventFromCycleEndpoint.handler(
      createEndpointRequest({ id: -1, user: null }),
    )
    const anonymousNextResponse = await createNextEventEndpoint.handler(
      createEndpointRequest({ body: { startAt: '2030-09-11T16:00:00.000Z' }, id: -1, user: null }),
    )
    expect(anonymousCycleResponse.status).toBe(401)
    expect(anonymousNextResponse.status).toBe(401)

    const cycle = await payload.create({
      collection: 'event-cycles',
      data: {
        _status: 'published',
        author: { relationTo: 'users', value: author.id },
        eventDefaults: {
          capacityMode: 'unlimited',
          eventType: 1,
          excerpt: createRichTextDocument(['Endpoint event excerpt']),
          layout: layout(),

          participation: 'public',
        },
        excerpt: createRichTextDocument(['Endpoint integration cycle']),
        layout: layout(),
        slug: slugs.endpointCycle,
        title: 'Endpoint integration cycle',
      },
      draft: false,
      overrideAccess: true,
    })
    const restrictedUser: User = {
      ...author,
      displayName: 'Restricted integration user',
      email: 'restricted-events@example.invalid',
      id: -100,
      roles: [userRole.id],
    }
    const createdEventIds: number[] = []

    try {
      const deniedCycleResponse = await createEventFromCycleEndpoint.handler(
        createEndpointRequest({ id: cycle.id, user: restrictedUser }),
      )
      expect(deniedCycleResponse.status).toBe(403)

      const allowedCycleResponse = await createEventFromCycleEndpoint.handler(
        createEndpointRequest({ id: cycle.id, user: author }),
      )
      expect(allowedCycleResponse.status).toBe(201)
      const allowedCycleBody = (await allowedCycleResponse.json()) as { doc: { id: number } }
      createdEventIds.push(allowedCycleBody.doc.id)
      const createdCycleEvent = await payload.findByID({
        collection: 'events',
        depth: 0,
        id: allowedCycleBody.doc.id,
        overrideAccess: true,
      })
      expect(extractRichTextText(createdCycleEvent.excerpt)).toBe('Endpoint event excerpt')
      expect(createdCycleEvent.layout).toHaveLength(1)
      expect(JSON.stringify(createdCycleEvent.layout)).toContain('Integration event content')
      expect(createdCycleEvent.startAt).toBeNull()
      expect(createdCycleEvent.endAt).toBeNull()

      const deniedNextResponse = await createNextEventEndpoint.handler(
        createEndpointRequest({
          body: { startAt: '2030-09-11T16:00:00.000Z' },
          id: allowedCycleBody.doc.id,
          user: restrictedUser,
        }),
      )
      expect(deniedNextResponse.status).toBe(403)

      const allowedNextResponse = await createNextEventEndpoint.handler(
        createEndpointRequest({
          body: { startAt: '2030-09-11T16:00:00.000Z' },
          id: allowedCycleBody.doc.id,
          user: author,
        }),
      )
      expect(allowedNextResponse.status).toBe(201)
      const allowedNextBody = (await allowedNextResponse.json()) as { doc: { id: number } }
      createdEventIds.push(allowedNextBody.doc.id)

      const missingSourceResponse = await createNextEventEndpoint.handler(
        createEndpointRequest({
          body: { startAt: '2030-09-11T16:00:00.000Z' },
          id: 2_147_483_647,
          user: author,
        }),
      )
      expect(missingSourceResponse.status).toBe(404)

      const invalidInputResponse = await createNextEventEndpoint.handler(
        createEndpointRequest({ body: { startAt: 'not-a-date' }, id: cycle.id, user: author }),
      )
      expect(invalidInputResponse.status).toBe(400)
    } finally {
      for (const eventId of createdEventIds) {
        await payload.delete({ collection: 'events', id: eventId, overrideAccess: true })
      }
    }
  })

  it('calculates the next Cycle Event dates from the latest dated Event', async () => {
    const groupName = 'Scheduled event editors'
    await payload.delete({ collection: 'user-groups', where: { name: { equals: groupName } } })
    const group = await payload.create({
      collection: 'user-groups',
      data: { name: groupName, members: [author.id] },
    })
    scheduleGroupId = group.id
    const cycle = await payload.create({
      collection: 'event-cycles',
      data: {
        _status: 'published',
        author: { relationTo: 'users', value: author.id },
        eventDefaults: {
          authorGroup: group.id,
          capacityMode: 'unlimited',
          defaultDayCount: 1,
          defaultEndTime: '22:00',
          defaultStartTime: '18:00',
          eventType: 1,
          excerpt: createRichTextDocument(['Scheduled endpoint event excerpt']),
          layout: layout(),

          participation: 'public',
          recurrenceType: 'weekly',
          recurrenceWeekday: 'tuesday',
          weekInterval: 2,
        },
        excerpt: createRichTextDocument(['Scheduled endpoint integration cycle']),
        layout: layout(),
        slug: slugs.endpointScheduleCycle,
        title: 'Scheduled endpoint integration cycle',
      },
      draft: false,
      overrideAccess: true,
    })
    const previousEvent = await payload.create({
      collection: 'events',
      data: {
        ...eventData(slugs.endpointSchedulePrevious, 'public', 'published'),
        cycle: cycle.id,
        startAt: '2030-03-12T17:00:00.000Z',
      },
      draft: false,
      overrideAccess: true,
    })
    let createdEventID: number | undefined

    try {
      const response = await createEventFromCycleEndpoint.handler(
        createEndpointRequest({ id: cycle.id, user: author }),
      )
      expect(response.status).toBe(201)
      const body = (await response.json()) as { doc: { id: number } }
      createdEventID = body.doc.id
      const createdEvent = await payload.findByID({
        collection: 'events',
        depth: 0,
        id: createdEventID,
        overrideAccess: true,
      })

      expect(createdEvent.author).toEqual({ relationTo: 'user-groups', value: group.id })
      expect(createdEvent.startAt).toBe('2030-03-26T17:00:00.000Z')
      expect(createdEvent.endAt).toBe('2030-03-26T21:00:00.000Z')
      expect(JSON.stringify(createdEvent.layout)).toContain('Integration event content')
    } finally {
      if (createdEventID) {
        await payload.delete({ collection: 'events', id: createdEventID, overrideAccess: true })
      }
      await payload.delete({ collection: 'events', id: previousEvent.id, overrideAccess: true })
      await payload.delete({ collection: 'event-cycles', id: cycle.id, overrideAccess: true })
    }
  })

  it('shows all published events publicly while keeping drafts hidden', async () => {
    await Promise.all([
      payload.create({
        collection: 'events',
        data: {
          ...eventData(slugs.public, 'public', 'published'),
          partners: [{ partner: partner.id, roles: ['partner'] }],
        },
        draft: false,
        overrideAccess: true,
      }),
      payload.create({
        collection: 'events',
        data: {
          ...eventData(slugs.members, 'members', 'published'),
          partners: [{ partner: partner.id, roles: ['partner'] }],
        },
        draft: false,
        overrideAccess: true,
      }),
      payload.create({
        collection: 'events',
        data: eventData(slugs.draft, 'public', 'draft'),
        draft: true,
        overrideAccess: true,
      }),
      payload.create({
        collection: 'events',
        data: {
          ...eventData(slugs.other, 'public', 'published'),
        },
        draft: false,
        overrideAccess: true,
      }),
    ])
    const anonymous = await payload.find({
      collection: 'events',
      context: publicRequestContext,
      draft: false,
      overrideAccess: false,
      user: null,
      where: { slug: { in: Object.values(slugs) } },
    })
    expect(anonymous.docs.map((event) => event.slug).sort()).toEqual(
      [slugs.other, slugs.completed, slugs.members, slugs.public].sort(),
    )

    const publicListing = await findPublicContent({
      conditions: [{ eventTimeValue: 'upcoming', field: 'eventTime', operator: 'equals' }],
      page: 1,
      pageSize: 10,
      pagination: true,
      sort: 'oldest',
      sources: ['events'],
    })
    expect(publicListing.items.map((item) => item.url)).toContain(`/events/${slugs.public}`)
    expect(publicListing.items.map((item) => item.url)).toContain(`/events/${slugs.members}`)
    expect(publicListing.items.map((item) => item.url)).not.toContain(`/events/${slugs.completed}`)

    const publicPartner = await findPublishedPartnerBySlug(slugs.partner)
    const partnerEvents = await findEventsForPartner(partner.id)
    expect(publicPartner?.id).toBe(partner.id)
    expect(partnerEvents.map((event) => event.slug)).toContain(slugs.public)
    expect(partnerEvents.map((event) => event.slug)).toContain(slugs.members)
  })

  it('uses the end time or, when absent, the start time in both event listings', async () => {
    const now = Date.now()
    const hour = 3_600_000
    const earlier = new Date(now - hour).toISOString()
    const later = new Date(now + hour).toISOString()
    const fixtures = [
      { key: 'ongoing', startAt: earlier, endAt: later },
      { key: 'future-without-end', startAt: later },
      { key: 'past-without-end', startAt: earlier },
      { key: 'finished', startAt: earlier, endAt: earlier },
    ]
    const events: Event[] = []
    try {
      for (const { key, ...dates } of fixtures) {
        events.push(
          await payload.create({
            collection: 'events',
            data: {
              ...eventData(`integration-event-time-${key}`, 'public', 'published'),
              ...dates,
            },
            draft: false,
            overrideAccess: true,
          }),
        )
      }
      const [ongoing, future, pastWithoutEnd, finished] = events
      const findListingItems = (eventTimeValue: 'upcoming' | 'past') =>
        findPublicContent({
          conditions: [{ eventTimeValue, field: 'eventTime', operator: 'equals' }],
          page: 1,
          pageSize: 100,
          pagination: false,
          sort: 'oldest',
          sources: ['events'],
        })
      const [upcomingEvents, pastEvents, upcomingListing, pastListing] = await Promise.all([
        findCurrentAndUpcomingEvents(100),
        findPastEvents(1, 100),
        findListingItems('upcoming'),
        findListingItems('past'),
      ])
      for (const ids of [
        upcomingEvents.map(({ id }) => id),
        upcomingListing.items.map(({ document }) => document.id),
      ]) {
        expect(ids).toEqual(expect.arrayContaining([ongoing.id, future.id]))
        expect(ids).not.toContain(pastWithoutEnd.id)
        expect(ids).not.toContain(finished.id)
      }
      for (const ids of [
        pastEvents.docs.map(({ id }) => id),
        pastListing.items.map(({ document }) => document.id),
      ]) {
        expect(ids).toEqual(expect.arrayContaining([pastWithoutEnd.id, finished.id]))
        expect(ids).not.toContain(ongoing.id)
        expect(ids).not.toContain(future.id)
      }
    } finally {
      for (const { id } of events) {
        await payload.delete({ collection: 'events', id, overrideAccess: true })
      }
    }
  })

  it('serves published Events and the Event type dictionary by month', async () => {
    const invalid = await getCalendar(
      new Request('http://localhost/events/calendar.json?month=bad'),
    )
    expect(invalid.status).toBe(400)

    const response = await getCalendar(
      new Request('http://localhost/events/calendar.json?month=2030-09'),
    )
    expect(response.status).toBe(200)
    const data = (await response.json()) as {
      eventTypes: { name: string }[]
      events: { slug: string }[]
      truncated: boolean
    }

    expect(data.events.map((event) => event.slug)).toEqual(
      expect.arrayContaining([slugs.public, slugs.members, slugs.other]),
    )
    expect(data.events.map((event) => event.slug)).not.toContain(slugs.draft)
    expect(data.eventTypes.map((eventType) => eventType.name)).toEqual(['Sesje RPG', 'Spotkania'])
    expect(data.truncated).toBe(false)
  })

  it('grants Event type management to Event editors and protects used types', async () => {
    const roles = await payload.find({
      collection: 'roles',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { key: { equals: 'editor' } },
    })
    expect(roles.docs[0]?.permissions).toContainEqual(
      expect.objectContaining({
        canCreate: true,
        deleteAllowed: true,
        readAllowed: true,
        resource: 'event-types',
        updateAllowed: true,
      }),
    )

    await expect(
      payload.delete({ collection: 'event-types', id: 1, overrideAccess: true }),
    ).rejects.toThrow('Nie można usunąć rodzaju używanego')
  })

  it('keeps an inactive location in event history but excludes it from new assignments and automatic Listings', async () => {
    const location = await createLocationFixture(payload, {
      venueName: 'Shared location integration',
    })
    const event = await payload.create({
      collection: 'events',
      data: {
        ...eventData(slugs.locationEvent, 'public', 'published'),
        location: location.id,
        onlineEventURL: 'https://example.org/meet',
      },
    })
    try {
      await payload.update({
        collection: 'partners',
        id: partner.id,
        data: { locations: [location.id] },
      })
      const listingOptions = {
        currentTarget: { relationTo: 'partners', value: partner.id } as const,
        conditions: [
          { field: 'relatedTo', operator: 'contains', relatedTargetMode: 'current' },
        ] as const,
        page: 1,
        pageSize: 10,
        pagination: false,
        sources: ['locations'] as 'locations'[],
        sort: 'titleAscending' as const,
      }
      const listOptions = { ...listingOptions, conditions: [...listingOptions.conditions] }
      expect((await findPublicContent(listOptions)).items).toMatchObject([
        {
          kind: 'locations',
          document: { id: location.id },
          url: expect.stringContaining('google.com/maps'),
        },
      ])

      await payload.update({
        collection: 'locations',
        id: location.id,
        draft: true,
        data: { _status: 'draft', streetAddress: 'ul. Nieopublikowana 4' },
      })
      const afterDraft = await payload.findByID({ collection: 'events', id: event.id, depth: 1 })
      expect(afterDraft.location).toMatchObject({ streetAddress: location.streetAddress })
      expect(afterDraft.calendarRevision).toBe(event.calendarRevision)

      await payload.update({
        collection: 'locations',
        id: location.id,
        data: { _status: 'published', isActive: false, streetAddress: 'ul. Poprawiona 5' },
      })
      const archived = await payload.findByID({ collection: 'events', id: event.id, depth: 1 })
      expect(archived.location).toMatchObject({
        isActive: false,
        streetAddress: 'ul. Poprawiona 5',
      })
      expect(archived.calendarRevision).toBe(event.calendarRevision + 1)
      expect(archived.calendarUID).toBe(event.calendarUID)
      const calendar = createEventsCalendar([archived], 'Test').replaceAll('\r\n ', '')
      expect(calendar).toContain('https://example.org/meet')
      expect(calendar).toContain('ul. Poprawiona 5')
      expect((await findPublicContent(listOptions)).items).toEqual([])
      expect(
        (await findPublicContent({ ...listOptions, includeInactiveLocations: true })).items,
      ).toMatchObject([{ document: { id: location.id } }])
      await expect(
        payload.update({
          collection: 'events',
          id: event.id,
          data: { location: location.id, title: 'Existing event with the old address' },
        }),
      ).resolves.toMatchObject({ title: 'Existing event with the old address' })
      await expect(
        payload.create({
          collection: 'events',
          data: {
            ...eventData(slugs.locationEvent + '-new', 'public', 'draft'),
            location: location.id,
          },
          draft: true,
        }),
      ).rejects.toThrow('aktywnego, opublikowanego miejsca')
      await expect(
        payload.update({
          collection: 'locations',
          id: location.id,
          data: { _status: 'draft' },
        }),
      ).rejects.toThrow('Miejsce jest używane')
      await expect(payload.delete({ collection: 'locations', id: location.id })).rejects.toThrow(
        'Miejsce jest używane',
      )
    } finally {
      await payload.update({ collection: 'partners', id: partner.id, data: { locations: [] } })
      await payload.delete({ collection: 'events', id: event.id })
      await payload.delete({ collection: 'locations', id: location.id })
    }
  })

  it('copies cycle defaults once and records published calendar metadata', async () => {
    const location = await createLocationFixture(payload, { venueName: 'Cycle venue integration' })
    const cycle = await payload.create({
      collection: 'event-cycles',
      draft: false,
      overrideAccess: true,
      data: {
        _status: 'published',
        author: { relationTo: 'users', value: author.id },
        excerpt: createRichTextDocument(['Integration cycle']),
        layout: layout(),
        slug: slugs.cycle,
        title: 'Integration cycle',
        eventDefaults: {
          capacityMode: 'unlimited',
          eventType: 1,
          excerpt: createRichTextDocument(['Copied cycle excerpt']),
          layout: layout(),
          location: location.id,
          participation: 'public',
        },
      },
    })
    const cycleIndex = await payload.find({
      collection: 'content-listing-items',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ source: { equals: 'event-cycles' } }, { sourceDocumentId: { equals: cycle.id } }],
      },
    })
    expect(cycleIndex.docs[0]).toMatchObject({
      hasSignificantDate: false,
      significantDate: null,
    })
    expect(cycle.eventDefaults.title).toBe('Integration cycle')
    const event = await payload.create({
      collection: 'events',
      draft: false,
      overrideAccess: true,
      data: {
        ...eventData(slugs.cycleEvent, 'public', 'published'),
        cycle: cycle.id,
        excerpt: createRichTextDocument([]),
        layout: [],
      },
    })
    const secondEvent = await payload.create({
      collection: 'events',
      draft: false,
      overrideAccess: true,
      data: {
        ...eventData(slugs.cycleEventSecond, 'public', 'published'),
        cycle: cycle.id,
        excerpt: createRichTextDocument([]),
        layout: [],
      },
    })
    const eventIndex = await payload.find({
      collection: 'content-listing-items',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        and: [{ source: { equals: 'events' } }, { sourceDocumentId: { equals: event.id } }],
      },
    })
    expect(eventIndex.docs[0]).toMatchObject({
      hasSignificantDate: true,
      significantDate: event.startAt,
    })
    expect(extractRichTextText(event.excerpt)).toBe('Copied cycle excerpt')
    expect(event.location).toMatchObject({ id: location.id, venueName: location.venueName })
    expect(
      typeof event.defaultsAppliedCycle === 'object'
        ? event.defaultsAppliedCycle?.id
        : event.defaultsAppliedCycle,
    ).toBe(cycle.id)
    expect(event.calendarUID).toMatch(/@wkf\.wroclaw\.pl$/)
    expect(event.calendarRevision).toBe(1)
    expect(event.layout[0]?.id).not.toBe(secondEvent.layout[0]?.id)

    const cycleListing = await findPublicContent({
      conditions: [
        {
          field: 'eventCycle',
          operator: 'equals',
          relationshipValue: { relationTo: 'event-cycles', value: cycle.id },
        },
        { eventTimeValue: 'upcoming', field: 'eventTime', operator: 'equals' },
      ],
      page: 1,
      pageSize: 10,
      pagination: true,
      sort: 'oldest',
      sources: ['events'],
    })
    expect(cycleListing.items.map((item) => item.url).sort()).toEqual(
      [`/events/${slugs.cycleEvent}`, `/events/${slugs.cycleEventSecond}`].sort(),
    )
    await payload.delete({ collection: 'events', id: event.id, overrideAccess: true })
    await payload.delete({ collection: 'events', id: secondEvent.id, overrideAccess: true })
  })
})
