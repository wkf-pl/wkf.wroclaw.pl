import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { MemberProfile, Partner, User } from '@/payload-types'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const cycleSlug = 'e2e-event-defaults-cycle'
const cycleTitle = 'E2E domyślny Cykl'
const eventEditorURL = /\/admin\/collections\/events\/\d+$/
const navigationTimeout = 20_000

let payload: Payload
let author: User
let cycleID: number
let organizer: MemberProfile | undefined
let partner: Partner | undefined

function layout() {
  return [
    {
      blockType: 'richText' as const,
      content: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'E2E content',
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
      },
    },
  ]
}

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await payload.delete({
    collection: 'event-cycles',
    overrideAccess: true,
    where: { slug: { equals: cycleSlug } },
  })
  await payload.delete({
    collection: 'events',
    overrideAccess: true,
    where: { title: { equals: 'Domyślny tytuł E2E' } },
  })
  const users = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: editorTestUser.email } },
  })
  if (!users.docs[0]) throw new Error('Missing E2E editor user.')
  author = users.docs[0]
  await payload.delete({
    collection: 'partners',
    overrideAccess: true,
    where: { slug: { equals: 'event-defaults-partner-e2e' } },
  })
  await payload.delete({
    collection: 'member-profiles',
    overrideAccess: true,
    where: { slug: { equals: 'event-defaults-organizer-e2e' } },
  })
  organizer = await payload.create({
    collection: 'member-profiles',
    data: {
      _status: 'published',
      owner: author.id,
      publicName: 'Organizator domyślny E2E',
      slug: 'event-defaults-organizer-e2e',
    },
    overrideAccess: true,
    user: author,
  })
  partner = await payload.create({
    collection: 'partners',
    data: {
      _status: 'published',
      author: author.id,
      excerpt: 'Partner używany w teście domyślnych danych Wydarzenia.',
      layout: layout(),
      name: 'Partner domyślny E2E',
      slug: 'event-defaults-partner-e2e',
    },
    overrideAccess: true,
  })
  const cycle = await payload.create({
    collection: 'event-cycles',
    data: {
      _status: 'published',
      author: author.id,
      eventDefaults: {
        capacityMode: 'unlimited',
        excerpt: 'Domyślne streszczenie E2E',
        layout: layout(),
        location: { country: 'Polska' },
        organizers: [{ profile: organizer.id, role: 'Osoba prowadząca' }],
        partners: [{ partner: partner.id, roles: ['partner'] }],
        participation: 'public',
        tagline: 'Domyślne hasło E2E',
        title: 'Domyślny tytuł E2E',
        visibility: 'public',
        externalLinks: [
          {
            customAddress: 'example.com/wydarzenie',
            customScheme: 'https',
            label: 'Informacje o wydarzeniu',
            targetType: 'custom',
          },
        ],
      },
      excerpt: 'Opis Cyklu E2E',
      layout: layout(),
      slug: cycleSlug,
      title: cycleTitle,
      visibility: 'public',
    },
    overrideAccess: true,
  })
  cycleID = cycle.id
})

test.afterAll(async () => {
  await payload.delete({
    collection: 'events',
    overrideAccess: true,
    where: { title: { equals: 'Domyślny tytuł E2E' } },
  })
  await payload.delete({
    collection: 'event-cycles',
    overrideAccess: true,
    where: { slug: { equals: cycleSlug } },
  })
  if (partner) {
    await payload.delete({ collection: 'partners', id: partner.id, overrideAccess: true })
  }
  if (organizer) {
    await payload.delete({ collection: 'member-profiles', id: organizer.id, overrideAccess: true })
  }
})

test('applies selected Cycle defaults to an Event form without overwriting values', async ({
  page,
}) => {
  test.setTimeout(60_000)
  const pageErrors: Error[] = []
  page.on('pageerror', (error) => pageErrors.push(error))
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/events/create')

  const cycleField = page.locator('#field-cycle')
  await cycleField.getByRole('combobox').click()
  const cycleResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' && response.url().includes('/api/event-cycles/'),
  )
  await page.getByText(cycleTitle, { exact: true }).click()
  const cycleResponse = await cycleResponsePromise
  expect(new URL(cycleResponse.url()).searchParams.get('depth')).toBe('0')
  expect(cycleResponse.ok()).toBe(true)
  const cycleData = (await cycleResponse.json()) as {
    eventDefaults?: { externalLinks?: unknown[]; organizers?: unknown[]; partners?: unknown[] }
  }
  expect(cycleData.eventDefaults?.organizers).toHaveLength(1)
  expect(cycleData.eventDefaults?.partners).toHaveLength(1)
  expect(cycleData.eventDefaults?.externalLinks).toHaveLength(1)

  await expect(page.getByRole('textbox', { name: 'Tytuł *' })).toHaveValue('Domyślny tytuł E2E')
  await expect(page.getByRole('textbox', { name: 'Hasło reklamowe' })).toHaveValue(
    'Domyślne hasło E2E',
  )
  await expect(page.getByRole('textbox', { name: 'Streszczenie *' })).toHaveValue(
    'Domyślne streszczenie E2E',
  )
  await expect(
    page.getByText('Organizator: Organizator domyślny E2E', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Funkcja' })).toHaveValue('Osoba prowadząca')
  await expect(page.getByText('Partner: Partner domyślny E2E', { exact: true })).toBeVisible()
  await expect(page.getByText('Link: Informacje o wydarzeniu', { exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Adres', exact: true })).toHaveValue(
    'example.com/wydarzenie',
  )
  const saveResponse = page.waitForResponse(
    (response) => response.request().method() === 'POST' && response.url().includes('/api/events'),
  )
  await page.getByRole('button', { name: 'Zapisz szkic' }).click()
  expect((await saveResponse).ok()).toBe(true)
  await expect(page).toHaveURL(eventEditorURL, { timeout: navigationTimeout })
  expect(pageErrors).toEqual([])
})

test('creates a Cycle Event draft without asking for a date or generating a slug', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/event-cycles/${cycleID}`)

  const createResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes(`/api/event-cycles/${cycleID}/create-event`),
  )
  await page.getByRole('button', { name: 'Dodaj kolejne Wydarzenie' }).click()
  expect((await createResponse).status()).toBe(201)
  await expect(page).toHaveURL(eventEditorURL, { timeout: navigationTimeout })

  await expect(page.locator('#field-startAt input')).toHaveValue('')
  await expect(page.locator('#field-slug')).toHaveValue('')
  await expect(page.getByRole('button', { name: 'Dodaj następne' })).toBeVisible()

  const eventID = Number(page.url().split('/').at(-1))
  await payload.delete({ collection: 'events', id: eventID, overrideAccess: true })
})
