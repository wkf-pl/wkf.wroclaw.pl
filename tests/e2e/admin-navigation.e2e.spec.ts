import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import {
  administratorTestUser,
  cleanupTestUsers,
  editorTestUser,
  seedTestUsers,
} from '../helpers/seedUser'

test.beforeAll(async () => {
  await seedTestUsers()
})

test.afterAll(async () => {
  await cleanupTestUsers()
})

test('groups editor navigation with the intended labels and order', async ({ page }) => {
  await login({ page, user: editorTestUser })

  const navigation = page.locator('aside nav')

  await expect(navigation.getByRole('button', { name: 'Treści' }).locator('..')).toContainText(
    'StronyWpisyKategorieTagiMedia',
  )
  await expect(navigation.getByRole('button', { name: 'Klubowe' }).locator('..')).toContainText(
    'DokumentySekcje',
  )
  await expect(
    navigation.getByRole('button', { name: 'Ustawienia strony' }).locator('..'),
  ).toContainText('PodstawoweMenuStopka')

  const groupLabels = await navigation.locator('.nav-group__label').allTextContents()

  expect(groupLabels).toEqual(['Treści', 'Klubowe', 'Ustawienia strony', 'Użytkownik'])
})

test('groups administrator navigation under Administracja', async ({ page }) => {
  await login({ page, user: administratorTestUser })

  const navigation = page.locator('aside nav')

  await expect(
    navigation.getByRole('button', { name: 'Administracja' }).locator('..'),
  ).toContainText('UżytkownicyRole')

  const groupLabels = await navigation.locator('.nav-group__label').allTextContents()

  expect(groupLabels).toEqual(['Administracja', 'Użytkownik'])
})

test('uses the requested navigation editor add labels and non-clearable schemes', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/globals/navigation')

  await expect(page.getByRole('button', { name: 'Dodaj pozycję menu w nagłówku' })).toBeVisible()
  const headerSchemeFields = page.locator('[id^="field-headerItems"][id$="customScheme"]')
  await expect(headerSchemeFields.first()).toBeVisible()
  await expect(headerSchemeFields.locator('.clear-indicator')).toHaveCount(0)

  const heroAddButton = page.getByRole('button', { name: 'Dodaj pozycję menu w sekcji Hero' })
  await expect(async () => {
    await page.getByRole('button', { name: 'Hero', exact: true }).click()
    await expect(heroAddButton).toBeVisible({ timeout: 1_000 })
  }).toPass()
  await expect(
    page.locator('[id^="field-heroItems"][id$="customScheme"] .clear-indicator'),
  ).toHaveCount(0)

  const socialAddButton = page.getByRole('button', { name: 'Dodaj medium społecznościowe' })
  await expect(async () => {
    await page.getByRole('button', { name: 'Stopka', exact: true }).click()
    await expect(socialAddButton).toBeVisible({ timeout: 1_000 })
  }).toPass()
  await expect(page.getByRole('button', { name: 'Dodaj kolumnę menu w stopce' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Dodaj pozycję menu' }).first()).toBeVisible()
  await expect(
    page.locator(
      '[id^="field-socialItems"][id$="customScheme"] .clear-indicator, [id^="field-footerColumns"][id$="customScheme"] .clear-indicator',
    ),
  ).toHaveCount(0)
})
