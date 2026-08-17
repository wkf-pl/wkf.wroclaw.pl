import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '../../src/payload.config.js'
import type { Media, Navigation, SiteSetting } from '../../src/payload-types.js'

let originalNavigation: Navigation
let originalSiteSettings: SiteSetting
let heroMedia: Media

test.beforeAll(async () => {
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
  await payload.updateGlobal({
    slug: 'site-settings',
    data: { heroImage: heroMedia.id },
    overrideAccess: true,
  })

  await payload.delete({
    collection: 'club-sections',
    overrideAccess: true,
    where: { slug: { in: ['e2e-rpg', 'e2e-larp'] } },
  })
  await payload.create({
    collection: 'club-sections',
    data: {
      _status: 'published',
      displayOrder: 1,
      menuItems: [
        {
          iconSource: 'system',
          label: 'Sesje',
          systemIcon: 'dice',
          targetType: 'custom',
          customAddress: 'blog',
          customScheme: 'path',
        },
      ],
      name: 'E2E RPG',
      slug: 'e2e-rpg',
    },
    overrideAccess: true,
  })
  await payload.create({
    collection: 'club-sections',
    data: {
      _status: 'draft',
      displayOrder: 2,
      name: 'E2E LARP',
      slug: 'e2e-larp',
    },
    draft: true,
    overrideAccess: true,
  })
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      footerColumns: [
        {
          items: [
            {
              label: 'O nas',
              page: aboutPage.id,
              targetType: 'page',
            },
          ],
          title: 'Nawigacja',
        },
      ],
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
          iconSource: 'system',
          label: 'E-mail',
          systemIcon: 'mail',
          targetType: 'custom',
          customAddress: 'kontakt@example.invalid',
          customScheme: 'mailto',
        },
        {
          appearance: 'button',
          label: 'O nas',
          page: aboutPage.id,
          targetType: 'page',
        },
      ],
      heroItems: [
        {
          customAddress: 'blog',
          customScheme: 'path',
          label: 'Gry RPG',
          targetType: 'custom',
        },
      ],
      socialItems: [
        {
          iconSource: 'system',
          label: 'Slack',
          systemIcon: 'facebook',
          targetType: 'custom',
          customAddress: 'slack.example.invalid',
          customScheme: 'https',
        },
      ],
    },
    overrideAccess: true,
  })
})

test.afterAll(async () => {
  const payload = await getPayload({ config })
  await payload.updateGlobal({
    slug: 'site-settings',
    data: { heroImage: originalSiteSettings.heroImage },
    overrideAccess: true,
  })
  await payload.delete({ collection: 'media', id: heroMedia.id, overrideAccess: true })
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      footerColumns: originalNavigation.footerColumns,
      headerItems: originalNavigation.headerItems,
      heroItems: originalNavigation.heroItems,
      socialItems: originalNavigation.socialItems,
    },
    overrideAccess: true,
  })
  await payload.delete({
    collection: 'club-sections',
    overrideAccess: true,
    where: { slug: { in: ['e2e-rpg', 'e2e-larp'] } },
  })
})

test('renders editable menus and only published club sections on the home page', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.locator('.homeHeroImage')).toHaveAttribute('src', /e2e-home-hero\.png/)
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
  await expect(page.getByRole('navigation', { name: 'Nawigacja w stopce' })).toContainText(
    'O nas',
  )
  await expect(
    page.getByRole('navigation', { name: 'Nawigacja w stopce' }).getByRole('link', { name: 'O nas' }),
  ).toHaveAttribute('href', '/o-nas')
})

test('keeps the global header and footer on blog and CMS pages', async ({ page }) => {
  for (const path of ['/blog', '/o-nas']) {
    await page.goto(path)
    await expect(page.getByRole('navigation', { name: 'Główna nawigacja' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Nawigacja w stopce' })).toBeVisible()
  }
})
