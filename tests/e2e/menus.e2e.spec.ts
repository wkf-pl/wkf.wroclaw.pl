import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '../../src/payload.config.js'
import type {
  Footer,
  HomepageHero,
  HomepageSection,
  Media,
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
let heroMedia: Media

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
    depth: 0,
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

  const heroImageData = await sharp({
    create: { background: '#b55a2a', channels: 4, height: 48, width: 96 },
  })
    .png()
    .toBuffer()
  heroMedia = await payload.create({
    collection: 'media',
    data: { alt: 'E2E Hero' },
    file: {
      data: heroImageData,
      mimetype: 'image/png',
      name: 'e2e-home-hero.png',
      size: heroImageData.length,
    },
    overrideAccess: true,
  })
  const page = await browser.newPage()
  await login({ page, user: editorTestUser })
  await updateGlobal(page, 'site-settings', { siteName: 'E2E Klub Fantastyki' })
  await updateGlobal(page, 'navigation', {
    ...createTestNavigation(aboutPage.id),
    logo: originalNavigation.logo,
  })
  await updateGlobal(page, 'homepage-hero', {
    image: heroMedia.id,
    items: createTestHeroItems(),
    title: createRichText('E2E Hero', 2),
  })
  await updateGlobal(page, 'homepage-sections', {
    eventsTitle: 'E2E Wydarzenia',
    groups: [
      {
        backgroundImage: heroMedia.id,
        menuItems: [
          {
            customAddress: 'blog',
            customScheme: 'path',
            iconSource: 'system',
            label: 'Sesje',
            systemIcon: 'dice',
            targetType: 'custom',
          },
        ],
        name: 'E2E RPG',
      },
    ],
    newsTitle: 'E2E Aktualności',
    sectionsTitle: 'E2E Sekcje',
  })
  await updateGlobal(page, 'footer', createTestFooter(aboutPage.id))
  await page.close()
})

test.afterAll(async ({ browser }) => {
  const payload = await getPayload({ config })
  const page = await browser.newPage()
  await login({ page, user: editorTestUser })
  await updateGlobal(page, 'site-settings', {
    contactEmail: originalSiteSettings.contactEmail,
    siteDescription: originalSiteSettings.siteDescription,
    siteName: originalSiteSettings.siteName,
  })
  await updateGlobal(page, 'navigation', {
    headerItems: originalNavigation.headerItems,
    logo: originalNavigation.logo,
  })
  await updateGlobal(page, 'homepage-hero', {
    content: originalHomepageHero.content,
    image: originalHomepageHero.image,
    items: originalHomepageHero.items,
    title: originalHomepageHero.title,
  })
  await updateGlobal(page, 'homepage-sections', {
    eventSlideLimit: originalHomepageSections.eventSlideLimit,
    eventsContent: originalHomepageSections.eventsContent,
    eventsTitle: originalHomepageSections.eventsTitle,
    eventWindowWeeks: originalHomepageSections.eventWindowWeeks,
    groups: originalHomepageSections.groups,
    newsTitle: originalHomepageSections.newsTitle,
    postCount: originalHomepageSections.postCount,
    sectionsTitle: originalHomepageSections.sectionsTitle,
  })
  await updateGlobal(page, 'footer', {
    columns: originalFooter.columns,
    contactHeading: originalFooter.contactHeading,
    content: originalFooter.content,
    copyright: originalFooter.copyright,
    socialItems: originalFooter.socialItems,
  })

  await payload.delete({ collection: 'media', id: heroMedia.id, overrideAccess: true })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'E2E RPG' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'E2E LARP' })).toHaveCount(0)
  await page.close()
})

test('renders editable menus and configured groups on the home page', async ({ page }) => {
  await page.goto('/')

  await expect(page.locator('.homeHeroImage')).toHaveAttribute('src', /e2e-home-hero\.png/)
  await expect(page.locator('.siteBrand img')).toHaveAttribute('src', /logo-color\.webp/)
  await expect(
    page.getByRole('link', { name: /E2E Klub Fantastyki — strona główna/ }),
  ).toBeVisible()
  await expect(page.getByRole('heading', { level: 1, name: 'E2E Hero' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'E2E Aktualności' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'E2E Sekcje' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Główna nawigacja' })).toContainText(
    'Aktualności',
  )
  await expect(page.getByRole('link', { name: 'E-mail' })).toHaveAttribute(
    'href',
    'mailto:kontakt@example.invalid',
  )
  const aboutHeaderLink = page
    .getByRole('navigation', { name: 'Główna nawigacja' })
    .getByRole('link', { name: 'O nas' })
  await expect(aboutHeaderLink).toHaveClass(/headerMenuItem-button/)
  await expect(aboutHeaderLink).toHaveAttribute('href', '/o-nas')
  await expect(page.getByRole('navigation', { name: 'Obszary klubu' })).toContainText('Gry RPG')
  await expect(page.getByRole('heading', { name: 'E2E RPG' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'E2E LARP' })).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Media społecznościowe' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Slack' })).toHaveAttribute(
    'href',
    'https://slack.example.invalid',
  )
  await expect(page.getByRole('navigation', { name: 'Nawigacja w stopce' })).toContainText('O nas')
  await expect(
    page
      .getByRole('navigation', { name: 'Nawigacja w stopce' })
      .getByRole('link', { name: 'O nas' }),
  ).toHaveAttribute('href', '/o-nas')
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
        appearance: 'icon',
        customAddress: 'kontakt@example.invalid',
        customScheme: 'mailto',
        iconSource: 'system',
        label: 'E-mail',
        systemIcon: 'mail',
        targetType: 'custom',
      },
      {
        appearance: 'button',
        label: 'O nas',
        page: aboutPageID,
        targetType: 'page',
      },
    ],
  }
}

function createTestHeroItems(): NonNullable<HomepageHero['items']> {
  return [
    {
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
        items: [{ label: 'O nas', page: aboutPageID, targetType: 'page' }],
        title: 'Nawigacja',
      },
    ],
    contactHeading: 'E2E Kontakt',
    socialItems: [
      {
        customAddress: 'slack.example.invalid',
        customScheme: 'https',
        iconSource: 'system',
        label: 'Slack',
        systemIcon: 'facebook',
        targetType: 'custom',
      },
    ],
  }
}

async function updateGlobal(
  page: import('@playwright/test').Page,
  slug: 'footer' | 'homepage-hero' | 'homepage-sections' | 'navigation' | 'site-settings',
  data:
    | Partial<Footer>
    | Partial<HomepageHero>
    | Partial<HomepageSection>
    | Partial<Navigation>
    | Partial<SiteSetting>,
): Promise<void> {
  const result = await page.evaluate(
    async ({ data, slug }) => {
      const response = await fetch(`/api/globals/${slug}`, {
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      return { body: await response.text(), ok: response.ok }
    },
    { data, slug },
  )

  expect(result.ok, result.body).toBe(true)
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
