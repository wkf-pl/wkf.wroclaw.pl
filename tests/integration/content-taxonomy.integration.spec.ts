import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createLocalReq, getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import { findPublicContent } from '@/modules/content/content-listing'
import { syncContentListingItem } from '@/modules/content/content-listing-index'
import type { Category, ContentListingItem, Page, Post, Tag, User } from '@/payload-types'

import { createIntegrationAuthor, deleteIntegrationAuthor } from '../helpers/integration-author'

const testSlugs = {
  category: 'integration-shared-category',
  childPage: 'integration-child-page',
  draftPost: 'integration-taxonomy-draft-post',
  lifecyclePage: 'integration-listing-lifecycle',
  page: 'integration-taxonomy-page',
  post: 'integration-taxonomy-post',
  tag: 'integration-shared-tag',
}

let payload: Payload
let author: User
let category: Category
let tag: Tag
let page: Page
let childPage: Page
let post: Post

function createLexicalDocument(text: string) {
  return {
    root: {
      children: [
        {
          children: [
            { detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 },
          ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          textStyle: '',
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

beforeAll(async () => {
  payload = await getPayload({ config })
  await Promise.all([
    payload.delete({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { in: [testSlugs.page, testSlugs.childPage, testSlugs.lifecyclePage] } },
    }),
    payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { in: [testSlugs.post, testSlugs.draftPost] } },
    }),
  ])
  await Promise.all([
    payload.delete({
      collection: 'categories',
      overrideAccess: true,
      where: { slug: { equals: testSlugs.category } },
    }),
    payload.delete({
      collection: 'tags',
      overrideAccess: true,
      where: { slug: { equals: testSlugs.tag } },
    }),
  ])

  author = await createIntegrationAuthor(payload, 'content-taxonomy')

  ;[category, tag] = await Promise.all([
    payload.create({
      collection: 'categories',
      data: { name: 'Integration shared category', slug: testSlugs.category },
      overrideAccess: true,
    }),
    payload.create({
      collection: 'tags',
      data: { name: 'Integration shared tag', slug: testSlugs.tag },
      overrideAccess: true,
    }),
  ])

  ;[page, post] = await Promise.all([
    payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: author.id,
        categories: [category.id],
        layout: [{ blockType: 'richText', content: createLexicalDocument('Page excerpt') }],
        publishedAt: '2026-08-12T12:00:00.000Z',
        slug: testSlugs.page,
        tags: [tag.id],
        title: 'Integration taxonomy page',
      },
      overrideAccess: true,
    }),
    payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        author: author.id,
        categories: [category.id],
        layout: [{ blockType: 'richText', content: createLexicalDocument('Post content') }],
        excerpt: 'Post excerpt',
        publishedAt: '2026-08-13T12:00:00.000Z',
        slug: testSlugs.post,
        tags: [tag.id],
        title: 'Integration taxonomy post',
      },
      overrideAccess: true,
    }),
  ])

  await payload.create({
    collection: 'posts',
    data: {
      _status: 'draft',
      author: author.id,
      categories: [category.id],
      layout: [{ blockType: 'richText', content: createLexicalDocument('Draft content') }],
      excerpt: 'Draft excerpt',
      publishedAt: '2026-08-14T12:00:00.000Z',
      slug: testSlugs.draftPost,
      tags: [tag.id],
      title: 'Integration taxonomy draft post',
    },
    draft: true,
    overrideAccess: true,
  })

  childPage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      author: author.id,
      layout: [{ blockType: 'richText', content: createLexicalDocument('Child page') }],
      parent: page.id,
      slug: testSlugs.childPage,
      title: 'Integration child page',
    },
    overrideAccess: true,
  })
}, 20_000)

afterAll(async () => {
  if (!payload) {
    return
  }

  await Promise.all([
    payload.delete({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { in: [testSlugs.page, testSlugs.childPage, testSlugs.lifecyclePage] } },
    }),
    payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { in: [testSlugs.post, testSlugs.draftPost] } },
    }),
  ])
  if (category && tag) {
    await Promise.all([
      payload.delete({ collection: 'categories', id: category.id, overrideAccess: true }),
      payload.delete({ collection: 'tags', id: tag.id, overrideAccess: true }),
    ])
  }
  await deleteIntegrationAuthor(payload, author)
})

describe('shared content taxonomy', () => {
  it('returns a page and a post in one globally sorted public stream', async () => {
    const result = await findPublicContent({
      categoryId: category.id,
      page: 1,
      pageSize: 12,
      pagination: true,
      sort: 'newest',
      sources: ['pages', 'posts'],
      tagId: tag.id,
    })

    expect(result.items.map(({ kind, title }) => [kind, title])).toEqual([
      ['posts', post.title],
      ['pages', page.title],
    ])

    const childResult = await findPublicContent({
      page: 1,
      pageSize: 12,
      pagination: true,
      parentId: page.id,
      sort: 'titleAscending',
      sources: ['pages'],
    })
    expect(childResult.items.map((item) => item.id)).toEqual([childPage.id])
  })

  it('exposes both collection relations through reverse Join fields', async () => {
    const populatedCategory = await payload.findByID({
      collection: 'categories',
      depth: 0,
      id: category.id,
      joins: { relatedPages: { limit: 10 }, relatedPosts: { limit: 10 } },
      overrideAccess: true,
    })

    expect(populatedCategory.relatedPages?.docs).toHaveLength(1)
    expect(populatedCategory.relatedPosts?.docs).toHaveLength(2)
  })

  it('persists a generated page excerpt and projects only listing fields into the index', async () => {
    const storedPage = await payload.findByID({
      collection: 'pages',
      depth: 0,
      id: page.id,
      overrideAccess: true,
    })
    const index = await findListingIndex('pages', page.id)

    expect(storedPage.listingExcerpt).toBe('Page excerpt')
    expect(index).toMatchObject({
      excerpt: 'Page excerpt',
      source: 'pages',
      sourceDocumentId: page.id,
      title: page.title,
      url: `/${testSlugs.page}`,
    })
    expect(index).not.toHaveProperty('layout')
  })

  it('rebuilds a missing index entry with the migration backfill primitive', async () => {
    const index = await findListingIndex('pages', page.id)
    if (!index) throw new Error('Expected the published page to have an index entry.')
    await payload.delete({
      collection: 'content-listing-items',
      id: index.id,
      overrideAccess: true,
    })

    const req = await createLocalReq(
      {
        context: { skipContentListingSync: true, skipPublicCacheInvalidation: true },
      },
      payload,
    )
    await syncContentListingItem(req, 'pages', page.id)

    expect(await findListingIndex('pages', page.id)).toMatchObject({
      sourceDocumentId: page.id,
      title: page.title,
    })
  })

  it('keeps the published projection during autosave, then handles republish, unpublish and delete', async () => {
    const lifecyclePage = await payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: author.id,
        layout: [{ blockType: 'richText', content: createLexicalDocument('Lifecycle excerpt') }],
        slug: testSlugs.lifecyclePage,
        title: 'Published lifecycle page',
      },
      overrideAccess: true,
    })

    await payload.update({
      collection: 'pages',
      data: { title: 'Draft lifecycle page' },
      draft: true,
      id: lifecyclePage.id,
      overrideAccess: true,
    })
    expect(await findListingIndex('pages', lifecyclePage.id)).toMatchObject({
      title: 'Published lifecycle page',
    })

    await payload.update({
      collection: 'pages',
      data: { _status: 'published', title: 'Republished lifecycle page' },
      draft: false,
      id: lifecyclePage.id,
      overrideAccess: true,
    })
    expect(await findListingIndex('pages', lifecyclePage.id)).toMatchObject({
      title: 'Republished lifecycle page',
    })

    await payload.update({
      collection: 'pages',
      data: { _status: 'draft' },
      id: lifecyclePage.id,
      overrideAccess: true,
      unpublishAllLocales: true,
    })
    expect(await findListingIndex('pages', lifecyclePage.id)).toBeNull()

    await payload.update({
      collection: 'pages',
      data: { _status: 'published' },
      draft: false,
      id: lifecyclePage.id,
      overrideAccess: true,
    })
    expect(await findListingIndex('pages', lifecyclePage.id)).not.toBeNull()

    await payload.delete({ collection: 'pages', id: lifecyclePage.id, overrideAccess: true })
    expect(await findListingIndex('pages', lifecyclePage.id)).toBeNull()
  })

  it('uses database pagination for a deep mixed listing page', async () => {
    const createdPosts: Post[] = []
    try {
      for (let i = 0; i < 7; i += 1) {
        createdPosts.push(
          await payload.create({
            collection: 'posts',
            data: {
              _status: 'published',
              author: author.id,
              categories: [category.id],
              excerpt: `Pagination excerpt ${i}`,
              layout: [{ blockType: 'richText', content: createLexicalDocument(`Content ${i}`) }],
              publishedAt: new Date(Date.UTC(2026, 7, 15 + i)).toISOString(),
              slug: `integration-pagination-${i}`,
              tags: [tag.id],
              title: `Integration pagination ${i}`,
            },
            overrideAccess: true,
          }),
        )
      }

      const result = await findPublicContent({
        categoryId: category.id,
        page: 4,
        pageSize: 2,
        pagination: true,
        sort: 'newest',
        sources: ['posts', 'pages', 'posts'],
        tagId: tag.id,
      })

      expect(result.items).toHaveLength(2)
      expect(result.page).toBe(4)
      expect(result.pageSize).toBe(2)
      expect(result.totalDocs).toBe(9)
    } finally {
      for (const createdPost of createdPosts) {
        await payload.delete({ collection: 'posts', id: createdPost.id, overrideAccess: true })
      }
    }
  })

  it('rejects a cycle in persisted page parents', async () => {
    await expect(
      payload.update({
        collection: 'pages',
        data: { parent: childPage.id },
        id: page.id,
        overrideAccess: true,
      }),
    ).rejects.toMatchObject({ status: 400 })
  })
})

async function findListingIndex(
  source: ContentListingItem['source'],
  sourceDocumentID: number,
): Promise<ContentListingItem | null> {
  const result = await payload.find({
    collection: 'content-listing-items',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [{ source: { equals: source } }, { sourceDocumentId: { equals: sourceDocumentID } }],
    },
  })
  return result.docs[0] ?? null
}
