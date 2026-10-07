import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findContentCalendarMonth } from '@/modules/content/content-calendar-data'

import {
  createContentTaxonomyFixture,
  type ContentTaxonomyFixture,
} from '../helpers/content-taxonomy-fixture'
import { createLexicalDocument } from '../helpers/lexical-document'

const calendarCycleSlug = 'integration-content-calendar-cycle'
const calendarEventSlug = 'integration-content-calendar-event'
const otherEventSlug = 'integration-content-calendar-other-event'
let fixture: ContentTaxonomyFixture

beforeAll(async () => {
  fixture = await createContentTaxonomyFixture('content-calendar')
  await cleanupCalendarFixtures()
}, 20_000)

afterAll(async () => {
  await cleanupCalendarFixtures()
  await fixture?.cleanup()
})

describe('content calendar', () => {
  it('filters mixed published content and persists the block configuration', async () => {
    const cycle = await fixture.payload.create({
      collection: 'event-cycles',
      data: {
        _status: 'published',
        author: fixture.author.id,
        eventDefaults: {
          capacityMode: 'unlimited',
          eventType: 1,
          excerpt: createLexicalDocument('Calendar cycle defaults'),
          layout: [{ blockType: 'richText', content: createLexicalDocument('Default content') }],
          location: { city: 'Wrocław', country: 'Polska' },
          participation: 'public',
        },
        excerpt: createLexicalDocument('Calendar cycle'),
        layout: [{ blockType: 'richText', content: createLexicalDocument('Cycle content') }],
        slug: calendarCycleSlug,
        title: 'Calendar cycle',
      },
      draft: false,
      overrideAccess: true,
    })
    const createEvent = (slug: string, cycleId?: number) =>
      fixture.payload.create({
        collection: 'events',
        data: {
          _status: 'published',
          author: fixture.author.id,
          calendarRevision: 0,
          capacityMode: 'unlimited',
          category: fixture.category.id,
          cycle: cycleId,
          eventStatus: 'scheduled',
          eventType: 1,
          excerpt: createLexicalDocument(`Excerpt ${slug}`),
          layout: [{ blockType: 'richText', content: createLexicalDocument(`Content ${slug}`) }],
          location: { city: 'Wrocław', country: 'Polska' },
          participation: 'public',
          slug,
          startAt: '2026-08-14T16:00:00.000Z',
          tags: [fixture.tag.id],
          timeMode: 'timed',
          title: slug,
        },
        draft: false,
        overrideAccess: true,
      })

    const [matchingEvent] = await Promise.all([
      createEvent(calendarEventSlug, cycle.id),
      createEvent(otherEventSlug),
    ])
    const containerPage = await fixture.payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: fixture.author.id,
        layout: [
          {
            blockType: 'contentCalendar',
            category: fixture.category.id,
            eventCycle: cycle.id,
            sources: ['events', 'posts'],
            tag: fixture.tag.id,
          },
        ],
        slug: fixture.slugs.lifecyclePage,
        title: 'Integration content calendar container',
      },
      overrideAccess: true,
    })

    const result = await findContentCalendarMonth('2026-08', {
      categoryId: fixture.category.id,
      eventCycleId: cycle.id,
      sources: ['events', 'posts'],
      tagId: fixture.tag.id,
    })
    const storedPage = await fixture.payload.findByID({
      collection: 'pages',
      depth: 0,
      id: containerPage.id,
      overrideAccess: true,
    })
    const storedBlock = storedPage.layout.find((block) => block.blockType === 'contentCalendar')

    expect(result.items.map((item) => item.id)).toEqual([
      `posts:${fixture.post.id}`,
      `events:${matchingEvent.id}`,
    ])
    expect(result.items.map((item) => item.kind)).toEqual(['posts', 'events'])
    expect(storedBlock).toMatchObject({
      category: fixture.category.id,
      eventCycle: cycle.id,
      sources: ['events', 'posts'],
      tag: fixture.tag.id,
    })
  })
})

async function cleanupCalendarFixtures(): Promise<void> {
  if (!fixture?.payload) return

  await fixture.payload.delete({
    collection: 'events',
    overrideAccess: true,
    where: { slug: { in: [calendarEventSlug, otherEventSlug] } },
  })
  await fixture.payload.delete({
    collection: 'event-cycles',
    overrideAccess: true,
    where: { slug: { equals: calendarCycleSlug } },
  })
}
