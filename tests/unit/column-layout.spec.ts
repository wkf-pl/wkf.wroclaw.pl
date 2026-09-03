import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'
import type { BlocksField, Field } from 'payload'

import { ColumnLayoutBlock, contentLeafBlocks, validateColumnLayoutColumns } from '@/blocks'
import { EventCycles } from '@/collections/EventCycles'
import { Events } from '@/collections/Events'
import { Pages } from '@/collections/Pages'
import { Partners } from '@/collections/Partners'
import { Posts } from '@/collections/Posts'
import { createBlockParameterSuffix } from '@/modules/content/block-parameter-name'
import { createContentLayoutField } from '@/modules/content/layout-field'
import { walkContentLeafBlocks } from '@/modules/content/walk-content-leaf-blocks'

function validate(columns: unknown): true | string {
  return validateColumnLayoutColumns(columns as never, {} as never) as true | string
}

describe('column layout', () => {
  it.each([
    [[{ width: 6 }, { width: 6 }]],
    [[{ width: 10 }, { width: 2 }]],
    [[{ width: 2 }, { width: 4 }, { width: 6 }]],
    [[{ width: 3 }, { width: 3 }, { width: 3 }, { width: 3 }]],
  ])('accepts a valid twelve-unit configuration', (columns) => {
    expect(validate(columns)).toBe(true)
  })

  it.each([
    {
      columns: [{ width: 5 }, { width: 5 }],
      message: 'Szerokości kolumn muszą sumować się do 12.',
    },
    {
      columns: [{ width: 1 }, { width: 11 }],
      message: 'Szerokość każdej kolumny musi być liczbą całkowitą od 2 do 10.',
    },
    {
      columns: [{ width: 5.5 }, { width: 6.5 }],
      message: 'Szerokość każdej kolumny musi być liczbą całkowitą od 2 do 10.',
    },
    {
      columns: [{ width: 12 }],
      message: 'Układ kolumnowy musi zawierać od 2 do 4 kolumn.',
    },
    {
      columns: [{ width: 2 }, { width: 2 }, { width: 2 }, { width: 2 }, { width: 4 }],
      message: 'Układ kolumnowy musi zawierać od 2 do 4 kolumn.',
    },
    {
      columns: [{ blocks: [{ blockType: 'columnLayout' }], width: 6 }, { width: 6 }],
      message: 'Układu kolumnowego nie można zagnieżdżać.',
    },
  ])('rejects invalid column data', ({ columns, message }) => {
    expect(validate(columns)).toBe(message)
  })

  it('uses leaf blocks inside columns and adds the layout block only at the top level', () => {
    const layoutField = createContentLayoutField('Treści')
    expect(layoutField.type).toBe('blocks')
    if (layoutField.type !== 'blocks') throw new Error('Missing content layout field')

    expect(layoutField.blocks.map((block) => block.slug)).toEqual([
      ...contentLeafBlocks.map((block) => block.slug),
      'columnLayout',
    ])

    const columnsField = ColumnLayoutBlock.fields.find(
      (field) => 'name' in field && field.name === 'columns',
    )
    expect(columnsField?.type).toBe('array')
    if (!columnsField || columnsField.type !== 'array') throw new Error('Missing columns field')
    const blocksField = columnsField.fields.find(
      (field) => 'name' in field && field.name === 'blocks',
    )
    expect(blocksField?.type).toBe('blocks')
    if (!blocksField || blocksField.type !== 'blocks')
      throw new Error('Missing nested blocks field')
    expect(blocksField.blocks.map((block) => block.slug)).toEqual(
      contentLeafBlocks.map((block) => block.slug),
    )
  })

  it('registers column layouts in every consumer of the shared layout field', () => {
    for (const collection of [Pages, Posts, Events, Partners]) {
      const layoutFields = findLayoutFields(collection.fields)
      expect(layoutFields).toHaveLength(1)
      expect(layoutFields[0]?.blocks.map((block) => block.slug)).toContain('columnLayout')
    }

    const cycleLayoutFields = findLayoutFields(EventCycles.fields)
    expect(cycleLayoutFields).toHaveLength(2)
    expect(
      cycleLayoutFields.every((field) =>
        field.blocks.some((block) => block.slug === 'columnLayout'),
      ),
    ).toBe(true)
  })

  it('walks top-level and nested leaf blocks in reading order', () => {
    const references = [
      ...walkContentLeafBlocks([
        { blockType: 'richText', marker: 'top' },
        {
          blockType: 'columnLayout',
          columns: [
            {
              blocks: [
                { blockType: 'listing', marker: 'left-first' },
                { blockType: 'mediaGallery', marker: 'left-second' },
              ],
            },
            { blocks: [{ blockType: 'documents', marker: 'right' }] },
          ],
        },
        { blockType: 'attachments', marker: 'bottom' },
      ]),
    ]

    expect(references.map(({ block }) => block.marker)).toEqual([
      'top',
      'left-first',
      'left-second',
      'right',
      'bottom',
    ])
    expect(references.map(({ path }) => path)).toEqual([
      'layout.0',
      'layout.1.columns.0.blocks.0',
      'layout.1.columns.0.blocks.1',
      'layout.1.columns.1.blocks.0',
      'layout.2',
    ])
  })

  it('uses generated IDs first and otherwise creates unique pagination suffixes from paths', () => {
    expect(createBlockParameterSuffix('generated-id', 'layout.0')).toBe('generated-id')
    expect(createBlockParameterSuffix(undefined, 'layout.1.columns.0.blocks.0')).toBe(
      'layout_1_columns_0_blocks_0',
    )
    expect(createBlockParameterSuffix(undefined, 'layout.1.columns.1.blocks.0')).toBe(
      'layout_1_columns_1_blocks_0',
    )
  })

  it('uses block-width breakpoints for every block that renders a grid', () => {
    const frontendStyles = readFileSync('src/app/(frontend)/styles.css', 'utf8')
    const contentBlockQueryIndex = frontendStyles.indexOf(
      '@container content-block (width <= 48rem)',
    )

    expect(frontendStyles).toContain(
      ':is(.listingBlock, .documentsBlock, .mediaBlock, .memberProfilesBlock)',
    )
    expect(frontendStyles).toContain('container-name: content-block')
    expect(contentBlockQueryIndex).toBeGreaterThan(frontendStyles.lastIndexOf('@media'))

    const contentBlockQuery = frontendStyles.slice(contentBlockQueryIndex)
    for (const gridClass of [
      '.contentList-grid',
      '.documentList-grid',
      '.mediaList-grid',
      '.mediaList-cards',
      '.memberGrid',
    ]) {
      expect(contentBlockQuery).toContain(gridClass)
    }
    expect(contentBlockQuery).toContain('grid-template-columns: minmax(0, 1fr)')
  })
})

function findLayoutFields(fields: Field[]): BlocksField[] {
  return fields.flatMap((field) => {
    const nested =
      field.type === 'tabs'
        ? field.tabs.flatMap((tab) => findLayoutFields(tab.fields))
        : 'fields' in field && Array.isArray(field.fields)
          ? findLayoutFields(field.fields)
          : []
    return 'name' in field && field.name === 'layout' && field.type === 'blocks'
      ? [field, ...nested]
      : nested
  })
}
