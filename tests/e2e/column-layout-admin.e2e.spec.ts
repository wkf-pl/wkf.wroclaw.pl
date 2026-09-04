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

let payload: Payload
let author: User
let fixturePage: PageDocument
let defaultFixturePage: PageDocument

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
          columns: [
            { blocks: [richTextBlock('Left content')], width: 3 },
            { blocks: [richTextBlock('Middle content')], width: 3 },
            { blocks: [], width: 3 },
            { blocks: [richTextBlock('Right content')], width: 3 },
          ],
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
          columns: [
            { blocks: [], width: 6 },
            { blocks: [], width: 6 },
          ],
        },
      ],
      slug: defaultFixtureSlug,
      title: 'E2E default column layout admin',
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
  await expect(field.getByText('Suma szerokości: 12/12', { exact: true })).toBeVisible()
  await expectWidthValues(field, ['6', '6'])
  await expect(field.locator('.wkf-column-layout-content')).toHaveCount(2)

  const firstColumnContent = field.locator('.wkf-column-layout-content').first()
  await expect(firstColumnContent.locator('.wkf-column-layout-content__title')).toHaveText(
    'Kolumna 1 - 6/12',
  )
  await expect(field.locator('.wkf-column-layout-content > .collapsible__toggle-wrap')).toHaveCount(
    2,
  )
  await field.getByRole('button', { exact: true, name: 'Zwiń wszystkie' }).click()
  await expect(field.locator('.wkf-column-layout-content.collapsible--collapsed')).toHaveCount(2)
  await field.getByRole('button', { exact: true, name: 'Rozwiń wszystkie' }).click()
  await expect(field.locator('.wkf-column-layout-content.collapsible--collapsed')).toHaveCount(0)
  await firstColumnContent
    .locator(':scope > .collapsible__toggle-wrap > .collapsible__toggle')
    .click()
  await expect(firstColumnContent).toHaveClass(/collapsible--collapsed/)
  await firstColumnContent
    .locator(':scope > .collapsible__toggle-wrap > .collapsible__toggle')
    .click()
  await expect(firstColumnContent).not.toHaveClass(/collapsible--collapsed/)

  const configuratorTop = await field
    .locator('.wkf-column-layout-configurator')
    .evaluate((element) => element.getBoundingClientRect().top)
  const firstContentTop = await field
    .locator('.wkf-column-layout-content')
    .first()
    .evaluate((element) => element.getBoundingClientRect().top)
  expect(configuratorTop).toBeLessThan(firstContentTop)

  await field.getByRole('button', { name: 'Dodaj kolumnę' }).click()
  await expectWidthValues(field, ['6', '6', '2'])
  await expect(page.getByText('Układ kolumnowy: 6/12 + 6/12 + 2/12', { exact: true })).toBeVisible()
  await expect(field.getByText('Suma szerokości: 14/12', { exact: true })).toBeVisible()
  await expect(
    field.getByText('Szerokości kolumn muszą sumować się do 12.', { exact: true }),
  ).toBeVisible()
  await expect(field.locator('.wkf-column-layout-content')).toHaveCount(3)

  await field.getByRole('button', { name: 'Dodaj kolumnę' }).click()
  await expect(field.locator('.wkf-column-layout-content')).toHaveCount(4)
  await expect(field.getByRole('button', { name: 'Dodaj kolumnę' })).toHaveCount(0)
  await field.getByRole('button', { name: 'Usuń kolumnę 4' }).click()
  await expect(field.locator('.wkf-column-layout-content')).toHaveCount(3)
  await expect(page.getByRole('heading', { name: 'Usunąć kolumnę 4?' })).toHaveCount(0)

  await firstColumnContent.locator('.blocks-field__drawer-toggler').click()
  const innerDrawer = page.locator('.drawer--is-open')
  await expect(innerDrawer.getByText('Treść', { exact: true })).toBeVisible()
  await expect(innerDrawer.getByText('Układ kolumnowy', { exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')

  await widthInputs(field).first().fill('5')
  await expect(firstColumnContent.locator('.wkf-column-layout-content__title')).toHaveText(
    'Kolumna 1 - 5/12',
  )
  await expect(page.getByText('Układ kolumnowy: 5/12 + 6/12 + 2/12', { exact: true })).toBeVisible()
  await expect(field.getByText('Suma szerokości: 13/12', { exact: true })).toBeVisible()
  await expect(firstColumnContent).toBeVisible()
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
    page.getByText('Układ kolumnowy: 3/12 + 3/12 + 3/12 + 3/12', { exact: true }),
  ).toBeVisible()
  await expect(field.getByRole('button', { name: 'Dodaj kolumnę' })).toHaveCount(0)

  for (const columnIndex of [0, 1]) {
    const column = field.locator('.wkf-column-layout-content').nth(columnIndex)
    if (
      !(await column.evaluate((element) => element.classList.contains('collapsible--collapsed')))
    ) {
      await column.locator(':scope > .collapsible__toggle-wrap > .collapsible__toggle').click()
    }
  }

  const secondColumnDragHandle = field
    .locator('.wkf-column-layout-content')
    .nth(1)
    .locator(':scope > .collapsible__toggle-wrap .collapsible__drag')
  await dragToColumn(
    page,
    secondColumnDragHandle,
    field.locator('.wkf-column-layout-content-row').nth(0),
  )
  await expect(field.locator('.wkf-column-layout-content').nth(0)).toContainText('Middle content')
  await expect(field.locator('.wkf-column-layout-content').nth(1)).toContainText('Left content')

  await field.getByRole('button', { name: 'Przesuń kolumnę 1 w prawo' }).click()
  await expect(field.locator('.wkf-column-layout-content').nth(0)).toContainText('Left content')
  await field.getByRole('button', { name: 'Przesuń kolumnę 2 w lewo' }).click()
  await expect(field.locator('.wkf-column-layout-content').nth(0)).toContainText('Middle content')

  await field.getByRole('button', { name: 'Usuń kolumnę 3' }).click()
  await expect(field.locator('.wkf-column-layout-content')).toHaveCount(3)
  await expect(page.getByRole('heading', { name: 'Usunąć kolumnę 3?' })).toHaveCount(0)

  await field.getByRole('button', { name: 'Usuń kolumnę 2' }).click()
  const modal = page.locator('.confirmation-modal')
  await expect(modal.getByRole('heading', { name: 'Usunąć kolumnę 2?' })).toBeVisible()
  await expect(modal).toContainText(
    'Ta kolumna zawiera bloki. Usunięcie kolumny trwale usunie również całą jej zawartość z bieżącego dokumentu.',
  )
  await modal.getByRole('button', { name: 'Anuluj' }).click()
  await expect(field.locator('.wkf-column-layout-content')).toHaveCount(3)
  await expect(field.locator('.wkf-column-layout-content').nth(1)).toContainText('Left content')

  await field.getByRole('button', { name: 'Usuń kolumnę 2' }).click()
  await modal.getByRole('button', { name: 'Usuń kolumnę' }).click()
  await expect(field.locator('.wkf-column-layout-content')).toHaveCount(2)
  await expect(field).not.toContainText('Left content')
  await widthInputs(field).nth(0).fill('6')
  await widthInputs(field).nth(1).fill('6')
  await expect(field.getByText('Suma szerokości: 12/12', { exact: true })).toBeVisible()
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
  await expandColumn(reloadedField, 0)
  await expandColumn(reloadedField, 1)
  await expectWidthValues(reloadedField, ['6', '6'])
  await expect(reloadedField.locator('.wkf-column-layout-content').nth(0)).toContainText(
    'Middle content',
  )
  await expect(reloadedField.locator('.wkf-column-layout-content').nth(1)).toContainText(
    'Right content',
  )
  await expect(reloadedField).not.toContainText('Left content')
})

function widthInputs(field: import('@playwright/test').Locator) {
  return field.locator('.wkf-column-layout-width input[type="number"]')
}

async function expectWidthValues(
  field: import('@playwright/test').Locator,
  expectedValues: string[],
): Promise<void> {
  await expect
    .poll(() =>
      widthInputs(field).evaluateAll((inputs) =>
        inputs.map((input) => (input as HTMLInputElement).value),
      ),
    )
    .toEqual(expectedValues)
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
  const field = layoutBlock.locator('.wkf-column-layout-field')

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

async function expandColumn(
  field: import('@playwright/test').Locator,
  columnIndex: number,
): Promise<void> {
  const column = field.locator('.wkf-column-layout-content').nth(columnIndex)
  if (await column.evaluate((element) => element.classList.contains('collapsible--collapsed'))) {
    await column.locator(':scope > .collapsible__toggle-wrap > .collapsible__toggle').click()
  }
  await expect(column).not.toHaveClass(/collapsible--collapsed/)
}

async function cleanup(): Promise<void> {
  if (!payload) return
  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: { slug: { in: [fixtureSlug, defaultFixtureSlug] } },
  })
}
