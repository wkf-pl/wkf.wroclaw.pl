import { describe, expect, it } from 'vitest'

import { ListingBlock, validateListingSources, validateParentPage } from '@/blocks/Listing'
import { Categories } from '@/collections/Categories'
import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { Tags } from '@/collections/Tags'
import { validatePageStructure } from '@/modules/content/page-validation'

function findField(fields: typeof Categories.fields, name: string) {
  const field = fields.find((candidate) => 'name' in candidate && candidate.name === name)

  if (!field) {
    throw new Error(`Missing field: ${name}`)
  }

  return field
}

function describeFieldOrder(fields: typeof Pages.fields): (string | string[])[] {
  return fields.map((field) => {
    if (field.type === 'row') {
      return field.fields.map((rowField) => ('name' in rowField ? rowField.name : ''))
    }

    return 'name' in field ? field.name : ''
  })
}

describe('page configuration', () => {
  it('arranges listing controls into the requested rows', () => {
    const rows = ListingBlock.fields.filter((field) => field.type === 'row')
    const rowFieldNames = rows.map((row) =>
      row.fields.map((field) => ('name' in field ? field.name : undefined)),
    )
    const parentPageField = rows[0]?.fields.find(
      (field) => 'name' in field && field.name === 'parentPage',
    )

    expect(ListingBlock.fields[0]).toMatchObject({ label: 'Nagłówek', name: 'heading' })
    expect(rowFieldNames).toEqual([
      ['sources', 'parentPage'],
      ['category', 'tag'],
      ['sort', 'view'],
      ['pageSize', 'pagination'],
    ])
    expect(describeFieldOrder(ListingBlock.fields)).toEqual([
      'heading',
      ['sources', 'parentPage'],
      ['category', 'tag'],
      ['sort', 'view'],
      ['pageSize', 'pagination'],
      'parentFilter',
      'emptyMessage',
    ])
    expect(parentPageField).toMatchObject({ label: 'Strona nadrzędna', type: 'relationship' })
  })

  it('keeps the agreed field order in Pages', () => {
    expect(describeFieldOrder(Pages.fields)).toEqual([
      ['title', 'parent'],
      ['categories', 'tags'],
      'heroImage',
      'listingExcerpt',
      'layout',
      'seo',
      'slug',
      'author',
      'publishedAt',
      'systemKey',
    ])
  })

  it('keeps the agreed field order in Posts', () => {
    expect(describeFieldOrder(Posts.fields)).toEqual([
      'title',
      'slug',
      ['categories', 'tags'],
      'heroImage',
      'excerpt',
      'layout',
      'author',
      'publishedAt',
      'seo',
    ])
  })

  it('keeps the agreed field order in Categories and Tags', () => {
    for (const collection of [Categories, Tags]) {
      expect(describeFieldOrder(collection.fields)).toEqual([
        'name',
        'slug',
        'description',
        'relatedPages',
        'relatedPosts',
      ])
    }
  })

  it('places taxonomy URLs in the sidebar and uses the related-content renderer', () => {
    for (const collection of [Categories, Tags]) {
      expect(findField(collection.fields, 'slug')).toMatchObject({
        admin: { position: 'sidebar' },
      })
      expect(findField(collection.fields, 'relatedPages')).toMatchObject({
        admin: {
          components: {
            Field: '/components/admin/TaxonomyRelatedContentJoin#TaxonomyRelatedContentJoin',
          },
        },
      })
      expect(findField(collection.fields, 'relatedPosts')).toMatchObject({
        admin: {
          components: {
            Field: '/components/admin/TaxonomyRelatedContentJoin#TaxonomyRelatedContentJoin',
          },
        },
      })
    }
  })

  it('accepts a parent filter only for a pages-only listing', () => {
    expect(
      validateListingSources(['pages'], {
        siblingData: { parentFilter: 'current', sources: ['pages'] },
      } as never),
    ).toBe(true)
    expect(
      validateListingSources(['pages', 'posts'], {
        siblingData: { parentFilter: 'current', sources: ['pages', 'posts'] },
      } as never),
    ).toBeTypeOf('string')
    expect(
      validateParentPage(null, {
        siblingData: { parentFilter: 'specific', sources: ['pages'] },
      } as never),
    ).toBeTypeOf('string')
  })

  it('keeps the system Blog slug and key immutable', async () => {
    const data = await validatePageStructure({
      data: { slug: 'zmieniony', systemKey: null },
      originalDoc: { id: 1, systemKey: 'blog' },
      req: { context: {}, payload: {} },
    } as never)

    expect(data).toMatchObject({ slug: 'blog', systemKey: 'blog' })
  })

  it('rejects an attempt to create the system Blog outside migration or seed', async () => {
    await expect(
      validatePageStructure({
        data: { slug: 'blog', systemKey: 'blog' },
        req: { context: {}, payload: {} },
      } as never),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('rejects a cycle in page parents', async () => {
    await expect(
      validatePageStructure({
        data: { parent: 2, slug: 'dziecko' },
        originalDoc: { id: 1 },
        req: {
          context: {},
          payload: {
            findByID: async () => ({ id: 2, parent: 1 }),
          },
        },
      } as never),
    ).rejects.toMatchObject({ status: 400 })
  })
})
