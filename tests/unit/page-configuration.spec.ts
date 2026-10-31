import { readFileSync } from 'node:fs'

import type { CollectionConfig, Field } from 'payload'
import { describe, expect, it } from 'vitest'

import { AttachmentsBlock, MediaGalleryBlock } from '@/blocks/MediaListing'
import { ActionLinksBlock } from '@/blocks/ActionLinks'
import { CardBlock } from '@/blocks/Card'
import { ContentCalendarBlock, validateContentCalendarSources } from '@/blocks/ContentCalendar'
import { ColumnLayoutBlock } from '@/blocks/ColumnLayout'
import { HeadingBlock } from '@/blocks/Heading'
import { RichTextBlock } from '@/blocks/RichText'
import { SectionGroupBlock } from '@/blocks/SectionGroup'
import { TabbedContentBlock } from '@/blocks/TabbedContent'
import { ListingBlock, validateListingSources, validateManualListingItems } from '@/blocks/Listing'
import { validateListingConditions } from '@/blocks/listing-condition-fields'
import { validateContentListingPageSize } from '@/blocks/listing-fields'
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
  it('uses semantic raster thumbnails for every content block', () => {
    expect([
      RichTextBlock.admin?.images?.thumbnail,
      ListingBlock.admin?.images?.thumbnail,
      MediaGalleryBlock.admin?.images?.thumbnail,
      AttachmentsBlock.admin?.images?.thumbnail,
      HeadingBlock.admin?.images?.thumbnail,
      ActionLinksBlock.admin?.images?.thumbnail,
      CardBlock.admin?.images?.thumbnail,
      ContentCalendarBlock.admin?.images?.thumbnail,
      ColumnLayoutBlock.admin?.images?.thumbnail,
      SectionGroupBlock.admin?.images?.thumbnail,
      TabbedContentBlock.admin?.images?.thumbnail,
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
        alt: 'Schematyczna ikona dokumentów połączonych spinaczem',
        url: '/assets/block-thumbnails/attachments.png',
      },
      {
        alt: 'Schematyczna ikona nagłówka i krótkiej treści',
        url: '/assets/block-thumbnails/heading.png',
      },
      {
        alt: 'Schematyczna ikona przycisków i odnośnika akcji',
        url: '/assets/block-thumbnails/action-links.png',
      },
      {
        alt: 'Schematyczna ikona karty z obrazem i odnośnikami',
        url: '/assets/block-thumbnails/card.png',
      },
      {
        alt: 'Schematyczna ikona kalendarza z siatką dni',
        url: '/assets/block-thumbnails/calendar.png',
      },
      {
        alt: 'Schematyczna ikona układu kolumnowego',
        url: '/assets/block-thumbnails/column-layout.png',
      },
      {
        alt: 'Schematyczna ikona sekcji objętych wspólną ramką',
        url: '/assets/block-thumbnails/section-group.png',
      },
      {
        alt: 'Schematyczna ikona treści przełączanej zakładkami',
        url: '/assets/block-thumbnails/tabbed-content.png',
      },
    ])
  })

  it('orders block-picker groups from content through elements to layout', () => {
    expect([
      RichTextBlock.admin?.group,
      ListingBlock.admin?.group,
      MediaGalleryBlock.admin?.group,
      AttachmentsBlock.admin?.group,
      HeadingBlock.admin?.group,
      ActionLinksBlock.admin?.group,
      CardBlock.admin?.group,
      ContentCalendarBlock.admin?.group,
      ColumnLayoutBlock.admin?.group,
      SectionGroupBlock.admin?.group,
    ]).toEqual([
      'Treści',
      'Treści',
      'Treści',
      'Treści',
      'Elementy',
      'Elementy',
      'Elementy',
      'Elementy',
      'Układ',
      'Układ',
    ])
  })

  it('places standalone heading controls in two compact rows', () => {
    const headingRow = HeadingBlock.fields[0]
    const iconRow = HeadingBlock.fields[1]
    expect(headingRow).toMatchObject({
      fields: [
        { admin: { width: '75%' }, name: 'heading', type: 'text' },
        {
          admin: { width: '25%' },
          defaultValue: 'h2',
          name: 'headingLevel',
          options: [
            { label: 'H2', value: 'h2' },
            { label: 'H3', value: 'h3' },
            { label: 'H4', value: 'h4' },
          ],
          type: 'select',
        },
      ],
      type: 'row',
    })
    expect(iconRow).toMatchObject({
      fields: [
        {
          admin: { width: '75%' },
          label: 'Ikona',
          name: 'headingIconName',
          type: 'select',
        },
        {
          admin: { width: '25%' },
          defaultValue: false,
          label: 'Inwersja',
          name: 'iconInverted',
          type: 'checkbox',
        },
      ],
      type: 'row',
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
    const listingFields = ListingBlock.fields.slice(3)
    const rows = listingFields.filter((field) => field.type === 'row')
    const rowFieldNames = rows.map((row) =>
      row.fields.map((field) => ('name' in field ? field.name : undefined)),
    )
    const conditionsField = findField(ListingBlock.fields, 'conditions')

    expect(ListingBlock.fields[0]).toMatchObject({
      fields: [
        {
          admin: { width: '33.333%' },
          name: 'view',
          options: expect.arrayContaining([{ label: 'Kafelki', value: 'tiles' }]),
          type: 'select',
        },
        { admin: { width: '33.333%' }, name: 'frame', type: 'select' },
        { admin: { width: '33.333%' }, name: 'surface', type: 'select' },
      ],
      type: 'row',
    })
    expect(rowFieldNames).toEqual([
      ['selectionMode', 'sources'],
      ['sort', 'pageSize', 'pagination'],
    ])
    expect(describeFieldOrder(listingFields)).toEqual([
      ['selectionMode', 'sources'],
      'items',
      'conditions',
      ['sort', 'pageSize', 'pagination'],
      'hideWhenEmpty',
      'emptyMessage',
    ])
    expect(conditionsField).toMatchObject({
      admin: {
        components: {
          Field: '/components/admin/ListingConditionsField#ListingConditionsField',
          RowLabel: '/components/admin/ListingConditionsField#ListingConditionRowLabel',
        },
      },
      maxRows: 10,
      type: 'array',
    })
    expect(rows.at(-1)).toMatchObject({
      fields: [
        {
          admin: { width: '33.333%' },
          name: 'sort',
          options: [
            { label: 'Najnowsze', value: 'newest' },
            { label: 'Najstarsze', value: 'oldest' },
            { label: 'Tytuł A–Z', value: 'titleAscending' },
            { label: 'Tytuł Z–A', value: 'titleDescending' },
          ],
        },
        { admin: { width: '33.333%' }, name: 'pageSize' },
        { admin: { width: '33.333%' }, name: 'pagination' },
      ],
    })
  })

  it('configures the content calendar with Listing-compatible filters', () => {
    const sourceField = findField(ContentCalendarBlock.fields, 'sources')
    const eventCycleField = findField(ContentCalendarBlock.fields, 'eventCycle')

    expect(describeFieldOrder(ContentCalendarBlock.fields.slice(3))).toEqual([
      'sources',
      ['category', 'tag', 'eventCycle'],
    ])
    expect(sourceField).toMatchObject({
      defaultValue: ['events', 'posts'],
      hasMany: true,
      label: 'Typy treści',
      options: [
        { label: 'Wydarzenia', value: 'events' },
        { label: 'Wpisy', value: 'posts' },
      ],
      required: true,
      type: 'select',
    })
    expect(eventCycleField).toMatchObject({
      admin: { width: '33.333%' },
      label: 'Cykl wydarzeń',
      relationTo: 'event-cycles',
      type: 'relationship',
    })
    expect(validateContentCalendarSources([], {} as never)).toBeTypeOf('string')
    expect(validateContentCalendarSources(['events', 'posts'], {} as never)).toBe(true)
  })

  it('supports ordered manual Listing items from every content source', async () => {
    const selectionModeField = findField(ListingBlock.fields, 'selectionMode')
    const itemsField = findField(ListingBlock.fields, 'items')
    const itemField =
      itemsField.type === 'array'
        ? itemsField.fields.find((field) => 'name' in field && field.name === 'item')
        : null
    const contextLabelField =
      itemsField.type === 'array'
        ? itemsField.fields.find((field) => 'name' in field && field.name === 'contextLabel')
        : null

    expect(selectionModeField).toMatchObject({
      admin: { width: '33.333%' },
      defaultValue: 'filters',
      label: 'Tryb wyboru',
      options: [
        { label: 'Ręczny', value: 'manual' },
        { label: 'Filtry', value: 'filters' },
      ],
      required: true,
      type: 'select',
    })
    expect(itemsField).toMatchObject({
      label: 'Treści',
      type: 'array',
    })
    expect(itemField).toMatchObject({
      admin: {
        components: {
          Field: '/components/admin/ListingManualItemField#ListingManualItemField',
        },
      },
      label: 'Treść',
      relationTo: [
        'pages',
        'posts',
        'events',
        'event-cycles',
        'documents',
        'partners',
        'member-profiles',
      ],
      required: true,
      type: 'relationship',
    })
    expect(contextLabelField).toMatchObject({ maxLength: 160, type: 'text' })
    expect(
      contextLabelField?.admin?.condition?.(
        {},
        { item: { relationTo: 'member-profiles' } },
        {} as never,
      ),
    ).toBe(true)
    const contextLabelHook =
      contextLabelField && 'hooks' in contextLabelField
        ? contextLabelField.hooks?.beforeValidate?.[0]
        : undefined
    expect(
      await contextLabelHook?.({
        siblingData: { item: { relationTo: 'pages' } },
        value: 'Ukryty podpis',
      } as never),
    ).toBeNull()
    expect(
      await contextLabelHook?.({
        siblingData: { item: { relationTo: 'member-profiles' } },
        value: '  Prezes Zarządu  ',
      } as never),
    ).toBe('Prezes Zarządu')
    expect(itemsField.admin?.condition?.({}, { selectionMode: 'manual' }, {} as never)).toBe(true)
    expect(itemsField.admin?.condition?.({}, { selectionMode: 'filters' }, {} as never)).toBe(false)
    expect(findField(ListingBlock.fields, 'sources')).toMatchObject({
      admin: { width: '66.667%' },
      options: expect.arrayContaining([{ label: 'Dokumenty', value: 'documents' }]),
    })
    expect(findField(ListingBlock.fields, 'view')).toMatchObject({
      options: expect.arrayContaining([{ label: 'Karuzela', value: 'carousel' }]),
    })
  })

  it('does not register the removed Documents block', () => {
    const layoutField = findField(Pages.fields, 'layout')
    if (layoutField.type !== 'blocks') throw new Error('Expected the Page layout field')

    expect(layoutField.blocks.map((block) => block.slug)).not.toContain('documents')
  })

  it('configures the Listing carousel window without pagination', async () => {
    const pageSizeField = findField(ListingBlock.fields, 'pageSize')
    const paginationField = findField(ListingBlock.fields, 'pagination')

    expect(pageSizeField).toMatchObject({
      admin: {
        components: { Field: '/components/admin/ListingPageSizeField#ListingPageSizeField' },
      },
      defaultValue: 12,
      max: 100,
      min: 1,
      required: true,
      type: 'number',
    })
    expect(paginationField.admin?.condition?.({}, { view: 'carousel' }, {} as never)).toBe(false)
    expect(paginationField.admin?.condition?.({}, { view: 'cards' }, {} as never)).toBe(true)
    expect(validateContentListingPageSize(20, { siblingData: { view: 'carousel' } } as never)).toBe(
      true,
    )
    expect(
      validateContentListingPageSize(21, { siblingData: { view: 'carousel' } } as never),
    ).toBeTypeOf('string')
    const pageSizeHook =
      'hooks' in pageSizeField ? pageSizeField.hooks?.beforeValidate?.[0] : undefined
    const paginationHook =
      'hooks' in paginationField ? paginationField.hooks?.beforeValidate?.[0] : undefined
    expect(
      await pageSizeHook?.({ siblingData: { view: 'carousel' }, value: undefined } as never),
    ).toBe(5)
    expect(
      await paginationHook?.({ siblingData: { view: 'carousel' }, value: true } as never),
    ).toBe(false)
  })

  it('requires unique manual Listing items within each content source', () => {
    expect(
      validateManualListingItems([], {
        siblingData: { selectionMode: 'manual' },
      } as never),
    ).toBeTypeOf('string')
    expect(
      validateManualListingItems([{ item: { relationTo: 'documents' } }], {
        siblingData: { selectionMode: 'manual' },
      } as never),
    ).toBe('Wybierz cel dla każdej treści.')
    expect(
      validateManualListingItems(
        [
          { item: { relationTo: 'pages', value: 7 } },
          { item: { relationTo: 'pages', value: { id: 7 } } },
        ],
        { siblingData: { selectionMode: 'manual' } } as never,
      ),
    ).toBeTypeOf('string')
    expect(
      validateManualListingItems(
        [{ item: { relationTo: 'pages', value: 7 } }, { item: { relationTo: 'posts', value: 7 } }],
        { siblingData: { selectionMode: 'manual' } } as never,
      ),
    ).toBe(true)
    expect(
      validateManualListingItems(
        [
          {
            contextLabel: 'Prezes',
            item: { relationTo: 'member-profiles', value: 7 },
          },
          {
            contextLabel: 'Koordynator',
            item: { relationTo: 'member-profiles', value: 7 },
          },
        ],
        { siblingData: { selectionMode: 'manual' } } as never,
      ),
    ).toBe(true)
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
          defaultColumns: ['title', 'slug', '_status', 'publishedAt', 'updatedAt'],
        },
      })

      for (const fieldName of [
        'relatedPages',
        'relatedPosts',
        'relatedEvents',
        'relatedEventCycles',
        'relatedDocuments',
      ]) {
        const relatedField = findField(collection.fields, fieldName)

        expect(relatedField.type).toBe('join')
        if (relatedField.type !== 'join') throw new Error(`Expected ${fieldName} to be a join`)

        expect(relatedField.admin?.defaultColumns).not.toContain('category')
        expect(relatedField.admin?.defaultColumns).not.toContain('tags')
      }
    }
  })

  it('configures Listing conditions from selected sources', () => {
    const component = readFileSync('src/components/admin/ListingConditionsField.tsx', 'utf8')

    expect(component).toContain('useFormFields')
    expect(component).toContain('listingConditionSupportedSources')
    expect(component).toContain('Ten warunek nie dotyczy żadnego wybranego źródła')
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

  it('accepts a parent-page condition when at least one source supports it', () => {
    expect(
      validateListingSources(['pages'], {
        siblingData: { selectionMode: 'filters', sources: ['pages'] },
      } as never),
    ).toBe(true)
    expect(
      validateListingSources(['pages', 'posts'], {
        siblingData: { selectionMode: 'filters', sources: ['pages', 'posts'] },
      } as never),
    ).toBe(true)
    expect(
      validateListingConditions(
        [
          {
            field: 'parentPage',
            operator: 'equals',
            relationshipValue: { relationTo: 'pages', value: 1 },
          },
        ],
        {
          siblingData: { selectionMode: 'filters', sources: ['pages', 'posts'] },
        } as never,
      ),
    ).toBe(true)
    expect(
      validateListingConditions(
        [
          {
            field: 'parentPage',
            operator: 'equals',
            relationshipValue: { relationTo: 'pages', value: 1 },
          },
        ],
        {
          siblingData: { selectionMode: 'filters', sources: ['posts'] },
        } as never,
      ),
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
