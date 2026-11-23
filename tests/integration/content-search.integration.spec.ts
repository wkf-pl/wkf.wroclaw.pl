import { sql } from '@payloadcms/db-postgres'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findContentSearchOptions, findPublicContent } from '@/modules/content/content-listing'
import type { ContentSearchFilters } from '@/modules/content/content-search-filters'
import { backfillContentSearchIndex } from '../../migrations/20261121_193551_content_search'
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
    const story = await payload.create({
      collection: 'tags',
      data: { name: 'Search story', slug: 'search-story' },
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
        { topics: true, tags: true },
      )
      expect(options.topics).toEqual([
        { id: topic.id, label: topic.name },
        { id: childTopic.id, label: `${topic.name} / ${childTopic.name}` },
      ])
      expect(options.tags.map(({ id }) => id)).toEqual([tag.id, story.id])

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
      await payload.delete({ collection: 'tags', id: excluded.id })
    }
  })

  it('matches public signatures and the current group name across publishing and trash', async () => {
    const { author, page, payload } = fixture
    const group = await payload.create({
      collection: 'user-groups',
      data: { name: 'Public Search Group' },
    })
    const documentAuthor = { relationTo: 'users', value: author.id } as const
    try {
      expect((await search({ author: author.displayName })).items).toEqual([])
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { author: { relationTo: 'user-groups', value: group.id } },
      })
      await payload.db.drizzle.execute(sql`
        UPDATE content_listing_items SET search_date = NULL, search_author_group_id = NULL
        WHERE source = 'pages' AND source_document_id = ${page.id}
      `)
      await backfillContentSearchIndex(payload.db.drizzle)
      expect(
        (await search({ author: 'search group', dateFrom: '2026-08-12', dateTo: '2026-08-12' }))
          .items,
      ).toMatchObject([{ kind: 'pages', document: { id: page.id } }])
      await payload.update({
        collection: 'user-groups',
        id: group.id,
        data: { name: 'Renamed contributors' },
      })
      expect((await search({ author: 'search group' })).items).toEqual([])
      expect((await search({ author: 'renamed contributors' })).items).toHaveLength(1)

      await payload.update({
        collection: 'pages',
        id: page.id,
        draft: true,
        data: { publicAuthorSignature: 'Draft signature' },
      })
      expect((await search({ author: 'draft signature' })).items).toEqual([])
      await payload.update({
        collection: 'pages',
        id: page.id,
        draft: false,
        data: { _status: 'published', publicAuthorSignature: 'Public signature' },
      })
      expect((await search({ author: 'renamed contributors' })).items).toEqual([])
      expect((await search({ author: 'public signature' })).items).toHaveLength(1)

      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { _status: 'draft' },
        unpublishAllLocales: true,
      })
      expect((await search({ author: 'public signature' })).items).toEqual([])
      await payload.update({ collection: 'pages', id: page.id, data: { _status: 'published' } })
      await payload.update({
        collection: 'pages',
        id: page.id,
        data: { deletedAt: new Date().toISOString() },
      })
      expect((await search({ author: 'public signature' })).items).toEqual([])
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
        data: { author: documentAuthor, publicAuthorSignature: null },
      })
      await payload.delete({ collection: 'user-groups', id: group.id })
    }
  })
})
