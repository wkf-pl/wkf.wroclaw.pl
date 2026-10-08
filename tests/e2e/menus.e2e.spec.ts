import { expect, test, type Page } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'
import type {
  Footer,
  HomepageHero,
  HomepageSection,
  Navigation,
  SiteSetting,
} from '../../src/payload-types.js'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

let originalNavigation: Navigation
let originalSiteSettings: SiteSetting
let originalHomepageHero: HomepageHero
let originalHomepageSections: HomepageSection
let originalFooter: Footer

test.beforeAll(async ({ browser }) => {
  const payload = await getPayload({ config })
  originalNavigation = await payload.findGlobal({
    slug: 'navigation',
    depth: 0,
    overrideAccess: true,
  })
  originalSiteSettings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 0,
    overrideAccess: true,
  })
  originalHomepageHero = await payload.findGlobal({
    slug: 'homepage-hero',
    depth: 0,
    overrideAccess: true,
  })
  originalHomepageSections = await payload.findGlobal({
    slug: 'homepage-sections',
    depth: 1,
    overrideAccess: true,
  })
  originalFooter = await payload.findGlobal({
    slug: 'footer',
    depth: 0,
    overrideAccess: true,
  })
  const aboutPages = await payload.find({
    collection: 'pages',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'o-nas' } },
  })
  const aboutPage = aboutPages.docs[0]

  if (!aboutPage) {
    throw new Error('Missing the published O nas page required by menu E2E tests.')
  }

  const page = await browser.newPage()
  await login({ page, user: editorTestUser })

  await updateGlobal(page, 'site-settings', { siteName: 'E2E Klub Fantastyki' })
  await updateGlobal(page, 'navigation', createTestNavigation(aboutPage.id))
  await updateGlobal(page, 'homepage-hero', {
    items: createTestHeroItems(),
    title: createRichText('E2E Hero', 2),
  })
  await updateGlobal(page, 'homepage-sections', {
    layout: [
      {
        blockType: 'heading',
        heading: 'E2E Wydarzenia',
        headingLevel: 'h2',
      },
      {
        blockType: 'card',
        links: [
          {
            appearance: 'link',
            customAddress: 'blog',
            customScheme: 'path',
            iconName: 'dice',
            label: 'Sesje',
            targetType: 'custom',
          },
        ],
        title: 'E2E RPG',
      },
    ],
  })
  await updateGlobal(page, 'footer', createTestFooter(aboutPage.id))
  await page.close()
})

test.afterAll(async ({ browser }) => {
  const page = await browser.newPage()
  await login({ page, user: editorTestUser })

  await updateGlobal(page, 'site-settings', {
    contactEmail: originalSiteSettings.contactEmail,
    siteDescription: originalSiteSettings.siteDescription,
    siteName: originalSiteSettings.siteName,
  })
  await updateGlobal(page, 'navigation', {
    headerItems: originalNavigation.headerItems,
  })
  await updateGlobal(page, 'homepage-hero', {
    content: originalHomepageHero.content,
    items: originalHomepageHero.items,
    title: originalHomepageHero.title,
  })
  await updateGlobal(page, 'homepage-sections', {
    layout: normalizeHomepageLayout(originalHomepageSections.layout),
  })
  await updateGlobal(page, 'footer', {
    columns: originalFooter.columns,
    contactHeading: originalFooter.contactHeading,
    content: originalFooter.content,
    copyright: originalFooter.copyright,
    socialItems: originalFooter.socialItems,
  })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'E2E RPG' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'E2E LARP' })).toHaveCount(0)
  await page.close()
})

test('renders editable menus and configured content on the home page', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('.siteBrand img')).toHaveAttribute('src', /logo-color(?:-\d+)?\.webp/)
  await expect(
    page.getByRole('link', { name: /E2E Klub Fantastyki — strona główna/ }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'E2E Hero' })).toBeVisible()
  const homepageContentHeading = page.getByRole('heading', { level: 2, name: 'E2E Wydarzenia' })
  await expect(homepageContentHeading).toHaveClass(/contentHeading--homeSection/)
  await expect(homepageContentHeading.locator('[data-icon-name="dice"]')).toHaveCount(2)
  await expect(page.locator('.homeEvents, .homeNews, .sectionHeading')).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Główna nawigacja' })).toContainText(
    'Aktualności',
  )
  await expect(page.getByRole('link', { name: 'kontakt@example.invalid' })).toHaveAttribute(
    'href',
    'mailto:kontakt@example.invalid',
  )
  await expect(
    page.getByRole('link', { name: 'kontakt@example.invalid' }).locator('[data-icon-name="mail"]'),
  ).toHaveAttribute('data-icon-size', 'medium')
  const aboutHeaderLink = page
    .getByRole('navigation', { name: 'Główna nawigacja' })
    .getByRole('link', { name: 'O nas' })
  await expect(aboutHeaderLink).toHaveClass(/presentedLink--secondaryButton/)
  await expect(aboutHeaderLink).toHaveAttribute('href', '/o-nas')
  const joinHeaderLink = page
    .getByRole('navigation', { name: 'Główna nawigacja' })
    .getByRole('link', { name: 'Dołącz!' })
  await expect(joinHeaderLink).toHaveClass(/presentedLink--primaryButton/)
  await expect(joinHeaderLink).toHaveAttribute('href', '/dolacz')

  for (const buttonLink of [aboutHeaderLink, joinHeaderLink]) {
    await expect(buttonLink).toHaveCSS('min-height', '44px')
    await expect(buttonLink).toHaveCSS('padding-left', '16px')
    await expect(buttonLink).toHaveCSS('padding-right', '16px')
  }
  await expect(aboutHeaderLink).toHaveCSS('border-top-width', '2px')
  await expect(aboutHeaderLink).toHaveCSS('border-top-color', 'rgb(243, 163, 19)')
  await expect(joinHeaderLink).toHaveCSS('border-top-width', '1px')
  await expect(aboutHeaderLink).toHaveCSS('color', 'rgb(244, 239, 229)')
  await expect(joinHeaderLink).toHaveCSS('color', 'rgb(0, 13, 23)')

  await aboutHeaderLink.hover()
  await expect(aboutHeaderLink).toHaveCSS('color', 'rgb(0, 13, 23)')
  await joinHeaderLink.hover()
  await expect(joinHeaderLink).toHaveCSS('color', 'rgb(0, 13, 23)')
  await expect(page.getByRole('navigation', { name: 'Obszary klubu' })).toContainText('Gry RPG')
  await expect(page.getByRole('heading', { name: 'E2E RPG' })).toBeVisible()
  await expect(page.locator('.cardBlock')).toHaveCSS('max-width', 'none')
  await expect(
    page.getByRole('link', { name: 'Sesje' }).locator('[data-icon-name="dice"]'),
  ).toHaveAttribute('data-icon-size', 'medium')
  await expect(page.getByRole('heading', { name: 'E2E LARP' })).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Media społecznościowe' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'slack.example.invalid' })).toHaveAttribute(
    'href',
    'https://slack.example.invalid',
  )
  await expect(
    page
      .getByRole('link', { name: 'slack.example.invalid' })
      .locator('[data-icon-name="facebook"]'),
  ).toHaveAttribute('data-icon-size', 'medium')
  await expect(page.getByRole('navigation', { name: 'Nawigacja w stopce' })).toContainText('O nas')
  await expect(page.getByRole('navigation', { name: 'Nawigacja w stopce' })).toHaveClass(
    /footerMenu--align-center/,
  )
  await expect(
    page
      .getByRole('navigation', { name: 'Nawigacja w stopce' })
      .getByRole('link', { name: 'O nas' }),
  ).toHaveAttribute('href', '/o-nas')
  await expect(page.getByRole('navigation', { name: 'Lewa w stopce' })).toHaveCSS(
    'align-items',
    'flex-start',
  )
  await expect(page.getByRole('navigation', { name: 'Lewa w stopce' }).getByRole('link')).toHaveCSS(
    'justify-content',
    'flex-start',
  )
  await expect(page.getByRole('navigation', { name: 'Prawa w stopce' })).toHaveCSS(
    'align-items',
    'flex-end',
  )
  await expect(
    page.getByRole('navigation', { name: 'Prawa w stopce' }).getByRole('link'),
  ).toHaveCSS('justify-content', 'flex-end')
})

test('searches, selects with the keyboard and persists a named icon in a card block', async ({
  page,
}) => {
  test.setTimeout(60_000)

  await login({ page, user: editorTestUser })
  await page.goto('/admin/globals/homepage-sections')

  const layoutField = page.locator('#field-layout')
  await expect(page.getByRole('button', { name: 'Treść', exact: true })).toHaveCount(0)
  await expect(layoutField).toBeVisible({ timeout: 15_000 })
  const expandLayoutButton = layoutField
    .locator(':scope > .blocks-field__header')
    .getByRole('button', { name: 'Pokaż wszystkie' })
  await expect(expandLayoutButton).toBeVisible({ timeout: 15_000 })
  await expandLayoutButton.click()

  const cardRow = layoutField.locator('.blocks-field__row').nth(1)
  const linksField = cardRow.locator('#field-layout__1__links')
  await expect(linksField).toBeVisible({ timeout: 15_000 })
  const expandLinksButton = linksField
    .locator(':scope > .array-field__header')
    .getByRole('button', { name: 'Pokaż wszystkie' })
  await expect(expandLinksButton).toBeVisible({ timeout: 15_000 })
  await expandLinksButton.click()

  const linkRow = linksField.locator('.array-field__row').first()
  const iconField = linkRow.locator('#field-layout__1__links__0__iconName')
  await expect(iconField).toBeVisible()

  const combobox = iconField.getByRole('combobox')
  await combobox.click()
  await combobox.fill('sword')
  const swordOption = page.locator('.rs__menu [role="option"]').filter({ hasText: 'Miecz' })
  await expect(swordOption).toContainText('sword')
  await combobox.press('ArrowDown')
  await combobox.press('Enter')
  await expect(iconField.locator('[data-icon-name="sword"]')).toBeVisible()

  const saveResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/api/globals/homepage-sections'),
  )
  await page.getByRole('button', { name: 'Zapisz' }).click()
  expect((await saveResponse).ok()).toBe(true)

  const payload = await getPayload({ config })
  const savedHomepageSections = await payload.findGlobal({
    slug: 'homepage-sections',
    depth: 0,
    overrideAccess: true,
  })
  expect(savedHomepageSections.layout?.[1]?.blockType).toBe('card')
  const savedCard = savedHomepageSections.layout?.[1]
  expect(savedCard?.blockType === 'card' ? savedCard.links?.[0]?.iconName : undefined).toBe('sword')

  await page.goto('/')
  await expect(
    page.getByRole('link', { name: 'Sesje' }).locator('[data-icon-name="sword"]'),
  ).toHaveAttribute('data-icon-size', 'medium')
})

test('keeps the global header and footer on blog and CMS pages', async ({ page }) => {
  for (const path of ['/blog', '/o-nas']) {
    await page.goto(path)
    await expect(page.getByRole('navigation', { name: 'Główna nawigacja' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Nawigacja w stopce' })).toBeVisible()
  }
})

function createTestNavigation(aboutPageID: number): Partial<Navigation> {
  return {
    headerItems: [
      {
        appearance: 'link',
        customAddress: 'blog',
        customScheme: 'path',
        label: 'Aktualności',
        targetType: 'custom',
      },
      {
        appearance: 'link',
        customAddress: 'kontakt@example.invalid',
        customScheme: 'mailto',
        iconName: 'mail',
        label: '',
        targetType: 'custom',
      },
      {
        appearance: 'secondaryButton',
        label: 'O nas',
        page: aboutPageID,
        targetType: 'page',
      },
      {
        appearance: 'primaryButton',
        customAddress: 'dolacz',
        customScheme: 'path',
        label: 'Dołącz!',
        targetType: 'custom',
      },
    ],
  }
}

function createTestHeroItems(): NonNullable<HomepageHero['items']> {
  return [
    {
      appearance: 'link',
      customAddress: 'blog',
      customScheme: 'path',
      label: 'Gry RPG',
      targetType: 'custom',
    },
  ]
}

function createTestFooter(aboutPageID: number): Partial<Footer> {
  return {
    columns: [
      {
        alignment: 'left',
        items: [
          {
            appearance: 'link',
            customAddress: 'blog',
            customScheme: 'path',
            label: 'Aktualności',
            targetType: 'custom',
          },
        ],
        title: 'Lewa',
      },
      {
        alignment: 'center',
        items: [{ appearance: 'link', label: 'O nas', page: aboutPageID, targetType: 'page' }],
        title: 'Nawigacja',
      },
      {
        alignment: 'right',
        items: [
          {
            appearance: 'link',
            customAddress: 'kontakt',
            customScheme: 'path',
            label: 'Kontakt',
            targetType: 'custom',
          },
        ],
        title: 'Prawa',
      },
    ],
    contactHeading: 'E2E Kontakt',
    socialItems: [
      {
        appearance: 'link',
        customAddress: 'slack.example.invalid',
        customScheme: 'https',
        iconName: 'facebook',
        label: '',
        targetType: 'custom',
      },
    ],
  }
}

function createRichText(text: string, format = 0): HomepageHero['title'] {
  return {
    root: {
      children: [
        {
          children: [
            {
              detail: 0,
              format,
              mode: 'normal',
              style: '',
              text,
              type: 'text',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

function normalizeHomepageLayout(layout: HomepageSection['layout']): HomepageSection['layout'] {
  return layout.map((block) => (block.blockType === 'card' ? { ...block, image: null } : block))
}

async function updateGlobal(page: Page, slug: string, data: unknown): Promise<void> {
  const result = await page.evaluate(
    async ({ globalSlug, globalData }) => {
      const response = await fetch(`/api/globals/${globalSlug}`, {
        body: JSON.stringify(globalData),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })

      return {
        body: await response.text(),
        ok: response.ok,
        status: response.status,
      }
    },
    { globalData: data, globalSlug: slug },
  )

  expect(result, `Failed to update ${slug}: ${result.status} ${result.body}`).toMatchObject({
    ok: true,
  })
}
