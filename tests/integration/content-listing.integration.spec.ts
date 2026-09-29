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
