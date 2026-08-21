import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'

import config from '../../src/payload.config.js'
import type { ClubSection, Media, Navigation, SiteSetting } from '../../src/payload-types.js'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

let originalNavigation: Navigation
let originalSiteSettings: SiteSetting
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
  await deleteTestClubSections(page, payload)
  await createTestClubSection(page, {
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
  })
  await createTestClubSection(
    page,
    {
      _status: 'draft',
      displayOrder: 2,
      name: 'E2E LARP',
      slug: 'e2e-larp',
    },
    true,
  )
  await updateGlobal(page, 'site-settings', { heroImage: heroMedia.id })
  await updateGlobal(page, 'navigation', createTestNavigation(aboutPage.id))
  await page.close()
})

test.afterAll(async ({ browser }) => {
  const payload = await getPayload({ config })
  const page = await browser.newPage()
  await login({ page, user: editorTestUser })
  await updateGlobal(page, 'site-settings', { heroImage: originalSiteSettings.heroImage })
  await updateGlobal(page, 'navigation', {
    footerColumns: originalNavigation.footerColumns,
    headerItems: originalNavigation.headerItems,
    heroItems: originalNavigation.heroItems,
    socialItems: originalNavigation.socialItems,
  })

  await payload.delete({ collection: 'media', id: heroMedia.id, overrideAccess: true })
  await deleteTestClubSections(page, payload)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'E2E RPG' })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'E2E LARP' })).toHaveCount(0)
  await page.close()
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

type TestClubSection = Pick<ClubSection, '_status' | 'displayOrder' | 'name' | 'slug'> &
  Partial<Pick<ClubSection, 'menuItems'>>

async function createTestClubSection(
  page: import('@playwright/test').Page,
  data: TestClubSection,
  draft = false,
): Promise<void> {
  const result = await page.evaluate(
    async ({ data, draft }) => {
      const response = await fetch(`/api/club-sections${draft ? '?draft=true' : ''}`, {
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      return { body: await response.text(), ok: response.ok }
    },
    { data, draft },
  )

  expect(result.ok, result.body).toBe(true)
}

async function deleteTestClubSections(
  page: import('@playwright/test').Page,
  payload: Payload,
): Promise<void> {
  const sections = await payload.find({
    collection: 'club-sections',
    depth: 0,
    overrideAccess: true,
    pagination: false,
    where: { slug: { in: ['e2e-rpg', 'e2e-larp'] } },
  })

  for (const section of sections.docs) {
    const result = await page.evaluate(async (sectionID) => {
      const response = await fetch(`/api/club-sections/${sectionID}`, { method: 'DELETE' })
      return { body: await response.text(), ok: response.ok }
    }, section.id)

    expect(result.ok, result.body).toBe(true)
  }
}

function createTestNavigation(aboutPageID: number): Partial<Navigation> {
  return {
    footerColumns: [
      {
        items: [{ label: 'O nas', page: aboutPageID, targetType: 'page' }],
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
  slug: 'navigation' | 'site-settings',
  data: Partial<Navigation> | Partial<SiteSetting>,
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
