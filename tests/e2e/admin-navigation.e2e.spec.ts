import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config'

import { login } from '../helpers/login'
import { administratorTestUser, editorTestUser } from '../helpers/seedUser'

test('groups editor navigation with the intended labels and order', async ({ page }) => {
  await login({ page, user: editorTestUser })

  const navigation = page.locator('aside nav')

  await expect(
    navigation.getByRole('button', { name: 'Treści' }).locator('..').locator('a'),
  ).toHaveText([
    'Strony',
    'Wpisy',
    'Wydarzenia',
    'Cykle wydarzeń',
    'Rodzaje wydarzeń',
    'Kategorie',
    'Tagi',
    'Media',
    'Aliasy adresów',
  ])
  await expect(
    navigation.getByRole('button', { name: 'Klubowe' }).locator('..').locator('a'),
  ).toHaveText(['Dokumenty', 'Partnerzy'])
  await expect(
    navigation.getByRole('button', { name: 'Strona główna' }).locator('..').locator('a'),
  ).toHaveText(['Podstawowe', 'Nagłówek', 'Hero', 'Treści', 'Stopka'])

  const groupLabels = await navigation.locator('.nav-group__label').allTextContents()

  expect(groupLabels).toEqual(['Treści', 'Klubowe', 'Strona główna', 'Użytkownik'])
})

test('groups administrator navigation under Administracja', async ({ page }) => {
  await login({ page, user: administratorTestUser })

  const navigation = page.locator('aside nav')

  await expect(
    navigation.getByRole('button', { name: 'Administracja' }).locator('..'),
  ).toContainText('Szablony stronUżytkownicyRole')
  await expect(navigation.getByRole('button', { name: 'Klubowe' }).locator('..')).toContainText(
    'Wizytówki klubowiczów',
  )
  const groupLabels = await navigation.locator('.nav-group__label').allTextContents()

  expect(groupLabels).toEqual(['Klubowe', 'Administracja', 'Użytkownik'])
})

test('shows accessible collections on the administration dashboard', async ({ page }) => {
  await login({ page, user: administratorTestUser })

  await expect(page.getByRole('heading', { level: 2, name: 'Administracja' })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Szablony stron' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Pokaż wszystkie Szablony stron' })).toHaveAttribute(
    'href',
    '/admin/collections/page-templates',
  )
})

test('hides inaccessible collections from navigation and dashboard', async ({ page }) => {
  await login({ page, user: editorTestUser })

  await expect(page.locator('aside nav').getByRole('link', { name: 'Szablony stron' })).toHaveCount(
    0,
  )
  await expect(page.getByRole('heading', { level: 3, name: 'Szablony stron' })).toHaveCount(0)
})

test('shows the fixed page template collection to administrators', async ({ page }) => {
  test.setTimeout(60_000)
  await login({ page, user: administratorTestUser })

  await expect(page.getByRole('link', { name: 'Szablony stron' })).toHaveAttribute(
    'href',
    '/admin/collections/page-templates',
  )

  await page.goto('/admin/collections/roles')
  const collectionTitleBox = await page
    .getByRole('heading', { level: 1, name: 'Role' })
    .boundingBox()

  await page.goto('/admin/collections/page-templates')

  await expect(page).toHaveURL(/\/admin\/collections\/page-templates(?:\?.*)?$/)
  const templateTitle = page.getByRole('heading', { level: 1, name: 'Szablony stron' })
  await expect(templateTitle).toBeVisible()
  await expect(page.locator('.step-nav')).toContainText('Szablony stron')
  await expect(page.locator('.step-nav')).not.toContainText('Role')
  await expect(
    page.getByRole('button', { name: new RegExp(administratorTestUser.displayName) }),
  ).toBeVisible()

  const templateTitleBox = await templateTitle.boundingBox()
  expect(collectionTitleBox).not.toBeNull()
  expect(templateTitleBox).not.toBeNull()
  expect(Math.abs((templateTitleBox?.y ?? 0) - (collectionTitleBox?.y ?? 0))).toBeLessThanOrEqual(2)

  await expect(page.getByRole('row')).toHaveCount(10)
  await expect(page.getByRole('columnheader', { name: 'Szablon' })).toBeVisible()
  await expect(page.getByText('Dotychczasowy układ (legacy)', { exact: true })).toHaveCount(9)
  await expect(page.getByRole('link', { name: /Dodaj/ })).toHaveCount(0)

  const collectionDescription = page.getByText(
    'Globalne układy tras kontrolowane przez aplikację. Typów szablonów nie można dodawać ani usuwać.',
    { exact: true },
  )
  await expect(collectionDescription).toBeVisible()

  for (const { label, route } of [
    { label: 'Wydarzenia', route: '/events' },
    { label: 'Szczegóły wydarzenia', route: '/events/[slug]' },
  ]) {
    const templateRow = page.getByRole('row').filter({
      has: page.getByText(route, { exact: true }),
    })
    await templateRow.getByRole('link').first().click()
    await expect(page.getByRole('heading', { level: 1, name: label, exact: true })).toBeVisible()
    await expect(
      page.locator('.doc-header__after-header').getByText(route, { exact: true }),
    ).toBeVisible()
    await expect(collectionDescription).toHaveCount(0)
    await expect(page.locator('.page-template-identity')).toHaveCount(0)
    if (route === '/events') await page.goto('/admin/collections/page-templates')
  }
  await expect(page.getByText('Nowy renderer tej trasy nie został jeszcze wdrożony.')).toHaveCount(
    0,
  )
  await expect(page.getByRole('button', { name: /Usuń/ })).toHaveCount(0)

  await page.locator('#renderingMode').locator('xpath=../../..').click()
  await page.getByRole('option', { name: 'Układ z szablonu' }).click()
  const confirmation = page.getByRole('dialog')
  await expect(
    confirmation.getByRole('heading', { name: 'Przełączyć na układ z szablonu?' }),
  ).toBeVisible()
  await confirmation.getByRole('button', { name: 'Anuluj' }).click()
  await expect(
    page.getByText('Dotychczasowy układ (legacy)', { exact: true }).first(),
  ).toBeVisible()
})

test('denies non-administrators access to the page template collection', async ({ page }) => {
  await login({ page, user: editorTestUser })

  await page.goto('/admin/collections/page-templates')

  await expect(page).toHaveURL(/\/admin\/collections\/page-templates$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Nic nie znaleziono' })).toBeVisible()
})

test('shows the selected logo and compact header item controls', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/globals/navigation')

  await expect(page.locator('#field-logo')).toContainText(/logo-color(?:-\d+)?\.webp/)

  const headerItems = page.locator('#field-headerItems')
  const firstRow = headerItems
    .locator('.array-field__row')
    .filter({ hasText: 'Pozycja: Aktualności' })
    .first()
  await expect(firstRow).toBeVisible()
  const labelField = firstRow.locator('[id$="__label"]')
  if (!(await labelField.isVisible())) {
    await firstRow.getByRole('button', { name: 'Przełącz blok' }).click()
  }

  const appearanceField = firstRow.locator('[id$="__appearance"]')
  await expect(labelField).toBeVisible()
  await expect(appearanceField).toBeVisible()
  const [labelBox, appearanceBox] = await Promise.all([
    labelField.boundingBox(),
    appearanceField.boundingBox(),
  ])
  expect(labelBox).not.toBeNull()
  expect(appearanceBox).not.toBeNull()
  expect(appearanceBox?.x ?? 0).toBeGreaterThan((labelBox?.x ?? 0) + (labelBox?.width ?? 0))

  const addItemButton = headerItems.getByRole('button', { name: 'Dodaj pozycję' })
  await expect(addItemButton).toHaveCSS('color', 'rgb(52, 101, 164)')
  await expect(addItemButton.locator('.icon--plus .stroke')).toHaveCSS(
    'stroke',
    'rgb(52, 101, 164)',
  )
})

test('presents raster icon choices as a grouped grid', async ({ page }) => {
  const payload = await getPayload({ config })
  const editorUsers = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { email: { equals: editorTestUser.email } },
  })
  const editor = editorUsers.docs[0]
  if (!editor) {
    throw new Error('The editor test user must exist before updating navigation.')
  }

  const navigation = await payload.findGlobal({
    slug: 'navigation',
    depth: 0,
    overrideAccess: true,
  })
  const originalHeaderItems = navigation.headerItems ?? []
  const iconHeaderItems = [
    {
      appearance: 'link' as const,
      customAddress: 'larp',
      customScheme: 'path' as const,
      iconName: 'larp' as const,
      label: '',
      targetType: 'custom' as const,
    },
    ...originalHeaderItems.slice(1),
  ]

  await payload.updateGlobal({
    slug: 'navigation',
    data: { headerItems: iconHeaderItems },
    overrideAccess: true,
    user: editor,
  })

  try {
    await login({ page, user: editorTestUser })
    await page.goto('/admin/globals/navigation')

    const firstRow = page.locator('#field-headerItems .array-field__row').first()
    const iconField = firstRow.locator('[id$="__iconName"]')
    if (!(await iconField.isVisible())) {
      await firstRow.getByRole('button', { name: 'Przełącz blok' }).click()
    }

    await expect(iconField).toBeVisible()
    await iconField.getByRole('combobox').click()

    const iconGroups = page.locator('.raster-icon-picker .rs__group')
    await expect(iconGroups).toHaveCount(6)
    await expect(page.locator('.raster-icon-picker .rs__group-heading')).toHaveText([
      'Akcje i informacje',
      'Treści',
      'Gry',
      'Fantastyka',
      'Społeczność',
      'Kontakt',
    ])
    await expect(iconGroups.first().locator(':scope > div:last-child')).toHaveCSS('display', 'grid')
    await expect(page.locator('.raster-icon-picker [role="option"]')).toHaveCount(89)
    await page.keyboard.press('Escape')

    const clearIconButton = iconField.locator('.clear-indicator')
    await expect(clearIconButton).toBeVisible()
    await clearIconButton.click()
    await expect(iconField.locator('.raster-icon-picker__value')).toHaveCount(0)
  } finally {
    await payload.updateGlobal({
      slug: 'navigation',
      data: { headerItems: originalHeaderItems },
      overrideAccess: true,
      user: editor,
    })
  }
})
