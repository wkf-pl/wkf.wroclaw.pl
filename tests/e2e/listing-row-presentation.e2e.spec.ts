import { expect, test, type Page } from '@playwright/test'

import { readFrontendStyles } from '../helpers/frontend-styles'

const styles = readFrontendStyles()

type Surface = 'transparent' | 'default' | 'subtle' | 'inverse' | 'image'

function presentationMarkup(frame: 'none' | 'outline', surface: Surface, content: string) {
  const image =
    surface === 'image'
      ? '<img class="contentPresentationImage" alt="" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"><span class="contentPresentationShade"></span>'
      : ''
  return `<div class="contentPresentation contentPresentation--block contentPresentation--${surface}${frame === 'outline' ? ' contentPresentation--frame-outline' : ''}${frame === 'outline' || surface !== 'transparent' ? ' contentPresentation--decorated' : ''}" data-frame="${frame}" data-surface="${surface}">${image}<div class="contentPresentationContent"><div class="contentPresentationBody">${content}</div></div></div>`
}

async function showListing(
  page: Page,
  columns: number,
  frame: 'none' | 'outline',
  surface: Surface = 'transparent',
) {
  const items = Array.from(
    { length: 5 },
    (_, index) =>
      `<article class="contentCard contentCard--withoutImage"><div class="contentCardContent"><h2><a href="/item-${index + 1}">Element listy ${index + 1}</a></h2></div></article>`,
  ).join('')
  const listing = `<div class="listingBlock"><div class="contentList contentList-compact${columns > 1 ? ' contentList-configuredColumns' : ''}" style="--listing-columns:${columns};--listing-minimum:11rem">${items}</div></div>`
  await page.setContent(
    `<style>${styles}</style><main style="max-width:1120px">${presentationMarkup(frame, surface, listing)}</main>`,
  )
}

async function measurements(page: Page) {
  return page.locator('.contentList-compact').evaluate((element) => {
    const group = element.getBoundingClientRect()
    const wrapper = element.closest('.contentPresentation')!
    const content = wrapper.querySelector('.contentPresentationContent')!
    const rows = Array.from(element.children).map((item) => {
      const bounds = item.getBoundingClientRect()
      const style = getComputedStyle(item)
      return {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        border: style.borderWidth,
        radius: style.borderRadius,
        shadow: style.boxShadow,
      }
    })
    return {
      width: group.width,
      padding: getComputedStyle(content).padding,
      gap: getComputedStyle(element).gap,
      groupBorder: getComputedStyle(element).borderWidth,
      outerBorder: getComputedStyle(wrapper).borderWidth,
      rows,
    }
  })
}

test('joins rows and columns into a single outlined list without padding', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  for (const columns of [1, 2, 4]) {
    await showListing(page, columns, 'outline')
    const layout = await measurements(page)
    expect(layout.padding).toBe('0px')
    expect(layout.outerBorder).toBe('2px')
    expect(layout.groupBorder).toBe('0px')
    expect(layout.gap).toBe('0px')
    for (const row of layout.rows) {
      expect(row.border).toBe('0px')
      expect(row.radius).toBe('0px')
      expect(row.shadow).toContain('-1px -1px')
    }
    if (columns > 1)
      expect(layout.rows[1].x).toBeCloseTo(layout.rows[0].x + layout.rows[0].width, 1)
    expect(layout.rows[columns].y).toBeCloseTo(layout.rows[0].y + layout.rows[0].height, 1)
    if (columns === 2)
      await page
        .locator('main')
        .screenshot({ path: testInfo.outputPath('listing-two-columns.png') })
  }
  await page.setViewportSize({ width: 320, height: 900 })
  const narrow = await measurements(page)
  expect(narrow.rows[1].x).toBe(narrow.rows[0].x)
  expect(narrow.rows[1].y).toBeCloseTo(narrow.rows[0].y + narrow.rows[0].height, 1)
  await page.locator('main').screenshot({ path: testInfo.outputPath('listing-narrow.png') })
})

for (const surface of ['transparent', 'default', 'subtle', 'inverse', 'image'] as const) {
  test(`uses the ${surface} surface on rows without adding spacing or implicit borders`, async ({
    page,
  }, testInfo) => {
    await showListing(page, 2, 'none', surface)
    const layout = await measurements(page)
    expect(layout.padding).toBe('0px')
    expect(layout.outerBorder).toBe('0px')
    expect(layout.groupBorder).toBe('0px')
    expect(layout.gap).toBe('0px')
    for (const row of layout.rows) {
      expect(row.border).toBe('0px')
      expect(row.shadow).not.toContain('-1px -1px')
    }
    await expect(page.locator('.contentCard').first()).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    )
    await expect(page.locator('.contentCard h2 a').first()).toHaveCSS(
      'color',
      surface === 'inverse' ? 'rgb(0, 13, 23)' : 'rgb(244, 239, 229)',
    )
    await showListing(page, 2, 'outline', surface)
    const framed = await measurements(page)
    expect(framed.padding).toBe('0px')
    expect(framed.outerBorder).toBe('2px')
    expect(framed.rows[0].border).toBe('0px')
    expect(framed.rows[0].shadow).toContain('-1px -1px')
    if (surface === 'inverse')
      await page.locator('main').screenshot({ path: testInfo.outputPath('listing-inverse.png') })
  })
}

test('keeps padding for unrelated decorated content blocks', async ({ page }) => {
  await page.setContent(
    `<style>${styles}</style>${presentationMarkup('outline', 'default', '<p>Treść zwykłego bloku</p>')}`,
  )
  expect(
    await page
      .locator('.contentPresentationContent')
      .evaluate((element) => parseFloat(getComputedStyle(element).paddingTop)),
  ).toBeGreaterThan(0)
})
