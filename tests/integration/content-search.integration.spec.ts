import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findContentSearchOptions, findPublicContent } from '@/modules/content/content-listing'
import type { ContentSearchFilters } from '@/modules/content/content-search-filters'
import { createIntegrationAuthor, deleteIntegrationAuthor } from '../helpers/integration-author'
import {
  createContentTaxonomyFixture,
  type ContentTaxonomyFixture,
} from '../helpers/content-taxonomy-fixture'

let fixture: ContentTaxonomyFixture

beforeAll(async () => {
  fixture = await createContentTaxonomyFixture('search')
}, 20_000)

afterAll(async () => {
  await fixture?.cleanup()
})

function search(filters?: ContentSearchFilters) {
  return findPublicContent({
    conditions: [
      {
        field: 'topic',
        operator: 'inSubtree',
        relationshipValue: { relationTo: 'topics', value: fixture.topic.id },
      },
    ],
    page: 1,
    pageSize: 10,
    pagination: true,
    searchFilters: filters,
    sort: 'titleAscending',
    sources: ['pages', 'posts'],
  })
}

describe('public content search', () => {
  it('intersects tag and topic filters, then paginates the matching types', async () => {
    const { topic, childPage, page, payload, post, tag } = fixture
    const group = await payload.create({
      collection: 'tag-groups',
      data: { name: 'Search formats', slug: 'search-formats', iconName: 'book' },
    })
    const story = await payload.create({
      collection: 'tags',
      data: { name: 'Search story', slug: 'search-story', group: group.id },
    })
    const excluded = await payload.create({
      collection: 'tags',
      data: { name: 'Search outside', slug: 'search-outside' },
    })
    const childTopic = await payload.create({
      collection: 'topics',
      data: { name: 'Search subtopic', slug: 'search-subtopic', parent: topic.id },
    })
    try {
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: {
          topics: [childTopic.id],
          listingExcerpt: 'Słońce świeci w 50% albo 50X.',
          tags: [tag.id, story.id],
        },
      })
      await payload.update({
        collection: 'pages',
        id: childPage.id,
        data: { tags: [tag.id, story.id, excluded.id] },
      })
      const options = await findContentSearchOptions(
        {
          conditions: [
            {
              field: 'topic',
              operator: 'inSubtree',
              relationshipValue: { relationTo: 'topics', value: topic.id },
            },
          ],
          sources: ['pages', 'posts'],
        },
        { topics: true, tags: true, groups: [group.id], author: true },
      )
      expect(options.topics).toEqual([
        { id: topic.id, label: topic.name },
        { id: childTopic.id, label: `${topic.name} / ${childTopic.name}` },
      ])
      expect(options.tags.map(({ id }) => id)).toEqual([tag.id, story.id])
      expect(options.authors).toEqual([
        { id: fixture.author.id, label: fixture.author.displayName },
      ])
      expect(options.tags).toContainEqual({ id: story.id, label: story.name, groupIcon: 'book' })
      expect(
        await payload.findByID({ collection: 'tag-groups', id: group.id, depth: 1 }),
      ).toMatchObject({ tags: { docs: [{ id: story.id, name: story.name }] } })

      expect(
        (
          await search({
            tagIds: [tag.id, story.id],
            topicId: topic.id,
            phrase: 'SŁOŃCE',
            dateFrom: '2026-08-12',
            dateTo: '2026-08-12',
          })
        ).items,
      ).toMatchObject([{ kind: 'pages', document: { id: page.id } }])
      expect((await search({ phrase: '50%' })).items).toMatchObject([{ kind: 'pages' }])
      expect((await search({ phrase: '50_' })).items).toEqual([])
      expect((await search({ phrase: '50X%' })).items).toEqual([])
      expect(
        (await search({ phrase: 'taxonomy page', sources: ['pages', 'posts'] })).items,
      ).toMatchObject([{ kind: 'pages', document: { id: page.id } }])
      expect((await search({ tagIds: [tag.id], sources: ['posts'] })).items).toMatchObject([
        { kind: 'posts', document: { id: post.id } },
      ])
      expect((await search({ tagIds: [tag.id, story.id], sources: ['posts'] })).items).toEqual([])
    } finally {
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { topics: [topic.id], tags: [tag.id] },
      })
      await payload.update({ collection: 'pages', id: childPage.id, data: { tags: [] } })
      await payload.delete({ collection: 'topics', id: childTopic.id })
      await payload.delete({ collection: 'tags', id: story.id })
      await payload.delete({ collection: 'tag-groups', id: group.id })
      await payload.delete({ collection: 'tags', id: excluded.id })
    }
  })

  it('searches the published attribution and ignores owners', async () => {
    const { author, page, payload } = fixture
    const alternativeAuthor = await createIntegrationAuthor(payload, 'search-alternative')
    const group = await payload.create({
      collection: 'user-groups',
      data: { name: 'Public Search Group' },
    })
    const date = { dateFrom: '2026-08-12', dateTo: '2026-08-12' }
    try {
      expect((await search({ ...date, author: author.displayName })).items).toMatchObject([
        { kind: 'pages', document: { id: page.id } },
      ])
      await payload.update({
        collection: 'pages',
        id: page.id,
        draft: true,
        data: {
          author: alternativeAuthor.id,
          owners: [{ relationTo: 'user-groups', value: group.id }],
        },
      })
      expect((await search({ author: alternativeAuthor.displayName })).items).toHaveLength(0)
      expect((await search({ authorId: alternativeAuthor.id })).items).toHaveLength(0)
      expect((await search({ ...date, author: author.displayName })).items).toHaveLength(1)
      expect((await search({ author: group.name })).items).toHaveLength(0)
      await payload.update({
        collection: 'pages',
        id: page.id,
        draft: false,
        data: { _status: 'published', author: alternativeAuthor.id },
      })
      expect((await search({ ...date, author: author.displayName })).items).toHaveLength(0)
      expect((await search({ author: alternativeAuthor.displayName })).items).toHaveLength(1)
      expect((await search({ authorId: alternativeAuthor.id })).items).toMatchObject([
        { kind: 'pages', document: { id: page.id } },
      ])
      await payload.update({
        collection: 'users',
        id: alternativeAuthor.id,
        data: { displayName: 'Renamed search author' },
      })
      expect((await search({ author: alternativeAuthor.displayName })).items).toHaveLength(0)
      expect((await search({ author: 'Renamed search author' })).items).toHaveLength(1)

      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { deletedAt: new Date().toISOString() },
      })
      expect((await search({ author: 'Renamed search author' })).items).toHaveLength(0)
    } finally {
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { deletedAt: null },
        trash: true,
      })
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { author: author.id, owners: [] },
      })
      await payload.delete({ collection: 'user-groups', id: group.id })
      await deleteIntegrationAuthor(payload, alternativeAuthor)
    }
  })
})
