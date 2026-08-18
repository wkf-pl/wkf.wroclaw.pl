import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Event, Role, User } from '@/payload-types'
import { websiteRequestContext } from '@/modules/membership/role-permissions'

const slugs = {
  cycle: 'integration-event-cycle',
  cycleEvent: 'integration-cycle-event',
  cycleEventSecond: 'integration-cycle-event-second',
  draft: 'integration-draft-event',
  members: 'integration-members-event',
  public: 'integration-public-event',
}

let payload: Payload
let author: User
let memberRole: Role

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

function memberUser(): User {
  return {
    collection: 'users',
    createdAt: new Date(0).toISOString(),
    displayName: 'Integration Member',
    email: 'integration-member@example.invalid',
    id: -100,
    roles: [memberRole.id],
    updatedAt: new Date(0).toISOString(),
  }
}

async function cleanup() {
  await payload.delete({
    collection: 'events',
    overrideAccess: true,
    where: {
      slug: {
        in: [slugs.public, slugs.members, slugs.draft, slugs.cycleEvent, slugs.cycleEventSecond],
      },
    },
  })
  await payload.delete({
    collection: 'event-cycles',
    overrideAccess: true,
    where: { slug: { equals: slugs.cycle } },
  })
}

beforeAll(async () => {
  payload = await getPayload({ config })
  const [users, roles] = await Promise.all([
    payload.find({ collection: 'users', depth: 0, limit: 1, overrideAccess: true }),
    payload.find({
      collection: 'roles',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { key: { equals: 'member' } },
    }),
  ])
  if (!users.docs[0] || !roles.docs[0])
    throw new Error('Integration test requires an author and the member role.')
  author = users.docs[0]
  memberRole = roles.docs[0]
  await cleanup()
})

afterAll(cleanup)

function eventData(slug: string, visibility: Event['visibility'], status: 'draft' | 'published') {
  return {
    _status: status,
    author: author.id,
    calendarRevision: 0,
    capacityMode: 'unlimited' as const,
    eventStatus: 'scheduled' as const,
    excerpt: `Integration event ${slug}`,
    layout: layout(),
    location: { city: 'Wrocław', country: 'Polska', venueName: 'WKF' },
    participation: visibility === 'members' ? ('members' as const) : ('public' as const),
    slug,
    startAt: '2030-09-10T16:00:00.000Z',
    timeMode: 'timed' as const,
    title: slug,
    visibility,
  }
}

describe('events integration', () => {
  it('keeps drafts and member-only events out of anonymous website reads', async () => {
    await Promise.all([
      payload.create({
        collection: 'events',
        data: eventData(slugs.public, 'public', 'published'),
        draft: false,
        overrideAccess: true,
      }),
      payload.create({
        collection: 'events',
        data: eventData(slugs.members, 'members', 'published'),
        draft: false,
        overrideAccess: true,
      }),
      payload.create({
        collection: 'events',
        data: eventData(slugs.draft, 'public', 'draft'),
        draft: true,
        overrideAccess: true,
      }),
    ])
    const anonymous = await payload.find({
      collection: 'events',
      context: websiteRequestContext,
      draft: false,
      overrideAccess: false,
      user: null,
      where: { slug: { in: Object.values(slugs) } },
    })
    expect(anonymous.docs.map((event) => event.slug)).toEqual([slugs.public])

    const member = await payload.find({
      collection: 'events',
      context: websiteRequestContext,
      draft: false,
      overrideAccess: false,
      user: memberUser(),
      where: { slug: { in: Object.values(slugs) } },
    })
    expect(member.docs.map((event) => event.slug).sort()).toEqual(
      [slugs.members, slugs.public].sort(),
    )
  })

  it('copies cycle defaults once and records published calendar metadata', async () => {
    const cycle = await payload.create({
      collection: 'event-cycles',
      draft: false,
      overrideAccess: true,
      data: {
        _status: 'published',
        author: author.id,
        excerpt: 'Integration cycle',
        layout: layout(),
        slug: slugs.cycle,
        title: 'Integration cycle',
        visibility: 'public',
        eventDefaults: {
          capacityMode: 'unlimited',
          excerpt: 'Copied cycle excerpt',
          layout: layout(),
          location: { city: 'Wrocław', country: 'Polska', venueName: 'Cycle venue' },
          participation: 'public',
          visibility: 'public',
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
        excerpt: '',
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
        excerpt: '',
        layout: [],
        location: { country: 'Polska' },
      },
    })
    expect(event.excerpt).toBe('Copied cycle excerpt')
    expect(event.location.venueName).toBe('Cycle venue')
    expect(
      typeof event.defaultsAppliedCycle === 'object'
        ? event.defaultsAppliedCycle?.id
        : event.defaultsAppliedCycle,
    ).toBe(cycle.id)
    expect(event.calendarUID).toMatch(/@wkf\.wroclaw\.pl$/)
    expect(event.calendarRevision).toBe(1)
    expect(event.layout[0]?.id).not.toBe(secondEvent.layout[0]?.id)
    await payload.delete({ collection: 'events', id: event.id, overrideAccess: true })
    await payload.delete({ collection: 'events', id: secondEvent.id, overrideAccess: true })
  })
})
