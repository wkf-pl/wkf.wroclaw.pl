import { readFileSync } from 'node:fs'

import type { ClientBlock, FormState } from 'payload'
import { describe, expect, it } from 'vitest'

import { isClipboardDataValid } from '../../node_modules/@payloadcms/ui/dist/elements/ClipboardAction/isClipboardDataValid.js'
import { mergeFormStateFromClipboard } from '../../node_modules/@payloadcms/ui/dist/elements/ClipboardAction/mergeFormStateFromClipboard.js'

const columnLayoutBlock = {
  fields: [{ name: 'verticalAlignment', type: 'select' }],
  slug: 'columnLayout',
} as ClientBlock

const sectionGroupBlock = {
  fields: [{ name: 'frame', type: 'select' }],
  slug: 'sectionGroup',
} as ClientBlock

describe('Payload row clipboard compatibility', () => {
  it('keeps clipboard overrides inside the existing Payload client bundle', () => {
    const payloadClientBundle = readFileSync(
      'node_modules/@payloadcms/ui/dist/exports/client/index.js',
      'utf8',
    )

    expect(payloadClientBundle).toContain('let n=o.blocks;if(typeof o.rowIndex==="number")')
    expect(payloadClientBundle).toContain('f=Array.isArray(e[o]?.rows)?e[o].rows:[]')
    expect(payloadClientBundle).not.toContain(
      "from '../../elements/ClipboardAction/isClipboardDataValid.js'",
    )
    expect(payloadClientBundle).not.toContain(
      "from '../../elements/ClipboardAction/mergeFormStateFromClipboard.js'",
    )
  })

  it('accepts a copied block row when that block type is allowed by the target field', () => {
    expect(
      isClipboardDataValid({
        blocks: [columnLayoutBlock, sectionGroupBlock],
        data: {
          'layout.0.blockType': { value: 'columnLayout' },
        },
        fieldPath: 'layout.1.sections.0.blocks',
        path: 'layout',
        rowIndex: 0,
        schemaBlocks: [columnLayoutBlock],
        type: 'blocks',
      }),
    ).toBe(true)
  })

  it('rejects a copied block row when its block type is not allowed by the target field', () => {
    expect(
      isClipboardDataValid({
        blocks: [columnLayoutBlock, sectionGroupBlock],
        data: {
          'layout.0.blockType': { value: 'sectionGroup' },
        },
        fieldPath: 'layout.1.sections.0.blocks',
        path: 'layout',
        rowIndex: 0,
        schemaBlocks: [columnLayoutBlock],
        type: 'blocks',
      }),
    ).toBe(false)
  })

  it('keeps strict whole-field validation when the clipboard contains a complete field', () => {
    expect(
      isClipboardDataValid({
        blocks: [columnLayoutBlock, sectionGroupBlock],
        data: {
          layout: { rows: [], value: 0 },
        },
        fieldPath: 'layout.1.sections.0.blocks',
        path: 'layout',
        schemaBlocks: [columnLayoutBlock],
        type: 'blocks',
      }),
    ).toBe(false)
  })
})

describe('Payload row-to-field paste behavior', () => {
  it('appends a copied block row without replacing existing target rows', () => {
    const existingBlockID = '68e24de324689736f71837d1'
    const copiedBlockID = '68e24de324689736f71837d2'
    const targetPath = 'layout.1.sections.0.blocks'
    const formState = {
      [targetPath]: {
        initialValue: 1,
        rows: [
          {
            blockType: 'richText',
            id: existingBlockID,
            isLoading: false,
            lastRenderedPath: `${targetPath}.0`,
          },
        ],
        valid: true,
        value: 1,
      },
      [`${targetPath}.0.blockType`]: { valid: true, value: 'richText' },
      [`${targetPath}.0.content`]: { valid: true, value: 'Existing content' },
      [`${targetPath}.0.id`]: { valid: true, value: existingBlockID },
    } as FormState

    const result = mergeFormStateFromClipboard({
      dataFromClipboard: {
        blocks: [columnLayoutBlock, sectionGroupBlock],
        data: {
          'layout.0.blockType': { valid: true, value: 'columnLayout' },
          'layout.0.columns': { rows: [], valid: true, value: 0 },
          'layout.0.id': { valid: true, value: copiedBlockID },
        },
        path: 'layout',
        rowIndex: 0,
        type: 'blocks',
      },
      formState,
      path: targetPath,
    })

    expect(result[targetPath].rows).toHaveLength(2)
    expect(result[targetPath].rows?.[0]).toMatchObject({
      blockType: 'richText',
      id: existingBlockID,
    })
    expect(result[targetPath].rows?.[1]).toMatchObject({
      blockType: 'columnLayout',
      isLoading: false,
      lastRenderedPath: `${targetPath}.1`,
    })
    expect(result[`${targetPath}.0.content`]?.value).toBe('Existing content')
    expect(result[`${targetPath}.1.blockType`]?.value).toBe('columnLayout')
    expect(result[`${targetPath}.1.id`]?.value).not.toBe(copiedBlockID)
  })

  it('regenerates relational row IDs and preserves row-label metadata', () => {
    const targetPath = 'layout.1.sections.0.blocks'
    const relationalBlockID = 101 as unknown as string
    const relationalColumnID = 202 as unknown as string
    const formState = {
      layout: {
        rows: [
          {
            blockType: 'columnLayout',
            customComponents: { RowLabel: 'source column label' },
            id: relationalBlockID,
          },
        ],
        value: 1,
      },
      [targetPath]: {
        rows: [],
        value: 0,
      },
    } as FormState

    const result = mergeFormStateFromClipboard({
      dataFromClipboard: {
        blocks: [columnLayoutBlock, sectionGroupBlock],
        data: {
          'layout.0.blockType': { valid: true, value: 'columnLayout' },
          'layout.0.columns': {
            rows: [{ id: relationalColumnID }],
            valid: true,
            value: 1,
          },
          'layout.0.columns.0.id': { valid: true, value: relationalColumnID },
          'layout.0.id': { valid: true, value: relationalBlockID },
        },
        path: 'layout',
        rowIndex: 0,
        type: 'blocks',
      },
      formState,
      path: targetPath,
    })

    expect(result[`${targetPath}.0.id`]?.value).not.toBe(relationalBlockID)
    expect(result[`${targetPath}.0.columns.0.id`]?.value).not.toBe(relationalColumnID)
    expect(result[`${targetPath}.0.columns`].rows?.[0]?.id).not.toBe(relationalColumnID)
    expect(result[targetPath].rows?.[0]).toMatchObject({
      blockType: 'columnLayout',
      customComponents: { RowLabel: 'source column label' },
      isLoading: false,
    })
    expect(result[targetPath].rows?.[0]?.lastRenderedPath).toBe(targetPath + '.0')
  })
})
