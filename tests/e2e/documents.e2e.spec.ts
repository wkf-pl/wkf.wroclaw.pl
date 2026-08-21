import { expect, test } from '@playwright/test'

import { administratorTestUser } from '../helpers/seedUser'

test('renders the public documents register and login page', async ({ page }) => {
  await page.goto('/dokumenty')
  await expect(page.getByRole('heading', { level: 1, name: 'Dokumenty klubowe' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Zaloguj się' })).toBeVisible()

  await page.goto('/login')
  await expect(page.getByRole('heading', { level: 1, name: 'Logowanie' })).toBeVisible()
  await expect(page.getByLabel('Adres e-mail')).toBeVisible()
  await expect(page.getByLabel('Hasło')).toBeVisible()
})

test('signs in through the public login form', async ({ page }) => {
  await page.goto('/login?returnTo=/dokumenty')
  await page.getByLabel('Adres e-mail').fill(administratorTestUser.email)
  await page.getByLabel('Hasło').fill(administratorTestUser.password)
  const loginResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().endsWith('/api/users/login'),
  )
  await page.getByRole('button', { name: 'Zaloguj się' }).click()

  expect((await loginResponse).ok()).toBe(true)
  await expect(page).toHaveURL(/\/dokumenty$/)
})
