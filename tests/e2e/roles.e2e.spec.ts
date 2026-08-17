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
  await expect(page.locator(globalNavigationLink('website-permissions'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('posts'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('pages'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('documents'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('club-sections'))).toHaveCount(0)
  await expect(page.locator(globalNavigationLink('site-settings'))).toHaveCount(0)
})

test('configures unique permission resources with Polish labels', async ({ page }) => {
  await login({ page, user: administratorTestUser })
  await page.goto('/admin/collections/roles/create')

  const permissions = page.locator('#field-permissions')
  const addPermission = permissions.getByRole('button', { name: 'Dodaj uprawnienie' })
  await expect(addPermission).toBeVisible()
  await expect(permissions).not.toContainText('Ogranicz operację do')

  await addPermission.click()
  const rows = permissions.locator('.array-field__row')
  await permissions.getByRole('button', { name: 'Pokaż wszystkie' }).click()
  await rows.nth(0).getByRole('combobox').click()
  await page.locator('.rs__menu').getByText('Media', { exact: true }).click()

  await rows.nth(0).getByText('Odczyt', { exact: true }).click()
  await expect(rows.nth(0).getByText('Tworzenie', { exact: true })).toBeVisible()
  await expect(rows.nth(0).getByText('Edycja', { exact: true })).toBeVisible()
  await expect(rows.nth(0).getByText('Usuwanie', { exact: true })).toBeVisible()
  await expect(rows.nth(0).getByText('Tylko własne', { exact: true })).toBeVisible()

  await addPermission.click()
  await permissions.getByRole('button', { name: 'Pokaż wszystkie' }).click()
  await rows.nth(1).getByRole('combobox').click()
  await expect(page.locator('.rs__menu').getByText('Media', { exact: true })).toHaveCount(0)

  await page.goto('/admin/globals/website-permissions')
  await expect(page.getByRole('heading', { name: 'Uprawnienia WWW' })).toBeVisible()
  await page.locator('#field-permissions').getByRole('button', { name: 'Pokaż wszystkie' }).click()
  await expect(page.getByText('Dostęp dla osób niezalogowanych').first()).toBeVisible()
})

test('shows display names with email tooltips in the users list', async ({ page }) => {
  await login({ page, user: administratorTestUser })
  await page.goto('/admin/collections/users')

  await expect(page.getByRole('columnheader', { name: /^Adres e-mail/ })).toBeVisible()
  const userName = page
    .locator('.table .wkf-user-identity')
    .filter({ hasText: administratorTestUser.displayName })
  await expect(userName).toBeVisible()
  await expect(userName.locator('xpath=ancestor::a[1]')).toHaveAttribute(
    'href',
    /\/admin\/collections\/users\/\d+$/,
  )
  const administratorRow = page
    .locator('tbody tr')
    .filter({ hasText: administratorTestUser.email })
  await expect(
    administratorRow.getByRole('link', { exact: true, name: administratorTestUser.email }),
  ).toHaveAttribute('href', /\/admin\/collections\/users\/\d+$/)
  await userName.hover()

  await expect(page.locator('.tooltip--show')).toContainText(administratorTestUser.email)

  await page.locator('tbody input[type="checkbox"]').first().check()
  await expect(page.getByRole('button', { exact: true, name: 'Edytuj' })).toHaveCount(0)
})

test('shows CMS resources but no administration collections to an editor', async ({ page }) => {
  await login({ page, user: editorTestUser })

  await expect(page.locator(collectionNavigationLink('posts'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('pages'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('media'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('club-sections'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('documents'))).toBeVisible()
  await expect(page.locator(globalNavigationLink('navigation'))).toBeVisible()
  await expect(page.locator(globalNavigationLink('site-settings'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('roles'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('users'))).toHaveCount(0)
})

test('opens a media document without rendering the category tabs outside the list', async ({
  page,
}) => {
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))

  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/media')

  const mediaDocumentLink = page.locator('.table a[href^="/admin/collections/media/"]').first()
  await expect(mediaDocumentLink).toBeVisible()
  await mediaDocumentLink.click()

  await expect(page.locator('#field-alt')).toBeVisible()
  expect(pageErrors).toEqual([])
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

  await expect(page.locator('#field-roles')).toContainText('Redaktor')

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
  await expect(page.locator(collectionNavigationLink('documents'))).toHaveCount(0)

  await page.goto('/admin/account')
  await expect(page.locator('#field-displayName')).toBeVisible()
})
