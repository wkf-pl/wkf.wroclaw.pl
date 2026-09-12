import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'

import {
  createPublishedDocumentFixture,
  deletePublishedDocumentFixture,
} from '../helpers/documentFixture'
import { editorTestUser } from '../helpers/seedUser'

const fixtureName = 'e2e-document-register'
let payload: Payload
let createdDocumentsPageID: number | undefined

test.beforeAll(async () => {
  payload = await getPayload({ config })
  const document = await createPublishedDocumentFixture(payload, fixtureName)
  const existingPages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { slug: { equals: 'dokumenty' } },
  })

  if (!existingPages.docs[0]) {
    const users = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { email: { equals: editorTestUser.email } },
    })
    const author = users.docs[0]

    if (!author) {
      throw new Error('Missing E2E editor user.')
    }

    const documentsPage = await payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: author.id,
        layout: [
          {
            blockType: 'documents',
            items: [{ document: document.id }],
            pageSize: 12,
            pagination: false,
            selectionMode: 'manual',
            sort: 'newest',
            view: 'cards',
          },
        ],
        slug: 'dokumenty',
        title: 'Dokumenty',
      },
      overrideAccess: true,
    })
    createdDocumentsPageID = documentsPage.id
  }
})

test.afterAll(async () => {
  if (payload) {
    if (createdDocumentsPageID !== undefined) {
      await payload.delete({
        collection: 'pages',
        id: createdDocumentsPageID,
        overrideAccess: true,
      })
    }
    await deletePublishedDocumentFixture(payload, fixtureName)
  }
})

test('renders the public documents register without account actions', async ({ page }) => {
  await page.goto('/dokumenty')
  await expect(page.locator('.cmsPageDocument')).toBeVisible()
  await expect(
    page.getByRole('heading', { exact: true, level: 1, name: 'Dokumenty' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Zaloguj się' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Wyloguj' })).toHaveCount(0)
  const documentLink = page.getByRole('link', {
    exact: true,
    name: `Dokument E2E ${fixtureName}`,
  })
  await expect(documentLink).toHaveAttribute('href', `/dokumenty/${fixtureName}`)

  await documentLink.click()
  await expect(
    page.getByRole('heading', {
      exact: true,
      level: 1,
      name: `Dokument E2E ${fixtureName}`,
    }),
  ).toBeVisible()
  const fileLink = page.getByRole('link', { exact: true, name: `PDF ${fixtureName}` })
  const filePath = await fileLink.getAttribute('href')
  expect(filePath).toMatch(new RegExp(`^/dokumenty/${fixtureName}/plik/\\d+$`))
  if (!filePath) {
    throw new Error('Missing document file path.')
  }
  const fileResponse = await page.request.get(filePath)
  expect(fileResponse.ok()).toBe(true)
  expect(fileResponse.headers()['content-type']).toBe('application/pdf')

  const loginResponse = await page.goto('/login')
  expect(loginResponse?.status()).toBe(404)
})
