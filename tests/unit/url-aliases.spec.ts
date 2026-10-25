import { describe, expect, it } from 'vitest'

import { UrlAliases } from '@/collections/UrlAliases'
import {
  appendSearchParameters,
  normalizeUrlAliasSlug,
  resolveUrlAliasTarget,
  validateUrlAliasSlugFormat,
} from '@/modules/url-aliases/url-aliases'

const publishedDocument = (slug: string, extra: Record<string, unknown> = {}) => ({
  _status: 'published',
  id: 1,
  slug,
  ...extra,
})

describe('URL aliases', () => {
  it('uses separate type and target controls in one admin field', () => {
    const targetRow = UrlAliases.fields.find((field) => field.type === 'row')
    if (!targetRow || targetRow.type !== 'row') throw new Error('Missing URL alias target row')
    const targetField = targetRow.fields.find((field) => 'name' in field && field.name === 'target')
    const documentDestinationField = targetRow.fields.find(
      (field) => 'name' in field && field.name === 'documentDestination',
    )

    expect(targetField).toMatchObject({
      admin: {
        components: {
          Field: '/components/admin/UrlAliasTargetField#UrlAliasTargetField',
        },
        width: '66.667%',
      },
      label: 'Cel',
      relationTo: [
        'pages',
        'posts',
        'events',
        'event-cycles',
        'partners',
        'categories',
        'tags',
        'documents',
      ],
      required: true,
      type: 'relationship',
    })
    expect(documentDestinationField).toMatchObject({
      admin: { width: '33.333%' },
      label: 'Cel dokumentu',
      type: 'select',
    })
    expect(
      documentDestinationField?.admin?.condition?.(
        {},
        { target: { relationTo: 'documents', value: 1 } },
        {} as never,
      ),
    ).toBe(true)
    expect(
      documentDestinationField?.admin?.condition?.(
        {},
        { target: { relationTo: 'posts', value: 1 } },
        {} as never,
      ),
    ).toBe(false)
  })

  it.each([
    ['pages', publishedDocument('o-klubie'), '/o-klubie'],
    ['posts', publishedDocument('aktualnosc'), '/blog/aktualnosc'],
    ['events', publishedDocument('spotkanie'), '/events/spotkanie'],
    ['event-cycles', publishedDocument('czwartki'), '/events/series/czwartki'],
    ['partners', publishedDocument('partner'), '/partners/partner'],
    ['categories', { id: 1, slug: 'gry' }, '/category/gry'],
    ['tags', { id: 1, slug: 'rpg' }, '/tag/rpg'],
  ] as const)('resolves %s to its canonical path', (relationTo, value, expected) => {
    expect(resolveUrlAliasTarget({ target: { relationTo, value } })).toBe(expected)
  })

  it('resolves a document page and its current primary PDF', () => {
    const value = publishedDocument('statut', { primaryFile: { id: 17 } })

    expect(
      resolveUrlAliasTarget({
        documentDestination: 'page',
        target: { relationTo: 'documents', value },
      }),
    ).toBe('/dokumenty/statut')
    expect(
      resolveUrlAliasTarget({
        documentDestination: 'primaryFile',
        target: { relationTo: 'documents', value },
      }),
    ).toBe('/dokumenty/statut/plik/17')
  })

  it('does not resolve unpublished, unpopulated, or incomplete targets', () => {
    expect(
      resolveUrlAliasTarget({
        target: { relationTo: 'posts', value: { _status: 'draft', id: 1, slug: 'draft' } },
      }),
    ).toBeNull()
    expect(resolveUrlAliasTarget({ target: { relationTo: 'posts', value: 1 } })).toBeNull()
    expect(
      resolveUrlAliasTarget({
        documentDestination: 'primaryFile',
        target: { relationTo: 'documents', value: publishedDocument('bez-pliku') },
      }),
    ).toBeNull()
  })

  it('normalizes a source address and rejects reserved roots', () => {
    expect(normalizeUrlAliasSlug({ value: '/Statut/' } as never)).toBe('statut')
    expect(validateUrlAliasSlugFormat('statut')).toBe(true)
    for (const reservedSlug of [
      'admin',
      'api',
      'assets',
      'blog',
      'category',
      'content',
      'dokumenty',
      'events',
      'health',
      'members',
      'partners',
      'preview',
      'tag',
    ]) {
      expect(validateUrlAliasSlugFormat(reservedSlug)).toBeTypeOf('string')
    }
  })

  it('preserves single and repeated search parameters in the destination', () => {
    expect(
      appendSearchParameters('/dokumenty/statut/plik/1', {
        download: '1',
        source: ['menu', 'footer'],
      }),
    ).toBe('/dokumenty/statut/plik/1?download=1&source=menu&source=footer')
  })
})
