import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config'
import type { ListingBlock } from '../../src/payload-types'
import { login } from '../helpers/login'
import { administratorTestUser } from '../helpers/seedUser'

test('locates two instances and detaches only the selected listing', async ({ page }) => {
  const payload = await getPayload({ config })
  const template = await payload.create({
    collection: 'listing-views',
    data: { _status: 'published', name: 'Szablon użyć E2E', settings: { columns: 2 } },
  })
  const listing: ListingBlock = {
    appearance: { preset: `shared:${template.id}` },
    blockType: 'listing',
    pageSize: 4,
    selectionMode: 'filters',
    sources: ['posts'],
    view: 'grid',
  }
  const document = await payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      title: 'Dwa listingi E2E',
      slug: 'dwa-listingi-e2e',
      layout: [
        { blockType: 'sectionGroup', name: 'Aktualności', sections: [{ blocks: [listing] }] },
        listing,
      ],
    },
  })

  try {
    await login({ page, user: administratorTestUser })
    await page.goto(`/admin/collections/listing-views/${template.id}`)
    const table = page.getByRole('table', { name: 'Użycie szablonu' })
    const nested = table.getByRole('row', { name: /Blok "Aktualności" › Sekcja 1 › Listing 1/ })
    const sibling = table.getByRole('row', { name: /Treść › Listing 2/ })
    await expect(nested.getByRole('link', { name: document.title })).toHaveAttribute(
      'href',
      `/admin/collections/pages/${document.id}`,
    )
    await expect(sibling).toBeVisible()
    await nested.getByRole('checkbox').check()
    await page.getByLabel('Zmień szablon na').selectOption('detach')
    await page.getByRole('button', { name: 'Zastosuj do zaznaczonych (1)' }).click()
    await expect(nested).toHaveCount(0)
    await expect(sibling).toBeVisible()

    const updated = await payload.findByID({ collection: 'pages', id: document.id, depth: 0 })
    expect(updated.layout).toMatchObject([
      { sections: [{ blocks: [{ appearance: { preset: 'custom', overrides: { columns: 2 } } }] }] },
      { appearance: listing.appearance },
    ])
  } finally {
    await payload.delete({ collection: 'pages', id: document.id, trash: true })
    await payload.delete({ collection: 'listing-views', id: template.id })
  }
})
