import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DocumentItems } from '@/app/(frontend)/_components/DocumentList'
import { DocumentsBlock, validateManualDocumentItems } from '@/blocks/Documents'
import { Documents } from '@/collections/Documents'
import { Pages } from '@/collections/Pages'
import type { Document } from '@/payload-types'
import type { Field } from 'payload'

function flattenFields(fields: Field[]): Field[] {
  return fields.flatMap((field) => {
    if (field.type === 'tabs') {
      return [field, ...field.tabs.flatMap((tab) => flattenFields(tab.fields))]
    }
    if ('fields' in field && Array.isArray(field.fields)) {
      return [field, ...flattenFields(field.fields)]
    }
    return [field]
  })
}

function describeFieldOrder(): (string | string[])[] {
  return DocumentsBlock.fields.map((field) => {
    if (field.type === 'row') {
      return field.fields.map((rowField) => ('name' in rowField ? rowField.name : ''))
    }

    return 'name' in field ? field.name : ''
  })
}

describe('documents block', () => {
  it('arranges the Document form into the requested rows', () => {
    const mainFieldOrder: (string | string[])[] = []

    for (const field of Documents.fields) {
      if (field.type === 'row') {
        mainFieldOrder.push(
          field.fields.map((rowField) => ('name' in rowField ? rowField.name : '')),
        )
      } else if ('name' in field && field.admin?.position !== 'sidebar') {
        mainFieldOrder.push(field.name)
      }
    }

    expect(mainFieldOrder).toEqual([
      ['documentType', 'documentNumber', 'documentDate'],
      'title',
      'summary',
      'content',
      'primaryFile',
      'attachments',
    ])
  })

  it('adds shared taxonomy to documents', () => {
    const names = Documents.fields.flatMap((field) =>
      field.type === 'row'
        ? field.fields.map((rowField) => ('name' in rowField ? rowField.name : ''))
        : 'name' in field
          ? [field.name]
          : [],
    )

    expect(names).toEqual(expect.arrayContaining(['category', 'tags']))
  })

  it('uses controls matching the media gallery layout and registers the block', () => {
    expect(DocumentsBlock.slug).toBe('documents')
    expect(describeFieldOrder()).toEqual([
      'heading',
      'selectionMode',
      'items',
      ['category', 'tag'],
      ['sort', 'view'],
      ['pageSize', 'pagination'],
      'emptyMessage',
    ])
    expect(DocumentsBlock.admin?.images?.thumbnail).toEqual({
      alt: 'Schematyczna ikona listy dokumentów',
      url: '/assets/block-thumbnails/documents.png',
    })
    const itemsField = DocumentsBlock.fields.find(
      (field) => 'name' in field && field.name === 'items',
    )
    const emptyMessageField = DocumentsBlock.fields.find(
      (field) => 'name' in field && field.name === 'emptyMessage',
    )
    expect(itemsField).toMatchObject({
      admin: {
        components: {
          RowLabel: '/components/admin/DocumentEntryRowLabel#DocumentEntryRowLabel',
        },
      },
    })
    expect(
      emptyMessageField?.admin?.condition?.({}, { selectionMode: 'filters' }, {} as never),
    ).toBe(true)
    expect(
      emptyMessageField?.admin?.condition?.({}, { selectionMode: 'manual' }, {} as never),
    ).toBe(false)

    const layout = flattenFields(Pages.fields).find(
      (field) => 'name' in field && field.name === 'layout' && field.type === 'blocks',
    )
    expect(layout).toMatchObject({
      blocks: expect.arrayContaining([expect.objectContaining({ slug: 'documents' })]),
    })
  })

  it('requires manual documents and rejects duplicate selections', () => {
    expect(
      validateManualDocumentItems([], {
        siblingData: { selectionMode: 'manual' },
      } as never),
    ).toBeTypeOf('string')
    expect(
      validateManualDocumentItems([{ document: 7 }, { document: { id: 7 } }], {
        siblingData: { selectionMode: 'manual' },
      } as never),
    ).toBeTypeOf('string')
    expect(
      validateManualDocumentItems([{ document: 7 }, { document: 8 }], {
        siblingData: { selectionMode: 'manual' },
      } as never),
    ).toBe(true)
  })

  it('renders card, compact list and grid as distinct public views', () => {
    const document = {
      documentDate: '2026-08-26T00:00:00.000Z',
      documentType: 'resolution',
      id: 1,
      slug: 'uchwala-testowa',
      summary: 'Opis widoczny w szczegółowych widokach.',
      title: 'Uchwała testowa',
      primaryFile: {
        id: 17,
        label: 'Uchwała PDF',
      },
    } as Document

    const renderView = (view: 'cards' | 'grid' | 'list') =>
      renderToStaticMarkup(createElement(DocumentItems, { documents: [document], view }))

    const cardsMarkup = renderView('cards')
    const gridMarkup = renderView('grid')
    const listMarkup = renderView('list')

    expect(cardsMarkup).toContain('documentList-cards')
    expect(cardsMarkup).toContain(document.summary)
    expect(cardsMarkup).toContain('documentPdfLink')
    expect(cardsMarkup).toContain('/dokumenty/uchwala-testowa/plik/17')
    expect(cardsMarkup).toContain('target="_blank"')
    expect(gridMarkup).toContain('documentList-grid')
    expect(gridMarkup).toContain(document.summary)
    expect(gridMarkup).not.toContain('documentPdfLink')
    expect(listMarkup).toContain('documentList-list')
    expect(listMarkup).not.toContain(document.summary)
    expect(listMarkup).not.toContain('documentPdfLink')
  })
})
