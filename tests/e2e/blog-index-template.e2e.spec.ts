import { expect, test, type Page } from '@playwright/test'
import { getPayload } from 'payload'

import type { PageTemplate } from '@/payload-types'
import config from '@/payload.config'

import { login } from '../helpers/login'
import { administratorTestUser } from '../helpers/seedUser'

const templateTitle = 'Blog — szablon E2E'

const composition = {
  hero: [{ blockType: 'heading', heading: templateTitle, headingLevel: 'h2' }],
  content: [
    {
      blockType: 'listing',
      pageSize: 12,
      pagination: true,
      selectionMode: 'filters',
      sort: 'newest',
      sources: ['posts'],
      view: 'cards',
    },
  ],
} satisfies Partial<PageTemplate>

test('previews the blog template and switches the public blog on publication', async ({
  browser,
  page,
}) => {
  test.setTimeout(90_000)
  const payload = await getPayload({ config })
  const {
    docs: [originalTemplate],
  } = await payload.find({
    collection: 'page-templates',
    depth: 0,
    limit: 1,
    where: { templateKey: { equals: 'blog-index' } },
  })
  if (!originalTemplate) throw new Error('Missing the seeded blog template.')

  const publicPage = await browser.newPage()
  const updateTemplate = (data: Partial<PageTemplate>, draft: boolean) =>
    payload.update({
      collection: 'page-templates',
      data,
      draft,
      id: originalTemplate.id,
      overrideAccess: true,
    })
  try {
    await publicPage.goto('/blog')
    await expect(publicPage.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible()
    const legacyPosts = await postLinks(publicPage)
    expect(legacyPosts.length).toBeGreaterThan(0)

    await updateTemplate({ ...composition, _status: 'draft', renderingMode: 'legacy' }, true)
    await login({ page, user: administratorTestUser })
    await page.goto(`/admin/collections/page-templates/${originalTemplate.id}`)
    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible()
    await expect(page.locator('.doc-header__after-header')).toHaveText('/blog')
    const popup = page.waitForEvent('popup')
    await page.locator('#preview-button').click()
    const preview = await popup
    await expect(preview).toHaveURL(/\/blog\?pageTemplatePreview=blog-index$/)
    await expect(preview.getByRole('heading', { level: 1, name: templateTitle })).toBeVisible()
    await expect(preview.getByRole('status')).toContainText('Podglądasz roboczy układ szablonu.')
    expect(await postLinks(preview)).toEqual(legacyPosts)

    await publicPage.goto('/blog?pageTemplatePreview=blog-index')
    await expect(publicPage.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible()
    await expect(publicPage.locator('.pageTemplateDocument')).toHaveCount(0)
    await preview.getByRole('link', { name: 'Wyłącz podgląd' }).click()
    await expect(preview.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible()

    await updateTemplate({ ...composition, _status: 'published', renderingMode: 'template' }, false)
    await publicPage.goto('/blog')
    await expect(publicPage.getByRole('heading', { level: 1, name: templateTitle })).toBeVisible()
    await expect(publicPage.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/blog$/)
    expect(await postLinks(publicPage)).toEqual(legacyPosts)

    await updateTemplate({ _status: 'published', renderingMode: 'legacy' }, false)
    await publicPage.goto('/blog')
    await expect(publicPage.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible()
    expect(await postLinks(publicPage)).toEqual(legacyPosts)
  } finally {
    await publicPage.close()
    await updateTemplate(originalTemplate, false)
  }
})

async function postLinks(page: Page): Promise<string[]> {
  const listing = page.locator('main .listingBlock')
  await expect(listing).toHaveCount(1)
  return listing
    .locator('a[href^="/blog/"]')
    .evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute('href') ?? ''))])
}
