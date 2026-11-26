import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '@/payload.config'
import type { Media, User } from '@/payload-types'
import { getStorageContainerClient } from '@/storage/get-storage-container-client'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const fixtureRunID = Date.now()
const pageSlug = `e2e-media-blocks-page-${fixtureRunID}`
const postSlug = `e2e-media-blocks-post-${fixtureRunID}`
const metadataTestAlt = `E2E metadata test ${fixtureRunID}`
const filenames = ['e2e-gallery-first.png', 'e2e-gallery-second.png', 'e2e-attachment.pdf']
const testPDF = Buffer.from(
  '%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 1\n0000000000 65535 f\n%%EOF\n',
)

let payload: Payload
let author: User
let firstImage: Media
let secondImage: Media
let attachment: Media

test.beforeAll(async () => {
  test.setTimeout(30_000)
  payload = await getPayload({ config })
  await cleanupContent()

  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: editorTestUser.email } },
  })
  if (!users.docs[0]) {
    throw new Error('Missing E2E editor user.')
  }
  author = users.docs[0]

  const firstImageData = await sharp({
    create: { background: '#193f5c', channels: 4, height: 800, width: 1200 },
  })
    .png()
    .toBuffer()
  const secondImageData = await sharp({
    create: { background: '#d79a2b', channels: 4, height: 800, width: 1200 },
  })
    .png()
    .toBuffer()

  ;[firstImage, secondImage, attachment] = await Promise.all([
    createMedia(firstImageData, 'image/png', filenames[0], 'Pierwszy podpis galerii'),
    createMedia(secondImageData, 'image/png', filenames[1], 'Drugi podpis galerii'),
    createMedia(testPDF, 'application/pdf', filenames[2], 'Opis załącznika PDF'),
  ])

  await Promise.all([
    payload.create({
      collection: 'pages',
      data: {
        _status: 'published',
        author: author.id,
        layout: [
          {
            blockType: 'heading',
            heading: 'Galeria testowa',
            headingLevel: 'h2',
          },
          {
            blockType: 'mediaGallery',
            items: [{ media: firstImage.id }, { media: secondImage.id }],
            pageSize: 12,
            pagination: false,
            selectionMode: 'manual',
            view: 'grid',
          },
          {
            blockType: 'heading',
            heading: 'Pliki testowe',
            headingLevel: 'h2',
          },
          {
            blockType: 'attachments',
            items: [{ media: attachment.id }],
            pageSize: 12,
            pagination: false,
            selectionMode: 'manual',
            view: 'list',
          },
        ],
        slug: pageSlug,
        title: 'E2E media blocks page',
      },
      overrideAccess: true,
    }),
    payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        author: author.id,
        excerpt: 'E2E media block pagination.',
        layout: [
          {
            blockType: 'heading',
            heading: 'Pliki we wpisie',
            headingLevel: 'h2',
          },
          {
            blockType: 'attachments',
            items: [{ media: firstImage.id }, { media: attachment.id }],
            pageSize: 1,
            pagination: true,
            selectionMode: 'manual',
            view: 'list',
          },
        ],
        slug: postSlug,
        title: 'E2E media blocks post',
      },
      overrideAccess: true,
    }),
  ])
})

test.afterAll(async () => {
  if (payload) {
    await cleanupContent()
  }
})

test('opens the media index with the image filter and searches within the selected category', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })

  const indexPath = '/admin/collections/media'
  const listRequests: string[] = []
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname === indexPath && request.headers().rsc === '1') {
      listRequests.push(request.url())
    }
  })
  await page.goto(`${indexPath}?search=e2e-`)
  const table = page.getByRole('table')
  const categoryTabs = page.getByLabel('Typ pliku')
  await expect(table.getByText(firstImage.filename!, { exact: true })).toBeVisible()
  await expect(table.getByText(attachment.filename!, { exact: true })).toHaveCount(0)
  await expect(page).toHaveURL((url) =>
    [...url.searchParams.keys()].some((name) => name.startsWith('where[mimeType]')),
  )
  expect(listRequests).toHaveLength(0)

  await categoryTabs.getByRole('button', { name: 'Dokumenty' }).click()
  await expect(table.getByText(attachment.filename!, { exact: true })).toBeVisible()
  await expect(table.getByText(firstImage.filename!, { exact: true })).toHaveCount(0)

  await page.locator('#search-filter-input').fill('e2e-attachment')
  await expect(page).toHaveURL((url) => url.searchParams.get('search') === 'e2e-attachment')
  await expect(table.getByText(attachment.filename!, { exact: true })).toBeVisible()
  await page.reload()
  await expect(table.getByText(attachment.filename!, { exact: true })).toBeVisible()
})

test('enables metadata cleaning again for each selected image', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/media/create')
  const file = page.locator('input[type="file"]')
  const jpeg = await sharp({
    create: { background: '#193f5c', channels: 3, height: 64, width: 96 },
  })
    .jpeg()
    .withExif({ IFD0: { Artist: 'Example Artist' } })
    .toBuffer()
  const metadata = page.getByRole('switch', { name: /Usuń dodatkowe metadane zdjęcia/ })

  await file.setInputFiles({ name: 'metadata-first.jpg', mimeType: 'image/jpeg', buffer: jpeg })
  await expect(metadata).toBeChecked()
  await metadata.uncheck()
  await expect(metadata).not.toBeChecked()
  await page.locator('.file-field__remove').click()
  await file.setInputFiles({ name: 'metadata-second.jpg', mimeType: 'image/jpeg', buffer: jpeg })
  await expect(metadata).toBeChecked()

  await metadata.uncheck()
  await page.getByRole('textbox', { name: /Tekst alternatywny/ }).fill(metadataTestAlt)
  const [save] = await Promise.all([
    page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/media' && response.request().method() === 'POST',
    ),
    page.getByRole('button', { name: 'Zapisz', exact: true }).click(),
  ])
  expect(save.ok()).toBe(true)
  const { doc } = (await save.json()) as { doc: Media }
  expect(doc.mimeType).toBe('image/webp')
  const output = await page.request.get(doc.url!)
  expect(output.ok()).toBe(true)
  expect((await sharp(await output.body()).metadata()).exif?.includes('Example Artist')).toBe(true)
  const container = getStorageContainerClient()
  expect(await container.getBlobClient('metadata-second.jpg').exists()).toBe(false)

  const filename = `metadata-api-${fixtureRunID}.jpg`
  const apiSave = await page.request.post('/api/media', {
    headers: { origin: new URL(page.url()).origin },
    multipart: {
      _payload: JSON.stringify({ alt: metadataTestAlt }),
      file: { name: filename, mimeType: 'image/jpeg', buffer: jpeg },
    },
  })
  expect(apiSave.ok(), await apiSave.text()).toBe(true)
  const { doc: apiImage } = (await apiSave.json()) as { doc: Media }
  const apiOutput = await page.request.get(apiImage.url!)
  expect(apiOutput.ok()).toBe(true)
  expect((await sharp(await apiOutput.body()).metadata()).exif).toBeUndefined()
  expect(await container.getBlobClient(filename).exists()).toBe(false)

  const edited = await page.request.patch(`/api/media/${apiImage.id}`, {
    data: { description: 'Opis po edycji metadanych rekordu' },
    headers: { origin: new URL(page.url()).origin },
  })
  expect(edited.ok(), await edited.text()).toBe(true)
  const { doc: editedImage } = (await edited.json()) as { doc: Media }
  expect(editedImage.filename).toBe(apiImage.filename)
  expect(editedImage.imageVariants).toEqual(apiImage.imageVariants)
})

test('opens gallery images in a captioned and zoomable lightbox', async ({ page }) => {
  await page.goto(`/${pageSlug}`)

  await expect(page.getByRole('heading', { name: 'Galeria testowa' })).toBeVisible()
  const image = page.getByRole('img', { name: filenames[0], exact: true })
  await expect(image).toHaveAttribute('srcset', /480w/)
  const variantURL = await image.getAttribute('src')
  const variant = await page.request.get(variantURL!)
  expect(variant.ok()).toBe(true)
  expect(variant.headers()['content-type']).toBe('image/webp')
  const etag = variant.headers().etag
  expect(
    (await page.request.get(variantURL!, { headers: { 'If-None-Match': etag } })).status(),
  ).toBe(304)
  const download = await page.request.get(firstImage.url!)
  expect(download.ok()).toBe(true)
  expect((await sharp(await download.body()).metadata()).width).toBe(1200)
  await page.getByRole('button', { name: `Otwórz obraz: ${filenames[0]}` }).click()

  const lightbox = page.locator('.yarl__root')
  await expect(lightbox).toBeVisible()
  await expect(lightbox).toContainText('Pierwszy podpis galerii')
  await expect(lightbox.getByRole('button', { name: 'Powiększ' })).toBeVisible()
  await expect(lightbox.getByRole('button', { name: 'Pobierz' })).toBeVisible()
  await lightbox.getByRole('button', { name: 'Następny obraz' }).click()
  await expect(lightbox).toContainText('Drugi podpis galerii')
  await page.keyboard.press('Escape')
  await expect(lightbox).toBeHidden()
})

test('opens an attachment in a new tab and displays its description', async ({ page }) => {
  await page.goto(`/${pageSlug}`)

  const attachmentLink = page.getByRole('link', { name: /e2e-attachment\.pdf/ })
  await expect(attachmentLink).toContainText('Opis załącznika PDF')
  await expect(attachmentLink).toHaveAttribute('target', '_blank')

  const popupPromise = page.waitForEvent('popup')
  await attachmentLink.click()
  const popup = await popupPromise
  await expect.poll(() => popup.url()).toContain(filenames[2])
  await popup.close()
})

test('keeps block pagination working on a single post route', async ({ page }) => {
  await page.goto(`/blog/${postSlug}`)

  const nextPage = page.getByRole('link', { name: 'Następna' })
  await expect(nextPage).toHaveAttribute('href', /attachments_.+=2/)
  await nextPage.click()
  await expect(page).toHaveURL(/attachments_.+=2/)
  await expect(page.getByText(filenames[2], { exact: true })).toBeVisible()
})

test(
  'invalidates cached media block data after a Payload update',
  { tag: '@public-cache' },
  async ({ page }) => {
    await page.goto(`/${pageSlug}`)
    await expect(page.getByRole('link', { name: /e2e-attachment\.pdf/ })).toContainText(
      'Opis załącznika PDF',
    )

    await login({ page, user: editorTestUser })
    const updateResponse = await updateMediaDescription(
      page,
      attachment.id,
      'Opis po unieważnieniu cache',
    )
    expect(updateResponse.ok, updateResponse.body).toBe(true)

    try {
      await page.goto(`/${pageSlug}`)
      await expect(page.getByRole('link', { name: /e2e-attachment\.pdf/ })).toContainText(
        'Opis po unieważnieniu cache',
      )
    } finally {
      const restoreResponse = await updateMediaDescription(
        page,
        attachment.id,
        'Opis załącznika PDF',
      )
      expect(restoreResponse.ok, restoreResponse.body).toBe(true)
    }
  },
)

async function createMedia(
  data: Buffer,
  mimetype: string,
  filename: string,
  description: string,
): Promise<Media> {
  return payload.create({
    collection: 'media',
    data: { alt: filename, description, uploadedBy: author.id },
    file: { data, mimetype, name: filename, size: data.length },
    overrideAccess: true,
  })
}

async function updateMediaDescription(
  page: import('@playwright/test').Page,
  mediaID: number,
  description: string,
): Promise<{ body: string; ok: boolean }> {
  return page.evaluate(
    async ({ description, mediaID }) => {
      const response = await fetch(`/api/media/${mediaID}`, {
        body: JSON.stringify({ description }),
        headers: { 'content-type': 'application/json' },
        method: 'PATCH',
      })
      return { body: await response.text(), ok: response.ok }
    },
    { description, mediaID },
  )
}

async function cleanupContent(): Promise<void> {
  await Promise.all([
    payload.delete({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { equals: pageSlug } },
    }),
    payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { equals: postSlug } },
    }),
  ])
  await payload.delete({
    collection: 'media',
    overrideAccess: true,
    where: { alt: { in: [...filenames, metadataTestAlt] } },
  })
}
