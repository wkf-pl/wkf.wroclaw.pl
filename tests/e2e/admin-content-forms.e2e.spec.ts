import { expect, test, type Locator } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '../../src/payload.config.js'
import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const fixturePrefix = 'e2e-admin-content-forms'
const topicTitle = 'E2E Temat formularzy'
const parentPageTitle = 'E2E Strona nadrzędna listingu'
const listingPageTitle = 'E2E Strona z listingiem'
const relatedPostTitle = 'E2E Powiązany wpis'
const unclassifiedPostTitle = 'E2E Wpis bez klasyfikacji'

let payload: Payload
let topicID: number | string
let parentPageID: number | string
let listingPageID: number | string
let relatedPostID: number | string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanupFixtures()

  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: editorTestUser.email } },
  })
  const author = users.docs[0]

  if (!author) {
    throw new Error('Missing the editor E2E user.')
  }

  const topic = await payload.create({
    collection: 'topics',
    data: { name: topicTitle, slug: `${fixturePrefix}-topic` },
    overrideAccess: true,
  })
  const tag = await payload.create({
    collection: 'tags',
    data: { name: 'E2E Tag formularzy', slug: `${fixturePrefix}-tag` },
    overrideAccess: true,
  })
  topicID = topic.id

  const parentPage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'draft',
      author: author.id,
      slug: `${fixturePrefix}-parent`,
      title: parentPageTitle,
    },
    draft: true,
    overrideAccess: true,
  })
  parentPageID = parentPage.id
  const listingPage = await payload.create({
    collection: 'pages',
    data: {
      _status: 'draft',
      author: author.id,
      layout: [
        {
          blockType: 'listing',
          pageSize: 12,
          pagination: true,
          selectionMode: 'filters',
          sort: 'newest',
          sources: ['pages'],
          view: 'cards',
        },
      ],
      slug: `${fixturePrefix}-listing`,
      title: listingPageTitle,
    },
    draft: true,
    overrideAccess: true,
  })
  listingPageID = listingPage.id

  const relatedPost = await payload.create({
    collection: 'posts',
    data: {
      _status: 'published',
      author: author.id,
      topics: [topic.id],
      excerpt: 'Wpis używany do sprawdzenia kolumn relacji.',
      layout: [
        {
          blockType: 'heading',
          heading: 'Treść testowa',
          headingLevel: 'h2',
        },
      ],
      slug: `${fixturePrefix}-related-post`,
      tags: [tag.id],
      title: relatedPostTitle,
    },
    draft: false,
    overrideAccess: true,
  })
  relatedPostID = relatedPost.id
  await payload.create({
    collection: 'posts',
    data: {
      _status: 'draft',
      author: author.id,
      excerpt: 'Wpis używany do sprawdzenia pustych wartości.',
      slug: `${fixturePrefix}-unclassified-post`,
      title: unclassifiedPostTitle,
    },
    draft: true,
    overrideAccess: true,
  })
})

test.afterAll(async () => {
  await cleanupFixtures()
})

test('shows complete search labels and concise missing-value fallbacks', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/posts')

  await expect(page.getByPlaceholder('Szukaj według: Tytuł, Streszczenie lub Slug')).toBeVisible()
  const row = page.getByRole('row').filter({ hasText: unclassifiedPostTitle })
  await expect(row).toBeVisible()
  await expect(row.getByText('<brak>', { exact: true })).toHaveCount(2)
  await expect(row).not.toContainText('<Bez')
})

async function openListingConditionRow(row: Locator) {
  const toggle = row.getByRole('button', { name: 'Przełącz blok' })
  await toggle.scrollIntoViewIfNeeded()
  await expect(toggle).toHaveClass(/\bcollapsible__toggle--(?:open|collapsed)\b/)
  if ((await toggle.getAttribute('class'))?.includes('collapsible__toggle--collapsed')) {
    await toggle.click()
  }
  await expect(toggle).toHaveClass(/\bcollapsible__toggle--open\b/)
}

test('lays out Listing presentation fields and persists labeled relationship conditions', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${listingPageID}`)

  const listingRow = page.locator('#field-layout .blocks-field__row').first()
  await expect(listingRow.getByRole('button', { name: 'Treści', exact: true })).toBeVisible()
  await expect(listingRow.getByLabel('Szablon widoku', { exact: true })).toBeHidden()
  await listingRow.getByRole('button', { name: 'Prezentacja', exact: true }).click()
  await expect(listingRow.locator('#field-layout__0__selectionMode')).toBeHidden()

  await expect(listingRow.getByLabel('Ramka', { exact: true })).toBeHidden()
  await listingRow.locator('summary').filter({ hasText: 'Dostosuj wygląd' }).click()
  await expect(listingRow.getByLabel('Ramka', { exact: true })).toBeVisible()
  await expect(listingRow.getByLabel('Powierzchnia', { exact: true })).toBeVisible()

  const templateSelect = listingRow.getByLabel('Szablon widoku', { exact: true })
  const columnsSelect = listingRow.getByLabel('Kolumny', { exact: true })
  await expect(templateSelect).toHaveRole('combobox')
  await expect(
    templateSelect.locator('xpath=ancestor::div[contains(@class, "field-type")][1]'),
  ).toContainText('Karty')
  await expect(
    columnsSelect.locator('xpath=ancestor::div[contains(@class, "field-type")][1]'),
  ).toContainText('1')
  await expect(listingRow.locator('select')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Podgląd wyników' })).toBeVisible()
  const listingPreview = listingRow.frameLocator('iframe[title="Podgląd wyników Listingu"]')
  await expect(listingPreview.locator('.listingBlock')).toBeVisible()
  await expect(listingPreview.locator('html')).toHaveCSS('--gold', '#f3a313')
  await expect(listingPreview.locator('body')).toHaveCSS('font-family', /Roboto Condensed/)

  const frameField = listingRow
    .getByLabel('Ramka', { exact: true })
    .locator('xpath=ancestor::div[contains(@class, "field-type")][1]')
  await frameField.locator('.rs__control').click()
  await page.getByRole('option', { name: 'Obrys', exact: true }).click()
  const listingPresentation = listingPreview.locator('.listingPresentation')
  await expect(listingPresentation).toHaveAttribute('data-frame', 'outline')
  await expect(listingPresentation.locator(':scope > .contentPresentationContent')).toHaveCSS(
    'padding',
    '0px',
  )
  await frameField.locator('.rs__control').click()
  await page.getByRole('option', { name: 'Brak', exact: true }).click()
  await expect(listingPresentation).toHaveAttribute('data-frame', 'none')

  await listingRow.getByRole('button', { name: 'Treści', exact: true }).click()

  const selectionFieldBox = await page.locator('#field-layout__0__selectionMode').boundingBox()
  const sourcesFieldBox = await page.locator('#field-layout__0__sources').boundingBox()
  if (!selectionFieldBox || !sourcesFieldBox) {
    throw new Error('Missing visible Listing selection fields')
  }
  expect(Math.abs(selectionFieldBox.y - sourcesFieldBox.y)).toBeLessThan(2)
  expect(sourcesFieldBox.x).toBeGreaterThan(selectionFieldBox.x)
  expect(sourcesFieldBox.width / selectionFieldBox.width).toBeCloseTo(2, 1)

  const listingFooterFieldAnchors = [
    page.locator('#field-layout__0__sort'),
    page.locator('#field-layout__0__pageSize'),
    page.getByRole('switch', { name: /Włącz paginację/ }),
  ]
  const listingFooterFieldBoxes = await Promise.all(
    listingFooterFieldAnchors.map((field) =>
      field.evaluate((element) => {
        const fieldElement = element.closest('.field-type') ?? element
        const bounds = fieldElement.getBoundingClientRect()
        return { x: bounds.x, y: bounds.y }
      }),
    ),
  )
  const listingFooterFieldTops = listingFooterFieldBoxes.map(({ y }) => y)
  expect(Math.max(...listingFooterFieldTops) - Math.min(...listingFooterFieldTops)).toBeLessThan(2)
  expect(listingFooterFieldBoxes.map(({ x }) => x)).toEqual(
    [...listingFooterFieldBoxes.map(({ x }) => x)].sort((left, right) => left - right),
  )

  const conditionsSection = page.locator('.wkf-listing-conditions').filter({
    has: page.locator('#field-layout__0__conditions'),
  })
  const conditionsField = conditionsSection.locator('#field-layout__0__conditions')
  await expect(conditionsSection).toContainText('0 warunków')
  await conditionsField.getByRole('button', { name: /Dodaj Warunek/i }).click()
  const conditionRow = conditionsField.locator('.array-field__row').first()
  await expect(conditionRow).toBeVisible()
  await expect(conditionsSection).toContainText('1 warunek')
  const connector = conditionRow.getByText('JEŚLI', { exact: true })
  await openListingConditionRow(conditionRow)
  await expect(connector).toBeVisible()

  await conditionRow.locator('.rs__control').first().click()
  const fieldOptions = page.locator('.rs__menu')
  await expect(fieldOptions.getByText(/Strona nadrzędna|dotychczasowy/i)).toHaveCount(0)
  await fieldOptions.getByText('Element nadrzędny', { exact: true }).click()
  await expect(conditionRow.getByText('bezpośrednio pod', { exact: true })).toBeVisible()

  const relationshipInput = conditionRow.getByRole('combobox').nth(2)
  await relationshipInput.fill(parentPageTitle)
  await page.locator('.rs__menu').getByText(parentPageTitle, { exact: true }).click()
  await expect(conditionRow).toContainText(parentPageTitle)
  await expect(conditionRow).toContainText('Dotyczy wszystkich źródeł: Strony.')
  const conditionLabel = conditionRow.locator('.wkf-listing-condition-row-label')
  await expect(conditionLabel).toHaveText(
    `Warunek:Element nadrzędny bezpośrednio pod „${parentPageTitle}”`,
  )
  await expect(conditionLabel).toHaveAttribute(
    'title',
    `Warunek: Element nadrzędny bezpośrednio pod „${parentPageTitle}”`,
  )

  await conditionsField.getByRole('button', { name: /Dodaj Warunek/i }).click()
  const topicConditionRow = conditionsField.locator('.array-field__row').nth(1)
  await expect(topicConditionRow).toBeVisible()
  await expect(conditionsSection).toContainText('2 warunki')
  await openListingConditionRow(topicConditionRow)

  await topicConditionRow.locator('.rs__control').first().click()
  await page.locator('.rs__menu').getByText('Temat', { exact: true }).click()
  await expect(topicConditionRow.getByText('to lub ma podtemat', { exact: true })).toBeVisible()

  await page.keyboard.press('Escape')
  const topicRelationshipInput = topicConditionRow.getByRole('combobox').nth(2)
  await topicRelationshipInput.fill(topicTitle)
  await page.locator('.rs__menu').getByText(topicTitle, { exact: true }).click()
  const topicConditionLabel = topicConditionRow.locator('.wkf-listing-condition-row-label')
  await expect(topicConditionLabel).toHaveText(`Warunek:Temat to lub ma podtemat „${topicTitle}”`)
  await expect(conditionsSection.locator('.wkf-listing-conditions__summary')).toContainText(
    `temat to lub ma podtemat „${topicTitle}”`,
  )

  const conditionHeaderBox = await conditionRow.locator('.array-field__row-header').boundingBox()
  const firstConditionFieldLabelBox = await conditionRow
    .locator('label')
    .filter({ hasText: 'Pole' })
    .first()
    .boundingBox()
  if (!conditionHeaderBox || !firstConditionFieldLabelBox) {
    throw new Error('Missing condition row geometry')
  }
  expect(
    firstConditionFieldLabelBox.y - (conditionHeaderBox.y + conditionHeaderBox.height),
  ).toBeLessThan(20)

  const conditionsBox = await conditionsSection.boundingBox()
  const footerBox = await page.locator('#field-layout__0__sort').boundingBox()
  if (!conditionsBox || !footerBox) throw new Error('Missing Listing filter section geometry')
  expect(footerBox.y - (conditionsBox.y + conditionsBox.height)).toBeGreaterThan(20)

  const saveResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'PATCH' &&
      response.url().includes(`/api/pages/${listingPageID}`),
  )
  await page.getByRole('button', { name: 'Zapisz szkic' }).click()
  expect((await saveResponse).ok()).toBe(true)

  const savedPage = await payload.findByID({
    collection: 'pages',
    depth: 0,
    draft: true,
    id: listingPageID,
    overrideAccess: true,
  })
  const listing = savedPage.layout?.find((block) => block.blockType === 'listing')
  expect(listing?.conditions).toMatchObject([
    {
      field: 'contentParent',
      operator: 'equals',
      relatedTargetMode: 'selected',
      relatedTargetValue: { relationTo: 'pages', value: parentPageID },
    },
    {
      field: 'topic',
      operator: 'inSubtree',
      relationshipValue: { relationTo: 'topics', value: topicID },
    },
  ])
})

test('selects a manual Listing target through separate type and target fields', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${listingPageID}`)

  const selectionModeField = page.locator('#field-layout__0__selectionMode')
  await selectionModeField.getByRole('combobox').click()
  await page.locator('.rs__menu').getByText('Ręczny', { exact: true }).click()

  const itemsField = page.locator('#field-layout__0__items')
  await itemsField.getByRole('button', { name: 'Dodaj Treść' }).click()
  const typeLabel = page.locator('label').filter({ hasText: 'Typ treści' })
  const targetLabel = page.locator('label').filter({ hasText: 'Cel' })
  await expect(typeLabel).toBeVisible()
  await expect(targetLabel).toBeVisible()

  const typeField = typeLabel.locator('xpath=ancestor::div[contains(@class, "field-type")][1][1]')
  await typeField.locator('.rs__control').click()
  await page.locator('.rs__menu').getByText('Wpis', { exact: true }).click()

  const targetField = targetLabel.locator(
    'xpath=ancestor::div[contains(@class, "field-type")][1][1]',
  )
  await targetField.getByRole('combobox').click()
  await page.locator('.rs__menu').getByText(relatedPostTitle, { exact: true }).click()
  await expect(targetField).toContainText(relatedPostTitle)

  const saveResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'PATCH' &&
      response.url().includes(`/api/pages/${listingPageID}`),
  )
  await page.getByRole('button', { name: 'Zapisz szkic' }).click()
  expect((await saveResponse).ok()).toBe(true)

  const savedPage = await payload.findByID({
    collection: 'pages',
    depth: 0,
    draft: true,
    id: listingPageID,
    overrideAccess: true,
  })
  const listing = savedPage.layout?.find((block) => block.blockType === 'listing')
  expect(listing).toMatchObject({
    items: [{ item: { relationTo: 'posts', value: relatedPostID } }],
    selectionMode: 'manual',
  })
})

test('loads the Location map preview after an explicit request', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/collections/locations/create')

  const mapURL = 'https://www.google.com/maps/embed?pb=e2e'
  await page.route(mapURL, (route) => route.fulfill({ body: 'Example map' }))
  await page.locator('#field-mapEmbedURL').fill(mapURL)
  const frame = page.locator('iframe[title="Podgląd mapy miejsca"]')
  await expect(frame).toHaveCount(0)
  await page.getByRole('button', { name: 'Wczytaj podgląd Map Google' }).click()
  await expect(frame).toBeVisible()
  await expect(frame).toHaveAttribute('src', mapURL)
})

test('shows related posts on the topic form', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/topics/${topicID}`)
  const relatedPosts = page.locator('.wkf-taxonomy-related-content').filter({
    has: page.getByRole('heading', { name: 'Powiązane wpisy' }),
  })
  await expect(relatedPosts.getByText(relatedPostTitle, { exact: true })).toBeVisible()
})

async function cleanupFixtures(): Promise<void> {
  if (!payload) return

  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: { slug: { in: [`${fixturePrefix}-parent`, `${fixturePrefix}-listing`] } },
  })
  await payload.delete({
    collection: 'posts',
    overrideAccess: true,
    where: {
      slug: {
        in: [`${fixturePrefix}-related-post`, `${fixturePrefix}-unclassified-post`],
      },
    },
  })
  await payload.delete({
    collection: 'topics',
    overrideAccess: true,
    where: { slug: { equals: `${fixturePrefix}-topic` } },
  })
  await payload.delete({
    collection: 'tags',
    overrideAccess: true,
    where: { slug: { equals: `${fixturePrefix}-tag` } },
  })
}
