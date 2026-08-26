import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Category, Page, Post, User } from '@/payload-types'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const categorySlugs = [
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
let categories: Category[] = []
let pages: Page[] = []
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
          type: 'paragraph' as const,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root' as const,
      version: 1,
    },
  }
}

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

  const rootCategory = await payload.create({
    collection: 'categories',
    data: { name: 'E2E Gry', slug: categorySlugs[0] },
    overrideAccess: true,
  })
  const childCategory = await payload.create({
    collection: 'categories',
    data: { name: 'E2E RPG', parent: rootCategory.id, slug: categorySlugs[1] },
    overrideAccess: true,
  })
  const grandchildCategory = await payload.create({
    collection: 'categories',
    data: { name: 'E2E Warhammer', parent: childCategory.id, slug: categorySlugs[2] },
    overrideAccess: true,
  })
  categories = [rootCategory, childCategory, grandchildCategory]

  post = await payload.create({
    collection: 'posts',
    data: {
      _status: 'published',
      author: author.id,
      category: grandchildCategory.id,
      excerpt: 'Treść z kategorii potomnej.',
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

test('shows category breadcrumbs, direct children and content from descendants', async ({
  page,
}) => {
  await page.goto(`/category/${categorySlugs[1]}`)

  const breadcrumbs = page.getByRole('navigation', { name: 'Okruszki' })
  await expect(breadcrumbs.getByRole('link', { name: 'E2E Gry' })).toHaveAttribute(
    'href',
    `/category/${categorySlugs[0]}`,
  )
  await expect(breadcrumbs).toContainText('E2E RPG')
  await expect(page.getByRole('navigation', { name: 'Podkategorie' })).toContainText(
    'E2E Warhammer',
  )
  await expect(page.getByRole('link').filter({ hasText: post.title })).toBeVisible()
})

test('shows published page ancestors as links and unpublished ancestors as text', async ({
  page,
}) => {
  await page.goto(`/${pageSlugs[2]}`)

  const breadcrumbs = page.getByRole('navigation', { name: 'Okruszki' })
  await expect(breadcrumbs.getByRole('link', { name: 'Strona główna' })).toHaveAttribute(
    'href',
    '/',
  )
  await expect(breadcrumbs.getByRole('link', { name: 'E2E Klub' })).toHaveAttribute(
    'href',
    `/${pageSlugs[0]}`,
  )
  await expect(breadcrumbs).toContainText('E2E Nieopublikowany zarząd')
  await expect(breadcrumbs.getByRole('link', { name: 'E2E Nieopublikowany zarząd' })).toHaveCount(0)
  await expect(breadcrumbs).toContainText('E2E Komisja')
})

test('uses one category selector and full hierarchy paths in admin relationships', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/posts/${post.id}`)

  const categoryField = page.locator('#field-category')
  await expect(categoryField.getByRole('combobox')).toHaveCount(1)
  await expect(categoryField).toContainText('E2E Gry › E2E RPG › E2E Warhammer')

  await page.goto(`/admin/collections/categories/${categories[2].id}`)
  await expect(page.locator('#field-parent')).toContainText('E2E Gry › E2E RPG')
  const categoryPath = page.getByRole('navigation', { name: 'Ścieżka nawigacji dokumentu' })
  await expect(categoryPath.getByRole('link', { name: 'E2E Gry' })).toHaveAttribute(
    'href',
    `/admin/collections/categories/${categories[0].id}`,
  )
  await expect(categoryPath.getByText('E2E Warhammer', { exact: true })).toHaveJSProperty(
    'tagName',
    'STRONG',
  )
  await expect(categoryPath.getByRole('link', { name: 'E2E Warhammer' })).toHaveCount(0)
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
  for (const slug of [...categorySlugs].reverse()) {
    await payload.delete({
      collection: 'categories',
      overrideAccess: true,
      where: { slug: { equals: slug } },
    })
  }
}
