import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '@/payload.config'
import type { Media, Page, RichTextBlock, User } from '@/payload-types'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const fixtureRunID = Date.now()
const pageSlug = `e2e-content-composition-${fixtureRunID}`
const imageFilename = `e2e-content-surface-${fixtureRunID}.png`

let payload: Payload
let pageDocument: Page
let surfaceImage: Media

function richText(paragraphs: string[], textStyle: RichTextBlock['textStyle'] = 'default') {
  return {
    blockType: 'richText' as const,
    content: {
      root: {
        children: paragraphs.map((text) => ({
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
        })),
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'root' as const,
        version: 1,
      },
    },
    textStyle,
  }
}

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanup()
  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: editorTestUser.email } },
  })
  const author = users.docs[0] as User | undefined
  if (!author) throw new Error('Missing E2E editor user.')

  const imageData = await sharp({
    create: { background: '#fffef8', channels: 4, height: 120, width: 240 },
  })
    .png()
    .toBuffer()
  surfaceImage = await payload.create({
    collection: 'media',
    data: { alt: 'Decorative bright test surface' },
    file: {
      data: imageData,
      mimetype: 'image/png',
      name: imageFilename,
      size: imageData.length,
    },
    overrideAccess: true,
  })

  pageDocument = await payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      author: author.id,
      layout: [
        {
          blockType: 'sectionGroup',
          frame: 'outline',
          sections: [
            {
              blocks: [
                {
                  blockType: 'heading',
                  iconName: 'image',
                  role: 'section',
                  text: 'Powierzchnia obrazowa',
                },
                {
                  blockType: 'columnLayout',
                  columnSeparators: 'between',
                  columns: [
                    {
                      blocks: [
                        richText(
                          ['Pierwsza kolumna ma dwa akapity.', 'Drugi akapit wydłuża kolumnę.'],
                          'lead',
                        ),
                      ],
                      surface: 'default',
                      width: 6,
                    },
                    {
                      blocks: [richText(['Druga kolumna kończy się na tej samej linii.'])],
                      surface: 'subtle',
                      width: 6,
                    },
                  ],
                  verticalAlignment: 'end',
                },
              ],
              surface: 'image',
              surfaceHorizontalPosition: 'right',
              surfaceImage: surfaceImage.id,
              surfaceVerticalPosition: 'bottom',
            },
            {
              blocks: [
                {
                  blockType: 'heading',
                  role: 'section',
                  text: 'Odnośniki prezentacyjne',
                },
                {
                  alignment: 'start',
                  blockType: 'actionLinks',
                  items: [
                    {
                      appearance: 'primaryButton',
                      emailBody: 'Chcę porozmawiać o dołączeniu.',
                      emailSubject: 'Kontakt z WKF',
                      iconName: 'mail',
                      label: 'Napisz do nas',
                      targetType: 'siteContactEmail',
                    },
                    {
                      appearance: 'secondaryButton',
                      customAddress: 'blog',
                      customScheme: 'path',
                      label: 'Zobacz aktualności',
                      targetType: 'custom',
                    },
                    {
                      appearance: 'link',
                      customAddress: 'o-nas',
                      customScheme: 'path',
                      iconName: 'home',
                      label: '',
                      targetType: 'custom',
                    },
                  ],
                  layout: 'inline',
                },
              ],
              surface: 'inverse',
            },
          ],
        },
      ],
      slug: pageSlug,
      title: 'E2E content composition',
    },
    overrideAccess: true,
  })
})

test.afterAll(async () => {
  await cleanup()
})

test('renders finite composition, decorative cover image and presented links', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1400 })
  await page.goto(`/${pageSlug}`)

  const group = page.locator('.sectionGroup')
  await expect(group).toHaveCount(1)
  await expect(group.locator('.sectionGroupSection')).toHaveCount(2)
  await expect(page.locator('.membershipOnboarding')).toHaveCount(0)

  const imageSurface = group.locator('[data-surface="image"]')
  const image = imageSurface.locator(':scope > .contentSurfaceImage')
  await expect(image).toHaveAttribute('alt', '')
  await expect(image).toHaveAttribute('aria-hidden', 'true')
  await expect(image).toHaveCSS('object-fit', 'cover')
  await expect(image).toHaveCSS('object-position', '100% 100%')
  await expect(imageSurface.locator(':scope > .contentSurfaceShade')).toBeVisible()
  await expect(group.locator('[data-surface="subtle"]')).toHaveCount(1)
  await expect(group.locator('[data-surface="inverse"]')).toHaveCount(1)

  const primaryAction = page.getByRole('link', { name: 'Napisz do nas' })
  await expect(primaryAction).toHaveClass(/presentedLink--primaryButton/)
  await expect(primaryAction).toHaveAttribute(
    'href',
    /mailto:.*subject=Kontakt(?:\+|%20)z(?:\+|%20)WKF.*body=/,
  )
  await expect(page.getByRole('link', { name: 'Zobacz aktualności' })).toHaveClass(
    /presentedLink--secondaryButton/,
  )
  const iconOnly = group.locator('.actionLinks').getByRole('link', { name: 'O nas', exact: true })
  await expect(iconOnly).toHaveAttribute('href', '/o-nas')
  const iconOnlyBox = await iconOnly.boundingBox()
  expect(iconOnlyBox?.width).toBeGreaterThanOrEqual(44)
  expect(iconOnlyBox?.height).toBeGreaterThanOrEqual(44)

  const columnTexts = await page
    .locator('.columnLayout--withSeparators .columnLayoutColumn')
    .allTextContents()
  expect(columnTexts).toEqual([
    'Pierwsza kolumna ma dwa akapity.Drugi akapit wydłuża kolumnę.',
    'Druga kolumna kończy się na tej samej linii.',
  ])
})

test('turns the separator horizontal without changing DOM order on mobile', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 480 })
  await page.goto(`/${pageSlug}`)

  const columns = page.locator('.columnLayout--withSeparators .columnLayoutColumn')
  await expect(columns).toHaveCount(2)
  const separator = await columns.nth(1).evaluate((element) => {
    const style = getComputedStyle(element, '::before')
    return { height: style.height, width: style.width }
  })
  expect(separator.height).toBe('1px')
  expect(Number.parseFloat(separator.width)).toBeGreaterThan(100)
  expect(await columns.allTextContents()).toEqual([
    'Pierwsza kolumna ma dwa akapity.Drugi akapit wydłuża kolumnę.',
    'Druga kolumna kończy się na tej samej linii.',
  ])
})

test('shows the image controls, crop preview and descriptive section label in admin', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${pageDocument.id}`)

  const firstSection = page.locator('#field-layout__0__sections .array-field__row').first()
  await firstSection.getByRole('button', { name: 'Przełącz blok' }).click()

  await expect(
    page.getByText('Sekcja 1: obraz · Powierzchnia obrazowa', { exact: true }),
  ).toBeVisible()
  const surfaceField = firstSection.locator('[id$="__surface"]').first()
  const surfaceImageField = firstSection.locator('[id$="__surfaceImage"]').first()
  const horizontalPositionField = firstSection
    .locator('[id$="__surfaceHorizontalPosition"]')
    .first()
  const verticalPositionField = firstSection.locator('[id$="__surfaceVerticalPosition"]').first()
  await expect(surfaceField).toContainText('Obraz')
  await expect(firstSection.locator('.wkf-surface-preview')).toBeVisible()
  await expect(horizontalPositionField.getByRole('combobox')).toBeVisible()
  await expect(verticalPositionField.getByRole('combobox')).toBeVisible()

  await surfaceField.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Domyślna', exact: true }).click()
  await expect(firstSection.locator('.wkf-surface-preview')).toHaveCount(0)
  await expect(surfaceImageField).toHaveCount(0)

  await surfaceField.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Obraz', exact: true }).click()
  await expect(firstSection.locator('.wkf-surface-preview')).toBeVisible()
  await expect(surfaceImageField).toContainText(imageFilename)
})

async function cleanup(): Promise<void> {
  if (!payload) return
  if (pageDocument) {
    await payload.delete({ collection: 'pages', id: pageDocument.id, overrideAccess: true })
  } else {
    await payload.delete({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { equals: pageSlug } },
    })
  }
  if (surfaceImage) {
    await payload.delete({ collection: 'media', id: surfaceImage.id, overrideAccess: true })
  } else {
    await payload.delete({
      collection: 'media',
      overrideAccess: true,
      where: { filename: { equals: imageFilename } },
    })
  }
}
