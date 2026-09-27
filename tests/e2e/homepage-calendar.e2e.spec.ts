import { expect, test } from '@playwright/test'

const eventSlug = 'homepage-calendar-e2e'
const eventTitle = 'Kalendarz strony głównej E2E'
const eventDay = 15

test('switches one responsive Events frame between the carousel and interactive calendar', async ({
  page,
}) => {
  await page.route('**/events/calendar.json?month=*', async (route) => {
    const month = new URL(route.request().url()).searchParams.get('month')
    if (!month) throw new Error('Missing calendar month in E2E request.')

    await route.fulfill({
      contentType: 'application/json',
      json: {
        eventTypes: [
          { id: 1, iconColor: 'lantern-glow', iconName: 'dice', name: 'Sesje RPG' },
          { id: 2, iconColor: 'mist-silver', iconName: 'users', name: 'Spotkania' },
        ],
        events: [
          {
            eventType: {
              id: 1,
              iconColor: 'lantern-glow',
              iconName: 'dice',
              name: 'Sesje RPG',
            },
            excerpt: 'Streszczenie wydarzenia kalendarzowego E2E.',
            id: 1,
            slug: eventSlug,
            startAt: `${month}-${String(eventDay).padStart(2, '0')}T12:00:00.000Z`,
            title: eventTitle,
          },
        ],
        truncated: false,
      },
    })
  })
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'wkf-privacy-consent',
      JSON.stringify({
        decidedAt: '2026-01-01T00:00:00.000Z',
        expiresAt: '2030-01-01T00:00:00.000Z',
        functional: false,
        version: 1,
      }),
    )
  })
  await page.goto('/')

  const showcase = page.locator('.homeEventShowcase')
  await expect(showcase).toBeVisible()
  await expect(showcase.getByRole('tab', { name: 'Najbliższe' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(showcase.getByRole('link', { name: /Wszystkie wydarzenia/ })).toHaveAttribute(
    'href',
    '/events',
  )
  const activeSlideControl = showcase.locator('.carouselControls button[aria-pressed="true"]')
  await expect(activeSlideControl).toHaveCSS('background-color', 'rgb(255, 189, 56)')
  await expect(activeSlideControl).toHaveCSS('color', 'rgb(0, 13, 23)')

  await showcase.getByRole('tab', { name: 'Kalendarz' }).click()
  await expect(showcase.getByRole('tab', { name: 'Kalendarz' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(showcase.getByRole('link', { name: /Subskrybuj kalendarz WKF/ })).toHaveAttribute(
    'href',
    '/events/calendar.ics',
  )
  await expect(showcase.getByRole('list', { name: 'Rodzaje wydarzeń' })).toContainText('Sesje RPG')
  await expect(showcase.getByRole('list', { name: 'Rodzaje wydarzeń' })).toContainText('Spotkania')

  const monthHeading = showcase.getByRole('heading', { level: 3 })
  const initialHeading = await monthHeading.textContent()
  await showcase.getByRole('button', { name: 'Następny miesiąc' }).click()
  await expect(monthHeading).not.toHaveText(initialHeading ?? '')
  await showcase.getByRole('button', { name: new RegExp(`^${eventDay}, .*${eventTitle}`) }).click()
  await expect(showcase.getByRole('link', { name: new RegExp(eventTitle) })).toHaveAttribute(
    'href',
    `/events/${eventSlug}`,
  )
  await expect(showcase).toContainText('Streszczenie wydarzenia kalendarzowego E2E.')
  await showcase.getByRole('button', { name: 'Poprzedni miesiąc' }).click()
  await expect(monthHeading).toHaveText(initialHeading ?? '')

  await page.setViewportSize({ height: 844, width: 390 })
  const calendarGrid = showcase.locator('.calendarGrid')
  await expect(calendarGrid).toBeVisible()
  expect(await calendarGrid.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  )

  const legendBox = await showcase.getByRole('list', { name: 'Rodzaje wydarzeń' }).boundingBox()
  const subscriptionBox = await showcase
    .getByRole('link', { name: /Subskrybuj kalendarz WKF/ })
    .boundingBox()
  expect(legendBox).not.toBeNull()
  expect(subscriptionBox).not.toBeNull()
  expect(subscriptionBox?.y ?? 0).toBeGreaterThan(legendBox?.y ?? 0)
})
