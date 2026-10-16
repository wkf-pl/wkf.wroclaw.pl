import { readFileSync } from 'node:fs'

import type { ClientBlock, Field, FormState } from 'payload'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SectionGroupBlock } from '@/blocks/SectionGroup'
import { TabbedContentBlock } from '@/blocks/TabbedContent'

import { isClipboardDataValid } from '../../node_modules/@payloadcms/ui/dist/elements/ClipboardAction/isClipboardDataValid.js'
import { clipboardPaste } from '../../node_modules/@payloadcms/ui/dist/elements/ClipboardAction/clipboardUtilities.js'
import { mergeFormStateFromClipboard } from '../../node_modules/@payloadcms/ui/dist/elements/ClipboardAction/mergeFormStateFromClipboard.js'

const columnLayoutBlock = {
  fields: [{ name: 'verticalAlignment', type: 'select' }],
  slug: 'columnLayout',
} as ClientBlock

const sectionGroupBlock = {
  fields: [{ name: 'frame', type: 'select' }],
  slug: 'sectionGroup',
} as ClientBlock

afterEach(() => {
  vi.unstubAllGlobals()
})

function findNamedField(fields: Field[], name: string): Field | undefined {
  for (const field of fields) {
    if ('name' in field && field.name === name) return field

    if (field.type === 'tabs') {
      for (const tab of field.tabs) {
        const nestedField = findNamedField(tab.fields, name)
        if (nestedField) return nestedField
      }
    } else if ('fields' in field && Array.isArray(field.fields)) {
      const nestedField = findNamedField(field.fields, name)
      if (nestedField) return nestedField
    }
  }

  return undefined
}

describe('Payload row clipboard compatibility', () => {
  it('keeps clipboard overrides inside the existing Payload client bundle', () => {
    const payloadClientBundle = readFileSync(
      'node_modules/@payloadcms/ui/dist/exports/client/index.js',
      'utf8',
    )
    const arrayActionModule = readFileSync(
      'node_modules/@payloadcms/ui/dist/elements/ArrayAction/index.js',
      'utf8',
    )

    expect(payloadClientBundle).toContain('let n=o.blocks;if(typeof o.rowIndex==="number")')
    expect(payloadClientBundle).toContain('f=Array.isArray(e[o]?.rows)?e[o].rows:[]')
    expect(payloadClientBundle).toContain('"Wytnij wiersz"')
    expect(payloadClientBundle).toContain('icon--scissors')
    expect(payloadClientBundle).toContain('t.cut===!0&&A>=0')
    expect(payloadClientBundle).toContain('r.cut===!0')
    expect(payloadClientBundle).toContain('cut:he')
    expect(payloadClientBundle).toContain('cut:ve')
    expect(payloadClientBundle).not.toContain('Qi(S$.Fragment,{children:Qi(')
    expect(arrayActionModule).toContain('copyRow(index, true)')
    expect(arrayActionModule).toContain('"Wytnij wiersz"')
    expect(arrayActionModule).toContain('icon--scissors')
    expect(arrayActionModule).not.toContain(
      '_jsxs(React.Fragment, {\n            children: [_jsxs(PopupList.Button',
    )
    expect(arrayActionModule).not.toContain('t("general:duplicate")')
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

  it('allows tabbed content to be added or pasted into a section group', () => {
    const sectionBlocksField = findNamedField(SectionGroupBlock.fields, 'blocks')
    if (!sectionBlocksField || sectionBlocksField.type !== 'blocks') {
      throw new Error('Missing section blocks field')
    }

    expect.soft(sectionBlocksField.blocks.map((block) => block.slug)).toContain('tabs')
    expect(
      isClipboardDataValid({
        blocks: [TabbedContentBlock as unknown as ClientBlock],
        data: {
          'layout.0.blockType': { value: 'tabs' },
        },
        fieldPath: 'layout.1.sections.0.blocks',
        path: 'layout',
        rowIndex: 0,
        schemaBlocks: sectionBlocksField.blocks as unknown as ClientBlock[],
        type: 'blocks',
      }),
    ).toBe(true)
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

  it('consumes the cut marker only after a valid paste', () => {
    const clipboardValues = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => clipboardValues.get(key) ?? null,
      removeItem: (key: string) => clipboardValues.delete(key),
      setItem: (key: string, value: string) => clipboardValues.set(key, value),
    })
    clipboardValues.set(
      '_payloadClipboard',
      JSON.stringify({
        blocks: [columnLayoutBlock, sectionGroupBlock],
        cut: true,
        data: {
          'layout.0.blockType': { value: 'columnLayout' },
          'layout.0.id': { value: '68e24de324689736f71837da' },
        },
        path: 'layout',
        rowIndex: 0,
        type: 'blocks',
      }),
    )
    let pasteWasCalled = false

    const result = clipboardPaste({
      onPaste: () => {
        pasteWasCalled = true
      },
      path: 'sidebar',
      schemaBlocks: [columnLayoutBlock],
      t: (key) => key,
    })

    expect(result).toBe(true)
    expect(pasteWasCalled).toBe(true)
    expect(JSON.parse(clipboardValues.get('_payloadClipboard') ?? '{}')).toMatchObject({
      cut: false,
    })
  })

  it('keeps the cut marker when clipboard validation rejects the paste', () => {
    const clipboardValues = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => clipboardValues.get(key) ?? null,
      removeItem: (key: string) => clipboardValues.delete(key),
      setItem: (key: string, value: string) => clipboardValues.set(key, value),
    })
    clipboardValues.set(
      '_payloadClipboard',
      JSON.stringify({
        blocks: [columnLayoutBlock, sectionGroupBlock],
        cut: true,
        data: {
          'layout.0.blockType': { value: 'columnLayout' },
          'layout.0.id': { value: '68e24de324689736f71837db' },
        },
        path: 'layout',
        rowIndex: 0,
        type: 'blocks',
      }),
    )
    let pasteWasCalled = false

    const result = clipboardPaste({
      onPaste: () => {
        pasteWasCalled = true
      },
      path: 'sidebar',
      schemaBlocks: [sectionGroupBlock],
      t: (key) => key,
    })

    expect(result).toBe('error:invalidClipboardData')
    expect(pasteWasCalled).toBe(false)
    expect(JSON.parse(clipboardValues.get('_payloadClipboard') ?? '{}')).toMatchObject({
      cut: true,
    })
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

  it('moves a cut row into a field only after the paste succeeds', () => {
    const sourcePath = 'layout'
    const targetPath = 'sidebar'
    const sourceBlockID = '68e24de324689736f71837d3'
    const remainingBlockID = '68e24de324689736f71837d4'
    const existingTargetBlockID = '68e24de324689736f71837d5'
    const formState = {
      [sourcePath]: {
        rows: [
          { blockType: 'columnLayout', id: sourceBlockID },
          { blockType: 'richText', id: remainingBlockID },
        ],
        value: 2,
      },
      [`${sourcePath}.0.blockType`]: { value: 'columnLayout' },
      [`${sourcePath}.0.heading`]: { value: 'Moved content' },
      [`${sourcePath}.0.id`]: { value: sourceBlockID },
      [`${sourcePath}.1.blockType`]: { value: 'richText' },
      [`${sourcePath}.1.content`]: { value: 'Remaining content' },
      [`${sourcePath}.1.id`]: { value: remainingBlockID },
      [targetPath]: {
        rows: [{ blockType: 'richText', id: existingTargetBlockID }],
        value: 1,
      },
      [`${targetPath}.0.blockType`]: { value: 'richText' },
      [`${targetPath}.0.content`]: { value: 'Existing target content' },
      [`${targetPath}.0.id`]: { value: existingTargetBlockID },
    } as FormState

    const result = mergeFormStateFromClipboard({
      dataFromClipboard: {
        blocks: [columnLayoutBlock, sectionGroupBlock],
        cut: true,
        data: {
          [`${sourcePath}.0.blockType`]: { value: 'columnLayout' },
          [`${sourcePath}.0.heading`]: { value: 'Moved content' },
          [`${sourcePath}.0.id`]: { value: sourceBlockID },
        },
        path: sourcePath,
        rowIndex: 0,
        type: 'blocks',
      },
      formState,
      path: targetPath,
    })

    expect(result[sourcePath].rows).toHaveLength(1)
    expect(result[sourcePath].rows?.[0]?.id).toBe(remainingBlockID)
    expect(result[`${sourcePath}.0.content`]?.value).toBe('Remaining content')
    expect(result[`${sourcePath}.1.content`]).toBeUndefined()
    expect(result[targetPath].rows).toHaveLength(2)
    expect(result[`${targetPath}.0.content`]?.value).toBe('Existing target content')
    expect(result[`${targetPath}.1.heading`]?.value).toBe('Moved content')
    expect(result[`${targetPath}.1.id`]?.value).not.toBe(sourceBlockID)
  })

  it('replaces a target row and then removes the cut source row', () => {
    const sourceBlockID = '68e24de324689736f71837d6'
    const middleBlockID = '68e24de324689736f71837d7'
    const targetBlockID = '68e24de324689736f71837d8'
    const formState = {
      layout: {
        rows: [
          { blockType: 'columnLayout', id: sourceBlockID },
          { blockType: 'richText', id: middleBlockID },
          { blockType: 'richText', id: targetBlockID },
        ],
        value: 3,
      },
      'layout.0.blockType': { value: 'columnLayout' },
      'layout.0.heading': { value: 'Moved content' },
      'layout.0.id': { value: sourceBlockID },
      'layout.1.blockType': { value: 'richText' },
      'layout.1.content': { value: 'Middle content' },
      'layout.1.id': { value: middleBlockID },
      'layout.2.blockType': { value: 'richText' },
      'layout.2.content': { value: 'Replaced content' },
      'layout.2.id': { value: targetBlockID },
    } as FormState

    const result = mergeFormStateFromClipboard({
      dataFromClipboard: {
        blocks: [columnLayoutBlock, sectionGroupBlock],
        cut: true,
        data: {
          'layout.0.blockType': { value: 'columnLayout' },
          'layout.0.heading': { value: 'Moved content' },
          'layout.0.id': { value: sourceBlockID },
        },
        path: 'layout',
        rowIndex: 0,
        type: 'blocks',
      },
      formState,
      path: 'layout',
      rowIndex: 2,
    })

    expect(result.layout.rows).toHaveLength(2)
    expect(result.layout.rows?.map((row) => row.id)).toEqual([middleBlockID, targetBlockID])
    expect(result['layout.0.content']?.value).toBe('Middle content')
    expect(result['layout.1.blockType']?.value).toBe('columnLayout')
    expect(result['layout.1.heading']?.value).toBe('Moved content')
  })

  it('does not remove a row when cut data is pasted back onto the same row', () => {
    const sourceBlockID = '68e24de324689736f71837d9'
    const formState = {
      layout: {
        rows: [{ blockType: 'columnLayout', id: sourceBlockID }],
        value: 1,
      },
      'layout.0.blockType': { value: 'columnLayout' },
      'layout.0.heading': { value: 'Unchanged content' },
      'layout.0.id': { value: sourceBlockID },
    } as FormState

    const result = mergeFormStateFromClipboard({
      dataFromClipboard: {
        blocks: [columnLayoutBlock, sectionGroupBlock],
        cut: true,
        data: {
          'layout.0.blockType': { value: 'columnLayout' },
          'layout.0.heading': { value: 'Unchanged content' },
          'layout.0.id': { value: sourceBlockID },
        },
        path: 'layout',
        rowIndex: 0,
        type: 'blocks',
      },
      formState,
      path: 'layout',
      rowIndex: 0,
    })

    expect(result.layout.rows).toHaveLength(1)
    expect(result.layout.rows?.[0]?.id).toBe(sourceBlockID)
    expect(result['layout.0.heading']?.value).toBe('Unchanged content')
  })
})
