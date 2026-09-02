import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const fixturePrefix = 'e2e-admin-content-forms'
const parentPageTitle = 'E2E Strona nadrzędna listingu'
const listingPageTitle = 'E2E Strona z listingiem'
const relatedPostTitle = 'E2E Powiązany wpis'
const unclassifiedPostTitle = 'E2E Wpis bez klasyfikacji'

let payload: Payload
let categoryID: number | string
let tagID: number | string
let parentPageID: number | string
let listingPageID: number | string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanupFixtures()

  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: editorTestUser.email } },
  })
  const author = users.docs[0]

  if (!author) {
    throw new Error('Missing the editor E2E user.')
  }

  const category = await payload.create({
    collection: 'categories',
    data: { name: 'E2E Kategoria formularzy', slug: `${fixturePrefix}-category` },
    overrideAccess: true,
  })
  const tag = await payload.create({
    collection: 'tags',
    data: { name: 'E2E Tag formularzy', slug: `${fixturePrefix}-tag` },
    overrideAccess: true,
  })
  categoryID = category.id
  tagID = tag.id

  const parentPage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'draft',
      author: author.id,
      slug: `${fixturePrefix}-parent`,
      title: parentPageTitle,
    },
    draft: true,
    overrideAccess: true,
  })
  parentPageID = parentPage.id
  const listingPage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'draft',
      author: author.id,
      layout: [
        {
          blockType: 'listing',
          eventTimeFilter: 'all',
          pageSize: 12,
          pagination: true,
          parentFilter: 'none',
          sort: 'newest',
          sources: ['pages'],
          view: 'cards',
        },
      ],
      slug: `${fixturePrefix}-listing`,
      title: listingPageTitle,
    },
    draft: true,
    overrideAccess: true,
  })
  listingPageID = listingPage.id

  await payload.create({
    collection: 'posts',
    data: {
      _status: 'draft',
      author: author.id,
      category: category.id,
      excerpt: 'Wpis używany do sprawdzenia kolumn relacji.',
      slug: `${fixturePrefix}-related-post`,
      tags: [tag.id],
      title: relatedPostTitle,
    },
    draft: true,
    overrideAccess: true,
  })
  await payload.create({
    collection: 'posts',
    data: {
      _status: 'draft',
      author: author.id,
      excerpt: 'Wpis używany do sprawdzenia pustych wartości.',
      slug: `${fixturePrefix}-unclassified-post`,
      title: unclassifiedPostTitle,
    },
    draft: true,
    overrideAccess: true,
  })
})

test.afterAll(async () => {
  await cleanupFixtures()
})

test('shows complete search labels and concise missing-value fallbacks', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/posts')

  await expect(page.getByPlaceholder('Szukaj według: Tytuł, Streszczenie lub Slug')).toBeVisible()
  const row = page.getByRole('row').filter({ hasText: unclassifiedPostTitle })
  await expect(row).toBeVisible()
  await expect(row.getByText('<brak>', { exact: true })).toHaveCount(2)
  await expect(row).not.toContainText('<Bez')
})

test('selects and persists a parent page in a Listing block', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${listingPageID}`)

  const parentPageField = page
    .locator('#field-layout')
    .getByText('Strona nadrzędna', { exact: true })
    .locator('xpath=ancestor::div[contains(@class, "field-type")][1]')
  await parentPageField.getByRole('combobox').click()
  await page.getByText(parentPageTitle, { exact: true }).click()
  await expect(parentPageField).toContainText(parentPageTitle)

  const saveResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'PATCH' &&
      response.url().includes(`/api/pages/${listingPageID}`),
  )
  await page.getByRole('button', { name: 'Zapisz szkic' }).click()
  expect((await saveResponse).ok()).toBe(true)

  const savedPage = await payload.findByID({
    collection: 'pages',
    depth: 0,
    draft: true,
    id: listingPageID,
    overrideAccess: true,
  })
  const listing = savedPage.layout?.find((block) => block.blockType === 'listing')
  expect(listing).toMatchObject({ parentFilter: 'specific' })
  expect(String(listing?.parentPage)).toBe(String(parentPageID))
})

test('uses full-width map previews in Events and Cycle defaults', async ({ page }) => {
  await login({ page, user: editorTestUser })
  const mapURL = 'https://www.google.com/maps/embed?pb=e2e'

  await page.goto('/admin/collections/events/create')
  await assertFullWidthMapPreview(page, '#field-location__mapEmbedURL', mapURL)

  await page.goto('/admin/collections/event-cycles/create')
  await page.getByRole('button', { name: 'Domyślne dane Wydarzenia' }).click()
  await assertFullWidthMapPreview(page, '#field-eventDefaults__location__mapEmbedURL', mapURL)
})

test('hides taxonomy columns in Category and Tag related-content lists', async ({ page }) => {
  await login({ page, user: editorTestUser })

  for (const [collection, id] of [
    ['categories', categoryID],
    ['tags', tagID],
  ] as const) {
    await page.goto(`/admin/collections/${collection}/${id}`)
    const relatedPosts = page
      .locator('.wkf-taxonomy-related-content')
      .filter({ has: page.getByRole('heading', { name: 'Powiązane wpisy' }) })
    await expect(relatedPosts.getByText(relatedPostTitle, { exact: true })).toBeVisible()
    const headers = relatedPosts.getByRole('columnheader')
    await expect(headers.filter({ hasText: 'Kategorie' })).toHaveCount(0)
    await expect(headers.filter({ hasText: 'Tagi' })).toHaveCount(0)
  }
})

test('lays out the Document identity fields in one row before its content fields', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/documents/create')

  const topPositions = await Promise.all(
    ['documentType', 'documentNumber', 'documentDate'].map(async (fieldName) =>
      getFieldTop(page, fieldName),
    ),
  )
  expect(Math.max(...topPositions) - Math.min(...topPositions)).toBeLessThan(2)

  const orderedFieldNames = ['title', 'summary', 'content', 'primaryFile', 'attachments']
  const orderedTopPositions = await Promise.all(
    orderedFieldNames.map(async (fieldName) => getFieldTop(page, fieldName)),
  )
  expect(orderedTopPositions).toEqual([...orderedTopPositions].sort((left, right) => left - right))
  expect(orderedTopPositions[0]).toBeGreaterThan(topPositions[0]!)
})

async function getFieldTop(
  page: import('@playwright/test').Page,
  fieldName: string,
): Promise<number> {
  const labels: Record<string, string> = {
    attachments: 'Dodatkowe załączniki PDF',
    content: 'Dodatkowy opis',
    documentDate: 'Data dokumentu',
    documentNumber: 'Numer dokumentu',
    documentType: 'Rodzaj dokumentu',
    primaryFile: 'Główny plik PDF',
    summary: 'Streszczenie',
    title: 'Tytuł',
  }

  return page
    .getByText(new RegExp(`^${labels[fieldName]!}`))
    .first()
    .evaluate((element) => {
      const field = element.closest('.field-type') ?? element
      return field.getBoundingClientRect().top
    })
}

async function assertFullWidthMapPreview(
  page: import('@playwright/test').Page,
  fieldSelector: string,
  mapURL: string,
): Promise<void> {
  await page.locator(fieldSelector).fill(mapURL)
  const frame = page.locator('iframe[title="Podgląd mapy wydarzenia"]').last()
  await expect(frame).toBeVisible()

  const dimensions = await frame.evaluate((element) => {
    const frameBounds = element.getBoundingClientRect()
    const fieldBounds = element.parentElement?.getBoundingClientRect()

    return {
      fieldWidth: fieldBounds?.width ?? 0,
      frameHeight: frameBounds.height,
      frameWidth: frameBounds.width,
    }
  })

  expect(dimensions.frameWidth).toBeGreaterThan(700)
  expect(Math.abs(dimensions.frameWidth - dimensions.fieldWidth)).toBeLessThan(2)
  expect(dimensions.frameWidth / dimensions.frameHeight).toBeCloseTo(16 / 9, 1)
}

async function cleanupFixtures(): Promise<void> {
  if (!payload) return

  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: { slug: { in: [`${fixturePrefix}-parent`, `${fixturePrefix}-listing`] } },
  })
  await payload.delete({
    collection: 'posts',
    overrideAccess: true,
    where: {
      slug: {
        in: [`${fixturePrefix}-related-post`, `${fixturePrefix}-unclassified-post`],
      },
    },
  })
  await payload.delete({
    collection: 'categories',
    overrideAccess: true,
    where: { slug: { equals: `${fixturePrefix}-category` } },
  })
  await payload.delete({
    collection: 'tags',
    overrideAccess: true,
    where: { slug: { equals: `${fixturePrefix}-tag` } },
  })
}
