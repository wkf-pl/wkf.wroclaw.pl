import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import { createRichTextDocument, extractRichTextText } from '@/modules/content/rich-text'
import type { Partner, User } from '@/payload-types'
import { findPublicContent } from '@/modules/content/content-listing'
import { findEventsForPartner, findPublishedPartnerBySlug } from '@/modules/events/public-events'
import { publicRequestContext } from '@/modules/content/public-access'
import { GET as getCalendar } from '@/app/(frontend)/events/calendar.json/route'

import { createIntegrationAuthor, deleteIntegrationAuthor } from '../helpers/integration-author'

const slugs = {
  cancelled: 'integration-cancelled-event',
  cycle: 'integration-event-cycle',
  cycleEvent: 'integration-cycle-event',
  cycleEventSecond: 'integration-cycle-event-second',
  draft: 'integration-draft-event',
  members: 'integration-members-event',
  partner: 'integration-events-partner',
  public: 'integration-public-event',
}

let payload: Payload
let author: User
let partner: Partner

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
          slugs.cancelled,
          slugs.public,
          slugs.members,
          slugs.draft,
          slugs.cycleEvent,
          slugs.cycleEventSecond,
        ],
      },
    },
  })
  await payload.delete({
    collection: 'event-cycles',
    overrideAccess: true,
    where: { slug: { equals: slugs.cycle } },
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
  partner = await payload.create({
    collection: 'partners',
    data: {
      _status: 'published',
      author: author.id,
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
  await deleteIntegrationAuthor(payload, author)
})

function eventData(
  slug: string,
  participation: 'members' | 'public',
  status: 'draft' | 'published',
) {
  return {
    _status: status,
    author: author.id,
    calendarRevision: 0,
    capacityMode: 'unlimited' as const,
    eventStatus: 'scheduled' as const,
    eventType: 1,
    excerpt: createRichTextDocument([`Integration event ${slug}`]),
    layout: layout(),
    location: { city: 'Wrocław', country: 'Polska', venueName: 'WKF' },
    participation,
    slug,
    startAt: '2030-09-10T16:00:00.000Z',
    timeMode: 'timed' as const,
    title: slug,
  }
}

describe('events integration', () => {
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
          ...eventData(slugs.cancelled, 'public', 'published'),
          eventStatus: 'cancelled',
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
      [slugs.cancelled, slugs.members, slugs.public].sort(),
    )

    const publicListing = await findPublicContent({
      eventTimeFilter: 'upcoming',
      page: 1,
      pageSize: 10,
      pagination: true,
      sort: 'eventDateAscending',
      sources: ['events'],
    })
    expect(publicListing.items.map((item) => item.url)).toContain(`/events/${slugs.public}`)
    expect(publicListing.items.map((item) => item.url)).toContain(`/events/${slugs.members}`)

    const publicPartner = await findPublishedPartnerBySlug(slugs.partner)
    const partnerEvents = await findEventsForPartner(partner.id)
    expect(publicPartner?.id).toBe(partner.id)
    expect(partnerEvents.map((event) => event.slug)).toContain(slugs.public)
    expect(partnerEvents.map((event) => event.slug)).toContain(slugs.members)
  })

  it('serves public scheduled Events and the Event type dictionary by month', async () => {
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
      expect.arrayContaining([slugs.public, slugs.members]),
    )
    expect(data.events.map((event) => event.slug)).not.toContain(slugs.draft)
    expect(data.events.map((event) => event.slug)).not.toContain(slugs.cancelled)
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

  it('copies cycle defaults once and records published calendar metadata', async () => {
    const cycle = await payload.create({
      collection: 'event-cycles',
      draft: false,
      overrideAccess: true,
      data: {
        _status: 'published',
        author: author.id,
        excerpt: createRichTextDocument(['Integration cycle']),
        layout: layout(),
        slug: slugs.cycle,
        title: 'Integration cycle',
        eventDefaults: {
          capacityMode: 'unlimited',
          eventType: 1,
          excerpt: createRichTextDocument(['Copied cycle excerpt']),
          layout: layout(),
          location: { city: 'Wrocław', country: 'Polska', venueName: 'Cycle venue' },
          participation: 'public',
        },
      },
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
        location: { country: 'Polska' },
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
        location: { country: 'Polska' },
      },
    })
    expect(extractRichTextText(event.excerpt)).toBe('Copied cycle excerpt')
    expect(event.location.venueName).toBe('Cycle venue')
    expect(
      typeof event.defaultsAppliedCycle === 'object'
        ? event.defaultsAppliedCycle?.id
        : event.defaultsAppliedCycle,
    ).toBe(cycle.id)
    expect(event.calendarUID).toMatch(/@wkf\.wroclaw\.pl$/)
    expect(event.calendarRevision).toBe(1)
    expect(event.layout[0]?.id).not.toBe(secondEvent.layout[0]?.id)

    const cycleListing = await findPublicContent({
      eventCycleId: cycle.id,
      eventTimeFilter: 'upcoming',
      page: 1,
      pageSize: 10,
      pagination: true,
      sort: 'eventDateAscending',
      sources: ['events'],
    })
    expect(cycleListing.items.map((item) => item.url).sort()).toEqual(
      [`/events/${slugs.cycleEvent}`, `/events/${slugs.cycleEventSecond}`].sort(),
    )
    await payload.delete({ collection: 'events', id: event.id, overrideAccess: true })
    await payload.delete({ collection: 'events', id: secondEvent.id, overrideAccess: true })
  })
})
