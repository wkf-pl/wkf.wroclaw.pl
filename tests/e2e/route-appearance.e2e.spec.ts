import { expect, test, type Page } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import { createRichTextDocument } from '../../src/modules/members/rich-text'
import type {
  CurrentItemFieldBlock,
  MemberProfile,
  PageTemplate,
  PageTemplateListingBlock,
} from '../../src/payload-types.js'
import { createLexicalDocument } from '../helpers/lexical-document'
import { login } from '../helpers/login'
import { administratorTestUser, editorTestUser } from '../helpers/seedUser'

const fixture = {
  categoryChildSlug: 'route-appearance-category-child-e2e',
  categorySlug: 'route-appearance-category-e2e',
  eventSlug: 'route-appearance-event-e2e',
  memberActivities: 'Prowadzę dyżury informacyjne oraz wspieram wydarzenia otwarte.',
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
      about: createRichTextDocument([
        'Organizuję spotkania dla nowych osób i pomagam im poznać klubowe aktywności.',
        fixture.memberActivities,
      ]),
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
      publishedAt: '2026-11-03T12:00:00.000Z',
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

const templateMarker = 'Układ szablonu E2E'
const currentItemContent = { blockType: 'currentItemContent' } as const
const currentItemCondition = {
  field: 'relatedTo',
  operator: 'contains',
  relatedTargetMode: 'current',
} as const

function listing(
  sources: PageTemplateListingBlock['sources'],
  options: Partial<
    Pick<PageTemplateListingBlock, 'conditions' | 'pageSize' | 'pagination' | 'sort'>
  > = {},
): PageTemplateListingBlock {
  return {
    blockType: 'listing',
    pageSize: 12,
    selectionMode: 'filters',
    sources,
    view: 'cards',
    ...options,
  }
}

function currentItemField(
  field: CurrentItemFieldBlock['field'],
  variant: CurrentItemFieldBlock['variant'],
): CurrentItemFieldBlock {
  return { blockType: 'currentItemField', field, variant }
}

type TemplateRoute = {
  route: (typeof routes)[number]['name']
  key: PageTemplate['templateKey']
  target?: NonNullable<PageTemplate['previewTarget']>['relationTo']
  hero?: PageTemplate['hero']
  informationPanel?: PageTemplate['informationPanel']
  content: NonNullable<PageTemplate['content']>
  expectedLinks?: { name: string; path: () => string }[]
  expectedText?: string[]
}

const taxonomyListing = listing(['pages', 'posts', 'events', 'event-cycles'], {
  conditions: [currentItemCondition],
  pagination: true,
  sort: 'newest',
})
const taggedPostLink = {
  name: 'Jak przygotować się do pierwszej sesji E2E',
  path: () => `/blog/${fixture.postSlug}`,
}

const templateRoutes: TemplateRoute[] = [
  {
    route: 'members',
    key: 'members-index',
    content: [listing(['member-profiles'], { sort: 'titleAscending' })],
    expectedLinks: [{ name: fixture.memberName, path: () => `/members/${memberProfile.slug}` }],
  },
  {
    route: 'member',
    key: 'member-detail',
    target: 'member-profiles',
    hero: [
      currentItemField('publicName', 'primaryHeading'),
      currentItemField('clubFunction', 'lead'),
    ],
    content: [currentItemContent],
    expectedText: [fixture.memberActivities, 'Zgłoś treść'],
  },
  {
    route: 'partner',
    key: 'partner-detail',
    target: 'partners',
    hero: [currentItemField('name', 'primaryHeading'), currentItemField('website', 'inline')],
    content: [
      currentItemContent,
      listing(['events', 'event-cycles'], { conditions: [currentItemCondition] }),
    ],
    expectedLinks: [
      { name: 'Strona WWW Partnera', path: () => 'https://example.com/route-appearance-partner' },
      { name: 'Pierwsza wyprawa E2E', path: () => `/events/${fixture.eventSlug}` },
      { name: 'Wieczory z wyobraźnią E2E', path: () => `/events/series/${fixture.seriesSlug}` },
    ],
    expectedText: ['Partner zapewnia przestrzeń, wyposażenie oraz wsparcie organizacyjne.'],
  },
  {
    route: 'event-series',
    key: 'event-cycle-detail',
    target: 'event-cycles',
    hero: [
      currentItemField('title', 'primaryHeading'),
      {
        alignment: 'start',
        blockType: 'actionLinks',
        layout: 'inline',
        items: [
          {
            actionSource: 'contextAction',
            appearance: 'link',
            contextAction: 'eventCycleCalendar',
            label: 'Subskrybuj cykl',
          },
        ],
      },
    ],
    informationPanel: [
      listing(['events'], {
        conditions: [
          currentItemCondition,
          { eventTimeValue: 'upcoming', field: 'eventTime', operator: 'equals' },
        ],
        pageSize: 1,
        sort: 'oldest',
      }),
      {
        blockType: 'infoGroup',
        sections: [
          {
            blocks: [
              {
                blockType: 'infoColumns',
                columnSeparators: 'none',
                verticalAlignment: 'start',
                columns: [
                  {
                    width: 6,
                    blocks: [listing(['posts'], { conditions: [currentItemCondition] })],
                  },
                  { width: 6, blocks: [currentItemField('excerpt', 'body')] },
                ],
              },
            ],
          },
        ],
      },
      {
        blockType: 'infoGroup',
        emptyChildBehavior: 'hideGroup',
        sections: [
          {
            blocks: [
              {
                blockType: 'infoColumns',
                columnSeparators: 'none',
                verticalAlignment: 'start',
                columns: [
                  {
                    width: 6,
                    blocks: [
                      listing(['posts'], {
                        conditions: [
                          { field: 'title', operator: 'equals', textValue: 'Missing E2E post' },
                        ],
                      }),
                    ],
                  },
                  {
                    width: 6,
                    blocks: [
                      { blockType: 'heading', heading: 'Ukryta grupa E2E', headingLevel: 'h2' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    content: [
      currentItemContent,
      currentItemField('organizers', 'list'),
      { blockType: 'heading', heading: 'Partnerzy', headingLevel: 'h2' },
      {
        blockType: 'listing',
        contextRelation: 'eventPartners',
        pageSize: 12,
        selectionMode: 'contextRelation',
        view: 'compact',
      },
      listing(['events'], { conditions: [currentItemCondition] }),
      listing(['posts'], { conditions: [currentItemCondition] }),
    ],
    expectedLinks: [
      { name: 'Pierwsza wyprawa E2E', path: () => `/events/${fixture.eventSlug}` },
      taggedPostLink,
      { name: 'Informacje o cyklu', path: () => 'https://example.com/route-appearance-series' },
    ],
    expectedText: ['Organizatorzy', 'Partnerzy'],
  },
  {
    route: 'tag',
    key: 'tag-detail',
    target: 'tags',
    hero: [currentItemField('name', 'primaryHeading')],
    content: [taxonomyListing],
    expectedLinks: [taggedPostLink],
  },
  {
    route: 'category',
    key: 'category-detail',
    target: 'categories',
    hero: [currentItemField('name', 'primaryHeading'), currentItemField('hierarchy', 'pills')],
    content: [taxonomyListing, listing(['pages'], { conditions: [currentItemCondition] })],
    expectedLinks: [
      taggedPostLink,
      { name: 'Dla początkujących E2E', path: () => `/category/${fixture.categoryChildSlug}` },
    ],
  },
]

for (const scenario of templateRoutes) {
  test(`renders configurable templates for ${scenario.route}`, async ({ browser, page }) => {
    test.setTimeout(60_000)
    const route = routes.find(({ name }) => name === scenario.route)!
    const pathname = route.path()
    const {
      docs: [original],
    } = await payload.find({
      collection: 'page-templates',
      depth: 0,
      limit: 1,
      where: { templateKey: { equals: scenario.key } },
    })
    if (!original) throw new Error(`Missing the seeded ${scenario.key} template.`)

    const target = scenario.target
    const slug = pathname.split('/').at(-1)
    const previewRecord = target
      ? (
          await payload.find({
            collection: target,
            depth: 0,
            limit: 1,
            where: { slug: { equals: slug } },
          })
        ).docs[0]
      : undefined
    if (target && !previewRecord) throw new Error(`Missing the preview item for ${pathname}.`)

    const composition: Partial<PageTemplate> = {
      content: [
        { blockType: 'heading', heading: templateMarker, headingLevel: 'h2' },
        ...scenario.content,
      ],
      hero: scenario.hero ?? [],
      informationPanel: scenario.informationPanel ?? [],
      previewTarget:
        target && previewRecord ? { relationTo: target, value: previewRecord.id } : null,
    }
    const updateTemplate = (data: Partial<PageTemplate>, draft: boolean) =>
      payload.update({ collection: 'page-templates', data, draft, id: original.id })
    const publicPage = await browser.newPage()
    const expectLegacy = async () => {
      await publicPage.goto(pathname)
      await expect(publicPage.getByRole('heading', { level: 1, name: route.heading })).toBeVisible()
      await expect(publicPage.locator('.pageTemplateDocument')).toHaveCount(0)
    }
    const expectTemplate = async (renderedPage: Page) => {
      const document = renderedPage.locator('.pageTemplateDocument')
      await expect(document.getByRole('heading', { level: 1, name: route.heading })).toBeVisible()
      await expect(document.getByRole('heading', { name: templateMarker })).toBeVisible()
      for (const { name, path } of scenario.expectedLinks ?? []) {
        await expect(document.getByRole('link', { name, exact: true }).first()).toHaveAttribute(
          'href',
          path(),
        )
      }
      for (const text of scenario.expectedText ?? []) {
        await expect(document.getByText(text, { exact: true })).toBeVisible()
      }
      if (scenario.route === 'event-series') {
        const content = document.locator('.pageTemplateContent')
        const partnerListing = content.locator('.listingBlock').filter({
          has: renderedPage.getByRole('link', { name: 'Przystań Wyobraźni E2E', exact: true }),
        })
        await expect(partnerListing.getByText('Udostępnienie sali i wyposażenia')).toBeVisible()
        await expect(
          partnerListing.getByRole('link', { name: 'Przystań Wyobraźni E2E' }),
        ).toHaveAttribute('href', `/partners/${fixture.partnerSlug}`)
        await expect(
          content
            .locator('.listingBlock')
            .getByRole('link', {
              name: taggedPostLink.name,
              exact: true,
            })
            .first(),
        ).toHaveAttribute('href', taggedPostLink.path())
        const panel = document.getByRole('region', { name: 'Panel informacyjny' })
        await expect(panel.getByRole('heading', { name: 'Ukryta grupa E2E' })).toHaveCount(0)
        const upcoming = panel.locator('.listingBlock').first()
        await expect(upcoming.locator('article')).toHaveCount(1)
        await expect(
          upcoming.getByRole('link', { name: 'Pierwsza wyprawa E2E', exact: true }).first(),
        ).toHaveAttribute('href', `/events/${fixture.eventSlug}`)
        await expect(upcoming.locator('time')).toBeVisible()
        await expect(
          panel
            .locator('.columnLayout')
            .getByRole('link', {
              name: taggedPostLink.name,
              exact: true,
            })
            .first(),
        ).toHaveAttribute('href', taggedPostLink.path())
        await expect(document.getByRole('link', { name: 'Subskrybuj cykl' })).toHaveAttribute(
          'href',
          /^\/events\/calendar\.ics\?series=.+/,
        )
      }
      if (target === 'tags' || target === 'categories') {
        await expect(
          document
            .locator('.listingBlock article')
            .filter({ has: renderedPage.locator('a[href^="/blog/"]') }),
        ).toHaveCount(1)
      }
    }

    try {
      await expectLegacy()
      await updateTemplate({ ...composition, _status: 'draft', renderingMode: 'legacy' }, true)
      await login({ page, user: administratorTestUser })
      if (scenario.route === 'event-series') {
        await page.goto(`/admin/collections/page-templates/${original.id}`)
        await expect(
          page.getByRole('heading', { level: 1, name: 'Szczegóły cyklu wydarzeń' }),
        ).toBeVisible()
        await page.getByRole('button', { name: 'Treść', exact: true }).click()
        await expect(
          page.locator('#field-content').getByText('Partnerzy bieżącego cyklu', { exact: true }),
        ).toBeVisible()
        await page.getByRole('button', { name: 'Panel informacyjny', exact: true }).click()
        await page.locator('#field-informationPanel > .blocks-field__drawer-toggler').click()
        const drawer = page.locator('.drawer--is-open .blocks-drawer__block-groups')
        for (const label of ['Listing', 'Karta', 'Kalendarz', 'Zakładki']) {
          await expect(drawer.getByText(label, { exact: true })).toBeVisible()
        }
      }
      const response = await page.goto(`/preview?pageTemplate=${scenario.key}`)
      expect(response?.status()).toBe(200)
      expect(new URL(page.url()).pathname).toBe(pathname)
      await expect(page.getByRole('status')).toContainText('Podglądasz roboczy układ szablonu.')
      await expectTemplate(page)
      await expectLegacy()

      await updateTemplate(
        { ...composition, _status: 'published', renderingMode: 'template' },
        false,
      )
      await publicPage.goto(pathname)
      await expectTemplate(publicPage)

      await updateTemplate({ _status: 'published', renderingMode: 'legacy' }, false)
      await expectLegacy()
    } finally {
      await updateTemplate(original, false)
      await publicPage.close()
    }
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
