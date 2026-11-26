import { expect, test } from '@playwright/test'

import type { ListingBlock } from '@/payload-types'
import { createContentTaxonomyFixture } from '../helpers/content-taxonomy-fixture'
import { createLexicalDocument } from '../helpers/lexical-document'
import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

test('filters a catalogue on its own page and preserves two independent searches on the blog', async ({
  browser,
  page,
}, testInfo) => {
  test.setTimeout(120_000)
  const fixture = await createContentTaxonomyFixture('e2e-search')
  const { author, topic, payload, slugs } = fixture
  const publicPage = await browser.newPage()
  const {
    docs: [template],
  } = await payload.find({
    collection: 'page-templates',
    depth: 0,
    limit: 1,
    where: { templateKey: { equals: 'blog-index' } },
  })
  if (!template) throw new Error('Missing blog index template.')

  const layoutSearch: ListingBlock = {
    blockType: 'listing',
    selectionMode: 'filters',
    searchEnabled: true,
    legacySearchParameters: true,
    conditions: [
      {
        field: 'topic',
        operator: 'inSubtree',
        relationshipValue: { relationTo: 'topics', value: topic.id },
      },
    ],
    filterDate: false,
    pageSize: 1,
    pagination: true,
    sort: 'titleAscending',
    sources: ['pages', 'posts'],
    view: 'cards',
  }
  const secondSearch: ListingBlock = {
    ...layoutSearch,
    sources: ['posts'],
    filterTopic: false,
    filterTags: false,
  }
  const tagSlug = 'dark-sun-e2e-search'
  const storySlug = 'opowiadanie-e2e-search'
  const eventSlug = 'e2e-content-search-event'
  const cycleSlug = 'e2e-content-search-cycle'
  const deleteEventsAndTags = async () => {
    await payload.delete({ collection: 'events', where: { slug: { equals: eventSlug } } })
    await payload.delete({ collection: 'event-cycles', where: { slug: { equals: cycleSlug } } })
    await payload.delete({ collection: 'tags', where: { slug: { in: [tagSlug, storySlug] } } })
  }
  try {
    await deleteEventsAndTags()
    const tag = await payload.create({
      collection: 'tags',
      data: { name: 'Dark Sun E2E search', slug: tagSlug },
    })
    const story = await payload.create({
      collection: 'tags',
      data: { name: 'Opowiadanie E2E search', slug: storySlug },
    })
    await payload.update({
      collection: 'pages',
      id: fixture.page.id,
      draft: false,
      data: {
        _status: 'published',
        layout: [layoutSearch],
        listingExcerpt: 'Zasady i opowiadania Dark Sun.',
        tags: [tag.id, story.id],
        title: 'Zasoby RPG',
      },
    })
    await payload.update({
      collection: 'posts',
      id: fixture.post.id,
      draft: false,
      data: { _status: 'published', layout: [layoutSearch], tags: [story.id] },
    })

    const {
      docs: [eventType],
    } = await payload.find({ collection: 'event-types', limit: 1 })
    if (!eventType) throw new Error('Missing event type.')
    await payload.create({
      collection: 'event-cycles',
      data: {
        _status: 'published',
        author: author.id,
        eventDefaults: {
          eventType: eventType.id,
          capacityMode: 'unlimited',
          layout: [{ blockType: 'richText', content: createLexicalDocument('Treść wydarzenia.') }],
          participation: 'public',
        },
        excerpt: createLexicalDocument('Cykl do testu wyszukiwarki.'),
        layout: [layoutSearch],
        slug: cycleSlug,
        title: 'Cykl z wyszukiwarką',
      },
      draft: false,
    })
    await payload.create({
      collection: 'events',
      data: {
        _status: 'published',
        author: author.id,
        calendarRevision: 0,
        capacityMode: 'unlimited',
        eventType: eventType.id,
        excerpt: createLexicalDocument('Wydarzenie do testu wyszukiwarki.'),
        layout: [layoutSearch],
        participation: 'public',
        slug: eventSlug,
        startAt: '2026-08-13T12:00:00.000Z',
        timeMode: 'timed',
        title: 'Wydarzenie z wyszukiwarką',
      },
      draft: false,
    })

    for (const pathname of [
      `/blog/${slugs.post}`,
      `/events/${eventSlug}`,
      `/events/series/${cycleSlug}`,
      `/${slugs.page}`,
    ]) {
      await publicPage.goto(pathname)
      await expect(publicPage.getByRole('search')).toBeVisible()
    }
    const catalogue = publicPage.getByRole('search')
    await expect(catalogue.getByLabel('Data od')).toHaveCount(0)
    await expect(catalogue.getByRole('button', { name: 'Szukaj' })).toHaveCount(0)
    await catalogue.getByLabel('Autor', { exact: true }).selectOption({ label: author.displayName })
    await expect(publicPage).toHaveURL(/_author=id%3A\d+/)
    await catalogue.getByLabel('Autor', { exact: true }).selectOption('')
    await expect(publicPage).not.toHaveURL(/_author=/)
    await catalogue.locator('summary').filter({ hasText: 'Tematy' }).click()
    await catalogue.getByRole('checkbox', { name: topic.name, exact: true }).check()
    await expect(publicPage).toHaveURL(/_category=\d+/)
    await catalogue.locator('summary').filter({ hasText: 'Tematy' }).click()
    await catalogue.locator('summary').filter({ hasText: 'Tagi' }).click()
    await catalogue.getByRole('checkbox', { name: 'Dark Sun E2E search' }).check()
    await catalogue.getByRole('checkbox', { name: 'Opowiadanie E2E search' }).check()
    await expect(
      publicPage.locator('.listingBlock a').filter({ hasText: 'Zasoby RPG' }),
    ).toBeVisible()
    await expect(publicPage.locator(`.listingBlock a[href="/blog/${slugs.post}"]`)).toHaveCount(0)

    await login({ page, user: editorTestUser })
    await page.goto(`/admin/collections/pages/${fixture.page.id}`)
    const filterTab = page.getByText('Wyszukiwanie', { exact: true })
    await expect(filterTab).toBeVisible({ timeout: 15_000 })
    await filterTab.click()
    await expect(page.getByText('Typ treści', { exact: true })).toBeVisible()
    const filterRow = page.locator('.wkf-listing-search-filters > .row__fields')
    await expect(filterRow).toHaveCSS('display', 'flex')
    await expect(filterRow).toHaveCSS('flex-wrap', 'wrap')
    await expect(filterRow.getByRole('switch')).not.toHaveCount(0)
    await expect(
      filterRow.getByRole('switch', { name: 'Pozwól czytelnikowi przeszukiwać listę' }),
    ).toHaveCount(0)

    await payload.update({
      collection: 'page-templates',
      data: {
        _status: 'published',
        renderingMode: 'template',
        content: [layoutSearch, secondSearch],
      },
      draft: false,
      id: template.id,
    })
    await publicPage.goto('/blog')
    const blocks = publicPage.locator('main .listingBlock')
    const first = blocks.nth(0)
    const second = blocks.nth(1)
    await expect(blocks).toHaveCount(2)
    await expect(second.getByRole('group', { name: 'Tematy' })).toHaveCount(0)
    await second.getByLabel('Fraza w tytule lub zajawce').fill('Po')
    await publicPage.waitForTimeout(400)
    await expect(publicPage).not.toHaveURL(/_q=/)
    await second.getByLabel('Fraza w tytule lub zajawce').fill('Post excerpt')
    await expect(publicPage).toHaveURL(/_q=Post\+excerpt/)
    await expect(second.getByRole('link', { name: 'Wyczyść filtry' })).toBeVisible()
    await first.getByRole('link', { name: 'Następna' }).click()
    await expect(first.getByText('Strona 2 z 2')).toBeVisible()
    await expect(second.getByLabel('Fraza w tytule lub zajawce')).toHaveValue('Post excerpt')

    await first.getByLabel('Fraza w tytule lub zajawce').fill('brak takiego wyniku')
    await expect(first.getByText('Brak treści pasujących do filtrów.')).toBeVisible()
    const sharedUrl = publicPage.url()
    await publicPage.goto(sharedUrl)
    await expect(first.getByText('Brak treści pasujących do filtrów.')).toBeVisible()
    await expect(first.getByLabel('Fraza w tytule lub zajawce')).toHaveValue('brak takiego wyniku')
    await first.getByRole('link', { name: 'Wyczyść filtry' }).click()
    await expect(first.getByText('Strona 1 z 2')).toBeVisible()
    await expect(second.getByLabel('Fraza w tytule lub zajawce')).toHaveValue('Post excerpt')

    await publicPage.goto(`/${slugs.page}`)
    const dismissConsent = publicPage.getByRole('button', { name: 'Odrzucam opcjonalne' })
    if (await dismissConsent.isVisible()) await dismissConsent.click()
    await catalogue.screenshot({ path: testInfo.outputPath('search-desktop.png') })
    await publicPage.setViewportSize({ width: 390, height: 844 })
    await catalogue.screenshot({ path: testInfo.outputPath('search-mobile.png') })
    expect(await catalogue.evaluate((form) => form.scrollWidth <= form.clientWidth + 1)).toBe(true)
  } finally {
    await publicPage.close()
    await payload.update({
      collection: 'page-templates',
      data: template,
      draft: false,
      id: template.id,
    })
    await fixture.cleanup()
    await deleteEventsAndTags()
  }
})
