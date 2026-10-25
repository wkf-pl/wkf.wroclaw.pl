import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Document, UrlAlias } from '@/payload-types'
import { getStorageContainerClient } from '@/storage/get-storage-container-client'

import {
  createPublishedDocumentFixture,
  deletePublishedDocumentFixture,
} from '../helpers/documentFixture'
import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const fixtureName = 'e2e-document-register'
const aliasSlug = 'e2e-document-alias'
let payload: Payload
let documentFixture: Document
let aliasFixture: UrlAlias
let createdDocumentsPageID: number | undefined

test.beforeAll(async () => {
  payload = await getPayload({ config })
  documentFixture = await createPublishedDocumentFixture(payload, fixtureName)
  await payload.delete({
    collection: 'url-aliases',
    overrideAccess: true,
    where: { slug: { equals: aliasSlug } },
  })
  aliasFixture = await payload.create({
    collection: 'url-aliases',
    data: {
      documentDestination: 'primaryFile',
      slug: aliasSlug,
      target: { relationTo: 'documents', value: documentFixture.id },
    },
    overrideAccess: true,
  })
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
            blockType: 'listing',
            items: [{ item: { relationTo: 'documents', value: documentFixture.id } }],
            pageSize: 12,
            pagination: false,
            parentFilter: 'none',
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
    await payload.delete({
      collection: 'url-aliases',
      overrideAccess: true,
      where: { slug: { equals: aliasSlug } },
    })
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

test('shows separate URL alias type and target controls in one row', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/url-aliases/${aliasFixture.id}`)

  const targetRow = page.locator('.wkf-url-alias-target')
  const typeField = targetRow.locator('.field-type.select')
  const targetField = targetRow.locator('.field-type.relationship')
  const documentDestinationField = page.locator('#field-documentDestination')
  await expect(typeField).toContainText('Typ')
  await expect(targetField).toContainText('Cel')
  await expect(documentDestinationField).toContainText('Cel dokumentu')
  await expect(typeField).toContainText('Dokument')
  await expect(targetField).toContainText(`Dokument E2E ${fixtureName}`)

  const typeBox = await typeField.boundingBox()
  const targetBox = await targetField.boundingBox()
  const documentDestinationBox = await documentDestinationField.boundingBox()
  expect(typeBox).not.toBeNull()
  expect(targetBox).not.toBeNull()
  expect(documentDestinationBox).not.toBeNull()
  expect(Math.abs((typeBox?.y ?? 0) - (targetBox?.y ?? 0))).toBeLessThan(5)
  expect(Math.abs((typeBox?.y ?? 0) - (documentDestinationBox?.y ?? 0))).toBeLessThan(5)
  expect(Math.abs((typeBox?.width ?? 0) - (targetBox?.width ?? 0))).toBeLessThan(5)
  expect(Math.abs((typeBox?.width ?? 0) - (documentDestinationBox?.width ?? 0))).toBeLessThan(5)

  await typeField.locator('.rs__control').click()
  await page.locator('.rs__menu').getByText('Wpis', { exact: true }).click()
  await expect(targetField).not.toContainText(`Dokument E2E ${fixtureName}`)
  await expect(documentDestinationField).toHaveCount(0)

  const targetRowBox = await targetRow.boundingBox()
  const updatedTargetBox = await targetField.boundingBox()
  expect(targetRowBox).not.toBeNull()
  expect(updatedTargetBox).not.toBeNull()
  expect((targetRowBox?.width ?? 0) / (updatedTargetBox?.width ?? 1)).toBeCloseTo(2, 1)
})

test('renders the public documents register without account actions', async ({ page }) => {
  await page.goto('/dokumenty')
  await expect(page.locator('.cmsPageDocument')).toBeVisible()
  await expect(
    page.getByRole('heading', { exact: true, level: 1, name: 'Dokumenty' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Zaloguj się' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Wyloguj' })).toHaveCount(0)
  const documentTitle = `Dokument E2E ${fixtureName}`
  const documentLink = page
    .getByRole('heading', { exact: true, level: 2, name: documentTitle })
    .getByRole('link', { exact: true, name: documentTitle })
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
  const heroBox = await page.locator('.contentHero').boundingBox()
  const footerBox = await page.locator('.siteFooterShell').boundingBox()
  expect(previewBox).not.toBeNull()
  expect(previewFrameBox).not.toBeNull()
  expect(openLinkBox).not.toBeNull()
  expect(heroBox).not.toBeNull()
  expect(footerBox).not.toBeNull()
  expect(previewFrameBox?.width).toBeGreaterThan(previewBox?.width ?? Number.POSITIVE_INFINITY)
  expect(openLinkBox?.width).toBeLessThan(previewBox?.width ?? 0)
  expect(previewBox?.y ?? 0).toBeGreaterThan(heroBox?.y ?? Number.POSITIVE_INFINITY)
  expect((previewBox?.y ?? 0) + (previewBox?.height ?? 0)).toBeGreaterThan(
    (heroBox?.y ?? 0) + (heroBox?.height ?? 0),
  )
  const previewIsVisibleBelowHero = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>('.contentHero')
    const preview = document.querySelector<HTMLElement>('.documentPdfPreview')

    if (!hero || !preview) return false

    const heroBox = hero.getBoundingClientRect()
    const previewBox = preview.getBoundingClientRect()
    const testedElement = document.elementFromPoint(
      previewBox.left + previewBox.width / 2,
      Math.min(previewBox.bottom - 1, heroBox.bottom + 8),
    )

    return testedElement !== null && preview.contains(testedElement)
  })
  expect(previewIsVisibleBelowHero).toBe(true)
  expect(footerBox?.y).toBeGreaterThan((previewBox?.y ?? 0) + (previewBox?.height ?? 0))
  await expect(downloadLink).toHaveAttribute('href', `${filePath}?download=1`)
  const fileResponse = await page.request.get(filePath)
  expect(fileResponse.ok()).toBe(true)
  expect(fileResponse.headers()['content-type']).toBe('application/pdf')
  expect(fileResponse.headers()['content-disposition']).toContain('inline;')
  expect(fileResponse.headers()['accept-ranges']).toBe('bytes')
  const rangeResponse = await page.request.get(filePath, { headers: { Range: 'bytes=0-9' } })
  expect(rangeResponse.status()).toBe(206)
  expect(rangeResponse.headers()['content-range']).toMatch(/^bytes 0-9\/\d+$/)
  expect(rangeResponse.headers()['content-length']).toBe('10')
  expect((await rangeResponse.body()).byteLength).toBe(10)
  const downloadResponse = await page.request.get(`${filePath}?download=1`)
  expect(downloadResponse.ok()).toBe(true)
  expect(downloadResponse.headers()['content-type']).toBe('application/pdf')
  expect(downloadResponse.headers()['content-disposition']).toContain('attachment;')

  const aliasResponse = await page.request.get(`/${aliasSlug}`, { maxRedirects: 0 })
  expect(aliasResponse.status()).toBe(308)
  expect(new URL(aliasResponse.headers().location, page.url()).pathname).toBe(filePath)

  const aliasFileResponse = await page.request.get(`/${aliasSlug}`)
  expect(aliasFileResponse.ok()).toBe(true)
  expect(aliasFileResponse.headers()['content-type']).toBe('application/pdf')
  expect(aliasFileResponse.headers()['content-disposition']).toContain('inline;')

  const aliasDownloadRedirect = await page.request.get(`/${aliasSlug}?download=1`, {
    maxRedirects: 0,
  })
  expect(aliasDownloadRedirect.status()).toBe(308)
  const aliasDownloadLocation = new URL(aliasDownloadRedirect.headers().location, page.url())
  expect(aliasDownloadLocation.pathname).toBe(filePath)
  expect(aliasDownloadLocation.search).toBe('?download=1')

  const aliasDownloadResponse = await page.request.get(`/${aliasSlug}?download=1`)
  expect(aliasDownloadResponse.ok()).toBe(true)
  expect(aliasDownloadResponse.headers()['content-type']).toBe('application/pdf')
  expect(aliasDownloadResponse.headers()['content-disposition']).toContain('attachment;')

  const aliasRangeResponse = await page.request.get(`/${aliasSlug}`, {
    headers: { Range: 'bytes=0-9' },
  })
  expect(aliasRangeResponse.status()).toBe(206)
  expect(aliasRangeResponse.headers()['content-range']).toMatch(/^bytes 0-9\/\d+$/)
  expect((await aliasRangeResponse.body()).byteLength).toBe(10)

  const updatedSlug = `${fixtureName}-updated`
  const authenticationResponse = await page.request.post('/api/users/login', {
    data: { email: editorTestUser.email, password: editorTestUser.password },
  })
  const authentication = (await authenticationResponse.json()) as { token?: string }
  if (!authentication.token) throw new Error('Document update login did not return a token.')
  const authenticationHeaders = { Authorization: `JWT ${authentication.token}` }
  const updateDocumentResponse = await page.request.patch(`/api/documents/${documentFixture.id}`, {
    data: { slug: updatedSlug },
    headers: authenticationHeaders,
  })
  if (!updateDocumentResponse.ok()) {
    throw new Error(
      `Document update failed with ${updateDocumentResponse.status()}: ${await updateDocumentResponse.text()}`,
    )
  }
  const updatedAliasResponse = await page.request.get(`/${aliasSlug}`, { maxRedirects: 0 })
  expect(updatedAliasResponse.status()).toBe(308)
  expect(new URL(updatedAliasResponse.headers().location, page.url()).pathname).toMatch(
    new RegExp(`^/dokumenty/${updatedSlug}/plik/\\d+$`),
  )
  const restoreDocumentResponse = await page.request.patch(`/api/documents/${documentFixture.id}`, {
    data: { slug: fixtureName },
    headers: authenticationHeaders,
  })
  if (!restoreDocumentResponse.ok()) {
    throw new Error(
      `Document restore failed with ${restoreDocumentResponse.status()}: ${await restoreDocumentResponse.text()}`,
    )
  }

  const blobClient = getStorageContainerClient().getBlobClient(`documents/${fixtureName}.pdf`)
  expect(await blobClient.exists()).toBe(true)
  await deletePublishedDocumentFixture(payload, fixtureName)
  expect(await blobClient.exists()).toBe(false)

  const loginResponse = await page.goto('/login')
  expect(loginResponse?.status()).toBe(404)
})
