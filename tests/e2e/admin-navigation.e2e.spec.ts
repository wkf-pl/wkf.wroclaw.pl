import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config'

import { createLocationFixture, deleteLocationFixture } from '../helpers/location-fixture'
import { login } from '../helpers/login'
import { administratorTestUser, editorTestUser } from '../helpers/seedUser'

test('searches the events list while typing and by the linked venue name', async ({ page }) => {
  const payload = await getPayload({ config })
  const venue = await createLocationFixture(payload, { venueName: 'Arena Asgard E2E' })
  const event = await payload.create({
    collection: 'events',
    draft: true,
    data: { title: 'Wikingowie w panelu E2E', slug: 'wikingowie-w-panelu-e2e', location: venue.id },
  })

  try {
    await login({ page, user: editorTestUser })
    const filter = new URLSearchParams({ 'where[id][equals]': String(event.id) })
    await page.goto(`/admin/collections/events?${filter}`)
    const input = page.locator('#search-filter-input')
    await expect(input).toHaveAttribute('aria-label', /Autor/)
    await expect(input).toHaveAttribute('aria-label', /Tematy/)
    for (const search of ['W', 'Wikin', 'Asgard']) {
      await input.fill(search)
      await expect(page).toHaveURL(new RegExp(`[?&]search=${search}(?:&|$)`))
      await expect(page.getByRole('link', { name: event.title, exact: true })).toBeVisible()
    }
    await input.fill('unmatched-event-title-e2e')
    await expect(page).toHaveURL(/search=unmatched-event-title-e2e/)
    await expect(page.getByRole('link', { name: event.title, exact: true })).toHaveCount(0)
  } finally {
    await payload.delete({ collection: 'events', id: event.id, trash: true })
    await deleteLocationFixture(payload, venue.venueName)
  }
})

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
    'Tematy',
    'Tagi',
    'Grupy tagów',
    'Media',
  ])
  await expect(
    navigation.getByRole('button', { name: 'Klubowe' }).locator('..').locator('a'),
  ).toHaveText(['Miejsca', 'Partnerzy'])
  await expect(navigation.getByRole('link', { name: 'Dokumenty', exact: true })).toHaveCount(0)
  await expect(
    navigation.getByRole('button', { name: 'Strona główna' }).locator('..').locator('a'),
  ).toHaveText(['Podstawowe', 'Nagłówek', 'Hero', 'Treści', 'Stopka'])

  await expect(
    navigation.getByRole('button', { name: 'Administracja' }).locator('..').locator('a'),
  ).toHaveText(['Aliasy adresów'])
  await expect(
    navigation.locator('#nav-url-aliases [data-icon-name="external-link"]'),
  ).toBeVisible()
  await expect(navigation.locator('#nav-locations [data-icon-name="location"]')).toBeVisible()
  await expect(
    navigation.locator('#nav-global-homepage-sections [data-icon-name="document"]'),
  ).toBeVisible()
  const groupLabels = await navigation.locator('.nav-group__label').allTextContents()
  expect(groupLabels).toEqual(['Treści', 'Klubowe', 'Strona główna', 'Administracja', 'Użytkownik'])
})

test('shows the tag group column and aligns it with the name in the tag editor', async ({
  page,
}) => {
  const payload = await getPayload({ config })
  const group = await payload.create({
    collection: 'tag-groups',
    data: { name: 'E2E Grupa tagu', slug: 'e2e-tag-list-group' },
  })
  try {
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'E2E Tag z grupą', slug: 'e2e-tag-list-tag', group: group.id },
    })
    try {
      await login({ page, user: editorTestUser })
      await page.goto('/admin/collections/tags')
      await expect(page.getByRole('columnheader', { name: 'Grupa tagów' })).toBeVisible()
      await expect(page.getByRole('cell', { name: group.name, exact: true })).toBeVisible()

      await page.goto(`/admin/collections/tags/${tag.id}`)
      const row = page
        .locator('.row__fields')
        .filter({ has: page.locator('#field-name') })
        .filter({ has: page.locator('#field-group') })
      await expect(row).toHaveCount(1)
      await expect(page.getByText('Powiązane dokumenty', { exact: true })).toHaveCount(0)
      const columns = row.locator(':scope > .field-type')
      const [nameBox, groupBox] = await Promise.all([
        columns.nth(0).boundingBox(),
        columns.nth(1).boundingBox(),
      ])
      expect(nameBox?.y).toBe(groupBox?.y)
      expect(nameBox?.width ?? 0).toBeGreaterThan(groupBox?.width ?? 0)

      await page.goto(`/admin/collections/tag-groups/${group.id}`)
      await expect(page.getByText('Tagi w grupie', { exact: true })).toBeVisible()
      await expect(page.getByRole('link', { name: tag.name, exact: true })).toBeVisible()
      const icon = page.locator('#field-iconName')
      await icon.getByRole('combobox').fill('book')
      await icon
        .getByRole('option')
        .filter({ has: page.locator('[data-icon-name="book"]') })
        .click()
      await page.getByRole('button', { name: 'Zapisz', exact: true }).click()
      await expect
        .poll(async () => {
          return (await payload.findByID({ collection: 'tag-groups', id: group.id })).iconName
        })
        .toBe('book')

      await page.goto('/admin/collections/tags')
      await expect(
        page.getByRole('cell', { name: tag.name, exact: true }).locator('[data-icon-name="book"]'),
      ).toBeVisible()
    } finally {
      await payload.delete({ collection: 'tags', id: tag.id })
    }
  } finally {
    await payload.delete({ collection: 'tag-groups', id: group.id })
  }
})

test('groups administrator navigation under Administracja', async ({ page }) => {
  await login({ page, user: administratorTestUser })

  const navigation = page.locator('aside nav')

  await expect(
    navigation.getByRole('button', { name: 'Administracja' }).locator('..').locator('a'),
  ).toHaveText([
    'Szablony stron',
    'Szablony widoków listingu',
    'Użytkownicy',
    'Grupy użytkowników',
    'Role',
  ])
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
  await expect(
    page.locator('aside nav').getByRole('link', { name: 'Szablony widoków listingu' }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('heading', { level: 3, name: 'Szablony widoków listingu' }),
  ).toHaveCount(0)

  // Editors still need to read published templates from the Listing editor.
  const result = await page.evaluate(async () => {
    const response = await fetch('/api/listing-views?limit=1')
    const { docs } = (await response.json()) as { docs?: { _status?: string }[] }
    return { status: response.status, docs }
  })
  expect(result.status).toBe(200)
  expect(result.docs).toHaveLength(1)
  expect(result.docs?.[0]._status).toBe('published')
})

test('shows the fixed page template collection to administrators', async ({ page }) => {
  test.setTimeout(60_000)
  await login({ page, user: administratorTestUser })

  await expect(
    page.locator('aside nav').getByRole('link', { name: 'Szablony stron', exact: true }),
  ).toHaveAttribute('href', '/admin/collections/page-templates')

  await page.goto('/admin/collections/page-templates')

  await expect(page).toHaveURL(/\/admin\/collections\/page-templates(?:\?.*)?$/)
  const templateTitle = page.getByRole('heading', { level: 1, name: 'Szablony stron' })
  await expect(templateTitle).toBeVisible()
  await expect(page.locator('.step-nav')).toContainText('Szablony stron')
  await expect(page.locator('.step-nav')).not.toContainText('Role')
  await expect(
    page.getByRole('button', { name: new RegExp(administratorTestUser.displayName) }),
  ).toBeVisible()

  await expect(page.getByRole('columnheader', { name: 'Szablon' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Dodaj/ })).toHaveCount(0)

  const collectionDescription = page.getByText(
    'Globalne układy tras kontrolowane przez aplikację. Typów szablonów nie można dodawać ani usuwać.',
    { exact: true },
  )
  await expect(collectionDescription).toBeVisible()

  const templateRow = page.getByRole('row').filter({
    has: page.getByText('/events/[slug]', { exact: true }),
  })
  await templateRow.getByRole('link').first().click()
  await expect(
    page.getByRole('heading', { name: 'Szczegóły wydarzenia', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.doc-header__after-header')).toContainText('/events/[slug]')
  await expect(collectionDescription).toHaveCount(0)

  await expect(page.getByText('Nowy renderer tej trasy nie został jeszcze wdrożony.')).toHaveCount(
    0,
  )
  await expect(page.getByRole('button', { name: /Usuń/ })).toHaveCount(0)

  await page.locator('#renderingMode').locator('xpath=../../..').click()
  await expect(page.getByRole('option', { name: 'Układ wbudowany' })).toHaveCount(0)
  await page.getByRole('option', { name: 'Układ z szablonu' }).click()
  const confirmation = page.getByRole('dialog')
  await expect(
    confirmation.getByRole('heading', { name: 'Przełączyć na układ z szablonu?' }),
  ).toBeVisible()
  await confirmation.getByRole('button', { name: 'Anuluj' }).click()
  await expect(page.getByText('Układ wbudowany', { exact: true }).first()).toBeVisible()
})

test('searches page templates by display name and key', async ({ page }) => {
  await login({ page, user: administratorTestUser })
  await page.goto('/admin/collections/page-templates')

  const search = page.locator('#search-filter-input')
  const template = page.getByRole('link', { name: /Szczegóły wydarzenia/ })
  const unrelatedTemplate = page.getByRole('link', { name: /Profil klubowicza/ })
  await expect(template).toBeVisible()
  await expect(unrelatedTemplate).toBeVisible()

  for (const term of ['szczegoly wydarzenia', 'event-detail']) {
    await search.fill(term)
    await expect(page).toHaveURL((url) => url.searchParams.get('search') === term)
    await expect(template).toBeVisible()
    await expect(unrelatedTemplate).toHaveCount(0)
  }

  await search.fill('missing-template-e2e')
  await expect(page).toHaveURL((url) => url.searchParams.get('search') === 'missing-template-e2e')
  await expect(template).toHaveCount(0)
})

test('restores a navigation group preference after reloading the panel', async ({ page }) => {
  await login({ page, user: editorTestUser })
  const group = page.locator('aside nav').getByRole('button', { name: 'Treści', exact: true })
  const savePreference = async (open: boolean) => {
    const response = await page.request.post('/api/payload-preferences/nav', {
      data: { value: { open: true, groups: { Treści: { open } } } },
      headers: { Origin: new URL(page.url()).origin },
    })
    expect(response.ok(), await response.text()).toBe(true)
  }

  try {
    await savePreference(true)
    await page.reload()
    await expect(group).toHaveClass(/nav-group__toggle--open/)

    await savePreference(false)
    await page.reload()
    await expect(group).toHaveClass(/nav-group__toggle--collapsed/)
  } finally {
    await savePreference(true)
  }
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
