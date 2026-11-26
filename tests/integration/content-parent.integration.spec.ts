import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findContentSearchOptions, findPublicContent } from '@/modules/content/content-listing'
import type { ContentListingReference } from '@/modules/content/listing-conditions'
import {
  createContentTaxonomyFixture,
  type ContentTaxonomyFixture,
} from '../helpers/content-taxonomy-fixture'
import { createLexicalDocument } from '../helpers/lexical-document'

let fixture: ContentTaxonomyFixture

beforeAll(async () => {
  fixture = await createContentTaxonomyFixture('content-parent')
}, 20_000)

afterAll(async () => {
  await fixture?.cleanup()
})

describe('content parent and search taxonomy', () => {
  it('keeps cyclic events in the published branch and follows a published cycle move', async () => {
    const { payload, page, childPage, author } = fixture
    const layout = [
      { blockType: 'richText' as const, content: createLexicalDocument('Hierarchy test') },
    ]
    const cycle = await payload.create({
      collection: 'event-cycles',
      data: {
        _status: 'published',
        author: author.id,
        title: 'Hierarchy test cycle',
        slug: 'hierarchy-test-cycle',
        parent: childPage.id,
        excerpt: layout[0].content,
        layout,
        eventDefaults: { eventType: 1, capacityMode: 'unlimited', participation: 'public', layout },
      },
    })

    const event = await payload.create({
      collection: 'events',
      data: {
        _status: 'published',
        author: author.id,
        title: 'Hierarchy test event',
        slug: 'hierarchy-test-event',
        parent: page.id,
        cycle: cycle.id,
        eventType: 1,
        startAt: '2026-12-01T17:00:00Z',
        timeMode: 'timed',
        capacityMode: 'unlimited',
        calendarRevision: 0,
        participation: 'public',
        excerpt: layout[0].content,
        layout,
      },
    })

    function search(parent: ContentListingReference, operator: 'equals' | 'inSubtree') {
      return findPublicContent({
        conditions: [
          {
            field: 'contentParent',
            operator,
            relatedTargetMode: 'selected',
            relatedTargetValue: parent,
          },
        ],
        page: 1,
        pageSize: 10,
        pagination: true,
        sort: 'titleAscending',
        sources: ['events'],
      })
    }

    const root = { relationTo: 'pages' as const, value: page.id }
    const cycleReference = { relationTo: 'event-cycles' as const, value: cycle.id }
    try {
      expect(event.parent).toBeNull()
      expect((await search(root, 'equals')).totalDocs).toBe(0)
      expect((await search(root, 'inSubtree')).items.map(({ document }) => document.id)).toEqual([
        event.id,
      ])
      expect((await search(cycleReference, 'equals')).totalDocs).toBe(1)
      await expect(payload.delete({ collection: 'event-cycles', id: cycle.id })).rejects.toThrow(
        'przenieś jego dzieci',
      )

      await payload.update({
        collection: 'event-cycles',
        id: cycle.id,
        draft: true,
        data: { parent: null },
      })
      expect((await search(root, 'inSubtree')).totalDocs).toBe(1)
      await payload.update({
        collection: 'event-cycles',
        id: cycle.id,
        draft: false,
        data: { _status: 'published', parent: null },
      })
      expect((await search(root, 'inSubtree')).totalDocs).toBe(0)

      const detached = await payload.update({
        collection: 'events',
        id: event.id,
        data: { cycle: null, parent: page.id },
      })
      expect(detached.cycle).toBeNull()
      expect((await search(root, 'equals')).totalDocs).toBe(1)
    } finally {
      await payload.delete({ collection: 'events', id: event.id })
      await payload.delete({ collection: 'event-cycles', id: cycle.id })
    }
  }, 20_000)

  it('combines multiple topics with an intersection across tag groups', async () => {
    const { payload, page, topic, post, tag } = fixture
    const literature = await payload.create({
      collection: 'topics',
      data: { name: 'Literatura', slug: 'taxonomy-literature' },
    })
    const work = await payload.create({
      collection: 'tag-groups',
      data: { name: 'Rodzaj pracy', slug: 'taxonomy-work-type' },
    })
    const system = await payload.create({
      collection: 'tag-groups',
      data: { name: 'System RPG', slug: 'taxonomy-system' },
    })
    const scenario = await payload.create({
      collection: 'tags',
      data: { name: 'Scenariusz', slug: 'taxonomy-scenario', group: work.id },
    })
    const guide = await payload.create({
      collection: 'tags',
      data: { name: 'Poradnik', slug: 'taxonomy-guide', group: work.id },
    })
    const cthulhu = await payload.create({
      collection: 'tags',
      data: { name: 'Zew Cthulhu', slug: 'taxonomy-cthulhu', group: system.id },
    })
    try {
      expect(scenario.displayName).toBe('Rodzaj pracy › Scenariusz')
      await payload.update({
        collection: 'posts',
        id: post.id,
        data: {
          parent: page.id,
          topics: [topic.id, literature.id],
          tags: [scenario.id, cthulhu.id],
        },
      })
      const scope = {
        sources: ['posts' as const],
        conditions: [
          { field: 'title' as const, operator: 'equals' as const, textValue: post.title },
        ],
      }
      const options = await findContentSearchOptions(scope, {
        topics: true,
        tags: false,
        branches: true,
        groups: [work.id, system.id],
      })
      expect(options.topics.map(({ id }) => id)).toEqual(
        expect.arrayContaining([topic.id, literature.id]),
      )
      expect(options.branches).toContainEqual(
        expect.objectContaining({ value: `pages:${page.id}` }),
      )
      expect(options.tagGroups?.flatMap(({ tags }) => tags.map(({ id }) => id))).toEqual(
        expect.arrayContaining([scenario.id, cthulhu.id]),
      )
      const result = await findPublicContent({
        ...scope,
        page: 1,
        pageSize: 10,
        pagination: true,
        sort: 'titleAscending',
        searchFilters: {
          topicIds: [topic.id, literature.id],
          tagGroups: [[scenario.id, guide.id], [cthulhu.id]],
          branch: `pages:${page.id}`,
        },
      })
      expect(result.totalDocs).toBe(1)
      expect(result.items[0].document.id).toBe(post.id)
      await payload.update({
        collection: 'posts',
        id: post.id,
        draft: true,
        data: {
          layout: [
            ...post.layout,
            {
              blockType: 'listing',
              selectionMode: 'filters',
              sources: ['posts'],
              pageSize: 10,
              sort: 'titleAscending',
              searchEnabled: true,
              filterTagGroups: [work.id],
              view: 'cards',
            },
          ],
        },
      })
      await expect(payload.delete({ collection: 'tag-groups', id: work.id })).rejects.toThrow(
        'usuń odwołania do tej grupy',
      )
    } finally {
      await payload.update({
        collection: 'posts',
        id: post.id,
        data: {
          _status: 'published',
          layout: post.layout,
          parent: null,
          topics: [topic.id],
          tags: [tag.id],
        },
        draft: false,
      })
      await payload.delete({ collection: 'tag-groups', id: work.id })
      const detached = await payload.findByID({ collection: 'tags', id: scenario.id, depth: 0 })
      expect(detached.group).toBeNull()
      expect(detached.displayName).toBe('Scenariusz')
      for (const id of [scenario.id, guide.id, cthulhu.id])
        await payload.delete({ collection: 'tags', id })
      await payload.delete({ collection: 'tag-groups', id: system.id })
      await payload.delete({ collection: 'topics', id: literature.id })
    }
  }, 20_000)
})
