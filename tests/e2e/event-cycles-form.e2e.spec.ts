import { expect, test, type Page } from '@playwright/test'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

async function getFieldLayout(page: Page, selector: string) {
  return page.locator(selector).evaluateAll((fields) =>
    fields.map((field) => {
      const fieldContainer = field.closest('.field-type') ?? field
      const rectangle = fieldContainer.getBoundingClientRect()

      return {
        configuredWidth: getComputedStyle(fieldContainer).getPropertyValue('--field-width').trim(),
        top: rectangle.top,
      }
    }),
  )
}

function expectSingleRow(
  fieldLayout: Awaited<ReturnType<typeof getFieldLayout>>,
  expectedWidths: string[],
): void {
  expect(fieldLayout).toHaveLength(expectedWidths.length)
  expect(
    Math.max(...fieldLayout.map(({ top }) => top)) - Math.min(...fieldLayout.map(({ top }) => top)),
  ).toBeLessThan(2)
  expect(fieldLayout.map(({ configuredWidth }) => configuredWidth)).toEqual(expectedWidths)
}

test('renders Cycle tabs, generated URL and grammatical creation labels', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/event-cycles/create')

  await expect(page.locator('.doc-controls__meta')).toContainText('Tworzenie nowego Cyklu wydarzeń')
  await expect(page.getByRole('button', { name: 'Opis cyklu' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'SEO' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Domyślne dane Wydarzenia' })).toBeVisible()

  await page.getByRole('textbox', { name: 'Tytuł *' }).pressSequentially('Testowy Cykl Łódź')
  await page
    .locator('[contenteditable="true"]')
    .first()
    .pressSequentially('Pełne streszczenie Cyklu')
  await expect(page.getByRole('textbox', { name: 'Slug *' })).toHaveValue('testowy-cykl-lodz')

  await page.getByRole('button', { name: 'Domyślne dane Wydarzenia' }).click()
  await expect(page.locator('#field-eventDefaults__title')).toHaveValue('Testowy Cykl Łódź')
  await expect(
    page.locator('[contenteditable="true"]').filter({ hasText: 'Pełne streszczenie Cyklu' }),
  ).toBeVisible()
  await expect(page.locator('#field-eventDefaults__layout h3')).toContainText('Treści')
  await expect(page.getByText('Event Defaults', { exact: true })).toHaveCount(0)
  await expect(page.locator('#field-eventDefaults__recurrenceType')).toContainText(
    'Co określoną liczbę tygodni',
  )
  await expect(page.locator('#field-eventDefaults__weekInterval')).toHaveValue('2')
  await expect(page.locator('#field-eventDefaults__recurrenceWeekday')).toContainText('wtorek')
  await expect(page.locator('#field-eventDefaults__defaultDayCount')).toHaveValue('1')
  await expect(page.locator('#field-eventDefaults__defaultStartTime')).toHaveAttribute(
    'type',
    'time',
  )
  await expect(page.locator('#field-eventDefaults__defaultEndTime')).toHaveAttribute('type', 'time')

  expectSingleRow(
    await getFieldLayout(page, '#field-eventDefaults__category, #field-eventDefaults__tags'),
    ['50%', '50%'],
  )
  expectSingleRow(
    await getFieldLayout(
      page,
      '#field-eventDefaults__recurrenceType, #field-eventDefaults__weekInterval, #field-eventDefaults__recurrenceWeekday',
    ),
    ['50%', '25%', '25%'],
  )
  expectSingleRow(
    await getFieldLayout(
      page,
      '#field-eventDefaults__defaultDayCount, #field-eventDefaults__defaultStartTime, #field-eventDefaults__defaultEndTime',
    ),
    ['33.333%', '33.333%', '33.333%'],
  )

  expectSingleRow(
    await getFieldLayout(
      page,
      '#field-eventDefaults__location, #field-eventDefaults__participation, #field-eventDefaults__capacityMode',
    ),
    ['50%', '16.6666%', '16.6666%'],
  )
  await expect(page.locator('#field-eventDefaults__capacity')).toHaveCount(0)

  await expect(page.locator('#field-eventDefaults__location')).toBeVisible()

  await page.goto('/admin/collections/events/create')
  await expect(page.locator('.doc-controls__meta')).toContainText('Tworzenie nowego Wydarzenia')
  await expect(page.getByRole('button', { name: 'Dodaj następne' })).toHaveCount(0)
  await expect(page.locator('#field-timeMode')).toBeHidden()
  await expect(page.locator('#field-location')).toBeVisible()
  await expect(page.locator('#field-onlineEventURL')).toBeVisible()
  expectSingleRow(await getFieldLayout(page, '#field-startAt, #field-endAt'), ['50%', '50%'])

  expectSingleRow(
    await getFieldLayout(page, '#field-location, #field-participation, #field-capacityMode'),
    ['50%', '16.6666%', '16.6666%'],
  )
  await expect(page.locator('#field-capacity')).toHaveCount(0)

  await page.goto('/admin/collections/locations/create')
  await expect(page.locator('#field-venueName')).toBeVisible()
  await expect(page.locator('#field-venueWebsite')).toBeVisible()
  await expect(page.locator('#field-city')).toHaveValue('Wrocław')
  await expect(page.locator('#field-country')).toHaveValue('Polska')
  await expect(page.getByText('Aktywne miejsce', { exact: true })).toBeVisible()
  await page.locator('#field-mapEmbedURL').fill('https://www.google.com/maps/embed?pb=test')
  await expect(page.getByRole('button', { name: 'Wczytaj podgląd Map Google' })).toBeVisible()

  await page.goto('/admin/collections/partners')
  await expect(
    page.getByRole('link', { name: 'Dodaj Partnera', exact: true }).first(),
  ).toBeVisible()
})
