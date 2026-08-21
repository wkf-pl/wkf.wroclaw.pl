import { expect, test } from '@playwright/test'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

test('renders dynamic labels for post content blocks', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/posts')
  await page.getByRole('link', { name: 'Erpegowe wtorki 1', exact: true }).click()
  await page.waitForURL('**/admin/collections/posts/*')

  const label = page.locator('.blocks-field__block-header .wkf-content-block-label').first()

  await expect(label).toBeVisible({ timeout: 15_000 })
  await expect(label.locator('strong')).toHaveText('Treść')
  await expect(label).toHaveText(
    'Treść: Erpegowe wtorki to regularne spotkania dla osób, które chcą zagrać, poprowadzić albo po prostu…',
  )
})

test('starts page and post forms with an expanded content block', async ({ page }) => {
  await login({ page, user: editorTestUser })

  for (const collection of ['pages', 'posts']) {
    await page.goto(`/admin/collections/${collection}/create`)

    const layoutField = page.locator('#field-layout')
    const block = layoutField.locator('.blocks-field__row').first()

    await expect(block).toBeVisible()
    await expect(block.locator('.wkf-content-block-label strong')).toHaveText('Treść')
    await expect(block.locator('.collapsible__toggle')).toHaveClass(/collapsible__toggle--open/)
    await expect(block.locator('.blocks-field__fields:visible').first()).toBeVisible()
  }
})

test('renders the customized page create form', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/pages/create')

  await expect(page.locator('.doc-controls__meta')).toContainText('Tworzenie nowej Strony')
  await expect(page.locator('#field-parent')).toContainText('<brak>')
  await expect(page.getByRole('textbox', { name: 'Streszczenie' })).toBeVisible()
  await expect(page.locator('#field-layout')).toContainText('Dodaj blok treści')
  await expect(page.locator('#field-layout [contenteditable="true"]')).toBeEditable()
})
