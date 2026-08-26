import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'

import {
  createPublishedDocumentFixture,
  deletePublishedDocumentFixture,
} from '../helpers/documentFixture'

const fixtureName = 'e2e-document-register'
let payload: Payload

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await createPublishedDocumentFixture(payload, fixtureName)
})

test.afterAll(async () => {
  if (payload) {
    await deletePublishedDocumentFixture(payload, fixtureName)
  }
})

test('renders the public documents register without account actions', async ({ page }) => {
  await page.goto('/dokumenty')
  await expect(page.getByRole('heading', { level: 1, name: 'Dokumenty klubowe' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Zaloguj się' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Wyloguj' })).toHaveCount(0)
  const primaryPdfLink = page.getByRole('link', {
    name: `Otwórz główny plik PDF dokumentu: Dokument E2E ${fixtureName}`,
  })
  await expect(primaryPdfLink).toBeVisible()
  await expect(primaryPdfLink).toHaveAttribute('href', /\/dokumenty\/[^/]+\/plik\/\d+/)
  await expect(primaryPdfLink).toHaveAttribute('target', '_blank')

  const loginResponse = await page.goto('/login')
  expect(loginResponse?.status()).toBe(404)
})
