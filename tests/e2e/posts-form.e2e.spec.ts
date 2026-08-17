import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { cleanupTestUsers, editorTestUser, seedTestUsers } from '../helpers/seedUser'

test.beforeAll(async () => {
  await seedTestUsers()
})

test.afterAll(async () => {
  await cleanupTestUsers()
})

test('renders the post editor in the intended field order', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/posts/create')

  const fields = {
    categories: page.locator('#field-categories'),
    excerpt: page.locator('#field-excerpt'),
    heroImage: page.locator('#field-heroImage'),
    layout: page.locator('#field-layout'),
    seo: page.getByRole('textbox', { name: 'Tytuł SEO' }),
    tags: page.locator('#field-tags'),
    title: page.locator('#field-title'),
  }

  for (const field of Object.values(fields)) {
    await expect(field).toBeVisible()
  }

  await expect(page.locator('#field-attachments')).toBeHidden()
  await expect(fields.categories).toContainText('<brak>')
  await expect(fields.tags).toContainText('<brak>')
  await expect(fields.layout.locator('h3')).toHaveText('Treści*')

  const positions = Object.fromEntries(
    await Promise.all(
      Object.entries(fields).map(async ([name, field]) => [name, await field.boundingBox()]),
    ),
  )

  const getTop = (name: keyof typeof positions) => positions[name]?.y ?? -1

  expect(getTop('title')).toBeLessThan(getTop('categories'))
  expect(getTop('categories')).toBe(getTop('tags'))
  expect(getTop('categories')).toBeLessThan(getTop('heroImage'))
  expect(getTop('heroImage')).toBeLessThan(getTop('excerpt'))
  expect(getTop('excerpt')).toBeLessThan(getTop('layout'))
  expect(getTop('layout')).toBeLessThan(getTop('seo'))
})

test('renders dynamic labels for post content blocks', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/posts/1')

  const label = page.locator('.blocks-field__block-header .wkf-content-block-label').first()

  await expect(label.locator('strong')).toHaveText('Treść')
  await expect(label).toHaveText(
    'Treść: Erpegowe wtorki to regularne spotkania dla osób, które chcą zagrać, poprowadzić albo po prostu…',
  )
})

test('starts page and post forms with an expanded content block', async ({ page }) => {
  await login({ page, user: editorTestUser })

  for (const collection of ['pages', 'posts']) {
    await page.goto(`/admin/collections/${collection}/create`)

    const layoutField = page.locator('#field-layout')
    const block = layoutField.locator('.blocks-field__row')

    await expect(block).toHaveCount(1)
    await expect(block.locator('.wkf-content-block-label strong')).toHaveText('Treść')
    await expect(block.locator('.blocks-field__fields')).toBeVisible()
  }
})

test('renders the customized page create form', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/pages/create')

  await expect(page.locator('.doc-controls__meta')).toContainText('Tworzenie nowej Strony')
  await expect(page.locator('#field-parent')).toContainText('<brak>')
  await expect(page.getByRole('textbox', { name: 'Streszczenie' })).toBeVisible()
  await expect(page.locator('#field-layout')).toContainText('Dodaj blok treści')
  await expect(page.locator('#field-layout [contenteditable="true"]')).toBeEditable()
})
