import { expect, test } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'
import type { Page as PageDocument, User } from '@/payload-types'

import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

test.describe.configure({ mode: 'serial' })

const fixtureRunID = Date.now()
const fixtureSlug = `e2e-column-layout-admin-${fixtureRunID}`
const defaultFixtureSlug = `e2e-column-layout-default-${fixtureRunID}`
const addedFixtureSlug = `e2e-column-layout-added-${fixtureRunID}`
const clipboardFixtureSlug = `e2e-column-layout-clipboard-${fixtureRunID}`

let payload: Payload
let author: User
let fixturePage: PageDocument
let defaultFixturePage: PageDocument
let addedFixturePage: PageDocument
let clipboardFixturePage: PageDocument

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

  fixturePage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'draft',
      author: author.id,
      layout: [
        {
          blockType: 'columnLayout',
          columnSeparators: 'none',
          columns: [
            { blocks: [richTextBlock('Left content')], surface: 'default', width: 3 },
            { blocks: [richTextBlock('Middle content')], surface: 'default', width: 3 },
            { blocks: [], surface: 'default', width: 3 },
            { blocks: [richTextBlock('Right content')], surface: 'default', width: 3 },
          ],
          verticalAlignment: 'start',
        },
      ],
      slug: fixtureSlug,
      title: 'E2E column layout admin',
    },
    draft: true,
    overrideAccess: true,
  })
  defaultFixturePage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'draft',
      author: author.id,
      layout: [
        {
          blockType: 'columnLayout',
          columnSeparators: 'none',
          columns: [
            { blocks: [], surface: 'default', width: 6 },
            { blocks: [], surface: 'default', width: 6 },
          ],
          verticalAlignment: 'start',
        },
      ],
      slug: defaultFixtureSlug,
      title: 'E2E default column layout admin',
    },
    draft: true,
    overrideAccess: true,
  })
  addedFixturePage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'draft',
      author: author.id,
      layout: [richTextBlock('Existing content')],
      slug: addedFixtureSlug,
      title: 'E2E added column layout admin',
    },
    draft: true,
    overrideAccess: true,
  })
  clipboardFixturePage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'draft',
      author: author.id,
      layout: [
        {
          blockType: 'columnLayout',
          columnSeparators: 'none',
          columns: [
            { blocks: [], surface: 'transparent', width: 6 },
            { blocks: [], surface: 'transparent', width: 6 },
          ],
          surface: 'transparent',
          verticalAlignment: 'start',
        },
        {
          blockType: 'sectionGroup',
          sections: [
            {
              blocks: [richTextBlock('Existing section content')],
              surface: 'transparent',
            },
            {
              blocks: [richTextBlock('Second section content')],
              surface: 'transparent',
            },
          ],
          surface: 'transparent',
        },
      ],
      slug: clipboardFixtureSlug,
      title: 'E2E column layout clipboard',
    },
    draft: true,
    overrideAccess: true,
  })
})

test.afterAll(async () => {
  await cleanup()
})

test('opens a 6+6 layout, keeps content visible while invalid and excludes nested layouts', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${defaultFixturePage.id}`)

  const field = await openColumnLayoutField(page)
  await expect(
    field.getByText('Kolumny: 2 · suma szerokości: 12/12', { exact: true }),
  ).toBeVisible()
  await expect(field.getByRole('tab')).toHaveText([
    'Prezentacja',
    'Kolumna 1 - 6c',
    'Kolumna 2 - 6c',
  ])
  const firstColumnTabContainer = field.locator('.wkf-layout-tabs__sortable-tab').first()
  await expect(firstColumnTabContainer.locator(':scope > button').nth(0)).toHaveAttribute(
    'aria-label',
    'Przeciągnij: Kolumna 1 - 6c',
  )
  await expect(firstColumnTabContainer.locator(':scope > button').nth(1)).toHaveAttribute(
    'role',
    'tab',
  )
  await expect(firstColumnTabContainer.locator(':scope > button').nth(2)).toHaveAttribute(
    'aria-label',
    'Usuń: Kolumna 1 - 6c',
  )
  await expect(field.getByRole('tab', { name: 'Prezentacja' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  const presentationRows = await activePanel(field).evaluate((element) => {
    const fieldRectangle = (suffix: string) =>
      element.querySelector(`[id$="__${suffix}"]`)?.getBoundingClientRect()
    const frame = fieldRectangle('frame')
    const surface = fieldRectangle('surface')
    const verticalAlignment = fieldRectangle('verticalAlignment')
    const columnSeparators = fieldRectangle('columnSeparators')
    if (!frame || !surface || !verticalAlignment || !columnSeparators) return null
    return {
      firstRowOffset: frame.top - surface.top,
      secondRowOffset: verticalAlignment.top - columnSeparators.top,
      verticalGap: verticalAlignment.top - frame.top,
    }
  })
  expect(presentationRows).not.toBeNull()
  expect(
    Math.abs(presentationRows?.firstRowOffset ?? Number.POSITIVE_INFINITY),
  ).toBeLessThanOrEqual(2)
  expect(
    Math.abs(presentationRows?.secondRowOffset ?? Number.POSITIVE_INFINITY),
  ).toBeLessThanOrEqual(2)
  expect(presentationRows?.verticalGap).toBeGreaterThan(20)
  await expectColumnWidths(field, ['6', '6'])

  const firstColumnTab = field.getByRole('tab', { name: 'Kolumna 1' })
  await firstColumnTab.click()
  await expect(activePanel(field).locator('input[type="number"]')).toHaveValue('6')
  const columnPresentationRow = await activePanel(field).evaluate((element) => {
    const fieldRectangle = (suffix: string) => {
      const field = element.querySelector(`[id$="__${suffix}"]`)
      return (field?.closest('.field-type') ?? field)?.getBoundingClientRect()
    }
    const width = fieldRectangle('width')
    const frame = fieldRectangle('frame')
    const surface = fieldRectangle('surface')
    if (!width || !frame || !surface) return null
    return {
      frameOffset: width.top - frame.top,
      surfaceOffset: width.top - surface.top,
      widths: [width.width, frame.width, surface.width],
    }
  })
  expect(columnPresentationRow).not.toBeNull()
  expect(
    Math.abs(columnPresentationRow?.frameOffset ?? Number.POSITIVE_INFINITY),
  ).toBeLessThanOrEqual(2)
  expect(
    Math.abs(columnPresentationRow?.surfaceOffset ?? Number.POSITIVE_INFINITY),
  ).toBeLessThanOrEqual(2)
  expect(Math.max(...(columnPresentationRow?.widths ?? []))).toBeLessThanOrEqual(
    Math.min(...(columnPresentationRow?.widths ?? [])) + 2,
  )
  await expect(firstColumnTabContainer).toHaveAttribute('data-active', 'true')

  const firstColumnControls = firstColumnTabContainer.locator(':scope > button')
  const underlineColors = await firstColumnControls.evaluateAll((controls) =>
    controls.map((control) => getComputedStyle(control).borderBottomColor),
  )
  expect(new Set(underlineColors).size).toBe(1)
  expect(underlineColors[0]).not.toBe('rgba(0, 0, 0, 0)')

  const iconSpacing = await firstColumnTabContainer.evaluate((element) => {
    const handleIcon = element.querySelector('.wkf-layout-tabs__drag-handle svg')
    const label = element.querySelector('[role="tab"] > span')
    const removeIcon = element.querySelector('.wkf-layout-tabs__remove-tab svg')
    if (!handleIcon || !label || !removeIcon) return null

    const handleRectangle = handleIcon.getBoundingClientRect()
    const labelRectangle = label.getBoundingClientRect()
    const removeRectangle = removeIcon.getBoundingClientRect()
    return {
      afterHandle: labelRectangle.left - handleRectangle.right,
      beforeRemove: removeRectangle.left - labelRectangle.right,
    }
  })
  expect(iconSpacing).not.toBeNull()
  expect(iconSpacing?.afterHandle).toBeLessThanOrEqual(12)
  expect(iconSpacing?.beforeRemove).toBeLessThanOrEqual(12)

  const firstColumnRemoveButton = firstColumnTabContainer.getByRole('button', {
    name: 'Usuń: Kolumna 1 - 6c',
  })
  await expect(firstColumnRemoveButton).toBeDisabled()
  const disabledDeleteColors = await firstColumnRemoveButton.evaluate((element) => {
    const styles = getComputedStyle(element)
    return {
      action: styles.getPropertyValue('--wkf-action-color').trim(),
      disabled: styles.getPropertyValue('--theme-elevation-400').trim(),
    }
  })
  expect(disabledDeleteColors.action).toBe(disabledDeleteColors.disabled)

  await firstColumnTab.press('ArrowRight')
  await expect(field.getByRole('tab', { name: 'Kolumna 2' })).toHaveAttribute(
    'aria-selected',
    'true',
  )

  const spacing = await activePanel(field).evaluate((element) => {
    const surface = element.querySelector('[id$="__surface"]')
    const blocks = element.querySelector('.blocks-field')
    if (!surface || !blocks) return null
    return blocks.getBoundingClientRect().top - surface.getBoundingClientRect().bottom
  })
  expect(spacing).toBeGreaterThanOrEqual(16)

  await field.getByRole('button', { name: 'Dodaj kolumnę' }).click()
  await expectColumnWidths(field, ['6', '6', '2'])
  await expect(
    page.getByText('Układ kolumnowy: przezroczysta · bez ramki — 6/12 + 6/12 + 2/12', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    field.getByText('Kolumny: 3 · suma szerokości: 14/12', { exact: true }),
  ).toBeVisible()
  await expect(field.getByRole('tab')).toHaveText([
    'Prezentacja',
    'Kolumna 1 - 6c',
    'Kolumna 2 - 6c',
    'Kolumna 3 - 2c',
  ])

  await field.getByRole('button', { name: 'Dodaj kolumnę' }).click()
  await expect(field.getByRole('tab')).toHaveCount(5)
  await expect(field.getByRole('button', { name: 'Dodaj kolumnę' })).toHaveCount(0)
  await field.getByRole('button', { name: 'Usuń: Kolumna 4 - 2c' }).click()
  await expect(field.getByRole('tab')).toHaveCount(4)
  await expect(page.getByRole('heading', { name: 'Usunąć kolumnę 4?' })).toHaveCount(0)

  await field.getByRole('tab', { name: 'Kolumna 1' }).click()
  await activePanel(field).locator('.blocks-field__drawer-toggler').click()
  const innerDrawer = page.locator('.drawer--is-open')
  const groupHeadings = await innerDrawer.getByRole('heading', { level: 3 }).allTextContents()
  expect(groupHeadings).toEqual(['Treści', 'Elementy'])
  await expect(innerDrawer.getByText('Układ kolumnowy', { exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')

  await activePanel(field).locator('input[type="number"]').fill('5')
  await expect(field.getByRole('tab', { name: 'Kolumna 1' })).toHaveText('Kolumna 1 - 5c')
  await expect(
    page.getByText('Układ kolumnowy: przezroczysta · bez ramki — 5/12 + 6/12 + 2/12', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(
    field.getByText('Kolumny: 3 · suma szerokości: 13/12', { exact: true }),
  ).toBeVisible()
  await expect(activePanel(field)).toBeVisible()
  await page.getByRole('button', { name: 'Zapisz szkic' }).click()
  await expect(
    field.getByText('Szerokości kolumn muszą sumować się do 12.', { exact: true }),
  ).toBeVisible()
  await expect(page).toHaveURL(new RegExp(`/admin/collections/pages/${defaultFixturePage.id}`))
})

test('moves whole columns, confirms destructive deletion and reloads the persisted result', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${fixturePage.id}`)

  const field = await openColumnLayoutField(page)
  await expect(
    page.getByText('Układ kolumnowy: przezroczysta · bez ramki — 3/12 + 3/12 + 3/12 + 3/12', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(field.getByRole('button', { name: 'Dodaj kolumnę' })).toHaveCount(0)

  const secondColumnDragHandle = field
    .locator('.wkf-layout-tabs__sortable-tab')
    .nth(1)
    .getByRole('button', { name: 'Przeciągnij: Kolumna 2 - 3c' })
  await dragToColumn(
    page,
    secondColumnDragHandle,
    field.locator('.wkf-layout-tabs__sortable-tab').nth(0),
  )
  const presentationTab = field.getByRole('tab', { name: 'Prezentacja' })
  await presentationTab.focus()
  await presentationTab.press('ArrowRight')
  await expect(field.getByRole('tab', { name: 'Kolumna 1' })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(activePanel(field)).toContainText('Middle content')
  await field.getByRole('tab', { name: 'Kolumna 2' }).click()
  await expect(activePanel(field)).toContainText('Left content')

  await expect(activePanel(field).getByRole('button', { name: 'Przesuń w lewo' })).toHaveCount(0)
  await expect(activePanel(field).getByRole('button', { name: 'Przesuń w prawo' })).toHaveCount(0)
  await expect(activePanel(field).getByRole('button', { name: 'Usuń' })).toHaveCount(0)

  await field.getByRole('button', { name: 'Usuń: Kolumna 3 - 3c' }).click()
  await expect(field.getByRole('tab')).toHaveCount(4)
  await expect(page.getByRole('heading', { name: 'Usunąć kolumnę 3?' })).toHaveCount(0)

  await field.getByRole('tab', { name: 'Kolumna 2' }).click()
  await field.getByRole('button', { name: 'Usuń: Kolumna 2 - 3c' }).click()
  const modal = page.locator('.confirmation-modal')
  await expect(modal.getByRole('heading', { name: 'Usunąć kolumnę 2?' })).toBeVisible()
  await expect(modal).toContainText(
    'Ta kolumna zawiera bloki. Usunięcie trwale usunie również całą jej zawartość z bieżącego dokumentu.',
  )
  await modal.getByRole('button', { name: 'Anuluj' }).click()
  await expect(field.getByRole('tab')).toHaveCount(4)
  await expect(activePanel(field)).toContainText('Left content')

  await field.getByRole('button', { name: 'Usuń: Kolumna 2 - 3c' }).click()
  await modal.getByRole('button', { name: 'Usuń', exact: true }).click()
  await expect(field.getByRole('tab')).toHaveCount(3)
  await expect(field).not.toContainText('Left content')
  await fillColumnWidth(field, 0, '6')
  await fillColumnWidth(field, 1, '6')
  await expect(
    field.getByText('Kolumny: 2 · suma szerokości: 12/12', { exact: true }),
  ).toBeVisible()
  const sourceLayout = fixturePage.layout?.[0]
  if (!sourceLayout || sourceLayout.blockType !== 'columnLayout') {
    throw new Error('Missing source column layout fixture.')
  }
  await payload.update({
    collection: 'pages',
    data: {
      layout: [
        {
          ...sourceLayout,
          columns: [
            { ...sourceLayout.columns[1]!, width: 6 },
            { ...sourceLayout.columns[3]!, width: 6 },
          ],
        },
      ],
    },
    draft: true,
    id: fixturePage.id,
    overrideAccess: true,
  })
  await page.reload()

  const reloadedField = await openColumnLayoutField(page)
  await expectColumnWidths(reloadedField, ['6', '6'])
  await reloadedField.getByRole('tab', { name: 'Kolumna 1' }).click()
  await expect(activePanel(reloadedField)).toContainText('Middle content')
  await reloadedField.getByRole('tab', { name: 'Kolumna 2' }).click()
  await expect(activePanel(reloadedField)).toContainText('Right content')
  await expect(reloadedField).not.toContainText('Left content')
})

test('saves a page after adding a default column layout in the admin', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${addedFixturePage.id}`)

  const layoutField = page.locator('#field-layout')
  await layoutField.locator(':scope > .blocks-field__drawer-toggler').click()
  const blockDrawer = page.locator('.drawer--is-open')
  await blockDrawer.getByRole('button', { name: /Układ kolumnowy$/ }).click()

  await expect(layoutField.locator('.blocks-field__row')).toHaveCount(2)

  const saveResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'PATCH' &&
      response.url().includes(`/api/pages/${addedFixturePage.id}`),
  )
  await page.getByRole('button', { name: 'Zapisz szkic' }).click()
  const saveResponse = await saveResponsePromise
  const responseBody = await saveResponse.text()

  expect(saveResponse.ok(), responseBody).toBe(true)
  await expect(page.getByText('Something went wrong', { exact: true })).toHaveCount(0)

  const savedPage = await payload.findByID({
    collection: 'pages',
    depth: 0,
    draft: true,
    id: addedFixturePage.id,
    overrideAccess: true,
  })
  expect(savedPage.layout?.[1]).toMatchObject({
    blockType: 'columnLayout',
    columns: [{ width: 6 }, { width: 6 }],
  })
})

test('appends an allowed copied block to section blocks and rejects a forbidden one', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${clipboardFixturePage.id}`)

  const layoutField = page.locator('#field-layout')
  const showAllButton = layoutField
    .locator(':scope > .blocks-field__header')
    .getByRole('button', { name: 'Pokaż wszystkie' })
  await expect(showAllButton).toHaveCount(1)
  await showAllButton.click()

  const topLevelRows = layoutField.locator('.blocks-field__row')
  await expect(topLevelRows).toHaveCount(2)
  await layoutField
    .locator('#layout-row-0 > div > div > .collapsible__actions-wrap .array-actions__button')
    .click()
  await page.getByRole('button', { name: 'Kopiuj wiersz' }).click()

  const sectionTabs = topLevelRows.nth(1).locator('.wkf-layout-tabs[data-layout-kind="sections"]')
  await sectionTabs.getByRole('tab', { name: 'Sekcja 1' }).click()
  const sectionBlocks = page.locator('#field-layout__1__sections__0__blocks')
  await expect(sectionBlocks.locator('.blocks-field__row')).toHaveCount(1)

  await sectionBlocks.locator(':scope > .blocks-field__header .clipboard-action__popup').click()
  await page.getByRole('button', { name: 'Wklej pole' }).click()

  const sectionRows = sectionBlocks.locator('.blocks-field__row')
  await expect(sectionRows).toHaveCount(2)
  await expect(sectionRows.nth(0)).toContainText('Treść')
  await expect(sectionRows.nth(1)).toContainText(
    'Układ kolumnowy: przezroczysta · bez ramki — 6/12 + 6/12',
  )

  await layoutField
    .locator('#layout-row-0 > div > div > .collapsible__actions-wrap .array-actions__button')
    .click()
  await page.getByRole('button', { exact: true, name: 'Usuń' }).click()
  await expect(layoutField.locator('.blocks-field__row')).toHaveCount(1)
  await expect(page.getByText(/Grupa sekcji: .* — 2 sekcje/)).toBeVisible()
  await layoutField.getByRole('tab', { exact: true, name: 'Sekcja 1' }).click()
  const movedSectionBlocks = page.locator('#field-layout__0__sections__0__blocks')
  const movedSectionRows = movedSectionBlocks.locator('.blocks-field__row')
  await expect(movedSectionRows).toHaveCount(2)
  await expect(movedSectionRows.nth(1)).toContainText('Układ kolumnowy')

  await layoutField
    .locator('#layout-row-0 > div > div > .collapsible__actions-wrap .array-actions__button')
    .click()
  await page.getByRole('button', { name: 'Kopiuj wiersz' }).click()
  await movedSectionBlocks
    .locator(':scope > .blocks-field__header .clipboard-action__popup')
    .click()
  await page.getByRole('button', { name: 'Wklej pole' }).click()
  await expect(page.getByText('Nieprawidłowe dane schowka.', { exact: true })).toBeVisible()
  await expect(movedSectionRows).toHaveCount(2)
})

function activePanel(field: import('@playwright/test').Locator) {
  return field.getByRole('tabpanel')
}

async function expectColumnWidths(
  field: import('@playwright/test').Locator,
  expectedValues: string[],
): Promise<void> {
  for (const [columnIndex, expectedValue] of expectedValues.entries()) {
    await field.getByRole('tab', { name: `Kolumna ${columnIndex + 1}` }).click()
    await expect(activePanel(field).locator('input[type="number"]')).toHaveValue(expectedValue)
  }
}

async function fillColumnWidth(
  field: import('@playwright/test').Locator,
  columnIndex: number,
  value: string,
): Promise<void> {
  await field.getByRole('tab', { name: `Kolumna ${columnIndex + 1}` }).click()
  await activePanel(field).locator('input[type="number"]').fill(value)
}

async function openColumnLayoutField(
  page: import('@playwright/test').Page,
): Promise<import('@playwright/test').Locator> {
  await page.waitForLoadState('networkidle')
  const layoutField = page.locator('#field-layout')
  const showAllButton = layoutField
    .locator(':scope > .blocks-field__header')
    .getByRole('button', { name: 'Pokaż wszystkie' })

  await expect(showAllButton).toHaveCount(1)
  await showAllButton.click()
  const layoutBlock = layoutField.locator('.blocks-field__row').first()
  const field = layoutBlock.locator('.wkf-layout-tabs[data-layout-kind="columns"]')

  await expect(field).toBeVisible()
  return field
}

async function dragToColumn(
  page: import('@playwright/test').Page,
  source: import('@playwright/test').Locator,
  target: import('@playwright/test').Locator,
): Promise<void> {
  await expect(source).toBeVisible()
  await expect(target).toBeVisible()
  await source.scrollIntoViewIfNeeded()
  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()
  if (!sourceBox || !targetBox) {
    throw new Error('Missing column drag coordinates.')
  }

  const sourceX = sourceBox.x + sourceBox.width / 2
  const sourceY = sourceBox.y + sourceBox.height / 2
  const targetX = targetBox.x + targetBox.width / 2
  const targetY = targetBox.y + targetBox.height / 2

  await page.mouse.move(sourceX, sourceY)
  await page.mouse.down()
  await page.mouse.move(sourceX + 10, sourceY, { steps: 2 })
  await page.mouse.move(targetX, targetY, { steps: 10 })
  await page.mouse.up()
}

async function cleanup(): Promise<void> {
  if (!payload) return
  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: {
      slug: {
        in: [fixtureSlug, defaultFixtureSlug, addedFixtureSlug, clipboardFixtureSlug],
      },
    },
  })
}
