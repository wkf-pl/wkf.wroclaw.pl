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
  await expect(page.locator('.contentHeroEyebrow')).toHaveText('STATUT')
  const fileLink = page.getByRole('link', {
    exact: true,
    name: `Otwórz główny plik PDF dokumentu: Dokument E2E ${fixtureName}`,
  })
  const downloadLink = page.getByRole('link', {
    exact: true,
    name: `Pobierz główny plik PDF dokumentu: Dokument E2E ${fixtureName}`,
  })
  const filePath = await fileLink.getAttribute('href')
  expect(filePath).toMatch(new RegExp(`^/dokumenty/${fixtureName}/plik/\\d+$`))
  if (!filePath) {
    throw new Error('Missing document file path.')
  }
  const previewFrame = page.locator('.documentPdfPreviewFrame')
  await expect(previewFrame).toHaveAttribute(
    'src',
    `${filePath}#page=1&view=FitH&toolbar=0&navpanes=0`,
  )
  await expect(previewFrame).toHaveCSS('pointer-events', 'auto')
  await expect(fileLink.locator('[data-icon-name="zoom-in"]')).toHaveCSS(
    'mask-image',
    /zoom-in\.png/,
  )
  await expect(downloadLink.locator('[data-icon-name="download"]')).toHaveCSS(
    'mask-image',
    /download\.png/,
  )
  const previewBox = await page.locator('.documentPdfPreview').boundingBox()
  const previewFrameBox = await previewFrame.boundingBox()
  const openLinkBox = await fileLink.boundingBox()
  const footerBox = await page.locator('.siteFooterShell').boundingBox()
  expect(previewBox).not.toBeNull()
  expect(previewFrameBox).not.toBeNull()
  expect(openLinkBox).not.toBeNull()
  expect(footerBox).not.toBeNull()
  expect(previewFrameBox?.width).toBeGreaterThan(previewBox?.width ?? Number.POSITIVE_INFINITY)
  expect(openLinkBox?.width).toBeLessThan(previewBox?.width ?? 0)
  expect(footerBox?.y).toBeGreaterThan((previewBox?.y ?? 0) + (previewBox?.height ?? 0))
  await expect(downloadLink).toHaveAttribute('href', `${filePath}?download=1`)
  const fileResponse = await page.request.get(filePath)
  expect(fileResponse.ok()).toBe(true)
  expect(fileResponse.headers()['content-type']).toBe('application/pdf')
  expect(fileResponse.headers()['content-disposition']).toContain('inline;')
  const downloadResponse = await page.request.get(`${filePath}?download=1`)
  expect(downloadResponse.ok()).toBe(true)
  expect(downloadResponse.headers()['content-type']).toBe('application/pdf')
  expect(downloadResponse.headers()['content-disposition']).toContain('attachment;')

  const loginResponse = await page.goto('/login')
  expect(loginResponse?.status()).toBe(404)
})
