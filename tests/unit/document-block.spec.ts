import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DocumentItems } from '@/app/(frontend)/_components/DocumentList'
import { DocumentsBlock, validateManualDocumentItems } from '@/blocks/Documents'
import { Documents } from '@/collections/Documents'
import { Pages } from '@/collections/Pages'
import type { Category, Document, Tag } from '@/payload-types'
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
      ['frame', 'surface'],
      ['surfaceImage', 'surfaceHorizontalPosition', 'surfaceVerticalPosition'],
      'surfacePreview',
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
    const viewField = flattenFields(DocumentsBlock.fields).find(
      (field) => 'name' in field && field.name === 'view' && field.type === 'select',
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
    expect(viewField).toMatchObject({
      options: expect.arrayContaining([{ label: 'Karuzela', value: 'carousel' }]),
    })

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
      category: { id: 4, name: 'Dokumenty', slug: 'dokumenty' } as Category,
      documentDate: '2026-08-26T00:00:00.000Z',
      documentNumber: '4/2026',
      documentType: 'resolution',
      id: 1,
      slug: 'uchwala-testowa',
      summary: 'Opis widoczny w szczegółowych widokach.',
      tags: [{ id: 7, name: 'Formalne', slug: 'formalne' } as Tag],
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
    expect(cardsMarkup).toContain('class="contentCardKind">Uchwała</span>')
    expect(cardsMarkup).toContain('nr 4/2026 z dnia')
    expect(cardsMarkup).toContain('26 sierpnia 2026')
    expect(cardsMarkup).toContain('contentCardImageFallback')
    expect(cardsMarkup).toContain('href="/category/dokumenty"')
    expect(cardsMarkup).toContain('href="/tag/formalne"')
    expect(cardsMarkup).not.toContain('documentPdfLink')
    expect(gridMarkup).toContain('documentList-grid')
    expect(gridMarkup).toContain('class="contentCard contentCard--grid"')
    expect(gridMarkup).toContain(document.summary)
    expect(gridMarkup).toContain('class="contentCardKind">Uchwała</span>')
    expect(gridMarkup).toContain('nr 4/2026 z dnia')
    expect(gridMarkup).toContain('26 sierpnia 2026')
    expect(gridMarkup).toContain('contentCardImageFallback')
    expect(gridMarkup).toContain('href="/category/dokumenty"')
    expect(gridMarkup).toContain('href="/tag/formalne"')
    expect(gridMarkup).not.toContain('documentPdfLink')
    expect(listMarkup).toContain('documentList-list')
    expect(listMarkup).toContain('class="contentCardKind">Uchwała</span>')
    expect(listMarkup).toContain('class="contentCardMetaText">nr 4/2026 z dnia ')
    expect(listMarkup).toContain(
      '<time dateTime="2026-08-26T00:00:00.000Z">26 sierpnia 2026</time>',
    )
    expect(listMarkup).not.toContain(document.summary)
    expect(listMarkup).not.toContain('documentPdfLink')
  })

  it('renders documents in the shared carousel without discarding document data', () => {
    const document = {
      category: { id: 4, name: 'Dokumenty', slug: 'dokumenty' } as Category,
      documentDate: '2026-08-26T00:00:00.000Z',
      documentNumber: '4/2026',
      documentType: 'resolution',
      id: 1,
      slug: 'uchwala-testowa',
      summary: 'Opis widoczny w karuzeli.',
      tags: [{ id: 7, name: 'Formalne', slug: 'formalne' } as Tag],
      title: 'Uchwała testowa',
    } as Document

    const markup = renderToStaticMarkup(
      createElement(DocumentItems, {
        documents: [document],
        view: 'carousel',
      }),
    )

    expect(markup).toContain('class="contentCarousel"')
    expect(markup).toContain('class="contentCarouselImageFallback"')
    expect(markup).toContain('<span class="contentCarouselKind">Uchwała</span>')
    expect(markup).toContain('nr 4/2026 z dnia')
    expect(markup).toContain('26 sierpnia 2026')
    expect(markup).toContain(document.summary)
    expect(markup).toContain('href="/category/dokumenty"')
    expect(markup).toContain('href="/tag/formalne"')
    expect(markup).toContain('<span>Zobacz</span>')
  })
})
