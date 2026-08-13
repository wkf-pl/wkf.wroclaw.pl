import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'
import type { Navigation } from '../../src/payload-types.js'

let originalNavigation: Navigation

test.beforeAll(async () => {
  const payload = await getPayload({ config })
  originalNavigation = await payload.findGlobal({
    slug: 'navigation',
    depth: 0,
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
          url: '/blog',
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
          items: [{ label: 'Aktualności', targetType: 'custom', url: '/blog' }],
          title: 'Nawigacja',
        },
      ],
      headerItems: [
        { appearance: 'link', label: 'Aktualności', targetType: 'custom', url: '/blog' },
        {
          appearance: 'icon',
          iconSource: 'system',
          label: 'E-mail',
          systemIcon: 'mail',
          targetType: 'custom',
          url: 'mailto:kontakt@example.invalid',
        },
        { appearance: 'button', label: 'O nas', targetType: 'custom', url: '/o-nas' },
      ],
      heroItems: [{ label: 'Gry RPG', targetType: 'custom', url: '/blog' }],
      socialItems: [
        {
          iconSource: 'system',
          label: 'Discord',
          systemIcon: 'discord',
          targetType: 'custom',
          url: 'https://discord.example.invalid',
        },
      ],
    },
    overrideAccess: true,
  })
})

test.afterAll(async () => {
  const payload = await getPayload({ config })
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

  await expect(page.getByRole('navigation', { name: 'Główna nawigacja' })).toContainText(
    'Aktualności',
  )
  await expect(page.getByRole('link', { name: 'E-mail' })).toHaveAttribute(
    'href',
    'mailto:kontakt@example.invalid',
  )
  await expect(page.getByRole('link', { name: 'O nas' })).toHaveClass(/headerMenuItem-button/)
  await expect(page.getByRole('navigation', { name: 'Obszary klubu' })).toContainText('Gry RPG')
  await expect(page.getByRole('heading', { name: 'E2E RPG' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'E2E LARP' })).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Media społecznościowe' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Nawigacja w stopce' })).toContainText(
    'Aktualności',
  )
})

test('keeps the global header and footer on blog and CMS pages', async ({ page }) => {
  for (const path of ['/blog', '/o-nas']) {
    await page.goto(path)
    await expect(page.getByRole('navigation', { name: 'Główna nawigacja' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Nawigacja w stopce' })).toBeVisible()
  }
})
