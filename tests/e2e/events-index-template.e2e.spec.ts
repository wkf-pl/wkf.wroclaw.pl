import { expect, test, type Locator, type Page } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import { getWarsawDaysAgoStartISOString } from '@/modules/content/listing-conditions'
import type { Event, PageTemplate } from '@/payload-types'
import config from '@/payload.config'

import { createLexicalDocument } from '../helpers/lexical-document'
import { login } from '../helpers/login'
import { administratorTestUser, editorTestUser } from '../helpers/seedUser'

const templateHeading = 'Wydarzenia — szablon E2E'
const calendarLabel = 'Subskrybuj kalendarz WKF'
const fixturePrefix = 'events-index-e2e-'

const composition = {
  hero: [{ blockType: 'heading', heading: templateHeading, headingLevel: 'h2' }],
  heroImage: null,
  informationPanel: [
    {
      alignment: 'start',
      blockType: 'actionLinks',
      items: [
        {
          actionSource: 'standard',
          appearance: 'link',
          customAddress: 'events/calendar.ics',
          customScheme: 'path',
          label: calendarLabel,
          targetType: 'custom',
        },
      ],
      layout: 'inline',
    },
  ],
  content: [
    { blockType: 'heading', heading: 'Trwające i nadchodzące', headingLevel: 'h2' },
    {
      blockType: 'listing',
      conditions: [{ eventTimeValue: 'upcoming', field: 'eventTime', operator: 'equals' }],
      pageSize: 100,
      pagination: false,
      selectionMode: 'filters',
      sort: 'oldest',
      sources: ['events'],
      view: 'cards',
    },
    { blockType: 'heading', heading: 'Archiwum', headingLevel: 'h2' },
    {
      blockType: 'listing',
      conditions: [{ eventTimeValue: 'past', field: 'eventTime', operator: 'equals' }],
      pageSize: 12,
      pagination: true,
      selectionMode: 'filters',
      sort: 'newest',
      sources: ['events'],
      view: 'compact',
    },
  ],
} satisfies Partial<PageTemplate>

test('previews, publishes and reverts the events index template with legacy listing parity', async ({
  browser,
  page,
}) => {
  test.setTimeout(120_000)
  const payload = await getPayload({ config })
  const {
    docs: [originalTemplate],
  } = await payload.find({
    collection: 'page-templates',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { templateKey: { equals: 'events-index' } },
  })
  if (!originalTemplate) throw new Error('Missing the seeded events index template.')

  const publicPage = await browser.newPage()
  const eventIDs: number[] = []
  const updateTemplate = (data: Partial<PageTemplate>, draft: boolean) =>
    payload.update({
      collection: 'page-templates',
      data,
      draft,
      id: originalTemplate.id,
      overrideAccess: true,
    })
  try {
    await createEventFixtures(payload, eventIDs)
    const anonymousPreview = await publicPage.request.get('/preview?pageTemplate=events-index')
    expect(anonymousPreview.status()).toBe(403)

    await publicPage.goto('/events?pageTemplatePreview=events-index')
    const legacySections = publicPage.locator('.eventsIndex > section')
    await expect(legacySections).toHaveCount(2)
    const legacyUpcoming = await eventLinks(legacySections.nth(0))
    const legacyArchive = await eventLinks(legacySections.nth(1))
    expect(legacyUpcoming).toEqual(
      expect.arrayContaining([
        fixturePath('ongoing'),
        fixturePath('today'),
        fixturePath('rescheduled'),
      ]),
    )
    expect(legacyUpcoming).not.toContain(fixturePath('cancelled-future'))
    expect(legacyArchive).toEqual(
      expect.arrayContaining([fixturePath('cancelled-past'), fixturePath('ended-today')]),
    )
    expect(legacyArchive).not.toContain(fixturePath('today'))
    expect(legacyArchive).not.toContain(fixturePath('rescheduled'))

    await publicPage.goto('/events?page=2')
    const legacyArchivePageTwo = await eventLinks(legacySections.nth(1))
    expect(legacyArchivePageTwo.length).toBeGreaterThan(0)
    expect(legacyArchivePageTwo).not.toEqual(legacyArchive)

    await updateTemplate({ ...composition, _status: 'draft', renderingMode: 'legacy' }, true)
    await login({ page, user: administratorTestUser })
    await page.goto(`/admin/collections/page-templates/${originalTemplate.id}`)
    await expect(page.getByText('Element używany w podglądzie', { exact: true })).toHaveCount(0)
    const popup = page.waitForEvent('popup')
    await page.locator('#preview-button').click()
    const previewPage = await popup
    await expect(previewPage).toHaveURL(/\/events\?pageTemplatePreview=events-index$/)
    await expect(
      previewPage.getByRole('heading', { level: 1, name: templateHeading }),
    ).toBeVisible()
    await expect(previewPage.getByRole('status')).toContainText(
      'Podglądasz roboczy układ szablonu.',
    )
    await expect(previewPage.locator('.contentHero')).toHaveClass(/contentHero--withoutImage/)
    await expect(
      previewPage
        .getByRole('region', { name: 'Panel informacyjny' })
        .getByRole('link', { name: calendarLabel }),
    ).toHaveAttribute('href', '/events/calendar.ics')

    const previewListings = previewPage.locator('.listingBlock')
    await expect(previewListings).toHaveCount(2)
    expect(await eventLinks(previewListings.nth(0))).toEqual(legacyUpcoming)
    expect(await eventLinks(previewListings.nth(1))).toEqual(legacyArchive)
    await previewListings.nth(1).getByRole('link', { name: 'Następna' }).click()
    await expect(previewPage).toHaveURL(/pageTemplatePreview=events-index.*listing_[^=]+=2/)
    expect(await eventLinks(previewListings.nth(0))).toEqual(legacyUpcoming)
    expect(await eventLinks(previewListings.nth(1))).toEqual(legacyArchivePageTwo)

    await publicPage.goto('/events?pageTemplatePreview=events-index')
    await expect(legacySections).toHaveCount(2)
    await expect(publicPage.getByRole('heading', { name: templateHeading })).toHaveCount(0)
    await previewPage.getByRole('link', { name: 'Wyłącz podgląd' }).click()
    await expect(previewPage.locator('.eventsIndex > section')).toHaveCount(2)

    await updateTemplate({ ...composition, _status: 'published', renderingMode: 'template' }, false)
    await publicPage.goto('/events?page=2')
    await expect(publicPage).toHaveURL(/\/events\?listing_[^=]+=2$/)
    await expect(publicPage.getByRole('heading', { level: 1, name: templateHeading })).toBeVisible()
    const publishedListings = publicPage.locator('.listingBlock')
    expect(await eventLinks(publishedListings.nth(0))).toEqual(legacyUpcoming)
    expect(await eventLinks(publishedListings.nth(1))).toEqual(legacyArchivePageTwo)

    await expectSystemPagePreview(page, payload)

    await updateTemplate({ _status: 'published', renderingMode: 'legacy' }, false)
    await publicPage.goto('/events?page=2')
    await expect(publicPage).toHaveURL(/\/events\?page=2$/)
    await expect(legacySections).toHaveCount(2)
    expect(await eventLinks(legacySections.nth(1))).toEqual(legacyArchivePageTwo)
  } finally {
    await publicPage.close()
    await updateTemplate(originalTemplate, false)
    for (const id of eventIDs) {
      await payload.delete({ collection: 'events', id, overrideAccess: true })
    }
  }
})

async function expectSystemPagePreview(page: Page, payload: Payload): Promise<void> {
  const title = 'Robocze wprowadzenie do wydarzeń E2E'
  const [pages, users] = await Promise.all([
    payload.find({
      collection: 'pages',
      depth: 0,
      limit: 1,
      where: { slug: { equals: 'events' } },
    }),
    payload.find({
      collection: 'users',
      limit: 1,
      where: { email: { equals: editorTestUser.email } },
    }),
  ])
  const [originalPage] = pages.docs
  const [author] = users.docs
  if (!author) throw new Error('Missing the editor for the system page preview.')

  const data = { _status: 'draft' as const, title }
  const draft = originalPage
    ? await payload.update({ collection: 'pages', data, draft: true, id: originalPage.id })
    : await payload.create({
        collection: 'pages',
        context: { allowSystemPageMutation: true },
        data: {
          ...data,
          author: author.id,
          layout: [{ blockType: 'richText', content: createLexicalDocument(title) }],
          slug: 'events',
          systemKey: 'events',
        },
        draft: true,
      })

  try {
    await login({ page, user: editorTestUser })
    await page.goto('/preview?collection=pages&slug=events')
    await expect(page).toHaveURL(/\/events$/)
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible()
    await expect(page.getByRole('status')).toContainText('Wyświetlasz zapisany szkic.')
    await expect(page.locator('.eventsIndex > section')).toHaveCount(2)
    await page.getByRole('link', { name: 'Wyłącz podgląd' }).click()
    await expect(page.getByRole('heading', { level: 1, name: templateHeading })).toBeVisible()
  } finally {
    if (originalPage) {
      await payload.update({ collection: 'pages', data: originalPage, draft: false, id: draft.id })
    } else {
      await payload.delete({ collection: 'pages', id: draft.id })
    }
  }
}

async function createEventFixtures(payload: Payload, eventIDs: number[]): Promise<void> {
  const [users, eventTypes] = await Promise.all([
    payload.find({
      collection: 'users',
      limit: 1,
      where: { email: { equals: administratorTestUser.email } },
    }),
    payload.find({ collection: 'event-types', limit: 1 }),
  ])
  const [author] = users.docs
  const [eventType] = eventTypes.docs
  if (!author || !eventType) throw new Error('Missing events index fixtures.')

  const now = Date.now()
  const today = Date.parse(getWarsawDaysAgoStartISOString(0, new Date(now)))
  const day = 86_400_000
  const fixtures: {
    key: string
    startAt: number
    endAt?: number
    status: Event['eventStatus']
  }[] = [
    { key: 'ongoing', startAt: today - day, endAt: now + day, status: 'scheduled' },
    { key: 'today', startAt: now - Math.floor((now - today) / 4), status: 'scheduled' },
    { key: 'ended-today', startAt: today - day, endAt: now - 60_000, status: 'scheduled' },
    { key: 'rescheduled', startAt: now + day, status: 'rescheduled' },
    { key: 'cancelled-future', startAt: now + 2 * day, status: 'cancelled' },
    { key: 'cancelled-past', startAt: today - day, status: 'cancelled' },
    ...Array.from({ length: 12 }, (_, index) => ({
      key: `archive-${index}`,
      startAt: today - (index + 2) * day,
      status: 'scheduled' as const,
    })),
  ]
  for (const { key, startAt, endAt, status } of fixtures) {
    const event = await payload.create({
      collection: 'events',
      data: {
        _status: 'published',
        author: author.id,
        calendarRevision: 0,
        capacityMode: 'unlimited',
        endAt: endAt === undefined ? undefined : new Date(endAt).toISOString(),
        eventStatus: status,
        eventType: eventType.id,
        excerpt: createLexicalDocument('Wydarzenie używane do porównania listingów.'),
        layout: [{ blockType: 'richText', content: createLexicalDocument('Treść wydarzenia.') }],
        location: { country: 'Polska' },
        participation: 'public',
        slug: `${fixturePrefix}${key}`,
        startAt: new Date(startAt).toISOString(),
        timeMode: 'timed',
        title: `Wydarzenie testowe ${key}`,
      },
      draft: false,
      overrideAccess: true,
    })
    eventIDs.push(event.id)
  }
}

function fixturePath(key: string): string {
  return `/events/${fixturePrefix}${key}`
}

async function eventLinks(listing: Locator): Promise<string[]> {
  await expect(listing).toBeVisible()
  return listing
    .locator('a[href^="/events/"]')
    .evaluateAll((links) =>
      [...new Set(links.map((link) => link.getAttribute('href') ?? ''))].filter((path) =>
        /^\/events\/[a-z0-9-]+$/.test(path),
      ),
    )
}
