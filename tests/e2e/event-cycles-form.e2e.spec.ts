import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

test('renders Cycle tabs, generated URL and grammatical creation labels', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/event-cycles/create')

  await expect(page.locator('.doc-controls__meta')).toContainText('Tworzenie nowego Cyklu wydarzeń')
  await expect(page.getByRole('button', { name: 'Opis cyklu' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'SEO' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Domyślne dane Wydarzenia' })).toBeVisible()

  await page.getByRole('textbox', { name: 'Tytuł *' }).pressSequentially('Testowy Cykl Łódź')
  await page
    .getByRole('textbox', { name: 'Streszczenie *' })
    .pressSequentially('Pełne streszczenie Cyklu')
  await expect(page.getByRole('textbox', { name: 'Slug *' })).toHaveValue('testowy-cykl-lodz')

  await page.getByRole('button', { name: 'Domyślne dane Wydarzenia' }).click()
  await expect(page.locator('#field-eventDefaults__title')).toHaveValue('Testowy Cykl Łódź')
  await expect(page.locator('#field-eventDefaults__excerpt')).toHaveValue(
    'Pełne streszczenie Cyklu',
  )
  await expect(page.locator('#field-eventDefaults__layout h3')).toContainText('Treści')
  await expect(page.getByText('Event Defaults', { exact: true })).toHaveCount(0)

  const venueWebsite = page.locator('#field-eventDefaults__location__venueWebsite')
  await venueWebsite.fill('https://wiking.')
  await page.locator('#field-eventDefaults__location__streetAddress').click()
  await expect(
    page.getByText('Podaj poprawny adres HTTP lub HTTPS.', { exact: true }),
  ).toBeVisible()
  await expect(
    venueWebsite.locator(
      'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " field-type ")][1]',
    ),
  ).toHaveClass(/error/)

  await venueWebsite.fill('https://wiking.pl')
  await page.locator('#field-eventDefaults__location__postalCode').fill('50001')
  await page.locator('#field-eventDefaults__location__city').click()
  await expect(
    page.getByText('Podaj kod pocztowy w formacie 00-000.', { exact: true }),
  ).toBeVisible()

  await page.locator('#field-eventDefaults__location__postalCode').fill('50-001')
  await page.locator('#field-eventDefaults__location__mapEmbedURL').fill('https://example.test/map')
  await page.locator('#field-eventDefaults__location__city').click()
  await expect(page.getByText(/Wklej kod osadzenia mapy Google/)).toBeVisible()

  await page.goto('/admin/collections/events/create')
  await expect(page.locator('.doc-controls__meta')).toContainText('Tworzenie nowego Wydarzenia')
  await expect(page.getByRole('button', { name: 'Dodaj następne' })).toHaveCount(0)

  await page.goto('/admin/collections/partners')
  await expect(
    page.getByRole('link', { name: 'Dodaj Partnera', exact: true }).first(),
  ).toBeVisible()
})
