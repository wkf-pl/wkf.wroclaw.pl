import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'

import {
  createPublishedDocumentFixture,
  deletePublishedDocumentFixture,
} from '../helpers/documentFixture'
import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const documentFixtureName = 'e2e-rich-text-link-document'
let payload: Payload
let dynamicLabelPostID: number | string

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await createPublishedDocumentFixture(payload, documentFixtureName)
  const posts = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'erpegowe-wtorki-1' } },
  })
  const dynamicLabelPost = posts.docs[0]

  if (!dynamicLabelPost) {
    throw new Error('Missing the seeded post required by the dynamic block label E2E test.')
  }

  dynamicLabelPostID = dynamicLabelPost.id
})

test.afterAll(async () => {
  if (payload) {
    await deletePublishedDocumentFixture(payload, documentFixtureName)
  }
})

test('renders dynamic labels for post content blocks', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/posts/${dynamicLabelPostID}`)

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

test('uses the shared target selector when editing a rich text link', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/posts/create')

  const editor = page.locator('#field-layout [contenteditable="true"]').first()
  await editor.fill('Odnośnik testowy')
  await editor.selectText()
  await page.locator('[data-button-key="link"]').click()

  const drawer = page.locator('.lexical-link-edit-drawer')
  const targetField = drawer.locator('#field-targetType')
  await expect(page.getByRole('heading', { name: 'Edytuj Link' })).toBeVisible()
  await expect(targetField).toBeVisible()
  await expect(drawer.locator('#field-linkType')).toBeHidden()
  await expect(drawer.locator('#field-doc')).toBeHidden()

  await targetField.getByRole('combobox').click()
  const options = page.locator('.rs__menu [role="option"]')
  await expect(options.first()).toHaveText('Własny adres')
  await options.filter({ hasText: 'Dokument' }).click()

  const documentField = drawer.locator('#field-document')
  await expect(documentField).toBeVisible()
  await expect(drawer.getByText('Otwórz w nowej karcie', { exact: true })).toBeVisible()

  await documentField.getByRole('combobox').click()
  const documentOption = page.locator('.rs__menu [role="option"]').first()
  const documentLabel = (await documentOption.textContent())?.trim()
  expect(documentLabel).toBeTruthy()
  await documentOption.click()
  await expect(drawer.locator('#field-doc')).toHaveValue('[object Object]')
  await drawer.getByRole('button', { name: 'Zapisz zmiany' }).click()
  await expect(drawer).toBeHidden({ timeout: 15_000 })

  await page.locator('.link-edit').click()

  await expect(targetField.locator('.rs__single-value')).toHaveText('Dokument')
  await expect(documentField.locator('.rs__single-value')).toContainText(documentLabel ?? '')
})
