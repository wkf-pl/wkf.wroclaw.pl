import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '@/payload.config'
import type { Media, User } from '@/payload-types'

import { login } from '../helpers/login'
import { cleanupTestUsers, editorTestUser, seedTestUsers } from '../helpers/seedUser'

const pageSlug = 'e2e-media-blocks-page'
const postSlug = 'e2e-media-blocks-post'
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
  await seedTestUsers()
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
            blockType: 'mediaGallery',
            heading: 'Galeria testowa',
            items: [{ media: firstImage.id }, { media: secondImage.id }],
            pageSize: 12,
            pagination: false,
            selectionMode: 'manual',
            view: 'grid',
          },
          {
            blockType: 'attachments',
            heading: 'Pliki testowe',
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
            blockType: 'attachments',
            heading: 'Pliki we wpisie',
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
  await cleanupTestUsers()
})

test('opens gallery images in a captioned and zoomable lightbox', async ({ page }) => {
  await page.goto(`/${pageSlug}`)

  await expect(page.getByRole('heading', { name: 'Galeria testowa' })).toBeVisible()
  await page.getByRole('button', { name: `Otwórz obraz: ${filenames[0]}` }).click()

  const lightbox = page.locator('.yarl__root')
  await expect(lightbox).toBeVisible()
  await expect(lightbox).toContainText('Pierwszy podpis galerii')
  await expect(lightbox.getByRole('button', { name: 'Powiększ' })).toBeVisible()
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

test('offers both media blocks in the page editor', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/pages/create')

  const layout = page.locator('#field-layout')
  await layout.getByRole('button', { name: 'Dodaj', exact: true }).last().click()
  await expect(page.getByText('Galeria mediów', { exact: true })).toBeVisible()
  await expect(page.getByText('Załączniki', { exact: true })).toBeVisible()
})

async function createMedia(
  data: Buffer,
  mimetype: string,
  filename: string,
  description: string,
): Promise<Media> {
  return payload.create({
    collection: 'media',
    data: { alt: filename, description },
    file: { data, mimetype, name: filename, size: data.length },
    overrideAccess: true,
  })
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
    where: { filename: { in: filenames } },
  })
}
