import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import { createLexicalDocument } from '../helpers/lexical-document'
import { editorTestUser } from '../helpers/seedUser'

const eventSlug = 'homepage-calendar-e2e'
const eventTitle = 'Kalendarz strony głównej E2E'
const eventDay = 15
const carouselEventSlugs = ['homepage-carousel-first-e2e', 'homepage-carousel-second-e2e']
let payload: Payload

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanupCarouselFixtures()

  const [users, eventTypes] = await Promise.all([
    payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { email: { equals: editorTestUser.email } },
    }),
    payload.find({
      collection: 'event-types',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { name: { equals: 'Sesje RPG' } },
    }),
  ])
  const author = users.docs[0]
  const eventType = eventTypes.docs[0]
  if (!author) throw new Error('Missing the editor E2E user.')
  if (!eventType) throw new Error('Missing the Sesje RPG event type.')

  for (const [index, slug] of carouselEventSlugs.entries()) {
    await payload.create({
      collection: 'events',
      data: {
        _status: 'published',
        author: author.id,
        calendarRevision: 0,
        capacityMode: 'unlimited',
        eventStatus: 'scheduled',
        eventType: eventType.id,
        excerpt: createLexicalDocument(`Streszczenie wydarzenia karuzeli E2E ${index + 1}.`),
        location: { country: 'Polska' },
        participation: 'public',
        layout: [
          {
            blockType: 'richText',
            content: createLexicalDocument(`Treść wydarzenia karuzeli E2E ${index + 1}.`),
          },
        ],
        slug,
        startAt: new Date(Date.now() + (index + 1) * 86_400_000).toISOString(),
        timeMode: 'timed',
        title: `Wydarzenie karuzeli E2E ${index + 1}`,
      },
      draft: false,
      overrideAccess: true,
    })
  }
})

test.afterAll(async () => cleanupCarouselFixtures())

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
            excerpt: createLexicalDocument('Streszczenie wydarzenia kalendarzowego E2E.'),
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

async function cleanupCarouselFixtures(): Promise<void> {
  if (!payload) return
  await payload.delete({
    collection: 'events',
    overrideAccess: true,
    where: { slug: { in: carouselEventSlugs } },
  })
}
