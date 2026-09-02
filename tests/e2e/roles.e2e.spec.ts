import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { administratorTestUser, editorTestUser, readOnlyTestUser } from '../helpers/seedUser'

const collectionNavigationLink = (slug: string) => `nav a[href="/admin/collections/${slug}"]`
const globalNavigationLink = (slug: string) => `nav a[href="/admin/globals/${slug}"]`

test('shows administration resources but no CMS to an administrator', async ({ page }) => {
  await login({ page, user: administratorTestUser })

  await expect(page.locator(collectionNavigationLink('users'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('roles'))).toBeVisible()
  await expect(page.locator(globalNavigationLink('website-permissions'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('posts'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('pages'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('documents'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('club-sections'))).toHaveCount(0)
  await expect(page.locator(globalNavigationLink('site-settings'))).toHaveCount(0)
})

test('configures unique permission resources with Polish labels', async ({ page }) => {
  test.setTimeout(60_000)

  await login({ page, user: administratorTestUser })
  await page.goto('/admin/collections/roles/create')
  await page.waitForLoadState('networkidle')

  const permissions = page.locator('#field-permissions')
  const addPermission = permissions.getByRole('button', { name: 'Dodaj uprawnienie' })
  await expect(addPermission).toBeVisible()
  await expect(permissions).not.toContainText('Ogranicz operację do')

  await addPermission.click()
  const rows = permissions.locator('.array-field__row')
  await expect(rows).toHaveCount(1)
  const firstRow = rows.nth(0)
  const firstResourceField = firstRow.locator('#field-permissions__0__resource')
  await expect(firstRow).toContainText('Uprawnienie 1')
  if (!(await firstResourceField.isVisible())) {
    await firstRow.getByRole('button', { name: 'Przełącz blok' }).click()
  }
  await expect(firstResourceField).toBeVisible()
  await firstResourceField.getByRole('combobox').click()
  await page.locator('.rs__menu').getByText('Media', { exact: true }).click()

  await rows.nth(0).getByText('Odczyt', { exact: true }).click()
  await expect(rows.nth(0).getByText('Tworzenie', { exact: true })).toBeVisible()
  await expect(rows.nth(0).getByText('Edycja', { exact: true })).toBeVisible()
  await expect(rows.nth(0).getByText('Usuwanie', { exact: true })).toBeVisible()
  await expect(rows.nth(0).getByText('Tylko własne', { exact: true })).toBeVisible()

  await addPermission.click()
  await expect(rows).toHaveCount(2)
  const secondRow = rows.nth(1)
  const secondResourceField = secondRow.locator('#field-permissions__1__resource')
  await expect(secondRow).toContainText('Uprawnienie 2')
  if (!(await secondResourceField.isVisible())) {
    await secondRow.getByRole('button', { name: 'Przełącz blok' }).click()
  }
  await expect(secondResourceField).toBeVisible()
  await secondResourceField.getByRole('combobox').click()
  await expect(page.locator('.rs__menu').getByText('Media', { exact: true })).toHaveCount(0)
  await expect(page.locator('.rs__menu').getByText('Dokumenty', { exact: true })).toBeVisible()
  await expect(page.locator('.rs__menu').getByText(/^Dokumenty:/)).toHaveCount(0)
  await expect(
    page.locator('.rs__menu').getByText('Pliki dokumentów', { exact: true }),
  ).toHaveCount(0)
})

test('shows CMS resources but no administration collections to an editor', async ({ page }) => {
  await login({ page, user: editorTestUser })

  await expect(page.locator(collectionNavigationLink('posts'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('pages'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('media'))).toBeVisible()
  await expect(page.locator(collectionNavigationLink('club-sections'))).toHaveCount(0)
  await expect(page.locator(collectionNavigationLink('documents'))).toBeVisible()
  await expect(page.locator(globalNavigationLink('navigation'))).toBeVisible()
  await expect(page.locator(globalNavigationLink('site-settings'))).toBeVisible()
  await expect(page.locator(globalNavigationLink('homepage-hero'))).toBeVisible()
  await expect(page.locator(globalNavigationLink('homepage-sections'))).toBeVisible()
  await expect(page.locator(globalNavigationLink('footer'))).toBeVisible()
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
  const mediaDocumentURL = await mediaDocumentLink.getAttribute('href')
  if (!mediaDocumentURL) {
    throw new Error('The media list must link to an editable document.')
  }
  await page.goto(mediaDocumentURL)

  await expect(page.locator('#field-alt')).toBeVisible({ timeout: 15_000 })
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
