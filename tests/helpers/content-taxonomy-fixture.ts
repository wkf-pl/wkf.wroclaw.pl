import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Topic, Page, Post, Tag, User } from '@/payload-types'

import { createIntegrationAuthor, deleteIntegrationAuthor } from './integration-author'
import { createLexicalDocument } from './lexical-document'

export type ContentTaxonomyFixture = {
  author: User
  topic: Topic
  childPage: Page
  cleanup: () => Promise<void>
  page: Page
  payload: Payload
  post: Post
  slugs: {
    topic: string
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
    topic: `${prefix}-topic`,
    childPage: `${prefix}-child-page`,
    draftPost: `${prefix}-draft-post`,
    lifecyclePage: `${prefix}-listing-lifecycle`,
    page: `${prefix}-page`,
    post: `${prefix}-post`,
    tag: `${prefix}-tag`,
  }

  await deleteFixtureContent(payload, slugs)
  const author = await createIntegrationAuthor(payload, `content-taxonomy-${fixtureKey}`)
  const [topic, tag] = await Promise.all([
    payload.create({
      collection: 'topics',
      data: { name: 'Integration shared topic', slug: slugs.topic },
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
        author: { relationTo: 'users', value: author.id },
        topics: [topic.id],
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
        author: { relationTo: 'users', value: author.id },
        topics: [topic.id],
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
      author: { relationTo: 'users', value: author.id },
      topics: [topic.id],
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
      author: { relationTo: 'users', value: author.id },
      layout: [{ blockType: 'richText', content: createLexicalDocument('Child page') }],
      parent: page.id,
      slug: slugs.childPage,
      title: 'Integration child page',
    },
    overrideAccess: true,
  })

  return {
    author,
    topic,
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
  await payload.delete({
    collection: 'posts',
    overrideAccess: true,
    where: { slug: { in: [slugs.post, slugs.draftPost] } },
  })
  for (const slug of [slugs.childPage, slugs.lifecyclePage, slugs.page]) {
    await payload.delete({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
  }
  await Promise.all([
    payload.delete({
      collection: 'topics',
      overrideAccess: true,
      where: { slug: { equals: slugs.topic } },
    }),
    payload.delete({
      collection: 'tags',
      overrideAccess: true,
      where: { slug: { equals: slugs.tag } },
    }),
  ])
}
