import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import { findPublicContent } from '@/modules/content/content-listing'
import type { Category, Page, Post, Tag, User } from '@/payload-types'

const testSlugs = {
  category: 'integration-shared-category',
  childPage: 'integration-child-page',
  draftPost: 'integration-taxonomy-draft-post',
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
      where: { slug: { in: [testSlugs.page, testSlugs.childPage] } },
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

  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
  })
  if (!users.docs[0]) {
    throw new Error('Integration test requires an existing author.')
  }
  author = users.docs[0]

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
      where: { slug: { in: [testSlugs.page, testSlugs.childPage] } },
    }),
    payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { in: [testSlugs.post, testSlugs.draftPost] } },
    }),
  ])
  await Promise.all([
    payload.delete({ collection: 'categories', id: category.id, overrideAccess: true }),
    payload.delete({ collection: 'tags', id: tag.id, overrideAccess: true }),
  ])
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
