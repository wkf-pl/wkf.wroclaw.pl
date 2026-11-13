import { expect, test, type Page, type Request } from '@playwright/test'
import { getPayload, type Payload } from 'payload'

import config from '@/payload.config'

import { createLexicalDocument } from '../helpers/lexical-document'
import { login } from '../helpers/login'
import { editorTestUser } from '../helpers/seedUser'

const draftSlug = 'e2e-draft-preview'
const invalidDraftSlug = 'e2e-invalid-draft-preview'
const globalDraftPreviewSlugs = [
  'navigation',
  'homepage-hero',
  'homepage-sections',
  'footer',
] as const
const navigationTimeout = 20_000
const pageTemplateDraftHeading = 'Roboczy układ szablonu wydarzenia E2E'
const pageTemplateEditorUser = {
  displayName: 'Codex Page Template Editor E2E',
  email: 'codex-page-template-editor-e2e@example.invalid',
  password: 'test',
}
const pageTemplatePreviewEventSlug = 'page-template-preview-e2e'
let invalidDraftPageID: number | string
let draftPageID: number | string
let draftPostID: number | string
let payload: Payload
let pageTemplateID: number | string
test.beforeAll(async () => {
  payload = await getPayload({ config })
  await cleanupPageTemplateEditor()
  await payload.delete({
    collection: 'pages',
    overrideAccess: true,
    where: { slug: { in: [draftSlug, invalidDraftSlug] } },
  })
  await payload.delete({
    collection: 'posts',
    overrideAccess: true,
    where: { slug: { equals: draftSlug } },
  })
  await payload.delete({
    collection: 'events',
    overrideAccess: true,
    where: { slug: { equals: pageTemplatePreviewEventSlug } },
  })

  const [users, eventTypes, roles, mediaItems] = await Promise.all([
    payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      where: { email: { equals: editorTestUser.email } },
    }),
    payload.find({
      collection: 'event-types',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
    }),
    payload.find({
      collection: 'roles',
      depth: 0,
      limit: 2,
      overrideAccess: true,
      pagination: false,
      where: { key: { in: ['administrator', 'editor'] } },
    }),
    payload.find({
      collection: 'media',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      where: { alt: { equals: 'Klubowicze podczas wspólnej sesji gry fabularnej' } },
    }),
  ])
  const editor = users.docs[0]
  const eventType = eventTypes.docs[0]
  const administratorRole = roles.docs.find(({ key }) => key === 'administrator')
  const editorRole = roles.docs.find(({ key }) => key === 'editor')
  const heroImage = mediaItems.docs[0]

  if (!editor) {
    throw new Error('Missing the E2E editor user required by the preview test.')
  }
  if (!eventType) {
    throw new Error('Missing an event type required by the page template preview test.')
  }
  if (!administratorRole || !editorRole) {
    throw new Error('Missing roles required by the page template preview test.')
  }
  if (!heroImage) {
    throw new Error('Missing the seeded event Hero image.')
  }

  await payload.create({
    collection: 'users',
    data: {
      ...pageTemplateEditorUser,
      roles: [administratorRole.id, editorRole.id],
    },
    overrideAccess: true,
  })

  const previewEvent = await payload.create({
    collection: 'events',
    data: {
      _status: 'published',
      author: editor.id,
      calendarRevision: 0,
      capacityMode: 'unlimited',
      eventStatus: 'scheduled',
      eventType: eventType.id,
      excerpt: createLexicalDocument('Wydarzenie używane do podglądu szablonu strony.'),
      heroImage: heroImage.id,
      layout: [
        {
          blockType: 'richText',
          content: createLexicalDocument('Treść wydarzenia używanego do podglądu szablonu.'),
        },
      ],
      location: { country: 'Polska' },
      participation: 'public',
      slug: pageTemplatePreviewEventSlug,
      startAt: '2026-12-12T17:00:00.000Z',
      timeMode: 'timed',
      title: 'Wydarzenie podglądu szablonu E2E',
    },
    draft: false,
    overrideAccess: true,
  })

  const pageTemplates = await payload.find({
    collection: 'page-templates',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { templateKey: { equals: 'event-detail' } },
  })
  const eventPageTemplate = pageTemplates.docs[0]
  if (!eventPageTemplate) {
    throw new Error('Missing the event page template required by the preview test.')
  }
  pageTemplateID = eventPageTemplate.id

  await payload.update({
    collection: 'page-templates',
    data: {
      _status: 'draft',
      content: [
        {
          blockType: 'heading',
          heading: pageTemplateDraftHeading,
          headingLevel: 'h2',
        },
        { blockType: 'currentItemContent' },
        {
          blockType: 'listing',
          contextRelation: 'eventPartners',
          hideWhenEmpty: true,
          selectionMode: 'contextRelation',
          view: 'cards',
        },
      ],
      hero: [
        {
          blockType: 'currentItemFieldRow',
          items: [
            { blockType: 'pageTemplateIcon', iconName: 'seance' },
            { blockType: 'currentItemField', field: 'eventType', variant: 'emphasizedBadge' },
            { blockType: 'fieldRowText', text: createLexicalDocument('—') },
            { blockType: 'currentItemField', field: 'eventStatus', variant: 'badge' },
          ],
        },
        {
          blockType: 'currentItemField',
          field: 'title',
          variant: 'primaryHeading',
        },
      ],
      informationPanel: [
        {
          blockType: 'currentItemFieldRow',
          items: [
            { blockType: 'pageTemplateIcon', iconName: 'calendar', hanging: true },
            { blockType: 'fieldRowText', text: createLexicalDocument('Termin wydarzenia') },
          ],
        },
        { blockType: 'currentItemField', field: 'eventTime', variant: 'icon' },
      ],
      previewTarget: { relationTo: 'events', value: previewEvent.id },
      renderingMode: 'legacy',
    },
    draft: true,
    id: eventPageTemplate.id,
    overrideAccess: true,
  })

  const draftPage = await payload.create({
    collection: 'pages',
    data: {
      author: editor.id,
      layout: [
        {
          blockType: 'heading',
          heading: 'Treść poprawnego szkicu strony',
          headingLevel: 'h2',
        },
      ],
      slug: draftSlug,
      title: 'Szkic widoczny wyłącznie w podglądzie',
    },
    draft: true,
    overrideAccess: true,
  })
  draftPageID = draftPage.id

  const invalidDraftPage = await payload.create({
    collection: 'pages',
    data: {
      author: editor.id,
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
      slug: invalidDraftSlug,
      title: 'Szkic z walidacją przed podglądem',
    },
    draft: true,
    overrideAccess: true,
  })
  invalidDraftPageID = invalidDraftPage.id

  const draftPost = await payload.create({
    collection: 'posts',
    data: {
      author: editor.id,
      excerpt: 'Streszczenie testowego szkicu wpisu.',
      layout: [
        {
          blockType: 'heading',
          heading: 'Treść poprawnego szkicu wpisu',
          headingLevel: 'h2',
        },
      ],
      slug: draftSlug,
      title: 'Szkic wpisu widoczny wyłącznie w podglądzie',
    },
    draft: true,
    overrideAccess: true,
  })
  draftPostID = draftPost.id
})

test.afterAll(async () => {
  if (payload) {
    await payload.delete({
      collection: 'pages',
      overrideAccess: true,
      where: { slug: { in: [draftSlug, invalidDraftSlug] } },
    })
    await payload.delete({
      collection: 'posts',
      overrideAccess: true,
      where: { slug: { equals: draftSlug } },
    })
    if (pageTemplateID) {
      await payload.update({
        collection: 'page-templates',
        data: {
          _status: 'published',
          content: [],
          hero: [],
          informationPanel: [],
          previewTarget: null,
          renderingMode: 'legacy',
        },
        draft: false,
        id: pageTemplateID,
        overrideAccess: true,
      })
    }
    await payload.delete({
      collection: 'events',
      overrideAccess: true,
      where: { slug: { equals: pageTemplatePreviewEventSlug } },
    })
    await cleanupPageTemplateEditor()
  }
})

test('rejects anonymous draft preview access', async ({ request }) => {
  const response = await request.get(`/preview?collection=pages&slug=${draftSlug}`)
  const globalResponse = await request.get('/preview?global=homepage-hero')
  const globalDraftAPIResponse = await request.get('/api/globals/homepage-hero?draft=true')

  expect(response.status()).toBe(403)
  expect(response.headers()['set-cookie']).toBeUndefined()
  expect(globalResponse.status()).toBe(403)
  expect(globalResponse.headers()['set-cookie']).toBeUndefined()
  expect(globalDraftAPIResponse.status()).toBe(403)
})

test('shows the preview button for every versioned global', async ({ page }) => {
  await login({ page, user: editorTestUser })

  for (const globalSlug of globalDraftPreviewSlugs) {
    await page.goto(`/admin/globals/${globalSlug}`)
    await expect(page.locator('#preview-button')).toBeVisible()
  }
})

test('matches event template spacing to the legacy layout on desktop and mobile', async ({
  page,
}) => {
  await login({ page, user: pageTemplateEditorUser })
  await page.goto(`/events/${pageTemplatePreviewEventSlug}`)
  await expect(page.locator('.eventDetails')).toBeVisible()

  const previewPage = await page.context().newPage()
  await previewPage.goto('/preview?pageTemplate=event-detail')
  await expect(previewPage.getByRole('region', { name: 'Panel informacyjny' })).toBeVisible()

  for (const width of [1280, 960, 390]) {
    await page.setViewportSize({ height: 900, width })
    await previewPage.setViewportSize({ height: 900, width })
    const legacySpacing = await measureEventSpacing(page, '.eventDetails', '.eventPageBody')
    const templateSpacing = await measureEventSpacing(
      previewPage,
      '.pageTemplateInformationPanel',
      '.pageTemplateContent',
    )

    expect
      .soft(templateSpacing.headerToHero, `Header to Hero at ${width}px`)
      .toBeCloseTo(legacySpacing.headerToHero, 0)
    expect
      .soft(templateSpacing.panelToContent, `Panel to content at ${width}px`)
      .toBeCloseTo(legacySpacing.panelToContent, 0)
    expect
      .soft(templateSpacing.imageToPanel, `Template image to panel at ${width}px`)
      .toBeGreaterThanOrEqual(24)
    expect
      .soft(legacySpacing.imageToPanel, `Legacy image to panel at ${width}px`)
      .toBeGreaterThanOrEqual(24)
  }
})

test('previews a draft page template before enabling template rendering publicly', async ({
  page,
}) => {
  await login({ page, user: pageTemplateEditorUser })
  await page.goto(`/admin/collections/page-templates/${pageTemplateID}`)

  const heroField = page.locator('#field-hero')
  await heroField.locator(':scope > .blocks-field__drawer-toggler').click()
  const blockDrawer = page.locator('.drawer--is-open').filter({
    has: page.locator('.blocks-drawer__block-groups'),
  })
  const elementsGroup = blockDrawer.locator('.blocks-drawer__block-group').filter({
    has: page.getByRole('heading', { name: 'Elementy', exact: true }),
  })
  await expect(elementsGroup.getByText('Pole bieżącego elementu', { exact: true })).toBeVisible()
  await expect(elementsGroup.getByText('Ikona', { exact: true })).toBeVisible()
  await expect(elementsGroup.locator('img[src$="/current-item-field.png"]')).toBeVisible()
  await expect(elementsGroup.locator('img[src$="/page-template-icon.png"]')).toBeVisible()
  await expect(blockDrawer.locator('img[src$="/current-item-field-row.png"]')).toBeVisible()
  await blockDrawer.locator('.drawer__header__close').click()

  await expect(
    heroField.getByText(': Ikona seance + Typ wydarzenia + "—" + Status wydarzenia', {
      exact: true,
    }),
  ).toBeVisible()
  await expect(heroField.getByText(': Seans', { exact: true })).toBeVisible()
  await expect(heroField.getByText(': —', { exact: true })).toBeVisible()
  const fieldSelect = heroField.locator('.field-type.select').filter({
    has: page.locator('[id="hero.0.items.1.field"]'),
  })
  const variantSelect = heroField.locator('.field-type.select').filter({
    has: page.locator('[id="hero.0.items.1.variant"]'),
  })
  await expect(fieldSelect).toHaveCSS('--field-width', '66.667%')
  await expect(variantSelect).toHaveCSS('--field-width', '33.333%')

  const textEditor = heroField.locator('.rich-text-lexical [contenteditable="true"]')
  await expect(textEditor).toHaveText('—')
  await textEditor.press('Control+a')
  await textEditor.press('Control+b')
  await textEditor.press('End')
  await textEditor.press('Shift+Enter')

  await page.getByRole('button', { name: 'Panel informacyjny', exact: true }).click()
  await expect(
    page.locator('#field-informationPanel__0__items__0__iconName .raster-icon-picker__value'),
  ).toBeVisible()
  const inversionSwitch = page
    .locator('#field-informationPanel')
    .getByRole('switch', { name: /^Inwersja\b/ })
  await expect(inversionSwitch).not.toBeChecked()
  await inversionSwitch.check()
  const textStyle = page.locator('#field-informationPanel__0__items__1__style')
  await textStyle.getByRole('combobox').click()
  await page.locator('.rs__menu').getByText('Etykieta', { exact: true }).click()

  await page.getByRole('button', { name: 'Treść', exact: true }).click()
  const contentField = page.locator('#field-content')
  await contentField.locator(':scope > .blocks-field__drawer-toggler').click()
  await expect(elementsGroup.getByText('Treści bieżącego elementu', { exact: true })).toBeVisible()
  await expect(elementsGroup.locator('img[src$="/current-item-content.png"]')).toBeVisible()
  await blockDrawer.locator('.drawer__header__close').click()
  const selectionMode = contentField.locator('#field-content__2__selectionMode')
  const contextRelation = contentField.locator('.field-type.select').filter({
    has: page.locator('[id="content.2.contextRelation"]'),
  })
  await expect(selectionMode).toHaveCSS('--field-width', '33.333%')
  await expect(contextRelation).toHaveCSS('--field-width', '66.667%')
  expect((await contextRelation.boundingBox())?.y).toBe((await selectionMode.boundingBox())?.y)

  const previewPagePromise = page.waitForEvent('popup')
  await page.locator('#preview-button').click()
  const previewPage = await previewPagePromise

  await expect(previewPage).toHaveURL(
    new RegExp(`/events/${pageTemplatePreviewEventSlug}\\?pageTemplatePreview=event-detail$`),
    { timeout: navigationTimeout },
  )
  await expect(previewPage.getByRole('heading', { name: pageTemplateDraftHeading })).toBeVisible()
  await expect(previewPage.getByRole('status')).toContainText('Podglądasz roboczy układ szablonu.')

  const fieldRow = previewPage.locator('.contentHero .pageTemplateFieldRow')
  await expect(fieldRow.locator('.pageTemplateFieldRowText strong')).toHaveText('—')
  await expect(fieldRow.locator('.pageTemplateFieldRowText :is(p, br)')).toHaveCount(0)
  await expect(fieldRow.locator('.pageTemplateBadge--emphasizedBadge')).toHaveCSS(
    'color',
    'rgb(255, 255, 255)',
  )
  const informationPanel = previewPage.getByRole('region', { name: 'Panel informacyjny' })
  const eventTime = informationPanel.locator('time')
  const hangingIcon = informationPanel.locator('.pageTemplateIcon--hanging')
  await expect(hangingIcon).toHaveClass(/contentHeadingIcon--inverted/)
  await expect(hangingIcon).toHaveCSS('background-color', 'rgb(243, 163, 19)')
  await expect(hangingIcon.locator('.rasterIcon')).toHaveCSS('color', 'rgb(0, 13, 23)')
  const iconCaption = informationPanel.getByText('Termin wydarzenia', { exact: true })
  await expect(iconCaption).toHaveClass(/\bpageTemplateBadge\b/)
  await expect(iconCaption).toHaveCSS('text-transform', 'uppercase')
  await expect(informationPanel.getByText('Kiedy', { exact: true })).toHaveCount(0)
  for (const width of [1280, 390]) {
    await previewPage.setViewportSize({ height: 900, width })
    const rowOverflow = await fieldRow.evaluate((row) => row.scrollWidth - row.clientWidth)
    expect(rowOverflow).toBe(0)
    const rowItems = await fieldRow.locator('.pageBlocks > *').evaluateAll((items) =>
      items.map((item) => {
        const { left, right, top, height } = item.getBoundingClientRect()
        return { left, right, verticalCenter: top + height / 2 }
      }),
    )
    expect(rowItems).toHaveLength(4)
    for (let index = 1; index < rowItems.length; index += 1) {
      expect(rowItems[index].left).toBeGreaterThanOrEqual(rowItems[index - 1].right)
      expect(rowItems[index].verticalCenter).toBeCloseTo(rowItems[0].verticalCenter, 0)
    }
    const dateBounds = await eventTime.locator('strong').boundingBox()
    const timeBounds = await eventTime.locator('span').boundingBox()
    expect(dateBounds).not.toBeNull()
    expect(timeBounds).not.toBeNull()
    expect(timeBounds!.y).toBeGreaterThanOrEqual(dateBounds!.y + dateBounds!.height)
    const iconBounds = await hangingIcon.boundingBox()
    const captionBounds = await iconCaption.boundingBox()
    expect(iconBounds).not.toBeNull()
    expect(captionBounds).not.toBeNull()
    expect(iconBounds!.x + iconBounds!.width).toBeLessThan(captionBounds!.x)
    expect(dateBounds!.x).toBeCloseTo(captionBounds!.x, 0)
  }

  await previewPage.getByRole('link', { name: 'Wyłącz podgląd' }).click()
  await expect(previewPage).toHaveURL(new RegExp(`/events/${pageTemplatePreviewEventSlug}$`), {
    timeout: navigationTimeout,
  })
  await expect(previewPage.getByRole('heading', { name: pageTemplateDraftHeading })).toHaveCount(0)
})

async function measureEventSpacing(page: Page, panelSelector: string, contentSelector: string) {
  await expect(page.locator('.contentHeroMedia')).toBeVisible()
  return page.evaluate(
    ({ panelSelector, contentSelector }) => {
      function bounds(selector: string) {
        const element = document.querySelector(selector)
        if (!element) throw new Error(`Missing event layout element: ${selector}`)
        return element.getBoundingClientRect()
      }

      const heroMedia = bounds('.contentHeroMedia')
      const panel = bounds(panelSelector)
      return {
        headerToHero:
          Math.min(bounds('.contentHeroCopy').top, heroMedia.top) - bounds('.siteHeader').bottom,
        imageToPanel: panel.top - heroMedia.bottom,
        panelToContent: bounds(`${contentSelector} > .pageBlocks`).top - panel.bottom,
      }
    },
    { panelSelector, contentSelector },
  )
}

test('saves a draft before opening it from the admin preview button and can leave preview mode', async ({
  page,
}) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${draftPageID}`)

  const previewButton = page.locator('#preview-button')
  const updatedTitle = 'Szkic zapisany automatycznie przed podglądem'

  await expect(previewButton).toHaveText('Podgląd')
  await page.getByRole('textbox', { name: 'Tytuł *' }).fill(updatedTitle)

  const saveDraftResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'PATCH' &&
      response.url().includes(`/api/pages/${draftPageID}`) &&
      response.url().includes('draft=true'),
  )
  const previewPagePromise = page.waitForEvent('popup')
  await previewButton.click()
  const previewPage = await previewPagePromise
  const saveDraftResponse = await saveDraftResponsePromise

  expect(saveDraftResponse.status(), await saveDraftResponse.text()).toBe(200)

  await expect(previewPage).toHaveURL(new RegExp(`/${draftSlug}$`), {
    timeout: navigationTimeout,
  })
  await expect(previewPage.getByRole('heading', { name: updatedTitle })).toBeVisible()
  await expect(previewPage.getByRole('status')).toContainText('Wyświetlasz zapisany szkic.')

  await previewPage.getByRole('link', { name: 'Wyłącz podgląd' }).click()
  await expect(previewPage).toHaveURL(new RegExp(`/${draftSlug}$`), {
    timeout: navigationTimeout,
  })
  await expect(previewPage.getByRole('heading', { name: updatedTitle })).toHaveCount(0)

  await page.goto(`/admin/collections/posts/${draftPostID}`)

  await expect(page.locator('#preview-button')).toHaveText('Podgląd')

  const postPreviewPagePromise = page.waitForEvent('popup')
  await page.locator('#preview-button').click()
  const postPreviewPage = await postPreviewPagePromise

  await expect(postPreviewPage).toHaveURL(new RegExp(`/blog/${draftSlug}$`), {
    timeout: navigationTimeout,
  })
  await expect(
    postPreviewPage.getByRole('heading', {
      name: 'Szkic wpisu widoczny wyłącznie w podglądzie',
    }),
  ).toBeVisible()
})

test('allows a manual Hero checkpoint after saving an autosave for preview', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.clock.install()
  await page.goto('/admin/globals/homepage-hero')

  const previewButton = page.locator('#preview-button')
  const saveDraftButton = page.locator('#action-save-draft')
  const title = page.locator('[data-field-path="title"] [contenteditable="true"]')
  const backgroundSaves: string[] = []
  const trackBackgroundSaves = (request: Request) => {
    const url = new URL(request.url())
    if (url.pathname === '/api/globals/homepage-hero' && url.searchParams.has('autosave')) {
      backgroundSaves.push(url.pathname)
    }
  }
  page.on('request', trackBackgroundSaves)
  await expect(previewButton).toBeVisible()
  await title.press('End')
  await page.keyboard.insertText('!')
  await expect(saveDraftButton).toBeEnabled()
  // Advance beyond Payload's default autosave delay before explicitly requesting preview.
  await page.clock.runFor(2500)
  expect(backgroundSaves).toEqual([])
  await expect(saveDraftButton).toBeEnabled()
  page.off('request', trackBackgroundSaves)

  const previewPagePromise = page.waitForEvent('popup')
  await previewButton.click()
  const previewPage = await previewPagePromise
  await expect(previewPage.getByRole('status')).toContainText('Wyświetlasz zapisany szkic.')
  await previewPage.close()

  await expect(saveDraftButton).toBeEnabled()
  const checkpoint = page.waitForResponse((response) => {
    const url = new URL(response.url())
    return (
      url.pathname === '/api/globals/homepage-hero' &&
      response.request().method() === 'POST' &&
      url.searchParams.get('draft') === 'true' &&
      !url.searchParams.has('autosave')
    )
  })
  await saveDraftButton.click()
  expect((await checkpoint).ok()).toBe(true)
  await expect(saveDraftButton).toBeDisabled()
})

test('shows only the direct save action for Podstawowe', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto('/admin/globals/site-settings')
  await expect(page.locator('#action-save')).toBeVisible()
  await expect(page.locator('#preview-button, #action-save-draft')).toHaveCount(0)
})

test('validates required manual Listing targets before opening draft preview', async ({ page }) => {
  await login({ page, user: editorTestUser })
  await page.goto(`/admin/collections/pages/${invalidDraftPageID}`)

  const selectionModeField = page.locator('#field-layout__0__selectionMode')
  await selectionModeField.getByRole('combobox').click()
  await page.locator('.rs__menu').getByText('Ręczny', { exact: true }).click()

  const itemsField = page.locator('#field-layout__0__items')
  await itemsField.getByRole('button', { name: 'Dodaj Treść' }).click()

  const typeLabel = page.locator('label').filter({ hasText: 'Typ treści' })
  const targetLabel = page.locator('label').filter({ hasText: 'Cel' })
  const typeField = typeLabel.locator('xpath=ancestor::div[contains(@class, "field-type")][1]')
  const targetField = targetLabel.locator('xpath=ancestor::div[contains(@class, "field-type")][1]')
  await typeField.locator('.rs__control').click()
  await page.locator('.rs__menu').getByText('Dokument', { exact: true }).click()

  const previewRequests: string[] = []
  page.on('request', (request) => {
    if (
      request.method() === 'PATCH' &&
      request.url().includes(`/api/pages/${invalidDraftPageID}`)
    ) {
      previewRequests.push(request.url())
    }
  })
  const openPageCount = page.context().pages().length

  await page.locator('#preview-button').click()

  await expect(targetField.locator('.field-error')).toBeVisible()
  await expect(page.locator('#preview-button')).toHaveText('Podgląd')
  await expect.poll(() => page.context().pages().length).toBe(openPageCount)
  expect(previewRequests).toEqual([])
})

async function cleanupPageTemplateEditor(): Promise<void> {
  if (!payload) return

  const users = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: { email: { equals: pageTemplateEditorUser.email } },
  })
  const user = users.docs[0]
  if (!user) return

  await payload.delete({
    collection: 'payload-locked-documents',
    overrideAccess: true,
    where: { 'user.value': { equals: user.id } },
  })
  await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
}
