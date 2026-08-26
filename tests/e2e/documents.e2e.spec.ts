import { expect, test } from '@playwright/test'

test('renders the public documents register without account actions', async ({ page }) => {
  await page.goto('/dokumenty')
  await expect(page.getByRole('heading', { level: 1, name: 'Dokumenty klubowe' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Zaloguj się' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Wyloguj' })).toHaveCount(0)
  const primaryPdfLink = page.locator('.documentPdfLink').first()
  await expect(primaryPdfLink).toBeVisible()
  await expect(primaryPdfLink).toHaveAttribute('href', /\/dokumenty\/[^/]+\/plik\/\d+/)
  await expect(primaryPdfLink).toHaveAttribute('target', '_blank')

  const loginResponse = await page.goto('/login')
  expect(loginResponse?.status()).toBe(404)
})
