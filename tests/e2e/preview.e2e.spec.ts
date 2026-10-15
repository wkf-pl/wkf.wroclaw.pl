import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const draftSlug = 'e2e-draft-preview'
const invalidDraftSlug = 'e2e-invalid-draft-preview'
const navigationTimeout = 20_000
let invalidDraftPageID: number | string
let draftPageID: number | string
let draftPostID: number | string
let payload: Payload

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: { slug: { in: [draftSlug, invalidDraftSlug] } },
  })
  await payload.delete({
    collection: 'posts',
    overrideAccess: true,
    where: { slug: { equals: draftSlug } },
  })

  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { email: { equals: editorTestUser.email } },
  })
  const editor = users.docs[0]

  if (!editor) {
    throw new Error('Missing the E2E editor user required by the preview test.')
  }

  const draftPage = await payload.create({
    collection: 'pages',
    data: {
      author: editor.id,
      layout: [
        {
          blockType: 'heading',
          heading: 'Treść poprawnego szkicu strony',
          headingLevel: 'h2',
        },
      ],
      slug: draftSlug,
      title: 'Szkic widoczny wyłącznie w podglądzie',
    },
    draft: true,
    overrideAccess: true,
  })
  draftPageID = draftPage.id

  const invalidDraftPage = await payload.create({
    collection: 'pages',
    data: {
      author: editor.id,
      layout: [
        {
          blockType: 'listing',
          eventTimeFilter: 'all',
          pageSize: 12,
          pagination: true,
          parentFilter: 'none',
          selectionMode: 'filters',
          sort: 'newest',
          sources: ['pages'],
          view: 'cards',
        },
      ],
      slug: invalidDraftSlug,
      title: 'Szkic z walidacją przed podglądem',
    },
    draft: true,
    overrideAccess: true,
  })
  invalidDraftPageID = invalidDraftPage.id

  const draftPost = await payload.create({
    collection: 'posts',
    data: {
      author: editor.id,
      excerpt: 'Streszczenie testowego szkicu wpisu.',
      layout: [
        {
          blockType: 'heading',
          heading: 'Treść poprawnego szkicu wpisu',
          headingLevel: 'h2',
        },
      ],
      slug: draftSlug,
      title: 'Szkic wpisu widoczny wyłącznie w podglądzie',
    },
    draft: true,
    overrideAccess: true,
  })
  draftPostID = draftPost.id
})

test.afterAll(async () => {
  if (payload) {
    await payload.delete({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { in: [draftSlug, invalidDraftSlug] } },
    })
    await payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { equals: draftSlug } },
    })
  }
})

test('rejects anonymous draft preview access', async ({ request }) => {
  const response = await request.get(`/preview?collection=pages&slug=${draftSlug}`)

  expect(response.status()).toBe(403)
  expect(response.headers()['set-cookie']).toBeUndefined()
})

test('saves a draft before opening it from the admin preview button and can leave preview mode', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${draftPageID}`)

  const previewButton = page.locator('#preview-button')
  const updatedTitle = 'Szkic zapisany automatycznie przed podglądem'

  await expect(previewButton).toHaveText('Podgląd')
  await page.getByRole('textbox', { name: 'Tytuł *' }).fill(updatedTitle)

  const saveDraftResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'PATCH' &&
      response.url().includes(`/api/pages/${draftPageID}`) &&
      response.url().includes('draft=true'),
  )
  const previewPagePromise = page.waitForEvent('popup')
  await previewButton.click()
  const previewPage = await previewPagePromise
  const saveDraftResponse = await saveDraftResponsePromise

  expect(saveDraftResponse.status()).toBe(200)

  await expect(previewPage).toHaveURL(new RegExp(`/${draftSlug}$`), {
    timeout: navigationTimeout,
  })
  await expect(previewPage.getByRole('heading', { name: updatedTitle })).toBeVisible()
  await expect(previewPage.getByRole('status')).toContainText('Wyświetlasz zapisany szkic.')

  await previewPage.getByRole('link', { name: 'Wyłącz podgląd' }).click()
  await expect(previewPage).toHaveURL(new RegExp(`/${draftSlug}$`), {
    timeout: navigationTimeout,
  })
  await expect(previewPage.getByRole('heading', { name: updatedTitle })).toHaveCount(0)

  await page.goto(`/admin/collections/posts/${draftPostID}`)

  await expect(page.locator('#preview-button')).toHaveText('Podgląd')

  const postPreviewPagePromise = page.waitForEvent('popup')
  await page.locator('#preview-button').click()
  const postPreviewPage = await postPreviewPagePromise

  await expect(postPreviewPage).toHaveURL(new RegExp(`/blog/${draftSlug}$`), {
    timeout: navigationTimeout,
  })
  await expect(
    postPreviewPage.getByRole('heading', {
      name: 'Szkic wpisu widoczny wyłącznie w podglądzie',
    }),
  ).toBeVisible()
})

test('validates required manual Listing targets before opening draft preview', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${invalidDraftPageID}`)

  const selectionModeField = page.locator('#field-layout__0__selectionMode')
  await selectionModeField.getByRole('combobox').click()
  await page.locator('.rs__menu').getByText('Ręczny', { exact: true }).click()

  const itemsField = page.locator('#field-layout__0__items')
  await itemsField.getByRole('button', { name: 'Dodaj Treść' }).click()

  const typeLabel = page.locator('label').filter({ hasText: 'Typ treści' })
  const targetLabel = page.locator('label').filter({ hasText: 'Cel' })
  const typeField = typeLabel.locator('xpath=ancestor::div[contains(@class, "field-type")][1]')
  const targetField = targetLabel.locator('xpath=ancestor::div[contains(@class, "field-type")][1]')
  await typeField.locator('.rs__control').click()
  await page.locator('.rs__menu').getByText('Dokument', { exact: true }).click()

  const previewRequests: string[] = []
  page.on('request', (request) => {
    if (
      request.method() === 'PATCH' &&
      request.url().includes(`/api/pages/${invalidDraftPageID}`)
    ) {
      previewRequests.push(request.url())
    }
  })
  const openPageCount = page.context().pages().length

  await page.locator('#preview-button').click()

  await expect(targetField.locator('.field-error')).toBeVisible()
  await expect(page.locator('#preview-button')).toHaveText('Podgląd')
  await expect.poll(() => page.context().pages().length).toBe(openPageCount)
  expect(previewRequests).toEqual([])
})
