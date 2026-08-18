import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { cleanupTestUsers, editorTestUser, seedTestUsers } from '../helpers/seedUser'

test.beforeAll(async () => {
  await seedTestUsers()
})

test.afterAll(async () => {
  await cleanupTestUsers()
})

test('renders the event editor in the intended field order', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/events/create')

  const fields = {
    title: page.locator('#field-title'),
    cycle: page.locator('#field-cycle'),
    categories: page.locator('#field-categories'),
    tags: page.locator('#field-tags'),
    heroImage: page.locator('#field-heroImage'),
    tagline: page.locator('#field-tagline'),
    excerpt: page.locator('#field-excerpt'),
    layout: page.locator('#field-layout'),
    participation: page.locator('#field-participation'),
    visibility: page.locator('#field-visibility'),
  }

  for (const field of Object.values(fields)) {
    await expect(field).toBeVisible()
  }

  const positions = Object.fromEntries(
    await Promise.all(
      Object.entries(fields).map(async ([name, field]) => [name, await field.boundingBox()]),
    ),
  )
  const getTop = (name: keyof typeof positions) => positions[name]?.y ?? -1

  expect(Math.abs(getTop('title') - getTop('cycle'))).toBeLessThan(40)
  expect(getTop('title')).toBeLessThan(getTop('categories'))
  expect(getTop('categories')).toBe(getTop('tags'))
  expect(getTop('categories')).toBeLessThan(getTop('heroImage'))
  expect(getTop('heroImage')).toBeLessThan(getTop('tagline'))
  expect(getTop('tagline')).toBeLessThan(getTop('excerpt'))
  expect(getTop('excerpt')).toBeLessThan(getTop('layout'))
  expect(getTop('participation')).toBe(getTop('visibility'))
})

test('serves the public event index', async ({ request }) => {
  const response = await request.get('/events')

  expect(response.status()).toBe(200)
  await expect(response.text()).resolves.toContain('Wydarzenia')
})
