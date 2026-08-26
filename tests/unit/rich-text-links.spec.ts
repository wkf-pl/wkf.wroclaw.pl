import type { SerializedLinkNode } from '@payloadcms/richtext-lexical'
import { describe, expect, it } from 'vitest'

import {
  createRichTextLinkFields,
  getRichTextLinkTechnicalValues,
  getRichTextLinkVisibleValues,
  isRichTextLinkFieldVisible,
  resolveRichTextInternalLink,
} from '@/modules/content/rich-text-links'

function createInternalLink(
  relationTo: string,
  value: number | { id: number; slug: string },
): SerializedLinkNode {
  return {
    children: [],
    direction: null,
    fields: {
      doc: { relationTo, value },
      linkType: 'internal',
      newTab: false,
    },
    format: '',
    indent: 0,
    type: 'link',
    version: 3,
  }
}

describe('rich text internal links', () => {
  it('shows only fields belonging to the selected target', () => {
    expect(isRichTextLinkFieldVisible('document', 'document')).toBe(true)
    expect(isRichTextLinkFieldVisible('page', 'document')).toBe(false)
    expect(isRichTextLinkFieldVisible('customScheme', 'custom')).toBe(true)
    expect(isRichTextLinkFieldVisible('customAddress', 'document')).toBe(false)
  })

  it('uses the shared target selector without labels or partner links', () => {
    const fields = createRichTextLinkFields([{ name: 'text', required: true, type: 'text' }])
    const targetRow = fields.find((field) => field.type === 'row')
    const targetTypeField =
      targetRow?.type === 'row'
        ? targetRow.fields.find((field) => 'name' in field && field.name === 'targetType')
        : undefined

    expect(fields[0]).toMatchObject({ name: 'text', type: 'text' })
    expect(targetTypeField).toMatchObject({
      name: 'targetType',
      options: [
        { label: 'Własny adres', value: 'custom' },
        { label: 'Cykl wydarzeń', value: 'eventCycle' },
        { label: 'Dokument', value: 'document' },
        { label: 'Kategoria', value: 'category' },
        { label: 'Strona', value: 'page' },
        { label: 'Tag', value: 'tag' },
        { label: 'Wpis', value: 'post' },
        { label: 'Wydarzenie', value: 'event' },
      ],
    })
    expect(
      targetRow?.type === 'row'
        ? targetRow.fields.some((field) => 'name' in field && field.name === 'partner')
        : true,
    ).toBe(false)
    expect(fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'newTab', type: 'checkbox' }),
        expect.objectContaining({ admin: { hidden: true }, name: 'linkType' }),
        expect.objectContaining({ admin: { hidden: true }, name: 'doc' }),
        expect.objectContaining({ admin: { hidden: true }, name: 'url' }),
        expect.objectContaining({ name: 'richTextLinkSync', type: 'ui' }),
      ]),
    )
  })

  it('maps the shared target values to Lexical technical fields', () => {
    expect(
      getRichTextLinkTechnicalValues({
        document: 12,
        newTab: true,
        targetType: 'document',
      }),
    ).toEqual({
      doc: { relationTo: 'documents', value: 12 },
      linkType: 'internal',
      newTab: true,
      url: undefined,
    })

    expect(
      getRichTextLinkTechnicalValues({
        customAddress: 'wkf.org.pl/kontakt',
        customScheme: 'https',
        newTab: false,
        targetType: 'custom',
      }),
    ).toEqual({
      doc: null,
      linkType: 'custom',
      newTab: false,
      url: 'https://wkf.org.pl/kontakt',
    })
  })

  it('restores an internal target from Lexical technical fields', () => {
    expect(
      getRichTextLinkVisibleValues({
        doc: { relationTo: 'documents', value: { id: 12, title: 'Statut WKF' } },
        linkType: 'internal',
      }),
    ).toEqual({
      document: 12,
      targetType: 'document',
    })
  })

  it('restores a custom target from Lexical technical fields', () => {
    expect(
      getRichTextLinkVisibleValues({
        linkType: 'custom',
        url: 'mailto:kontakt@wkf.org.pl',
      }),
    ).toEqual({
      customAddress: 'kontakt@wkf.org.pl',
      customScheme: 'mailto',
      targetType: 'custom',
    })
  })

  it.each([
    ['pages', 'o-nas', '/o-nas'],
    ['posts', 'konwent', '/blog/konwent'],
    ['events', 'spotkanie', '/events/spotkanie'],
    ['event-cycles', 'planszowki', '/events/series/planszowki'],
    ['categories', 'aktualnosci', '/category/aktualnosci'],
    ['tags', 'fantastyka', '/tag/fantastyka'],
    ['documents', 'regulamin', '/dokumenty/regulamin'],
  ])('maps %s to its public route', (relationTo, slug, expectedHref) => {
    expect(
      resolveRichTextInternalLink({ linkNode: createInternalLink(relationTo, { id: 1, slug }) }),
    ).toBe(expectedHref)
  })

  it('returns a safe fallback when the relationship is not populated', () => {
    expect(resolveRichTextInternalLink({ linkNode: createInternalLink('pages', 1) })).toBe('#')
  })

  it('returns a safe fallback for a collection that is not enabled', () => {
    expect(
      resolveRichTextInternalLink({
        linkNode: createInternalLink('users', { id: 1, slug: 'administrator' }),
      }),
    ).toBe('#')
  })
})
