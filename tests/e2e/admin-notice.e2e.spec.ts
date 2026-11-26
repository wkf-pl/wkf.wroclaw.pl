import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import { login } from '../helpers/login'
import { administratorTestUser, editorTestUser } from '../helpers/seedUser'

const slug = 'admin-notice'
const settingsLabel = 'Powiadomienie administracyjne'
const message = 'Planowana przerwa serwisowa'
const activeNoticePath = '/api/globals/admin-notice/active'

test.use({ actionTimeout: 15_000, timezoneId: 'America/New_York' })
test.setTimeout(90_000)

test.afterEach(async () => {
  const payload = await getPayload({ config })
  await payload.updateGlobal({
    slug,
    data: { enabled: false, message: null, startsAt: null, endsAt: null },
  })
})

test('saves the Warsaw schedule from a browser in another time zone', async ({ page }) => {
  const payload = await getPayload({ config })
  await page.setViewportSize({ width: 1536, height: 900 })
  await login({ page, user: administratorTestUser })
  expect(await page.evaluate(() => Intl.DateTimeFormat().resolvedOptions().timeZone)).toBe(
    'America/New_York',
  )
  await page.locator('aside nav').getByRole('link', { name: settingsLabel }).click()
  await expect(page).toHaveURL('/admin/globals/admin-notice')
  await page.getByRole('switch', { name: /^Włączone/ }).check()
  await page.getByRole('textbox', { name: 'Treść' }).fill(message)
  const startInput = page.locator('#field-startsAt .date-time-picker input')
  const endInput = page.locator('#field-endsAt .date-time-picker input')
  await startInput.fill('15 lipca 2030, 20:17')
  await startInput.press('Tab')
  await endInput.fill('15 grudnia 2030, 22:41')
  await endInput.press('Tab')
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click()

  await expect
    .poll(() => payload.findGlobal({ slug }))
    .toMatchObject({
      enabled: true,
      message,
      startsAt: '2030-07-15T18:17:00.000Z',
      endsAt: '2030-12-15T21:41:00.000Z',
    })
  await page.reload()
  await expect(startInput).toHaveValue('15 lipca 2030, 20:17')
  await expect(endInput).toHaveValue('15 grudnia 2030, 22:41')
  await expect(page.locator('.wkf-admin-notice')).toHaveCount(0)
})

test('shows the notice across admin screens and keeps it off public and login pages', async ({
  page,
}) => {
  const payload = await getPayload({ config })
  const now = Date.now()
  await payload.updateGlobal({
    slug,
    data: {
      enabled: true,
      message,
      startsAt: new Date(now - 60_000).toISOString(),
      endsAt: new Date(now + 300_000).toISOString(),
    },
  })
  await login({ page, user: editorTestUser })
  const banner = page.locator('[aria-live="polite"]').getByText(message)
  await expect(banner).toBeVisible()
  await expect(page.locator('aside nav').getByRole('link', { name: settingsLabel })).toHaveCount(0)
  for (const path of [
    '/admin/collections/posts',
    '/admin/collections/posts/create',
    '/admin/account',
  ]) {
    await page.goto(path)
    await expect(page).toHaveURL(path)
    await expect(banner).toBeVisible()
  }

  const { docs: memberRoles } = await payload.find({
    collection: 'roles',
    depth: 0,
    limit: 1,
    where: { key: { equals: 'member' } },
  })
  const memberRole = memberRoles[0]
  if (!memberRole) throw new Error('Missing migrated member role')
  const memberLogin = { email: 'admin-notice-member@example.invalid', password: 'notice-test' }
  const member = await payload.create({
    collection: 'users',
    data: { ...memberLogin, displayName: 'Member for admin notice test', roles: [memberRole.id] },
  })

  try {
    await page.setViewportSize({ width: 390, height: 844 })
    await login({ page, user: memberLogin })
    await page.goto('/admin/profile')
    await expect(page).toHaveURL('/admin/profile')
    await expect(banner).toBeVisible()
    await expect(banner).toBeInViewport()

    await page.goto('/')
    await expect(page.getByText(message)).toHaveCount(0)
    await page.context().clearCookies()
    await page.goto('/admin/login')
    await expect(page).toHaveURL('/admin/login')
    await expect(page.getByText(message)).toHaveCount(0)
  } finally {
    await payload.delete({ collection: 'users', id: member.id })
  }
})

test('starts and expires in an open form even when the expiry recheck fails', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await Promise.all([
    page.waitForResponse(activeNoticePath),
    page.goto('/admin/collections/posts/create'),
  ])
  const title = page.locator('#field-title')
  await title.fill('Niezapisany tytuł')

  const payload = await getPayload({ config })
  const now = Date.now()
  await payload.updateGlobal({
    slug,
    data: {
      enabled: true,
      message,
      startsAt: new Date(now + 4_000).toISOString(),
      endsAt: new Date(now + 9_000).toISOString(),
    },
  })

  const nextCheck = page.waitForResponse(activeNoticePath, { timeout: 10_000 })
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect((await nextCheck).json()).resolves.toMatchObject({ notice: null })
  const banner = page.locator('[aria-live="polite"]').getByText(message)
  await expect(banner).toBeVisible({ timeout: 10_000 })

  await page.route(activeNoticePath, (route) => route.fulfill({ status: 503 }))
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().endsWith(activeNoticePath) && response.status() === 503,
      { timeout: 10_000 },
    ),
    expect(banner).toHaveCount(0, { timeout: 10_000 }),
  ])
  await expect(title).toHaveValue('Niezapisany tytuł')
  await expect(page).toHaveURL('/admin/collections/posts/create')
})
