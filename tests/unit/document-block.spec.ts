import { describe, expect, it } from 'vitest'

import { Documents } from '@/collections/Documents'

describe('documents', () => {
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
})
