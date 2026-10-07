// @vitest-environment jsdom

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ArrayField, BlocksField, Field, GroupField } from 'payload'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { TabbedContentFrame } from '@/app/(frontend)/_components/TabbedContentFrame'
import { TabbedContentBlock } from '@/blocks/TabbedContent'
import { createContentLayoutField } from '@/modules/content/layout-field'
import { walkContentLeafBlocks } from '@/modules/content/walk-content-leaf-blocks'

import { readFrontendStyles } from '../helpers/frontend-styles'

function findNamedField(fields: Field[], name: string): Field | undefined {
  for (const field of fields) {
    if ('name' in field && field.name === name) return field
    if ('fields' in field && Array.isArray(field.fields)) {
      const nestedField = findNamedField(field.fields, name)
      if (nestedField) return nestedField
    }
  }
}

function getTabsField(): ArrayField {
  const tabsField = findNamedField(TabbedContentBlock.fields, 'tabs')
  if (!tabsField || tabsField.type !== 'array') throw new Error('Missing tabs field')
  return tabsField
}

function getTabBlocksField(): BlocksField {
  const blocksField = findNamedField(getTabsField().fields, 'blocks')
  if (!blocksField || blocksField.type !== 'blocks') throw new Error('Missing tab blocks field')
  return blocksField
}

describe('tabbed content block', () => {
  it('uses a dedicated semantic block thumbnail', () => {
    expect(TabbedContentBlock.admin?.images?.thumbnail).toEqual({
      alt: 'Schematyczna ikona treści przełączanej zakładkami',
      url: '/assets/block-thumbnails/tabbed-content.png',
    })
  })

  it('defines two default tabs and excludes nested section groups', () => {
    const tabsField = getTabsField()
    const blockSlugs = getTabBlocksField().blocks.map((block) => block.slug)

    expect(tabsField).toMatchObject({
      defaultValue: [
        { blocks: [], label: 'Najbliższe' },
        { blocks: [], label: 'Kalendarz' },
      ],
      maxRows: 8,
      minRows: 2,
      required: true,
    })
    expect(blockSlugs).toContain('columnLayout')
    expect(blockSlugs).not.toContain('sectionGroup')
    expect(blockSlugs).not.toContain('tabs')
  })

  it('uses presented-link menus on both header sides and in the optional footer', () => {
    for (const fieldName of ['headerLeftItems', 'headerRightItems', 'footerItems']) {
      const menuField = findNamedField(TabbedContentBlock.fields, fieldName)
      if (!menuField || menuField.type !== 'array') {
        throw new Error(`Missing ${fieldName} menu field`)
      }

      expect(menuField.required).not.toBe(true)
      expect(findNamedField(menuField.fields, 'appearance')).toMatchObject({
        defaultValue: 'link',
        type: 'select',
      })
      expect(findNamedField(menuField.fields, 'iconName')).toMatchObject({ type: 'select' })
      expect(findNamedField(menuField.fields, 'targetType')).toMatchObject({ type: 'select' })
      expect(findNamedField(menuField.fields, 'targetType')).toMatchObject({
        options: expect.arrayContaining([expect.objectContaining({ value: 'siteContactEmail' })]),
      })
    }

    expect(findNamedField(TabbedContentBlock.fields, 'footerAlignment')).toMatchObject({
      defaultValue: 'center',
      options: [
        { label: 'Do lewej', value: 'start' },
        { label: 'Do środka', value: 'center' },
        { label: 'Do prawej', value: 'end' },
      ],
      required: true,
      type: 'select',
    })
  })

  it('uses a tabbed admin field with frame settings separate from tab contents', () => {
    const container = TabbedContentBlock.fields.find(
      (field): field is GroupField => field.type === 'group',
    )

    expect(container).toMatchObject({
      admin: {
        components: {
          Field: '/components/admin/TabbedLayoutField#TabbedContentTabsField',
        },
      },
      type: 'group',
    })
  })

  it('is available at the top level and exposes nested blocks to content processing', () => {
    const layoutField = createContentLayoutField('Treści')
    const availableBlockSlugs = layoutField.blocks.map((block) => block.slug)
    const references = [
      ...walkContentLeafBlocks([
        {
          blockType: 'tabs',
          tabs: [
            {
              blocks: [
                { blockType: 'richText' },
                {
                  blockType: 'columnLayout',
                  columns: [{ blocks: [{ blockType: 'listing' }] }],
                },
              ],
            },
          ],
        },
      ]),
    ]

    expect(availableBlockSlugs).toContain('tabs')
    expect(references.map(({ block }) => block.blockType)).toEqual(['richText', 'listing'])
    expect(references.map(({ path }) => path)).toEqual([
      'layout.0.tabs.0.blocks.0',
      'layout.0.tabs.0.blocks.1.columns.0.blocks.0',
    ])
  })

  it('keeps the event-frame hierarchy and responsive menu layout in frontend styles', () => {
    const frontendStyles = readFrontendStyles()

    expect(frontendStyles).toContain(
      '.tabbedContentHeader {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);',
    )
    expect(frontendStyles).toContain('.tabbedContentFooter--align-center')
    expect(frontendStyles).toContain(".tabbedContentTabs button[aria-selected='true']")
    expect(frontendStyles).toContain('@media (width <= 34rem)')
  })
})

describe('tabbed content frame', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    ;(
      globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
  })

  it('switches the visible panel and supports keyboard tab navigation', async () => {
    await act(async () => {
      root.render(
        createElement(TabbedContentFrame, {
          footer: createElement('a', { href: '/footer' }, 'Stopka'),
          footerAlignment: 'end',
          headerLeft: createElement('a', { href: '/left' }, 'Lewe menu'),
          headerRight: createElement('a', { href: '/right' }, 'Prawe menu'),
          tabs: [
            { content: createElement('p', null, 'Pierwsza treść'), id: 'first', label: 'Pierwszy' },
            { content: createElement('p', null, 'Druga treść'), id: 'second', label: 'Drugi' },
          ],
        }),
      )
    })

    const tabButtons = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
    const panels = [...container.querySelectorAll<HTMLElement>('[role="tabpanel"]')]

    expect(tabButtons.map((button) => button.getAttribute('aria-selected'))).toEqual([
      'true',
      'false',
    ])
    expect(panels.map((panel) => panel.hidden)).toEqual([false, true])
    expect(container.querySelector('.tabbedContentFooter--align-end')).not.toBeNull()

    await act(async () => {
      tabButtons[0]?.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }),
      )
    })

    expect(tabButtons.map((button) => button.getAttribute('aria-selected'))).toEqual([
      'false',
      'true',
    ])
    expect(panels.map((panel) => panel.hidden)).toEqual([true, false])
    expect(document.activeElement).toBe(tabButtons[1])
  })

  it('omits the footer when no footer menu resolves', async () => {
    await act(async () => {
      root.render(
        createElement(TabbedContentFrame, {
          footerAlignment: 'center',
          tabs: [{ content: createElement('p', null, 'Treść'), id: 'only', label: 'Tab' }],
        }),
      )
    })

    expect(container.querySelector('.tabbedContentFooter')).toBeNull()
  })
})
