import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Category, Page, Post, Tag, User } from '@/payload-types'

import { createIntegrationAuthor, deleteIntegrationAuthor } from './integration-author'
import { createLexicalDocument } from './lexical-document'

export type ContentTaxonomyFixture = {
  author: User
  category: Category
  childPage: Page
  cleanup: () => Promise<void>
  page: Page
  payload: Payload
  post: Post
  slugs: {
    category: string
    childPage: string
    draftPost: string
    lifecyclePage: string
    page: string
    post: string
    tag: string
  }
  tag: Tag
}

export async function createContentTaxonomyFixture(
  fixtureKey: string,
): Promise<ContentTaxonomyFixture> {
  const payload = await getPayload({ config })
  const prefix = `integration-${fixtureKey}`
  const slugs = {
    category: `${prefix}-category`,
    childPage: `${prefix}-child-page`,
    draftPost: `${prefix}-draft-post`,
    lifecyclePage: `${prefix}-listing-lifecycle`,
    page: `${prefix}-page`,
    post: `${prefix}-post`,
    tag: `${prefix}-tag`,
  }

  await deleteFixtureContent(payload, slugs)
  const author = await createIntegrationAuthor(payload, `content-taxonomy-${fixtureKey}`)
  const [category, tag] = await Promise.all([
    payload.create({
      collection: 'categories',
      data: { name: 'Integration shared category', slug: slugs.category },
      overrideAccess: true,
    }),
    payload.create({
      collection: 'tags',
      data: { name: 'Integration shared tag', slug: slugs.tag },
      overrideAccess: true,
    }),
  ])

  const [page, post] = await Promise.all([
    payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: author.id,
        category: category.id,
        layout: [{ blockType: 'richText', content: createLexicalDocument('Page excerpt') }],
        publishedAt: '2026-08-12T12:00:00.000Z',
        slug: slugs.page,
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
        category: category.id,
        excerpt: 'Post excerpt',
        layout: [{ blockType: 'richText', content: createLexicalDocument('Post content') }],
        publishedAt: '2026-08-13T12:00:00.000Z',
        slug: slugs.post,
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
      category: category.id,
      excerpt: 'Draft excerpt',
      layout: [{ blockType: 'richText', content: createLexicalDocument('Draft content') }],
      publishedAt: '2026-08-14T12:00:00.000Z',
      slug: slugs.draftPost,
      tags: [tag.id],
      title: 'Integration taxonomy draft post',
    },
    draft: true,
    overrideAccess: true,
  })

  const childPage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      author: author.id,
      layout: [{ blockType: 'richText', content: createLexicalDocument('Child page') }],
      parent: page.id,
      slug: slugs.childPage,
      title: 'Integration child page',
    },
    overrideAccess: true,
  })

  return {
    author,
    category,
    childPage,
    page,
    payload,
    post,
    slugs,
    tag,
    cleanup: async () => {
      await deleteFixtureContent(payload, slugs)
      await deleteIntegrationAuthor(payload, author)
    },
  }
}

async function deleteFixtureContent(
  payload: Payload,
  slugs: ContentTaxonomyFixture['slugs'],
): Promise<void> {
  await Promise.all([
    payload.delete({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { in: [slugs.page, slugs.childPage, slugs.lifecyclePage] } },
    }),
    payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { in: [slugs.post, slugs.draftPost] } },
    }),
  ])
  await Promise.all([
    payload.delete({
      collection: 'categories',
      overrideAccess: true,
      where: { slug: { equals: slugs.category } },
    }),
    payload.delete({
      collection: 'tags',
      overrideAccess: true,
      where: { slug: { equals: slugs.tag } },
    }),
  ])
}
