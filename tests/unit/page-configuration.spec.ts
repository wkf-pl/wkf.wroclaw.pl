import type { CollectionConfig, Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { AttachmentsBlock, MediaGalleryBlock } from '@/blocks/MediaListing'
import { DocumentsBlock } from '@/blocks/Documents'
import { MemberProfilesBlock } from '@/blocks/MemberProfiles'
import { RichTextBlock } from '@/blocks/RichText'
import { ListingBlock, validateListingSources, validateParentPage } from '@/blocks/Listing'
import { Categories } from '@/collections/Categories'
import { Documents } from '@/collections/Documents'
import { EventCycles } from '@/collections/EventCycles'
import { Events } from '@/collections/Events'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Partners } from '@/collections/Partners'
import { Posts } from '@/collections/Posts'
import { Tags } from '@/collections/Tags'
import {
  populateHierarchyFullTitle,
  preventDeletingCategoryWithChildren,
  validateHierarchy,
} from '@/modules/content/hierarchy'
import { validatePageStructure } from '@/modules/content/page-validation'

function findField(fields: typeof Categories.fields, name: string) {
  const field = flattenFields(fields).find(
    (candidate) => 'name' in candidate && candidate.name === name,
  )

  if (!field) {
    throw new Error(`Missing field: ${name}`)
  }

  return field
}

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

function sidebarFieldNames(collection: CollectionConfig): string[] {
  return flattenFields(collection.fields).flatMap((field) =>
    'name' in field && field.admin?.position === 'sidebar' ? [field.name] : [],
  )
}

function tabLabels(collection: CollectionConfig): (false | string | undefined)[] {
  const tabs = collection.fields.find((field) => field.type === 'tabs')
  if (!tabs || tabs.type !== 'tabs') throw new Error(`Missing tabs in ${collection.slug}`)
  return tabs.tabs.map((tab) => (typeof tab.label === 'string' ? tab.label : undefined))
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
  it('uses semantic SVG thumbnails for every content block', () => {
    expect([
      RichTextBlock.admin?.images?.thumbnail,
      ListingBlock.admin?.images?.thumbnail,
      MediaGalleryBlock.admin?.images?.thumbnail,
      DocumentsBlock.admin?.images?.thumbnail,
      AttachmentsBlock.admin?.images?.thumbnail,
      MemberProfilesBlock.admin?.images?.thumbnail,
    ]).toEqual([
      {
        alt: 'Schematyczna ikona dokumentu z tekstem i piórem',
        url: '/assets/block-thumbnails/rich-text.png',
      },
      {
        alt: 'Schematyczna ikona uporządkowanych kart i filtra',
        url: '/assets/block-thumbnails/listing.png',
      },
      {
        alt: 'Schematyczna ikona siatki zdjęć',
        url: '/assets/block-thumbnails/media-gallery.png',
      },
      {
        alt: 'Schematyczna ikona listy dokumentów',
        url: '/assets/block-thumbnails/documents.png',
      },
      {
        alt: 'Schematyczna ikona dokumentów połączonych spinaczem',
        url: '/assets/block-thumbnails/attachments.png',
      },
      {
        alt: 'Schematyczna ikona dwóch kart profili osób',
        url: '/assets/block-thumbnails/member-profiles.png',
      },
    ])
  })

  it('offers card, list and grid views for embedded member profiles', () => {
    const viewField = MemberProfilesBlock.fields.find(
      (field) => 'name' in field && field.name === 'view',
    )

    expect(viewField).toMatchObject({
      admin: { isClearable: false },
      defaultValue: 'grid',
      label: 'Widok',
      options: [
        { label: 'Karta', value: 'card' },
        { label: 'Lista', value: 'list' },
        { label: 'Siatka', value: 'grid' },
      ],
      required: true,
      type: 'select',
    })
  })

  it('uses the custom grammatically correct create label', () => {
    expect(Pages.admin?.components?.edit?.beforeDocumentControls).toContain(
      '/components/admin/PageCreateLabel#PageCreateLabel',
    )
  })

  it('uses the intended create-form labels, placeholder, and empty rich text value', () => {
    const parentField = findField(Pages.fields, 'parent')
    const excerptField = findField(Pages.fields, 'listingExcerpt')
    const layoutField = findField(Pages.fields, 'layout')

    expect(parentField).toMatchObject({ admin: { placeholder: '<brak>' } })
    expect(excerptField).toMatchObject({ label: 'Streszczenie' })
    expect(layoutField).toMatchObject({
      defaultValue: [
        {
          blockType: 'richText',
          content: { root: { children: [{ type: 'paragraph' }] } },
        },
      ],
      labels: { singular: 'blok treści' },
    })
  })

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
      ['eventTimeFilter', 'eventCycle'],
      ['pageSize', 'pagination'],
    ])
    expect(describeFieldOrder(ListingBlock.fields)).toEqual([
      'heading',
      ['sources', 'parentPage'],
      ['category', 'tag'],
      ['sort', 'view'],
      ['eventTimeFilter', 'eventCycle'],
      ['pageSize', 'pagination'],
      'parentFilter',
      'emptyMessage',
    ])
    expect(parentPageField).toMatchObject({ label: 'Strona nadrzędna', type: 'relationship' })
  })

  it('puts SEO in a separate tab in every SEO-enabled collection', () => {
    for (const collection of [Pages, Posts, Events, EventCycles, Partners]) {
      expect(tabLabels(collection)).toContain('SEO')
    }
  })

  it('uses the requested sidebar field order', () => {
    expect(sidebarFieldNames(Pages)).toEqual([
      'slug',
      'hierarchyPath',
      'category',
      'tags',
      'author',
      'publishedAt',
    ])
    expect(sidebarFieldNames(Posts)).toEqual(['slug', 'category', 'tags', 'author', 'publishedAt'])
    expect(sidebarFieldNames(Events)).toEqual(['slug', 'category', 'tags', 'author', 'publishedAt'])
    expect(sidebarFieldNames(EventCycles)).toEqual([
      'slug',
      'category',
      'tags',
      'author',
      'publishedAt',
    ])
    expect(sidebarFieldNames(Documents)).toEqual([
      'slug',
      'category',
      'tags',
      'author',
      'publishedAt',
    ])
    expect(sidebarFieldNames(Media)).toEqual(['category', 'tags', 'uploadedBy'])
    expect(sidebarFieldNames(Partners)).toEqual(['slug', 'author', 'publishedAt'])
  })

  it('keeps the agreed field order in Categories and Tags', () => {
    expect(describeFieldOrder(Categories.fields)).toEqual([
      'name',
      'slug',
      'description',
      'parent',
      'fullTitle',
      'relatedPages',
      'relatedPosts',
      'relatedEvents',
      'relatedEventCycles',
      'relatedDocuments',
      'breadcrumbs',
      'hierarchyPath',
    ])
    expect(describeFieldOrder(Tags.fields)).toEqual([
      'name',
      'slug',
      'description',
      'relatedPages',
      'relatedPosts',
      'relatedEvents',
      'relatedEventCycles',
      'relatedDocuments',
    ])
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

  it('hides plugin breadcrumbs and shows the readable hierarchy path in the sidebar', () => {
    for (const collection of [Pages, Categories]) {
      expect(findField(collection.fields, 'breadcrumbs')).toMatchObject({
        admin: { hidden: true, readOnly: true },
        type: 'array',
      })
      expect(findField(collection.fields, 'hierarchyPath')).toMatchObject({
        admin: {
          components: { Field: '/components/admin/HierarchyPath#HierarchyPath' },
          position: 'sidebar',
        },
        label: 'Ścieżka nawigacji',
        type: 'ui',
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
      validateHierarchy({
        collection: { slug: 'pages' },
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

  it('builds the administrative title from the complete breadcrumb path', () => {
    expect(
      populateHierarchyFullTitle({
        data: {
          breadcrumbs: [{ label: 'Gry' }, { label: 'RPG' }, { label: 'Warhammer' }],
          name: 'Warhammer',
        },
      }),
    ).toMatchObject({ fullTitle: 'Gry › RPG › Warhammer' })
  })

  it('prevents deleting a category that still has children', async () => {
    await expect(
      preventDeletingCategoryWithChildren({
        id: 1,
        req: {
          payload: {
            count: async () => ({ totalDocs: 1 }),
          },
        },
      } as never),
    ).rejects.toMatchObject({ status: 400 })
  })
})
