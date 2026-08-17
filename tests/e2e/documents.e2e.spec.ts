import { expect, test } from '@playwright/test'

test('renders the public documents register and login page', async ({ page }) => {
  await page.goto('/dokumenty')
  await expect(page.getByRole('heading', { level: 1, name: 'Dokumenty klubowe' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Zaloguj się' })).toBeVisible()

  await page.goto('/login')
  await expect(page.getByRole('heading', { level: 1, name: 'Logowanie' })).toBeVisible()
  await expect(page.getByLabel('Adres e-mail')).toBeVisible()
  await expect(page.getByLabel('Hasło')).toBeVisible()
})
