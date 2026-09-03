import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { User } from '@/payload-types'

import { editorTestUser } from '../helpers/seedUser'

const fixtureRunID = Date.now()
const pageSlug = `e2e-column-layout-${fixtureRunID}`
const postSlugPrefix = `e2e-column-layout-post-${fixtureRunID}`

let payload: Payload
let author: User

function richTextBlock(text: string) {
  return {
    blockType: 'richText' as const,
    content: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text,
                type: 'text',
                version: 1,
              },
            ],
            direction: null,
            format: '' as const,
            indent: 0,
            textFormat: 0,
            textStyle: '',
            type: 'paragraph' as const,
            version: 1,
          },
        ],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'root' as const,
        version: 1,
      },
    },
  }
}

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanup()
  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: editorTestUser.email } },
  })
  const editor = users.docs[0]
  if (!editor) throw new Error('Missing E2E editor user.')
  author = editor

  for (let index = 1; index <= 3; index += 1) {
    await payload.create({
      collection: 'posts',
      data: {
        _status: 'published',
        author: author.id,
        excerpt: `Column layout post ${index}`,
        layout: [richTextBlock(`Column layout post content ${index}`)],
        slug: `${postSlugPrefix}-${index}`,
        title: `Column layout post ${index}`,
      },
      overrideAccess: true,
    })
  }

  await payload.create({
    collection: 'pages',
    data: {
      _status: 'published',
      author: author.id,
      layout: [
        {
          blockType: 'columnLayout',
          columns: [
            { blocks: [richTextBlock('Two columns left')], width: 8 },
            { blocks: [], width: 4 },
          ],
        },
        {
          blockType: 'columnLayout',
          columns: [
            { blocks: [richTextBlock('Three columns left')], width: 2 },
            { blocks: [richTextBlock('Three columns center')], width: 4 },
            { blocks: [richTextBlock('Three columns right')], width: 6 },
          ],
        },
        {
          blockType: 'columnLayout',
          columns: [
            { blocks: [richTextBlock('Four columns first')], width: 3 },
            { blocks: [richTextBlock('Four columns second')], width: 3 },
            { blocks: [richTextBlock('Four columns third')], width: 3 },
            { blocks: [richTextBlock('Four columns fourth')], width: 3 },
          ],
        },
        {
          blockType: 'columnLayout',
          columns: [
            { blocks: [], width: 6 },
            { blocks: [], width: 6 },
          ],
        },
        {
          blockType: 'columnLayout',
          columns: [
            { blocks: [listingBlock('Left paginated listing', 'grid')], width: 6 },
            { blocks: [listingBlock('Right paginated listing', 'grid')], width: 6 },
          ],
        },
        listingBlock('Top-level grid listing', 'grid', false),
      ],
      slug: pageSlug,
      title: 'E2E column layout',
    },
    overrideAccess: true,
  })
})

test.afterAll(async () => {
  await cleanup()
})

test('renders exact spans, reading order and independently paginated nested blocks', async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 1400 })
  await page.goto(`/${pageSlug}`)

  const layouts = page.locator('.columnLayout')
  await expect(layouts).toHaveCount(4)
  await expect(layouts.nth(0).locator('.columnLayoutColumn')).toHaveCount(2)
  await expect(layouts.nth(1).locator('.columnLayoutColumn')).toHaveCount(3)
  await expect(layouts.nth(2).locator('.columnLayoutColumn')).toHaveCount(4)

  await expect(layouts.nth(0).locator('.columnLayoutColumn').nth(0)).toHaveAttribute(
    'data-column-width',
    '8',
  )
  await expect(layouts.nth(0).locator('.columnLayoutColumn').nth(1)).toHaveAttribute(
    'data-column-width',
    '4',
  )
  expect(
    await layouts
      .nth(1)
      .locator('.columnLayoutColumn')
      .evaluateAll((columns) => columns.map((column) => column.getAttribute('data-column-width'))),
  ).toEqual(['2', '4', '6'])
  expect(
    await layouts
      .nth(2)
      .locator('.columnLayoutColumn')
      .evaluateAll((columns) => columns.map((column) => column.getAttribute('data-column-width'))),
  ).toEqual(['3', '3', '3', '3'])

  const readingOrder = await layouts.nth(1).locator('.columnLayoutColumn').allTextContents()
  expect(readingOrder).toEqual([
    'Three columns left',
    'Three columns center',
    'Three columns right',
  ])

  const paginationLinks = layouts.nth(3).getByRole('link', { name: 'Następna' })
  await expect(paginationLinks).toHaveCount(2)
  const hrefs = await paginationLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute('href')),
  )
  expect(hrefs[0]).not.toBe(hrefs[1])

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(hasHorizontalOverflow).toBe(false)
})

test('uses container breakpoints and omits empty columns after stacking', async ({ page }) => {
  await page.setViewportSize({ height: 900, width: 1400 })
  await page.goto(`/${pageSlug}`)
  const twoColumnLayout = page.locator('.columnLayout--2').first()
  const threeColumnLayout = page.locator('.columnLayout--3')

  expect(await getGridTrackCount(twoColumnLayout.locator('.columnLayoutGrid'))).toBe(12)
  expect(await getGridTrackCount(threeColumnLayout.locator('.columnLayoutGrid'))).toBe(12)
  await expect(twoColumnLayout.locator('.columnLayoutColumn')).toHaveCount(2)

  await page.setViewportSize({ height: 900, width: 900 })
  expect(await getGridTrackCount(threeColumnLayout.locator('.columnLayoutGrid'))).toBe(1)
  expect(await getGridTrackCount(twoColumnLayout.locator('.columnLayoutGrid'))).toBe(12)

  await page.setViewportSize({ height: 900, width: 700 })
  expect(await getGridTrackCount(twoColumnLayout.locator('.columnLayoutGrid'))).toBe(1)
  await expect(twoColumnLayout.locator('.columnLayoutColumn').nth(0)).toBeVisible()
  await expect(twoColumnLayout.locator('.columnLayoutColumn').nth(1)).toBeHidden()
})

test('collapses grid blocks according to their own width in every layout context', async ({
  page,
}) => {
  await page.setViewportSize({ height: 900, width: 1400 })
  await page.goto(`/${pageSlug}`)

  const nestedGrid = page
    .locator('.columnLayout')
    .filter({ hasText: 'Left paginated listing' })
    .locator('.contentList-grid')
    .first()
  const topLevelGrid = page.locator('.pageBlocks > .listingBlock .contentList-grid')

  expect(await getGridTrackCount(nestedGrid)).toBe(1)
  expect(await getGridTrackCount(topLevelGrid)).toBe(3)

  await page.setViewportSize({ height: 900, width: 700 })
  expect(await getGridTrackCount(topLevelGrid)).toBe(1)
})

function listingBlock(heading: string, view: 'compact' | 'grid' = 'compact', pagination = true) {
  return {
    blockType: 'listing' as const,
    eventTimeFilter: 'all' as const,
    heading,
    pageSize: pagination ? 1 : 3,
    pagination,
    parentFilter: 'none' as const,
    sort: 'newest' as const,
    sources: ['posts' as const],
    view,
  }
}

async function getGridTrackCount(locator: import('@playwright/test').Locator): Promise<number> {
  return locator.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns.split(' ').length,
  )
}

async function cleanup(): Promise<void> {
  if (!payload) return
  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: { slug: { equals: pageSlug } },
  })
  await payload.delete({
    collection: 'posts',
    overrideAccess: true,
    where: { slug: { like: `${postSlugPrefix}%` } },
  })
}
