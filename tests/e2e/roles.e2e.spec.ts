import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import {
  administratorTestUser,
  cleanupTestUsers,
  editorTestUser,
  readOnlyTestUser,
  seedTestUsers,
} from '../helpers/seedUser'

const collectionNavigationLink = (slug: string) => `nav a[href="/admin/collections/${slug}"]`
const globalNavigationLink = (slug: string) => `nav a[href="/admin/globals/${slug}"]`

test.beforeAll(async () => {
  await seedTestUsers()
})

test.afterAll(async () => {
  await cleanupTestUsers()
})

test('shows administration resources but no CMS to an administrator', async ({ page }) => {
  await login({ page, user: administratorTestUser })

  await expect(page.locator(collectionNavigationLink('users'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('roles'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('posts'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('pages'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('club-sections'))).toHaveCount(0)
  await expect(page.locator(globalNavigationLink('site-settings'))).toHaveCount(0)
})

test('shows CMS resources but no administration collections to an editor', async ({ page }) => {
  await login({ page, user: editorTestUser })

  await expect(page.locator(collectionNavigationLink('posts'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('pages'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('media'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('club-sections'))).toBeVisible()
  await expect(page.locator(globalNavigationLink('navigation'))).toBeVisible()
  await expect(page.locator(globalNavigationLink('site-settings'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('roles'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('users'))).toHaveCount(0)
})

test('shows a readable collection without its create action', async ({ page }) => {
  await login({ page, user: readOnlyTestUser })

  await expect(page.locator(collectionNavigationLink('posts'))).toBeVisible()
  await expect(page.locator('a[href="/admin/collections/posts/create"]')).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('pages'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('club-sections'))).toHaveCount(0)
})
