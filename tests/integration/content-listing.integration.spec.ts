import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sql } from '@payloadcms/db-postgres'

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
      conditions: [
        {
          field: 'category',
          operator: 'inSubtree',
          relationshipValue: { relationTo: 'categories', value: fixture.category.id },
        },
        {
          field: 'tag',
          operator: 'contains',
          relationshipValue: { relationTo: 'tags', value: fixture.tag.id },
        },
      ],
      page: 1,
      pageSize: 12,
      pagination: true,
      sort: 'newest',
      sources: ['pages', 'posts'],
    })

    expect(result.items.map(({ document, kind }) => [kind, document.title])).toEqual([
      ['posts', fixture.post.title],
      ['pages', fixture.page.title],
    ])

    const childResult = await findPublicContent({
      conditions: [
        {
          field: 'parentPage',
          operator: 'equals',
          relationshipValue: { relationTo: 'pages', value: fixture.page.id },
        },
      ],
      page: 1,
      pageSize: 12,
      pagination: true,
      sort: 'titleAscending',
      sources: ['pages'],
    })
    expect(childResult.items.map((item) => item.document.id)).toEqual([fixture.childPage.id])
    expect(childResult.items[0]?.document).toHaveProperty('layout')

    const mixedSourceResult = await findPublicContent({
      conditions: [
        {
          field: 'parentPage',
          operator: 'equals',
          relationshipValue: { relationTo: 'pages', value: fixture.page.id },
        },
      ],
      page: 1,
      pageSize: 12,
      pagination: false,
      sort: 'titleAscending',
      sources: ['pages', 'posts'],
    })
    expect(mixedSourceResult.items.map(({ document, kind }) => `${kind}:${document.id}`)).toEqual([
      `pages:${fixture.childPage.id}`,
      `posts:${fixture.post.id}`,
    ])
  })

  it('distinguishes a category subtree from an exact category and combines repeated tags with AND', async () => {
    const childCategorySlug = 'integration-listing-child-category'
    const secondTagSlug = 'integration-listing-second-tag'
    const doublyTaggedPostSlug = 'integration-listing-doubly-tagged-post'
    await fixture.payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { equals: doublyTaggedPostSlug } },
    })
    await fixture.payload.delete({
      collection: 'categories',
      overrideAccess: true,
      where: { slug: { equals: childCategorySlug } },
    })
    await fixture.payload.delete({
      collection: 'tags',
      overrideAccess: true,
      where: { slug: { equals: secondTagSlug } },
    })

    const childCategory = await fixture.payload.create({
      collection: 'categories',
      data: {
        name: 'Integration child category',
        parent: fixture.category.id,
        slug: childCategorySlug,
      },
      overrideAccess: true,
    })
    const secondTag = await fixture.payload.create({
      collection: 'tags',
      data: { name: 'Integration second tag', slug: secondTagSlug },
      overrideAccess: true,
    })
    const doublyTaggedPost = await fixture.payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        author: fixture.author.id,
        category: childCategory.id,
        excerpt: 'Doubly tagged excerpt',
        layout: [{ blockType: 'richText', content: createLexicalDocument('Tagged content') }],
        publishedAt: '2026-08-20T12:00:00.000Z',
        slug: doublyTaggedPostSlug,
        tags: [fixture.tag.id, secondTag.id],
        title: 'Integration doubly tagged post',
      },
      overrideAccess: true,
    })

    try {
      const subtreeResult = await findPublicContent({
        conditions: [
          {
            field: 'category',
            operator: 'inSubtree',
            relationshipValue: { relationTo: 'categories', value: fixture.category.id },
          },
        ],
        page: 1,
        pageSize: 20,
        pagination: false,
        sort: 'titleAscending',
        sources: ['posts'],
      })
      const exactResult = await findPublicContent({
        conditions: [
          {
            field: 'category',
            operator: 'equals',
            relationshipValue: { relationTo: 'categories', value: fixture.category.id },
          },
        ],
        page: 1,
        pageSize: 20,
        pagination: false,
        sort: 'titleAscending',
        sources: ['posts'],
      })
      const repeatedTagsResult = await findPublicContent({
        conditions: [
          {
            field: 'tag',
            operator: 'contains',
            relationshipValue: { relationTo: 'tags', value: fixture.tag.id },
          },
          {
            field: 'tag',
            operator: 'contains',
            relationshipValue: { relationTo: 'tags', value: secondTag.id },
          },
        ],
        page: 1,
        pageSize: 20,
        pagination: false,
        sort: 'titleAscending',
        sources: ['posts'],
      })

      expect(subtreeResult.items.map((item) => item.document.id)).toContain(doublyTaggedPost.id)
      expect(exactResult.items.map((item) => item.document.id)).not.toContain(doublyTaggedPost.id)
      expect(repeatedTagsResult.items.map((item) => item.document.id)).toEqual([
        doublyTaggedPost.id,
      ])
    } finally {
      await fixture.payload.delete({
        collection: 'posts',
        id: doublyTaggedPost.id,
        overrideAccess: true,
      })
      await fixture.payload.delete({
        collection: 'categories',
        id: childCategory.id,
        overrideAccess: true,
      })
      await fixture.payload.delete({
        collection: 'tags',
        id: secondTag.id,
        overrideAccess: true,
      })
    }
  })

  it('matches normalized titles with contains and exact operators', async () => {
    const containsResult = await findPublicContent({
      conditions: [{ field: 'title', operator: 'contains', textValue: '  TAXONOMY  ' }],
      page: 1,
      pageSize: 20,
      pagination: false,
      sort: 'titleAscending',
      sources: ['pages', 'posts'],
    })
    const exactResult = await findPublicContent({
      conditions: [
        {
          field: 'title',
          operator: 'equals',
          textValue: fixture.page.title.toLocaleUpperCase('pl-PL'),
        },
      ],
      page: 1,
      pageSize: 20,
      pagination: false,
      sort: 'titleAscending',
      sources: ['pages', 'posts'],
    })

    expect(containsResult.items.map((item) => item.document.id)).toEqual([
      fixture.page.id,
      fixture.post.id,
    ])
    expect(exactResult.items.map((item) => item.document.id)).toEqual([fixture.page.id])
  })

  it('sorts dated content by its significant date and undated content by title', async () => {
    const result = await findPublicContent({
      page: 1,
      pageSize: 12,
      pagination: false,
      sort: 'oldest',
      sources: ['pages', 'posts'],
    })

    expect(result.items.map(({ document, kind }) => [kind, document.title])).toEqual([
      ['posts', fixture.post.title],
      ['pages', fixture.childPage.title],
      ['pages', fixture.page.title],
    ])
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

    expect(result.items.map(({ document, kind }) => [kind, document.title])).toEqual([
      ['pages', fixture.childPage.title],
    ])
    expect(result.totalDocs).toBe(3)
    expect(result.totalPages).toBe(2)
  })

  it('filters dated content by age while passing through sources without that field', async () => {
    const recentPost = await fixture.payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        author: fixture.author.id,
        excerpt: 'Recent post excerpt',
        layout: [{ blockType: 'richText', content: createLexicalDocument('Recent content') }],
        publishedAt: new Date(Date.now() - 86_400_000).toISOString(),
        slug: 'integration-listing-recent-post',
        title: 'Integration recent post',
      },
      overrideAccess: true,
    })

    try {
      const result = await findPublicContent({
        conditions: [{ field: 'significantDate', numberValue: 30, operator: 'notOlderThan' }],
        page: 1,
        pageSize: 20,
        pagination: false,
        sort: 'newest',
        sources: ['pages', 'posts'],
      })
      const references = result.items.map(({ document, kind }) => `${kind}:${document.id}`)

      expect(references).toContain(`posts:${recentPost.id}`)
      expect(references).toContain(`pages:${fixture.page.id}`)
      expect(references).toContain(`pages:${fixture.childPage.id}`)
      expect(references).not.toContain(`posts:${fixture.post.id}`)
    } finally {
      await fixture.payload.delete({
        collection: 'posts',
        id: recentPost.id,
        overrideAccess: true,
      })
    }
  })

  it('applies before, after, and inclusive-between boundaries and rejects an empty supported date', async () => {
    const slugs = {
      after: 'integration-listing-date-after',
      before: 'integration-listing-date-before',
      empty: 'integration-listing-date-empty',
    }
    await fixture.payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { in: Object.values(slugs) } },
    })

    const createPost = (slug: string, title: string, publishedAt: string) =>
      fixture.payload.create({
        collection: 'posts',
        data: {
          _status: 'published',
          author: fixture.author.id,
          excerpt: `${title} excerpt`,
          layout: [{ blockType: 'richText', content: createLexicalDocument(title) }],
          publishedAt,
          slug,
          title,
        },
        overrideAccess: true,
      })
    const beforePost = await createPost(
      slugs.before,
      'Integration date before',
      '2026-08-12T12:00:00Z',
    )
    const afterPost = await createPost(
      slugs.after,
      'Integration date after',
      '2026-08-14T12:00:00Z',
    )
    const emptyDatePost = await createPost(
      slugs.empty,
      'Integration date empty',
      '2026-08-13T12:00:00Z',
    )
    await fixture.payload.db.drizzle.execute(sql`
      UPDATE "content_listing_items" SET "significant_date" = NULL
      WHERE "source" = 'posts' AND "source_document_id" = ${emptyDatePost.id}
    `)

    const findWithDateCondition = (operator: 'after' | 'before' | 'between') =>
      findPublicContent({
        conditions: [
          {
            dateValue: '2026-08-13',
            ...(operator === 'between' ? { endDateValue: '2026-08-13' } : {}),
            field: 'significantDate',
            operator,
          },
        ],
        page: 1,
        pageSize: 20,
        pagination: false,
        sort: 'titleAscending',
        sources: ['posts'],
      })

    try {
      const beforeResult = await findWithDateCondition('before')
      const afterResult = await findWithDateCondition('after')
      const betweenResult = await findWithDateCondition('between')

      expect(beforeResult.items.map((item) => item.document.id)).toContain(beforePost.id)
      expect(beforeResult.items.map((item) => item.document.id)).not.toContain(emptyDatePost.id)
      expect(afterResult.items.map((item) => item.document.id)).toContain(afterPost.id)
      expect(afterResult.items.map((item) => item.document.id)).not.toContain(emptyDatePost.id)
      expect(betweenResult.items.map((item) => item.document.id)).toContain(fixture.post.id)
      expect(betweenResult.items.map((item) => item.document.id)).not.toContain(beforePost.id)
      expect(betweenResult.items.map((item) => item.document.id)).not.toContain(afterPost.id)
      expect(betweenResult.items.map((item) => item.document.id)).not.toContain(emptyDatePost.id)
    } finally {
      for (const post of [beforePost, afterPost, emptyDatePost]) {
        await fixture.payload.delete({ collection: 'posts', id: post.id, overrideAccess: true })
      }
    }
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

  it('stores a limited manual Carousel without pagination fields', async () => {
    const containerPage = await fixture.payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: fixture.author.id,
        layout: [
          {
            blockType: 'carousel',
            items: [
              { item: { relationTo: 'posts', value: fixture.post.id } },
              { item: { relationTo: 'pages', value: fixture.page.id } },
            ],
            selectionMode: 'manual',
            slideLimit: 1,
          },
        ],
        slug: `${fixture.slugs.lifecyclePage}-carousel`,
        title: 'Integration manual carousel container',
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
      const carousel = storedPage.layout?.find((block) => block.blockType === 'carousel')
      const result = await findPublicContent({
        manualItems: carousel?.items?.map(({ item }) => item),
        page: 1,
        pageSize: carousel?.slideLimit ?? 5,
        pagination: false,
        selectionMode: carousel?.selectionMode,
        sort: carousel?.sort ?? 'newest',
        sources: [],
      })

      expect(carousel?.items?.map(({ item }) => [item.relationTo, item.value])).toEqual([
        ['posts', fixture.post.id],
        ['pages', fixture.page.id],
      ])
      expect(carousel).not.toHaveProperty('pagination')
      expect(carousel).not.toHaveProperty('pageSize')
      expect(result.items.map(({ document, kind }) => [kind, document.title])).toEqual([
        ['posts', fixture.post.title],
      ])
      expect(result.totalDocs).toBe(2)
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
        conditions: [
          {
            field: 'category',
            operator: 'inSubtree',
            relationshipValue: { relationTo: 'categories', value: fixture.category.id },
          },
          {
            field: 'tag',
            operator: 'contains',
            relationshipValue: { relationTo: 'tags', value: fixture.tag.id },
          },
        ],
        page: 4,
        pageSize: 2,
        pagination: true,
        sort: 'newest',
        sources: ['posts', 'pages', 'posts'],
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
