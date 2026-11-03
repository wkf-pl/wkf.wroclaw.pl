import { expect, test, type Page } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import type { MemberProfile } from '../../src/payload-types.js'
import { createLexicalDocument } from '../helpers/lexical-document'
import { editorTestUser } from '../helpers/seedUser'

const fixture = {
  categoryChildSlug: 'route-appearance-category-child-e2e',
  categorySlug: 'route-appearance-category-e2e',
  eventSlug: 'route-appearance-event-e2e',
  memberEmail: 'route-appearance-member-e2e@example.invalid',
  memberName: 'Alicja Makietowa E2E',
  partnerSlug: 'route-appearance-partner-e2e',
  postSlug: 'route-appearance-post-e2e',
  seriesSlug: 'route-appearance-series-e2e',
  tagSlug: 'route-appearance-tag-e2e',
} as const

let memberProfile: MemberProfile
let payload: Payload

test.describe.configure({ mode: 'serial' })
test.use({
  colorScheme: 'light',
  viewport: { height: 1_000, width: 1_440 },
})

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanupFixtures()

  const [users, eventTypes, mediaItems, memberRoles] = await Promise.all([
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
      sort: 'id',
    }),
    payload.find({
      collection: 'media',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: {
        alt: { equals: 'Klubowicze podczas wspólnej sesji gry fabularnej' },
      },
    }),
    payload.find({
      collection: 'roles',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { key: { equals: 'member' } },
    }),
  ])
  const author = users.docs[0]
  const eventType = eventTypes.docs[0]
  const heroImage = mediaItems.docs[0]
  const memberRole = memberRoles.docs[0]
  if (!author) throw new Error('Missing the editor E2E user.')
  if (!eventType) throw new Error('Missing an Event Type fixture.')
  if (!heroImage) throw new Error('Missing the seeded route appearance image.')
  if (!memberRole) throw new Error('Missing the Member role fixture.')

  const member = await payload.create({
    collection: 'users',
    data: {
      displayName: fixture.memberName,
      email: fixture.memberEmail,
      password: 'test',
      roles: [memberRole.id],
    },
    overrideAccess: true,
  })
  memberProfile = await payload.create({
    collection: 'member-profiles',
    data: {
      _status: 'published',
      about: createLexicalDocument(
        'Organizuję spotkania dla nowych osób i pomagam im poznać klubowe aktywności.',
      ),
      clubActivities: createLexicalDocument(
        'Prowadzę dyżury informacyjne oraz wspieram wydarzenia otwarte.',
      ),
      clubFunction: 'Opiekunka nowych klubowiczów',
      contactChannels: [
        { type: 'email', url: fixture.memberEmail },
        { type: 'website', url: 'https://example.com/route-appearance-member' },
      ],
      contactTopics: 'Pierwsza wizyta w klubie i wydarzenia dla nowych osób.',
      games: [
        { plays: true, runs: false, title: 'Tajerie' },
        { plays: true, runs: true, title: 'Wędrowcy Północy' },
      ],
      interests: 'Gry fabularne, fantastyka naukowa i integracja nowych osób.',
      owner: member.id,
      publicName: fixture.memberName,
      slug: 'generated-by-hook',
    },
    draft: false,
    overrideAccess: true,
    user: member,
  })

  const partner = await payload.create({
    collection: 'partners',
    data: {
      _status: 'published',
      author: author.id,
      excerpt: 'Partner wspierający spotkania i wydarzenia Wrocławskiego Klubu Fantastyki.',
      heroImage: heroImage.id,
      layout: [
        {
          blockType: 'richText',
          content: createLexicalDocument(
            'Partner zapewnia przestrzeń, wyposażenie oraz wsparcie organizacyjne.',
          ),
        },
      ],
      name: 'Przystań Wyobraźni E2E',
      slug: fixture.partnerSlug,
      website: 'https://example.com/route-appearance-partner',
    },
    draft: false,
    overrideAccess: true,
  })

  const series = await payload.create({
    collection: 'event-cycles',
    data: {
      _status: 'published',
      author: author.id,
      eventDefaults: {
        capacity: 12,
        capacityMode: 'exact',
        eventType: eventType.id,
        excerpt: createLexicalDocument('Regularne spotkania z grami fabularnymi.'),
        externalLinks: [
          {
            customAddress: 'example.com/route-appearance-series',
            customScheme: 'https',
            label: 'Informacje o cyklu',
            targetType: 'custom',
          },
        ],
        layout: [
          {
            blockType: 'richText',
            content: createLexicalDocument('Domyślna treść wydarzeń z tego cyklu.'),
          },
        ],
        location: {
          city: 'Wrocław',
          country: 'Polska',
          postalCode: '50-001',
          streetAddress: 'ul. Wyobraźni 12',
          venueName: 'Przystań Wyobraźni',
        },
        organizers: [
          {
            contactFor: 'Zapisy i zasady udziału',
            profile: memberProfile.id,
            responsibilities: 'Prowadzenie spotkań',
            role: 'Koordynatorka cyklu',
            showContactChannels: true,
          },
        ],
        partners: [
          {
            contribution: 'Udostępnienie sali i wyposażenia',
            partner: partner.id,
            roles: ['venueHost', 'partner'],
          },
        ],
        participation: 'public',
        title: 'Wieczory z wyobraźnią',
      },
      excerpt: createLexicalDocument(
        'Comiesięczny cykl spotkań dla osób rozpoczynających przygodę z RPG.',
      ),
      heroImage: heroImage.id,
      layout: [
        {
          blockType: 'richText',
          content: createLexicalDocument(
            'Każde spotkanie przedstawia inny system i pozwala dołączyć bez przygotowania.',
          ),
        },
      ],
      slug: fixture.seriesSlug,
      title: 'Wieczory z wyobraźnią E2E',
    },
    draft: false,
    overrideAccess: true,
  })

  const event = await payload.create({
    collection: 'events',
    data: {
      _status: 'published',
      author: author.id,
      calendarRevision: 0,
      capacity: 12,
      capacityMode: 'exact',
      cycle: series.id,
      endAt: '2040-02-18T20:00:00.000Z',
      eventStatus: 'scheduled',
      eventType: eventType.id,
      excerpt: createLexicalDocument(
        'Otwarte spotkanie z grą fabularną dla nowych i doświadczonych osób.',
      ),
      externalLinks: [
        {
          customAddress: 'example.com/route-appearance-event',
          customScheme: 'https',
          label: 'Regulamin wydarzenia',
          targetType: 'custom',
        },
      ],
      heroImage: heroImage.id,
      layout: [
        {
          blockType: 'richText',
          content: createLexicalDocument(
            'Na miejscu wyjaśnimy zasady, przygotujemy postacie i rozegramy pełną przygodę.',
          ),
        },
      ],
      location: {
        city: 'Wrocław',
        country: 'Polska',
        postalCode: '50-001',
        streetAddress: 'ul. Wyobraźni 12',
        venueName: 'Przystań Wyobraźni',
      },
      organizers: [
        {
          contactFor: 'Udział w wydarzeniu',
          profile: memberProfile.id,
          responsibilities: 'Przygotowanie i prowadzenie sesji',
          role: 'Osoba prowadząca',
          showContactChannels: true,
        },
      ],
      participation: 'public',
      partners: [
        {
          contribution: 'Sala oraz materiały do gry',
          partner: partner.id,
          roles: ['venueHost'],
        },
      ],
      slug: fixture.eventSlug,
      startAt: '2040-02-18T17:00:00.000Z',
      timeMode: 'timed',
      title: 'Pierwsza wyprawa E2E',
    },
    draft: false,
    overrideAccess: true,
  })

  const parentCategory = await payload.create({
    collection: 'categories',
    data: {
      description: 'Treści poświęcone klubowym grom fabularnym.',
      name: 'Gry fabularne E2E',
      slug: fixture.categorySlug,
    },
    overrideAccess: true,
  })
  const childCategory = await payload.create({
    collection: 'categories',
    data: {
      description: 'Materiały dla osób rozpoczynających przygodę z RPG.',
      name: 'Dla początkujących E2E',
      parent: parentCategory.id,
      slug: fixture.categoryChildSlug,
    },
    overrideAccess: true,
  })
  const tag = await payload.create({
    collection: 'tags',
    data: {
      description: 'Treści związane z otwartymi spotkaniami klubowymi.',
      name: 'Otwarte spotkania E2E',
      slug: fixture.tagSlug,
    },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'posts',
    data: {
      _status: 'published',
      author: author.id,
      category: childCategory.id,
      excerpt: 'Przewodnik po pierwszym spotkaniu i przygotowaniu do klubowej sesji RPG.',
      heroImage: heroImage.id,
      layout: [
        {
          blockType: 'richText',
          content: createLexicalDocument(
            'Zabierz ciekawość i dobry humor. Wszystkie pozostałe materiały będą na miejscu.',
          ),
        },
      ],
      publishedAt: '2039-12-01T12:00:00.000Z',
      relatedContent: [
        { relationTo: 'events', value: event.id },
        { relationTo: 'event-cycles', value: series.id },
      ],
      slug: fixture.postSlug,
      tags: [tag.id],
      title: 'Jak przygotować się do pierwszej sesji E2E',
    },
    draft: false,
    overrideAccess: true,
  })
})

test.afterAll(async () => cleanupFixtures())

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'wkf-privacy-consent',
      JSON.stringify({
        decidedAt: '2026-01-01T00:00:00.000Z',
        expiresAt: '2041-01-01T00:00:00.000Z',
        functional: false,
        version: 1,
      }),
    )
  })
})

const routes = [
  { heading: 'Blog', headingLevel: 1, name: 'blog', path: () => '/blog' },
  {
    heading: 'Trwające i nadchodzące',
    headingLevel: 2,
    name: 'events',
    path: () => '/events',
  },
  { heading: 'Klubowicze', headingLevel: 1, name: 'members', path: () => '/members' },
  {
    heading: '#Otwarte spotkania E2E',
    headingLevel: 1,
    name: 'tag',
    path: () => `/tag/${fixture.tagSlug}`,
  },
  {
    heading: 'Gry fabularne E2E',
    headingLevel: 1,
    name: 'category',
    path: () => `/category/${fixture.categorySlug}`,
  },
  {
    heading: 'Pierwsza wyprawa E2E',
    headingLevel: 1,
    name: 'event',
    path: () => `/events/${fixture.eventSlug}`,
  },
  {
    heading: 'Wieczory z wyobraźnią E2E',
    headingLevel: 1,
    name: 'event-series',
    path: () => `/events/series/${fixture.seriesSlug}`,
  },
  {
    heading: 'Przystań Wyobraźni E2E',
    headingLevel: 1,
    name: 'partner',
    path: () => `/partners/${fixture.partnerSlug}`,
  },
  {
    heading: fixture.memberName,
    headingLevel: 1,
    name: 'member',
    path: () => `/members/${memberProfile.slug}`,
  },
] as const

for (const route of routes) {
  test(`preserves the legacy appearance of ${route.name}`, async ({ page }) => {
    const pageErrors: Error[] = []
    page.on('pageerror', (error) => pageErrors.push(error))

    const response = await page.goto(route.path())
    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole('heading', { level: route.headingLevel, name: route.heading }),
    ).toBeVisible()
    await prepareRouteScreenshot(page)

    await expect(page.locator('body')).toHaveScreenshot(`${route.name}-desktop.png`, {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    })

    await page.setViewportSize({ height: 844, width: 390 })
    await expect(page.locator('body')).toHaveScreenshot(`${route.name}-mobile.png`, {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
    })
    expect(pageErrors).toEqual([])
  })
}

async function prepareRouteScreenshot(page: Page): Promise<void> {
  await page.addStyleTag({
    content: '.siteHeaderShell, .siteFooterShell { display: none !important; }',
  })
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      [...document.images].map(
        (image) =>
          image.complete ||
          new Promise<void>((resolve) => {
            image.addEventListener('error', () => resolve(), { once: true })
            image.addEventListener('load', () => resolve(), { once: true })
          }),
      ),
    )
  })
}

async function cleanupFixtures(): Promise<void> {
  if (!payload) return

  await payload.delete({
    collection: 'posts',
    overrideAccess: true,
    where: { slug: { equals: fixture.postSlug } },
  })
  await payload.delete({
    collection: 'events',
    overrideAccess: true,
    where: { slug: { equals: fixture.eventSlug } },
  })
  await payload.delete({
    collection: 'event-cycles',
    overrideAccess: true,
    where: { slug: { equals: fixture.seriesSlug } },
  })
  await payload.delete({
    collection: 'partners',
    overrideAccess: true,
    where: { slug: { equals: fixture.partnerSlug } },
  })
  await payload.delete({
    collection: 'member-profiles',
    overrideAccess: true,
    where: { publicName: { equals: fixture.memberName } },
  })
  await payload.delete({
    collection: 'users',
    overrideAccess: true,
    where: { email: { equals: fixture.memberEmail } },
  })
  await payload.delete({
    collection: 'categories',
    overrideAccess: true,
    where: { slug: { equals: fixture.categoryChildSlug } },
  })
  await payload.delete({
    collection: 'categories',
    overrideAccess: true,
    where: { slug: { equals: fixture.categorySlug } },
  })
  await payload.delete({
    collection: 'tags',
    overrideAccess: true,
    where: { slug: { equals: fixture.tagSlug } },
  })
}
