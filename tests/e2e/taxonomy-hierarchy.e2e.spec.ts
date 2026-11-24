import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Topic, Page, Post, User } from '@/payload-types'

import { createLexicalDocument } from '../helpers/lexical-document'
import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const topicSlugs = [
  'e2e-hierarchy-root',
  'e2e-hierarchy-child',
  'e2e-hierarchy-grandchild',
] as const
const pageSlugs = [
  'e2e-hierarchy-page-root',
  'e2e-hierarchy-page-draft',
  'e2e-hierarchy-page-leaf',
] as const
const postSlug = 'e2e-hierarchy-post'

let payload: Payload
let topics: Topic[] = []
let pages: Page[] = []
let post: Post

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanup()

  const users = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: editorTestUser.email } },
  })
  const author = users.docs[0] as User | undefined
  if (!author) throw new Error('Missing E2E editor user.')

  const rootTopic = await payload.create({
    collection: 'topics',
    data: { name: 'E2E Gry', slug: topicSlugs[0] },
    overrideAccess: true,
  })
  const childTopic = await payload.create({
    collection: 'topics',
    data: { name: 'E2E RPG', parent: rootTopic.id, slug: topicSlugs[1] },
    overrideAccess: true,
  })
  const grandchildTopic = await payload.create({
    collection: 'topics',
    data: { name: 'E2E Warhammer', parent: childTopic.id, slug: topicSlugs[2] },
    overrideAccess: true,
  })
  topics = [rootTopic, childTopic, grandchildTopic]

  post = await payload.create({
    collection: 'posts',
    data: {
      _status: 'published',
      author: author.id,
      topics: [grandchildTopic.id],
      excerpt: 'Treść z podtematu.',
      layout: [{ blockType: 'richText', content: createLexicalDocument('Treść potomna') }],
      publishedAt: '2026-08-24T10:00:00.000Z',
      slug: postSlug,
      title: 'E2E treść z Warhammera',
    },
    overrideAccess: true,
  })

  const rootPage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      author: author.id,
      layout: [{ blockType: 'richText', content: createLexicalDocument('Root page') }],
      slug: pageSlugs[0],
      title: 'E2E Klub',
    },
    draft: false,
    overrideAccess: true,
  })
  const draftPage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'draft',
      author: author.id,
      parent: rootPage.id,
      slug: pageSlugs[1],
      title: 'E2E Nieopublikowany zarząd',
    },
    draft: true,
    overrideAccess: true,
  })
  const leafPage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      author: author.id,
      layout: [{ blockType: 'richText', content: createLexicalDocument('Leaf page') }],
      parent: draftPage.id,
      slug: pageSlugs[2],
      title: 'E2E Komisja',
    },
    draft: false,
    overrideAccess: true,
  })
  pages = [rootPage, draftPage, leafPage]
})

test.afterAll(async () => {
  await cleanup()
})

test('shows topic breadcrumbs, direct children and content from descendants', async ({ page }) => {
  await page.goto(`/topic/${topicSlugs[1]}`)

  const breadcrumbs = page.getByRole('navigation', { name: 'Okruszki' })
  await expect(breadcrumbs.getByRole('link', { name: 'Strona główna' })).toHaveCount(0)
  await expect(breadcrumbs.getByRole('link', { name: 'E2E Gry' })).toHaveAttribute(
    'href',
    `/topic/${topicSlugs[0]}`,
  )
  await expect(breadcrumbs.getByText('E2E RPG', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Podtematy' })).toContainText('E2E Warhammer')
  await expect(page.getByRole('link').filter({ hasText: post.title })).toBeVisible()
})

test('redirects a legacy topic address and preserves its query parameters', async ({ page }) => {
  await page.goto(`/category/${topicSlugs[1]}?from=legacy&tag=rpg&tag=larp`)
  const url = new URL(page.url())
  expect(url.pathname).toBe(`/topic/${topicSlugs[1]}`)
  expect(url.searchParams.get('from')).toBe('legacy')
  expect(url.searchParams.getAll('tag')).toEqual(['rpg', 'larp'])
})

test('shows published page ancestors as links and unpublished ancestors as text', async ({
  page,
}) => {
  await page.goto(`/${pageSlugs[2]}`)

  const breadcrumbs = page.getByRole('navigation', { name: 'Okruszki' })
  await expect(breadcrumbs.getByRole('link', { name: 'Strona główna' })).toHaveCount(0)
  await expect(breadcrumbs.getByRole('link', { name: 'E2E Klub' })).toHaveAttribute(
    'href',
    `/${pageSlugs[0]}`,
  )
  await expect(breadcrumbs).toContainText('E2E Nieopublikowany zarząd')
  await expect(breadcrumbs.getByRole('link', { name: 'E2E Nieopublikowany zarząd' })).toHaveCount(0)
  await expect(breadcrumbs.getByText('E2E Komisja', { exact: true })).toHaveCount(0)
})

test('uses one topic selector and full hierarchy paths in admin relationships', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/posts/${post.id}`)

  const topicField = page.locator('#field-topics')
  await expect(topicField.getByRole('combobox')).toHaveCount(1)
  await expect(topicField).toContainText('E2E Gry › E2E RPG › E2E Warhammer')

  await page.goto(`/admin/collections/topics/${topics[2].id}`)
  await expect(page.locator('#field-parent')).toContainText('E2E Gry › E2E RPG')
  const topicPath = page.getByRole('navigation', { name: 'Ścieżka nawigacji dokumentu' })
  await expect(topicPath.getByRole('link', { name: 'E2E Gry' })).toHaveAttribute(
    'href',
    `/admin/collections/topics/${topics[0].id}`,
  )
  await expect(topicPath.getByText('E2E Warhammer', { exact: true })).toHaveJSProperty(
    'tagName',
    'STRONG',
  )
  await expect(topicPath.getByRole('link', { name: 'E2E Warhammer' })).toHaveCount(0)
  await expect(page.getByText('Breadcrumbs', { exact: true })).toHaveCount(0)

  await page.goto(`/admin/collections/pages/${pages[2].id}`)
  await expect(page.locator('#field-parent')).toContainText('E2E Klub › E2E Nieopublikowany zarząd')
  const pagePath = page.getByRole('navigation', { name: 'Ścieżka nawigacji dokumentu' })
  await expect(pagePath.getByRole('link', { name: 'E2E Klub' })).toHaveAttribute(
    'href',
    `/admin/collections/pages/${pages[0].id}`,
  )
  await expect(pagePath.getByText('E2E Komisja', { exact: true })).toHaveJSProperty(
    'tagName',
    'STRONG',
  )
  await expect(pagePath.getByRole('link', { name: 'E2E Komisja' })).toHaveCount(0)
  const sidebarFields = page.locator('.document-fields__sidebar-fields > .render-fields')
  await expect(sidebarFields).toHaveCSS('display', 'flex')
  const smallestSidebarGap = await sidebarFields.evaluate((element) => {
    const visibleChildren = [...element.children]
      .map((child) => child.getBoundingClientRect())
      .filter((rectangle) => rectangle.height > 0 && rectangle.width > 0)
    const gaps = visibleChildren.slice(1).map((rectangle, index) => {
      const previousRectangle = visibleChildren[index]
      return rectangle.top - previousRectangle.bottom
    })

    return Math.min(...gaps)
  })
  expect(smallestSidebarGap).toBeGreaterThanOrEqual(20)
  await expect(page.getByText('Breadcrumbs', { exact: true })).toHaveCount(0)
})

test('shows the inherited cycle path in the Event sidebar', async ({ page }) => {
  const layout = [
    { blockType: 'richText' as const, content: createLexicalDocument('Cycle hierarchy') },
  ]
  const cycle = await payload.create({
    collection: 'event-cycles',
    data: {
      _status: 'published',
      author: post.author,
      title: 'E2E Cykl hierarchii',
      slug: 'e2e-hierarchy-cycle',
      parent: pages[0].id,
      excerpt: layout[0].content,
      layout,
      eventDefaults: { eventType: 1, capacityMode: 'unlimited', participation: 'public', layout },
    },
  })
  try {
    const event = await payload.create({
      collection: 'events',
      draft: true,
      data: {
        _status: 'draft',
        author: post.author,
        cycle: cycle.id,
        title: 'E2E Wydarzenie w cyklu',
        slug: 'e2e-hierarchy-event',
        startAt: '2026-12-01T17:00:00Z',
      },
    })
    try {
      await login({ page, user: editorTestUser })
      await page.goto(`/admin/collections/events/${event.id}`)
      await expect(page.getByText('E2E Klub › E2E Cykl hierarchii', { exact: true })).toBeVisible()
      await expect(page.locator('#field-parent')).toHaveCount(0)
    } finally {
      await payload.delete({ collection: 'events', id: event.id })
    }
  } finally {
    await payload.delete({ collection: 'event-cycles', id: cycle.id })
  }
})

async function cleanup(): Promise<void> {
  if (!payload) return

  await payload.delete({
    collection: 'posts',
    overrideAccess: true,
    where: { slug: { equals: postSlug } },
  })

  for (const slug of [...pageSlugs].reverse()) {
    await payload.delete({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
  }
  for (const slug of [...topicSlugs].reverse()) {
    await payload.delete({
      collection: 'topics',
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
  }
}
