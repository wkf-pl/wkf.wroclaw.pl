import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

test('shows eight block tiles per row on a wide admin viewport', async ({ page }) => {
  await page.setViewportSize({ height: 1080, width: 1920 })
  await login({ page, user: editorTestUser })
  await page.goto('/admin/globals/homepage-sections')

  const layoutField = page.locator('#field-layout')
  const contentTab = page.getByRole('button', { name: 'Treść', exact: true })
  await expect(async () => {
    await contentTab.click()
    await expect(layoutField).toBeVisible({ timeout: 2_000 })
  }).toPass({ intervals: [500, 1_000], timeout: 15_000 })

  const drawerToggler = layoutField.locator(':scope > .blocks-field__drawer-toggler')
  await drawerToggler.click()

  const blockGrid = page.locator('.drawer--is-open .blocks-drawer__blocks').first()
  await expect(blockGrid).toBeVisible()

  const layout = await blockGrid.evaluate((element) => {
    const gridTemplateColumns = getComputedStyle(element).gridTemplateColumns

    return {
      columnCount: gridTemplateColumns.split(' ').length,
      gridTemplateColumns,
      viewportWidth: window.innerWidth,
    }
  })

  expect(layout, JSON.stringify(layout)).toMatchObject({
    columnCount: 8,
    viewportWidth: 1920,
  })
})
