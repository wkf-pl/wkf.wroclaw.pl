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
                  heading: 'Powierzchnia obrazowa',
                  headingIconName: 'image',
                  headingLevel: 'h2',
                  iconInverted: true,
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
                  heading: 'Odnośniki prezentacyjne',
                  headingLevel: 'h2',
                },
                {
                  alignment: 'start',
                  blockType: 'actionLinks',
                  items: [
                    {
                      appearance: 'primaryButton',
                      emailBody: 'Cześć!\n\nChcę porozmawiać o dołączeniu.',
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
          surface: 'default',
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
  const image = imageSurface.locator(':scope > .contentPresentationImage')
  await expect(image).toHaveAttribute('alt', '')
  await expect(image).toHaveAttribute('aria-hidden', 'true')
  await expect(image).toHaveCSS('object-fit', 'cover')
  await expect(image).toHaveCSS('object-position', '100% 100%')
  await expect(imageSurface.locator(':scope > .contentPresentationShade')).toBeVisible()
  await expect(group.locator('[data-surface="subtle"]')).toHaveCount(1)
  await expect(group.locator('[data-surface="inverse"]')).toHaveCount(1)
  const imageHeading = page.getByRole('heading', { level: 2, name: 'Powierzchnia obrazowa' })
  await expect(imageHeading).toBeVisible()
  await expect(imageHeading.locator('.contentHeadingIcon')).toHaveClass(
    /contentHeadingIcon--inverted/,
  )

  const primaryAction = page.getByRole('link', { name: 'Napisz do nas' })
  await expect(primaryAction).toHaveClass(/presentedLink--primaryButton/)
  await expect(primaryAction).toHaveAttribute(
    'href',
    /mailto:.*subject=Kontakt%20z%20WKF.*body=Cze%C5%9B%C4%87%21%0D%0A%0D%0AChc%C4%99%20porozmawia%C4%87%20o%20do%C5%82%C4%85czeniu\./,
  )
  expect(await primaryAction.getAttribute('href')).not.toContain('+')
  const secondaryAction = page.getByRole('link', { name: 'Zobacz aktualności' })
  await expect(secondaryAction).toHaveClass(/presentedLink--secondaryButton/)
  await primaryAction.hover()
  await expect(primaryAction).toHaveCSS('color', 'rgb(255, 189, 56)')
  await secondaryAction.hover()
  await expect(secondaryAction).toHaveCSS('color', 'rgb(244, 239, 229)')
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
  const separatedColumns = page.locator('.columnLayout--withSeparators .columnLayoutColumn')
  const firstColumnBox = await separatedColumns.nth(0).boundingBox()
  const secondColumnBox = await separatedColumns.nth(1).boundingBox()
  expect(firstColumnBox).not.toBeNull()
  expect(secondColumnBox).not.toBeNull()
  expect(secondColumnBox!.x - (firstColumnBox!.x + firstColumnBox!.width)).toBeGreaterThanOrEqual(
    40,
  )
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

test('shows compact presentation and heading controls with the crop preview in admin', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${pageDocument.id}`)

  const layoutField = page.locator('#field-layout')
  const showAllButton = layoutField
    .locator(':scope > .blocks-field__header')
    .getByRole('button', { name: 'Pokaż wszystkie' })
  await showAllButton.click()
  const sectionTabs = layoutField
    .locator('.blocks-field__row')
    .first()
    .locator('.wkf-layout-tabs[data-layout-kind="sections"]')
  await expect(sectionTabs.getByRole('tab')).toHaveText(['Prezentacja', 'Sekcja 1', 'Sekcja 2'])
  await sectionTabs.getByRole('tab', { name: 'Sekcja 1' }).click()
  const firstSection = sectionTabs.getByRole('tabpanel')

  const frameField = firstSection.locator('[id$="__frame"]').first()
  const surfaceField = firstSection.locator('[id$="__surface"]').first()
  const surfaceImageField = firstSection.locator('[id$="__surfaceImage"]').first()
  const horizontalPositionField = firstSection
    .locator('[id$="__surfaceHorizontalPosition"]')
    .first()
  const verticalPositionField = firstSection.locator('[id$="__surfaceVerticalPosition"]').first()
  const presentationLayout = await Promise.all(
    [frameField, surfaceField].map((field) =>
      field.evaluate((element) => {
        const fieldContainer = element.closest('.field-type') ?? element
        const rectangle = fieldContainer.getBoundingClientRect()
        return { height: rectangle.height, width: rectangle.width, x: rectangle.x, y: rectangle.y }
      }),
    ),
  )
  const [frameBox, surfaceBox] = presentationLayout
  expect(Math.abs(frameBox.y - surfaceBox.y)).toBeLessThanOrEqual(2)
  expect(Math.abs(frameBox.width - surfaceBox.width)).toBeLessThanOrEqual(2)

  const headingField = firstSection.locator('[id$="__heading"]').first()
  const headingLevelField = firstSection.locator('[id$="__headingLevel"]').first()
  const headingIconField = firstSection.locator('[id$="__headingIconName"]').first()
  const iconInvertedField = firstSection.locator('[id$="__iconInverted"]').first()
  const headingLayout = await Promise.all(
    [headingField, headingLevelField, headingIconField, iconInvertedField].map((field) =>
      field.evaluate((element) => {
        const fieldContainer = element.closest('.field-type') ?? element
        const rectangle = fieldContainer.getBoundingClientRect()
        return { width: rectangle.width, y: rectangle.y }
      }),
    ),
  )
  const [headingBox, headingLevelBox, headingIconBox, iconInvertedBox] = headingLayout
  expect(Math.abs(headingBox.y - headingLevelBox.y)).toBeLessThanOrEqual(2)
  expect(Math.abs(headingIconBox.y - iconInvertedBox.y)).toBeLessThanOrEqual(2)
  expect(headingIconBox.y).toBeGreaterThan(headingBox.y)
  expect(headingBox.width / headingLevelBox.width).toBeGreaterThan(2.5)
  expect(headingIconBox.width / iconInvertedBox.width).toBeGreaterThan(2.5)
  await expect(iconInvertedField).toBeChecked()
  const [iconControlHeight, levelControlHeight] = await Promise.all(
    [headingIconField, headingLevelField].map((field) =>
      field.locator('.rs__control').evaluate((element) => element.getBoundingClientRect().height),
    ),
  )
  expect(Math.abs(iconControlHeight - levelControlHeight)).toBeLessThanOrEqual(1)
  const selectedIconGeometry = await headingIconField.evaluate((element) => {
    const control = element.querySelector('.rs__control')
    const selectedIcon = element.querySelector('.raster-icon-picker__value .rasterIcon')
    if (!control || !selectedIcon) return null

    const controlRectangle = control.getBoundingClientRect()
    const iconRectangle = selectedIcon.getBoundingClientRect()
    return {
      bottomOverflow: iconRectangle.bottom - controlRectangle.bottom,
      centerOffset:
        iconRectangle.top +
        iconRectangle.height / 2 -
        (controlRectangle.top + controlRectangle.height / 2),
      topOverflow: controlRectangle.top - iconRectangle.top,
    }
  })
  expect(selectedIconGeometry).not.toBeNull()
  expect(selectedIconGeometry?.topOverflow).toBeLessThanOrEqual(0)
  expect(selectedIconGeometry?.bottomOverflow).toBeLessThanOrEqual(0)
  expect(
    Math.abs(selectedIconGeometry?.centerOffset ?? Number.POSITIVE_INFINITY),
  ).toBeLessThanOrEqual(1)
  const indicatorCenterOffset = await Promise.all(
    [headingIconField, headingLevelField].map((field) =>
      field.evaluate((element) => {
        const control = element.querySelector('.rs__control')
        const indicators = element.querySelector('.rs__indicators')
        if (!control || !indicators) return null
        const controlRectangle = control.getBoundingClientRect()
        const indicatorRectangle = indicators.getBoundingClientRect()
        return (
          indicatorRectangle.top +
          indicatorRectangle.height / 2 -
          (controlRectangle.top + controlRectangle.height / 2)
        )
      }),
    ),
  )
  expect(indicatorCenterOffset.every((offset) => offset !== null && Math.abs(offset) <= 1)).toBe(
    true,
  )
  await expect(frameField.getByRole('combobox')).toBeVisible()
  await frameField.getByRole('combobox').click()
  await expect(page.getByRole('option', { name: 'Brak', exact: true })).toBeVisible()
  await expect(page.getByRole('option', { name: 'Obrys', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
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

  await headingIconField.locator('.clear-indicator').click()
  await expect(headingIconField).toContainText('Wyszukaj ikonę po nazwie…')
  const placeholderCenterOffset = await headingIconField.evaluate((element) => {
    const control = element.querySelector('.rs__control')
    const placeholder = element.querySelector('.rs__placeholder')
    if (!control || !placeholder) return null
    const controlRectangle = control.getBoundingClientRect()
    const placeholderRectangle = placeholder.getBoundingClientRect()
    return (
      placeholderRectangle.top +
      placeholderRectangle.height / 2 -
      (controlRectangle.top + controlRectangle.height / 2)
    )
  })
  expect(placeholderCenterOffset).not.toBeNull()
  expect(Math.abs(placeholderCenterOffset ?? Number.POSITIVE_INFINITY)).toBeLessThanOrEqual(1)

  await expect(sectionTabs.getByRole('button', { name: /^Przeciągnij: Sekcja / })).toHaveCount(2)
  await sectionTabs.getByRole('button', { name: 'Dodaj sekcję' }).click()
  await expect(sectionTabs.getByRole('tab', { name: 'Sekcja 3' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(
    sectionTabs.getByRole('tabpanel').getByRole('button', { name: 'Duplikuj sekcję' }),
  ).toHaveCount(0)
  await sectionTabs.getByRole('button', { name: 'Usuń: Sekcja 3' }).click()
  await expect(sectionTabs.getByRole('tab')).toHaveText(['Prezentacja', 'Sekcja 1', 'Sekcja 2'])
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
