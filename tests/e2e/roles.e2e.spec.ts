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

test('shows display names with email tooltips in the users list', async ({ page }) => {
  await login({ page, user: administratorTestUser })
  await page.goto('/admin/collections/users')

  const userName = page
    .locator('.table .wkf-user-identity')
    .filter({ hasText: administratorTestUser.displayName })
  await expect(userName).toBeVisible()
  await userName.hover()

  await expect(page.locator('.tooltip--show')).toContainText(administratorTestUser.email)
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

test('shows the author display name with an email tooltip in a relationship field', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/posts/create')

  const authorField = page.locator('#field-author')
  const userName = authorField.getByText(editorTestUser.displayName, { exact: true })
  await expect(userName).toBeVisible()
  await authorField.locator('.rs__control').hover()

  await expect(page.locator('.wkf-user-relationship > .tooltip--show')).toContainText(
    editorTestUser.email,
  )
})

test('rejects an occupied display name when editing the account profile', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/account')

  const displayNameField = page.locator('#field-displayName')
  await displayNameField.fill(administratorTestUser.displayName)
  await page.getByRole('button', { exact: true, name: 'Zapisz' }).click()

  await expect(page.locator('.field-error')).toContainText('Wartość musi być unikalna')
  await expect(displayNameField).toHaveValue(administratorTestUser.displayName)
})

test('shows a readable collection without its create action', async ({ page }) => {
  await login({ page, user: readOnlyTestUser })

  await expect(page.locator(collectionNavigationLink('posts'))).toBeVisible()
  await expect(page.locator('a[href="/admin/collections/posts/create"]')).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('pages'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('club-sections'))).toHaveCount(0)
})
