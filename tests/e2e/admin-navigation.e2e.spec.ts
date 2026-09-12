import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { administratorTestUser, editorTestUser } from '../helpers/seedUser'

test('groups editor navigation with the intended labels and order', async ({ page }) => {
  await login({ page, user: editorTestUser })

  const navigation = page.locator('aside nav')

  await expect(
    navigation.getByRole('button', { name: 'Treści' }).locator('..').locator('a'),
  ).toHaveText(['Strony', 'Wpisy', 'Wydarzenia', 'Cykle wydarzeń', 'Kategorie', 'Tagi', 'Media'])
  await expect(
    navigation.getByRole('button', { name: 'Klubowe' }).locator('..').locator('a'),
  ).toHaveText(['Dokumenty', 'Partnerzy'])
  await expect(
    navigation.getByRole('button', { name: 'Strona główna' }).locator('..').locator('a'),
  ).toHaveText(['Podstawowe', 'Nagłówek', 'Hero', 'Sekcje', 'Stopka'])

  const groupLabels = await navigation.locator('.nav-group__label').allTextContents()

  expect(groupLabels).toEqual(['Treści', 'Klubowe', 'Strona główna', 'Użytkownik'])
})

test('groups administrator navigation under Administracja', async ({ page }) => {
  await login({ page, user: administratorTestUser })

  const navigation = page.locator('aside nav')

  await expect(
    navigation.getByRole('button', { name: 'Administracja' }).locator('..'),
  ).toContainText('UżytkownicyRole')

  const groupLabels = await navigation.locator('.nav-group__label').allTextContents()

  expect(groupLabels).toEqual(['Administracja', 'Użytkownik'])
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
  await login({ page, user: editorTestUser })
  await page.goto('/admin/globals/navigation')

  const headerItems = page.locator('#field-headerItems')
  const firstRow = headerItems.locator('.array-field__row').first()
  const appearanceField = firstRow.locator('[id$="__appearance"]')

  if (!(await appearanceField.isVisible())) {
    await firstRow.getByRole('button', { name: 'Przełącz blok' }).click()
  }

  await appearanceField.getByRole('combobox').click()
  await page.getByRole('option', { name: 'Ikona', exact: true }).click()

  const iconField = firstRow.locator('[id$="__iconName"]')
  await expect(iconField).toBeVisible()
  await iconField.getByRole('combobox').click()

  const iconGroups = page.locator('.raster-icon-picker .rs__group')
  await expect(iconGroups).toHaveCount(7)
  await expect(iconGroups.first().locator(':scope > div:last-child')).toHaveCSS('display', 'grid')
  await expect(page.locator('.raster-icon-picker [role="option"]')).toHaveCount(63)
})
