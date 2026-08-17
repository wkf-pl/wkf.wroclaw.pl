import sharp from 'sharp'
import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import { createRichTextDocument } from '../../src/modules/members/rich-text.js'
import type { MemberProfile, Page, Role, User } from '../../src/payload-types.js'
import config from '../../src/payload.config.js'
import { login } from '../helpers/login'

const profileOwnerUser = {
  displayName: 'Codex Member Profile Owner E2E',
  email: 'codex-member-profile-owner-e2e@example.invalid',
  password: 'test',
}
const photoOwnerUser = {
  displayName: 'Codex Member Profile Photo E2E',
  email: 'codex-member-profile-photo-e2e@example.invalid',
  password: 'test',
}
const profileCreatorUser = {
  displayName: 'Codex Member Profile Creator E2E',
  email: 'codex-member-profile-creator-e2e@example.invalid',
  password: 'test',
}
const ordinaryUser = {
  displayName: 'Codex Ordinary User E2E',
  email: 'codex-ordinary-user-e2e@example.invalid',
  password: 'test',
}
const testEmails = [
  profileOwnerUser.email,
  photoOwnerUser.email,
  profileCreatorUser.email,
  ordinaryUser.email,
]

let owner: User
let ownerProfile: MemberProfile
let embeddedPage: Page

async function findRole(key: string): Promise<Role> {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'roles',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { key: { equals: key } },
  })
  if (!result.docs[0]) throw new Error(`The ${key} role must exist before running E2E tests.`)
  return result.docs[0]
}

async function createUser(user: typeof profileOwnerUser, role: Role): Promise<User> {
  const payload = await getPayload({ config })
  return payload.create({
    collection: 'users',
    data: { ...user, roles: [role.id] },
    depth: 1,
    overrideAccess: true,
  })
}

async function cleanupMemberProfileFixtures(): Promise<void> {
  const payload = await getPayload({ config })
  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: { slug: { equals: 'integration-member-profiles-e2e' } },
  })
  await payload.delete({
    collection: 'users',
    overrideAccess: true,
    where: { email: { in: testEmails } },
  })
}

test.beforeAll(async () => {
  const payload = await getPayload({ config })
  await cleanupMemberProfileFixtures()
  const [memberRole, userRole] = await Promise.all([findRole('member'), findRole('user')])
  const photoOwner = await createUser(photoOwnerUser, memberRole)
  ;[owner] = await Promise.all([
    createUser(profileOwnerUser, memberRole),
    createUser(profileCreatorUser, memberRole),
    createUser(ordinaryUser, userRole),
  ])

  ownerProfile = await payload.create({
    collection: 'member-profiles',
    data: {
      _status: 'published',
      about: createRichTextDocument([
        'Organizuję spotkania dla nowych osób i pomagam im znaleźć odpowiednie aktywności klubowe.',
      ]),
      clubFunction: 'Opiekunka nowych klubowiczów',
      contactChannels: [
        { type: 'email', url: 'member-profile-e2e@example.invalid' },
        { type: 'website', url: 'https://example.com/member-profile-e2e' },
      ],
      owner: owner.id,
      publicName: 'Alicja Bez Zdjęcia',
      slug: 'generated-by-hook',
    },
    draft: false,
    overrideAccess: false,
    user: owner,
  })

  const avif = await sharp({
    create: { background: '#284e66', channels: 4, height: 640, width: 640 },
  })
    .avif()
    .toBuffer()
  const photo = await payload.create({
    collection: 'member-profile-images',
    data: { owner: photoOwner.id },
    file: {
      data: avif,
      mimetype: 'image/avif',
      name: 'member-profile-e2e.avif',
      size: avif.length,
    },
    overrideAccess: false,
    user: photoOwner,
  })
  await payload.create({
    collection: 'member-profiles',
    data: {
      _status: 'published',
      about: createRichTextDocument([
        'Prowadzę sesje gier fabularnych i wspieram klubowe wydarzenia poświęcone fantastyce naukowej.',
      ]),
      games: [{ runs: true, title: 'Alien RPG' }],
      owner: photoOwner.id,
      photo: photo.id,
      publicName: 'Borys AVIF',
      slug: 'generated-by-hook',
    },
    draft: false,
    overrideAccess: false,
    user: photoOwner,
  })
  embeddedPage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      author: owner.id,
      layout: [
        {
          blockType: 'memberProfiles',
          entries: [{ contextLabel: 'Prezes Zarządu', profile: ownerProfile.id }],
          heading: 'Władze testowe',
        },
      ],
      slug: 'integration-member-profiles-e2e',
      title: 'Integration member profiles E2E',
    },
    overrideAccess: true,
  })
})

test.afterAll(async () => {
  await cleanupMemberProfileFixtures()
})

test('renders the catalogue, rich profile, default avatar, AVIF derivative, and contacts', async ({
  page,
}) => {
  await page.goto('/members')

  const cards = page.locator('.memberCard')
  const aliceCard = cards.filter({ hasText: 'Alicja Bez Zdjęcia' })
  const borysCard = cards.filter({ hasText: 'Borys AVIF' })
  await expect(aliceCard).toHaveCount(1)
  await expect(borysCard).toHaveCount(1)
  await expect(aliceCard).toContainText('Opiekunka nowych klubowiczów')
  await expect(aliceCard.locator('img')).toHaveAttribute(
    'src',
    '/assets/member-profile-placeholder.svg',
  )
  await expect(borysCard.locator('img')).toHaveAttribute('src', /\.webp\?prefix=member-profiles/)

  await page.goto(`/members/${ownerProfile.slug}`)
  await expect(page.getByRole('heading', { level: 1, name: 'Alicja Bez Zdjęcia' })).toBeVisible()
  await expect(page.getByText('Organizuję spotkania dla nowych osób')).toBeVisible()
  await expect(page.getByTitle('E-mail')).toHaveAttribute(
    'href',
    'mailto:member-profile-e2e@example.invalid',
  )
  await expect(page.getByTitle('Strona WWW')).toHaveAttribute(
    'href',
    'https://example.com/member-profile-e2e',
  )
})

test('renders an embedded profile with its contextual label instead of the club function', async ({
  page,
}) => {
  await page.goto(`/${embeddedPage.slug}`)

  await expect(page.getByRole('heading', { level: 2, name: 'Władze testowe' })).toBeVisible()
  await expect(page.getByText('Prezes Zarządu')).toBeVisible()
  await expect(page.getByText('Opiekunka nowych klubowiczów')).toHaveCount(0)
  await expect(page.getByRole('link', { exact: true, name: 'Alicja Bez Zdjęcia' })).toBeVisible()
})

test('opens a member profile from account and publishes the automatically created draft', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await login({ page, user: profileCreatorUser })
  await page.goto('/admin/account')

  await expect(page.getByRole('link', { name: 'Wizytówka publiczna' })).toBeVisible()
  await page.locator('.wkf-user-menu__trigger').click()
  const menuItems = page.locator('.wkf-user-menu__popup').locator('a, button')
  await expect(menuItems).toHaveText(['Konto', 'Wizytówka', 'Wyloguj'])

  await page.locator('.wkf-user-menu__popup').getByText('Wizytówka', { exact: true }).click()
  await expect(page).toHaveURL('/admin/profile')
  await expect(page.getByRole('button', { name: 'Podstawowe informacje' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Działalność klubowa' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Kontakt' })).toBeVisible()
  await expect(page.locator('#field-publicName')).toHaveValue(profileCreatorUser.displayName)

  await page.locator('#field-publicName').fill('Celina E2E')
  await page.getByRole('button', { name: /^Opublikuj/ }).click()
  await expect(
    page.locator('.doc-controls__status').getByText('Opublikowano', { exact: true }),
  ).toBeVisible({ timeout: 20_000 })

  await page.goto('/members/codex-member-profile-creator-e2e')
  await expect(page.getByRole('heading', { level: 1, name: 'Celina E2E' })).toBeVisible()
})

test('shows the profile address and automatically resolved display locations in the sidebar', async ({
  page,
}) => {
  test.setTimeout(60_000)
  await login({ page, user: profileOwnerUser })
  await page.goto('/admin/profile')

  await expect(page.locator('.wkf-profile-sidebar-field')).toContainText(
    `/members/${ownerProfile.slug}`,
  )
  await expect(page.locator('.wkf-profile-usage')).toContainText(`/members/${ownerProfile.slug}`)
  await expect(page.locator('.wkf-profile-usage')).toContainText('/members')
  await expect(page.locator('.wkf-profile-usage')).toContainText(embeddedPage.title)
})

test('does not expose profile controls to a user without the member role', async ({ page }) => {
  await login({ page, user: ordinaryUser })
  await page.goto('/admin/account')

  await expect(page.getByRole('link', { name: 'Wizytówka publiczna' })).toHaveCount(0)
  await page.locator('.wkf-user-menu__trigger').click()
  await expect(
    page.locator('.wkf-user-menu__popup').getByText('Wizytówka', { exact: true }),
  ).toHaveCount(0)

  await page.goto('/admin/profile')
  await expect(page).toHaveURL('/admin/account')
})
