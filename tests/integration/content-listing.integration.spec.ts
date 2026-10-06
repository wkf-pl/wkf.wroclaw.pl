import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { findPublicContent } from '@/modules/content/content-listing'
import type { Post } from '@/payload-types'

import {
  createContentTaxonomyFixture,
  type ContentTaxonomyFixture,
} from '../helpers/content-taxonomy-fixture'
import { createLexicalDocument } from '../helpers/lexical-document'

let fixture: ContentTaxonomyFixture

beforeAll(async () => {
  fixture = await createContentTaxonomyFixture('listing')
}, 20_000)

afterAll(async () => {
  await fixture?.cleanup()
})

describe('content listing and pagination', () => {
  it('returns a page and a post in one globally sorted public stream', async () => {
    const result = await findPublicContent({
      categoryId: fixture.category.id,
      page: 1,
      pageSize: 12,
      pagination: true,
      sort: 'newest',
      sources: ['pages', 'posts'],
      tagId: fixture.tag.id,
    })

    expect(result.items.map(({ kind, title }) => [kind, title])).toEqual([
      ['posts', fixture.post.title],
      ['pages', fixture.page.title],
    ])

    const childResult = await findPublicContent({
      page: 1,
      pageSize: 12,
      pagination: true,
      parentId: fixture.page.id,
      sort: 'titleAscending',
      sources: ['pages'],
    })
    expect(childResult.items.map((item) => item.id)).toEqual([fixture.childPage.id])
  })

  it('preserves manual mixed-content order before pagination', async () => {
    const result = await findPublicContent({
      manualItems: [
        { relationTo: 'posts', value: fixture.post.id },
        { relationTo: 'pages', value: fixture.page.id },
        { relationTo: 'pages', value: fixture.childPage.id },
      ],
      page: 2,
      pageSize: 2,
      pagination: true,
      selectionMode: 'manual',
      sort: 'titleAscending',
      sources: [],
    })

    expect(result.items.map(({ kind, title }) => [kind, title])).toEqual([
      ['pages', fixture.childPage.title],
    ])
    expect(result.totalDocs).toBe(3)
    expect(result.totalPages).toBe(2)
  })

  it('stores ordered polymorphic relationships in a manual Listing block', async () => {
    const containerPage = await fixture.payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: fixture.author.id,
        layout: [
          {
            blockType: 'listing',
            items: [
              { item: { relationTo: 'posts', value: fixture.post.id } },
              { item: { relationTo: 'pages', value: fixture.page.id } },
            ],
            pageSize: 12,
            pagination: false,
            parentFilter: 'none',
            selectionMode: 'manual',
            sort: 'newest',
            view: 'cards',
          },
        ],
        slug: fixture.slugs.lifecyclePage,
        title: 'Integration manual listing container',
      },
      overrideAccess: true,
    })

    try {
      const storedPage = await fixture.payload.findByID({
        collection: 'pages',
        depth: 0,
        id: containerPage.id,
        overrideAccess: true,
      })
      const listing = storedPage.layout?.find((block) => block.blockType === 'listing')

      expect(listing?.items?.map(({ item }) => [item.relationTo, item.value])).toEqual([
        ['posts', fixture.post.id],
        ['pages', fixture.page.id],
      ])
    } finally {
      await fixture.payload.delete({
        collection: 'pages',
        id: containerPage.id,
        overrideAccess: true,
      })
    }
  })

  it('exposes both collection relations through reverse Join fields', async () => {
    const populatedCategory = await fixture.payload.findByID({
      collection: 'categories',
      depth: 0,
      id: fixture.category.id,
      joins: { relatedPages: { limit: 10 }, relatedPosts: { limit: 10 } },
      overrideAccess: true,
    })

    expect(populatedCategory.relatedPages?.docs).toHaveLength(1)
    expect(populatedCategory.relatedPosts?.docs).toHaveLength(2)
  })

  it('uses database pagination for a deep mixed listing page', async () => {
    const createdPosts: Post[] = []
    try {
      for (let i = 0; i < 7; i += 1) {
        createdPosts.push(
          await fixture.payload.create({
            collection: 'posts',
            data: {
              _status: 'published',
              author: fixture.author.id,
              category: fixture.category.id,
              excerpt: `Pagination excerpt ${i}`,
              layout: [{ blockType: 'richText', content: createLexicalDocument(`Content ${i}`) }],
              publishedAt: new Date(Date.UTC(2026, 7, 15 + i)).toISOString(),
              slug: `integration-listing-pagination-${i}`,
              tags: [fixture.tag.id],
              title: `Integration pagination ${i}`,
            },
            overrideAccess: true,
          }),
        )
      }

      const result = await findPublicContent({
        categoryId: fixture.category.id,
        page: 4,
        pageSize: 2,
        pagination: true,
        sort: 'newest',
        sources: ['posts', 'pages', 'posts'],
        tagId: fixture.tag.id,
      })

      expect(result.items).toHaveLength(2)
      expect(result.page).toBe(4)
      expect(result.pageSize).toBe(2)
      expect(result.totalDocs).toBe(9)
    } finally {
      for (const createdPost of createdPosts) {
        await fixture.payload.delete({
          collection: 'posts',
          id: createdPost.id,
          overrideAccess: true,
        })
      }
    }
  })
})
