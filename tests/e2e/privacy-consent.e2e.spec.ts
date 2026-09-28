import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const eventSlug = 'privacy-consent-e2e'
let payload: Payload

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanupFixture()

  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: editorTestUser.email } },
  })
  const author = users.docs[0]
  if (!author) throw new Error('Missing the editor E2E user.')

  await payload.create({
    collection: 'events',
    data: {
      _status: 'published',
      author: author.id,
      calendarRevision: 0,
      capacityMode: 'unlimited',
      eventStatus: 'scheduled',
      eventType: 1,
      excerpt: createLexicalDocument('Wydarzenie do testowania ustawień prywatności.'),
      location: {
        city: 'Wrocław',
        country: 'Polska',
        postalCode: '54-530',
        streetAddress: 'ul. Rodła 32',
        venueName: 'Wrocławski Klub Fantastyki',
      },
      participation: 'public',
      layout: [
        {
          blockType: 'richText',
          content: createLexicalDocument('Treść wydarzenia do testowania ustawień prywatności.'),
        },
      ],
      slug: eventSlug,
      startAt: '2026-12-12T17:00:00.000Z',
      timeMode: 'timed',
      title: 'Prywatność E2E',
    },
    draft: false,
    overrideAccess: true,
  })
})

test.afterAll(async () => cleanupFixture())

test('asks again after the saved decision expires', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'wkf-privacy-consent',
      JSON.stringify({
        decidedAt: '2025-01-01T00:00:00.000Z',
        expiresAt: '2025-07-01T00:00:00.000Z',
        functional: true,
        version: 1,
      }),
    )
  })

  await page.goto(`/events/${eventSlug}`)

  await expect(page.getByRole('heading', { name: 'Szanujemy Twoją prywatność' })).toBeVisible()
})

test('audits browser storage on the public site and after CMS login', async ({ context, page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Odrzucam opcjonalne' }).click()

  const publicState = await readBrowserState(page)
  expect(publicState).toEqual({
    localStorage: ['wkf-privacy-consent'],
    sessionStorage: [],
  })
  await expectCookieNames(context, [])

  await login({ page, user: editorTestUser })
  const cmsState = await readBrowserState(page)
  expect(cmsState).toEqual({
    localStorage: ['wkf-privacy-consent'],
    sessionStorage: [],
  })
  await expectCookieNames(context, ['payload-token'])
})

async function cleanupFixture(): Promise<void> {
  if (!payload) return
  await payload.delete({
    collection: 'events',
    overrideAccess: true,
    where: { slug: { equals: eventSlug } },
  })
}

function createLexicalDocument(text: string) {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text,
              type: 'text',
              version: 1,
            },
          ],
          direction: null,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          textStyle: '',
          type: 'paragraph' as const,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root' as const,
      version: 1,
    },
  }
}

async function readBrowserState(page: import('@playwright/test').Page) {
  return page.evaluate(() => ({
    localStorage: Object.keys(window.localStorage).sort(),
    sessionStorage: Object.keys(window.sessionStorage).sort(),
  }))
}

async function expectCookieNames(
  context: import('@playwright/test').BrowserContext,
  expectedNames: string[],
): Promise<void> {
  const cookies = await context.cookies()
  expect(cookies.map(({ name }) => name).sort()).toEqual(expectedNames)
}
