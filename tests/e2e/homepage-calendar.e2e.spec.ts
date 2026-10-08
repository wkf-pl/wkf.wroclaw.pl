import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import type { HomepageSection } from '../../src/payload-types.js'
import { createLexicalDocument } from '../helpers/lexical-document'
import { editorTestUser } from '../helpers/seedUser'

const eventSlug = 'homepage-calendar-e2e'
const eventTitle = 'Kalendarz strony głównej E2E'
const eventDay = 15
const carouselEventSlugs = ['homepage-carousel-first-e2e', 'homepage-carousel-second-e2e']
let payload: Payload
let originalHomepageSections: HomepageSection

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanupCarouselFixtures()
  originalHomepageSections = await payload.findGlobal({
    slug: 'homepage-sections',
    depth: 1,
    overrideAccess: true,
  })

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

  await payload.updateGlobal({
    slug: 'homepage-sections',
    data: {
      layout: [
        { blockType: 'heading', heading: 'Wydarzenia', headingLevel: 'h2' },
        {
          blockType: 'carousel',
          eventTimeFilter: 'upcoming',
          parentFilter: 'none',
          selectionMode: 'filters',
          slideLimit: 5,
          sort: 'eventDateAscending',
          sources: ['events'],
        },
        { blockType: 'heading', heading: 'Kalendarz', headingLevel: 'h2' },
        { blockType: 'contentCalendar', sources: ['events'] },
      ],
    },
    overrideAccess: true,
  })
})

test.afterAll(async () => {
  await payload.updateGlobal({
    slug: 'homepage-sections',
    data: { layout: normalizeHomepageLayout(originalHomepageSections.layout) },
    overrideAccess: true,
  })
  await cleanupCarouselFixtures()
})

test('renders responsive event carousel and calendar content blocks on the homepage', async ({
  page,
}) => {
  await page.route('**/content/calendar.json?*', async (route) => {
    const month = new URL(route.request().url()).searchParams.get('month')
    if (!month) throw new Error('Missing calendar month in E2E request.')

    await route.fulfill({
      contentType: 'application/json',
      json: {
        itemTypes: [
          {
            id: 'event-type:1',
            iconColor: 'lantern-glow',
            iconName: 'dice',
            name: 'Sesje RPG',
          },
          {
            id: 'event-type:2',
            iconColor: 'mist-silver',
            iconName: 'users',
            name: 'Spotkania',
          },
        ],
        items: [
          {
            dateTime: `${month}-${String(eventDay).padStart(2, '0')}T12:00:00.000Z`,
            endAt: `${month}-${String(eventDay).padStart(2, '0')}T16:00:00.000Z`,
            id: 'events:1',
            kind: 'events',
            location: {
              venueName: 'Klub Pod Kolumnami',
              venueWebsite: 'https://example.com/klub',
            },
            summary: {
              kind: 'richText',
              value: createLexicalDocument('Streszczenie wydarzenia kalendarzowego E2E.'),
            },
            timeMode: 'timed',
            title: eventTitle,
            type: {
              id: 'event-type:1',
              iconColor: 'lantern-glow',
              iconName: 'dice',
              name: 'Sesje RPG',
            },
            url: `/events/${eventSlug}`,
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

  const carousel = page.getByRole('region', { name: 'Karuzela treści' })
  await expect(carousel).toBeVisible()
  await expect(carousel.locator('.contentCarouselSlide')).toHaveCount(2)
  await expect(
    carousel.locator(
      '.contentCarouselSlide--active .contentCarouselControls button[aria-pressed="true"]',
    ),
  ).toHaveCount(1)

  const calendar = page.getByRole('region', { name: 'Kalendarz treści' })
  await expect(calendar).toBeVisible()
  await expect(calendar.getByRole('link', { name: /Zasubskrybuj kalendarz WKF/ })).toHaveAttribute(
    'href',
    '/events/calendar.ics',
  )
  await expect(calendar.getByRole('list', { name: 'Typy treści' })).toContainText('Sesje RPG')

  const monthHeading = calendar.getByRole('heading', { level: 3 })
  const initialHeading = await monthHeading.textContent()
  await calendar.getByRole('button', { name: 'Następny miesiąc' }).click()
  await expect(monthHeading).not.toHaveText(initialHeading ?? '')
  await calendar.getByRole('button', { name: new RegExp(`^${eventDay}, .*${eventTitle}`) }).click()
  await expect(calendar.getByRole('link', { name: new RegExp(eventTitle) })).toHaveAttribute(
    'href',
    `/events/${eventSlug}`,
  )
  await expect(calendar).toContainText('Streszczenie wydarzenia kalendarzowego E2E.')
  await expect(calendar.getByRole('link', { name: 'Klub Pod Kolumnami' })).toHaveAttribute(
    'href',
    'https://example.com/klub',
  )
  await expect(calendar.getByRole('link', { name: /Dodaj do kalendarza/ })).toHaveAttribute(
    'href',
    `/events/${eventSlug}/calendar.ics`,
  )
  await calendar.getByRole('button', { name: 'Poprzedni miesiąc' }).click()
  await expect(monthHeading).toHaveText(initialHeading ?? '')

  await page.setViewportSize({ height: 844, width: 390 })
  const calendarGrid = calendar.locator('.calendarGrid')
  await expect(calendarGrid).toBeVisible()
  expect(await calendarGrid.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  )

  const legendBox = await calendar.getByRole('list', { name: 'Typy treści' }).boundingBox()
  const subscriptionBox = await calendar
    .getByRole('link', { name: /Zasubskrybuj kalendarz WKF/ })
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

function normalizeHomepageLayout(layout: HomepageSection['layout']): HomepageSection['layout'] {
  return layout.map((block) => (block.blockType === 'card' ? { ...block, image: null } : block))
}
