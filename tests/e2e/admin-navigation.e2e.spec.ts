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
