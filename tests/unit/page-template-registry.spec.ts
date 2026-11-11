import { describe, expect, it } from 'vitest'

import { PageTemplates } from '@/collections/PageTemplates'
import {
  permissionResources,
  resourceSupportsCreateAndDelete,
} from '@/modules/membership/permission-resources'
import {
  CurrentItemFieldBlock,
  getAllowedPageTemplateBlockSlugs,
  InformationPanelColumnsBlock,
} from '@/modules/page-templates/page-template-blocks'
import {
  getPageTemplateDefinition,
  getPageTemplateDynamicField,
  pageTemplateRegistry,
} from '@/modules/page-templates/page-template-registry'
import {
  preservePageTemplateKey,
  validatePageTemplateData,
} from '@/modules/page-templates/page-template-validation'

describe('page template registry', () => {
  it('defines the closed set of supported route templates', () => {
    expect(pageTemplateRegistry.map(({ route }) => route)).toEqual([
      '/blog',
      '/events',
      '/members',
      '/tag/[slug]',
      '/category/[slug]',
      '/events/[slug]',
      '/events/series/[slug]',
      '/partners/[slug]',
      '/members/[slug]',
    ])
    expect(new Set(pageTemplateRegistry.map(({ id }) => id)).size).toBe(9)
    expect(new Set(pageTemplateRegistry.map(({ route }) => route)).size).toBe(9)
  })

  it('defines route-specific regions, dynamic fields, and image behavior', () => {
    expect(pageTemplateRegistry.every(({ regions }) => regions.includes('informationPanel'))).toBe(
      true,
    )
    expect(getPageTemplateDefinition('event-detail')).toMatchObject({
      currentItemLabel: 'Wydarzenie',
      heroImageRule: 'currentItem',
    })
    expect(
      pageTemplateRegistry
        .filter(({ routeKind }) => routeKind === 'collectionIndex')
        .every(({ heroImageRule }) => heroImageRule === 'configurable'),
    ).toBe(true)
  })

  it('offers item fields in every template region while hiding editorial metadata', () => {
    const fieldsByTemplate = {
      'event-detail': ['title', 'startAt', 'location.city', 'externalLinks', 'eventStatus'],
      'event-cycle-detail': [
        'tags',
        'eventDefaults.eventType',
        'eventDefaults.defaultStartTime',
        'updatedAt',
      ],
      'member-detail': ['photo', 'interests', 'games', 'contactTopics'],
      'partner-detail': ['heroImage', 'layout', 'publishedAt'],
      'category-detail': ['parent', 'fullTitle', 'relatedPages'],
      'tag-detail': ['description', 'relatedEvents', 'updatedAt'],
    } as const

    for (const definition of pageTemplateRegistry) {
      if (definition.routeKind !== 'collectionItem' || !(definition.id in fieldsByTemplate))
        continue
      const keys = fieldsByTemplate[definition.id as keyof typeof fieldsByTemplate]
      for (const region of definition.regions) {
        for (const key of keys) {
          expect(getPageTemplateDynamicField(definition.id, key, region), key).toBeDefined()
        }
        for (const key of [
          'slug',
          'status',
          '_status',
          'createdAt',
          'id',
          'systemKey',
          '_objectKey',
          'deletedAt',
          'seo',
          'seo.title',
        ]) {
          expect(getPageTemplateDynamicField(definition.id, key, region), key).toBeUndefined()
        }
      }
    }
  })

  it('uses the shared text styles for current item descriptions', () => {
    const fields = CurrentItemFieldBlock.fields[0]
    expect(fields?.type === 'row' && fields.fields[1]).toMatchObject({
      name: 'variant',
      label: 'Styl',
    })
    const field = getPageTemplateDynamicField('event-detail', 'excerpt', 'hero')
    expect(field?.variants).toEqual([
      { label: 'Tekst wprowadzający', value: 'lead' },
      { label: 'Tekst podstawowy', value: 'body' },
      { label: 'Tekst kompaktowy', value: 'compact' },
      { label: 'Etykieta', value: 'badge' },
      { label: 'Etykieta wyróżniona', value: 'emphasizedBadge' },
    ])
    for (const variant of ['badge', 'emphasizedBadge']) {
      expect(() =>
        validatePageTemplateData({
          templateKey: 'event-detail',
          hero: [{ blockType: 'currentItemField', field: 'excerpt', variant }],
        }),
      ).not.toThrow()
    }
  })

  it('supports layout blocks in the information panel', () => {
    expect(InformationPanelColumnsBlock.slug).toBe('infoColumns')
    expect(getAllowedPageTemplateBlockSlugs('event-detail', 'informationPanel')).toEqual(
      expect.arrayContaining(['currentItemField', 'infoColumns', 'infoGroup']),
    )
  })

  it('offers every content block in the information panel of the same template', () => {
    for (const { id } of pageTemplateRegistry) {
      const content = getAllowedPageTemplateBlockSlugs(id, 'content')
      const informationPanel = getAllowedPageTemplateBlockSlugs(id, 'informationPanel')
      const expected = content.map((blockType) => {
        if (blockType === 'columnLayout') return 'infoColumns'
        if (blockType === 'sectionGroup') return 'infoGroup'
        return blockType
      })
      expect([...informationPanel].sort(), id).toEqual(expected.sort())
    }

    expect(
      getPageTemplateDynamicField('event-cycle-detail', 'organizers', 'informationPanel'),
    ).toBeDefined()
    expect(
      getPageTemplateDynamicField('event-detail', 'eventTime', 'informationPanel'),
    ).toBeDefined()
    expect(getAllowedPageTemplateBlockSlugs('event-cycle-detail', 'hero')).not.toContain('listing')
  })

  it('accepts a published cycle template with its content and a Listing in the information panel', () => {
    expect(() =>
      validatePageTemplateData({
        _status: 'published',
        informationPanel: [{ blockType: 'currentItemContent' }, { blockType: 'listing' }],
        renderingMode: 'template',
        templateKey: 'event-cycle-detail',
      }),
    ).not.toThrow()
  })

  it('supports field rows and standalone icons in every template region', () => {
    for (const region of ['hero', 'informationPanel', 'content'] as const) {
      expect(getAllowedPageTemplateBlockSlugs('event-detail', region)).toEqual(
        expect.arrayContaining(['currentItemFieldRow', 'pageTemplateIcon']),
      )
    }
  })

  it('allows spacers in every region and inside field rows', () => {
    for (const { id, regions } of pageTemplateRegistry) {
      for (const region of regions) {
        expect(getAllowedPageTemplateBlockSlugs(id, region)).toContain('spacer')
      }
    }

    expect(() =>
      validatePageTemplateData({
        templateKey: 'member-detail',
        hero: [{ blockType: 'currentItemFieldRow', items: [{ blockType: 'spacer', size: '24' }] }],
      }),
    ).not.toThrow()
  })

  it('defines event-specific actions and contextual Listing relations', () => {
    expect(getPageTemplateDefinition('event-detail')).toMatchObject({
      contextActions: [
        { key: 'eventCalendar', label: 'Dodaj do kalendarza' },
        { key: 'eventMap', label: 'Otwórz w Mapach' },
        { key: 'eventCycleCalendar', label: 'Subskrybuj cykl' },
      ],
      contextListingRelations: [
        {
          key: 'eventPartners',
          label: 'Partnerzy bieżącego wydarzenia',
          source: 'partners',
        },
      ],
    })
  })

  it('offers the partners of the current cycle as a contextual Listing relation', () => {
    expect(getPageTemplateDefinition('event-cycle-detail')?.contextListingRelations).toEqual([
      { key: 'eventPartners', label: 'Partnerzy bieżącego cyklu', source: 'partners' },
    ])
    expect(() =>
      validatePageTemplateData({
        _status: 'draft',
        content: [
          {
            blockType: 'listing',
            contextRelation: 'eventPartners',
            selectionMode: 'contextRelation',
          },
        ],
        renderingMode: 'template',
        templateKey: 'event-cycle-detail',
      }),
    ).not.toThrow()
  })

  it('registers page templates as a normal collection without create and delete operations', () => {
    expect(PageTemplates.slug).toBe('page-templates')
    expect(PageTemplates.versions).toMatchObject({ drafts: true, maxPerDoc: 50 })
    expect(PageTemplates.disableDuplicate).toBe(true)
    expect(permissionResources['page-templates']).toMatchObject({
      collection: 'page-templates',
      kind: 'collection',
    })
    expect(resourceSupportsCreateAndDelete('page-templates')).toBe(false)
  })

  it('keeps the fixed template identity immutable on update', () => {
    expect(
      preservePageTemplateKey({ templateKey: 'blog-index' }, 'update', {
        templateKey: 'event-detail',
      }),
    ).toMatchObject({ templateKey: 'event-detail' })
  })

  it('allows incomplete drafts but validates configured blocks', () => {
    expect(() =>
      validatePageTemplateData({
        _status: 'draft',
        renderingMode: 'template',
        templateKey: 'event-detail',
      }),
    ).not.toThrow()

    expect(() =>
      validatePageTemplateData({
        _status: 'draft',
        hero: [{ blockType: 'currentItemContent' }],
        renderingMode: 'legacy',
        templateKey: 'event-detail',
      }),
    ).toThrow('nie jest dozwolony w regionie hero')
  })

  it('provides a renderer for every registered template', () => {
    expect(pageTemplateRegistry.every(({ rendererAvailable }) => rendererAvailable)).toBe(true)
  })

  it('publishes an event template with any number of current item content blocks', () => {
    const currentItemContent = { blockType: 'currentItemContent' }
    for (const content of [
      [],
      [currentItemContent],
      [
        currentItemContent,
        { blockType: 'columnLayout', columns: [{ blocks: [currentItemContent] }] },
      ],
    ]) {
      expect(() =>
        validatePageTemplateData({
          _status: 'published',
          content,
          hero: [{ blockType: 'currentItemField', field: 'title', variant: 'primaryHeading' }],
          renderingMode: 'template',
          templateKey: 'event-detail',
        }),
      ).not.toThrow()
    }
  })

  it('rejects current item content nested in an index template', () => {
    expect(() =>
      validatePageTemplateData({
        content: [
          {
            blockType: 'columnLayout',
            columns: [{ blocks: [{ blockType: 'currentItemContent' }] }],
          },
        ],
        templateKey: 'events-index',
      }),
    ).toThrow('Ten szablon nie obsługuje bloku')
  })

  it('requires the accessible event title when publishing the event template', () => {
    const publishedTemplate = {
      _status: 'published',
      content: [{ blockType: 'currentItemContent' }],
      hero: [
        {
          blockType: 'currentItemField',
          field: 'title',
          variant: 'primaryHeading',
        },
      ],
      renderingMode: 'template',
      templateKey: 'event-detail',
    }

    expect(() => validatePageTemplateData(publishedTemplate)).not.toThrow()
    expect(() =>
      validatePageTemplateData({
        ...publishedTemplate,
        hero: [],
      }),
    ).toThrow('wymaga w Hero pola „Tytuł” w stylu „Nagłówek główny”')
  })

  it('rejects unsupported contextual actions and Listing relations', () => {
    expect(() =>
      validatePageTemplateData({
        _status: 'draft',
        hero: [
          {
            blockType: 'actionLinks',
            items: [{ actionSource: 'contextAction', contextAction: 'unknownAction' }],
          },
        ],
        renderingMode: 'legacy',
        templateKey: 'event-detail',
      }),
    ).toThrow('nie jest dostępna dla tego szablonu')

    expect(() =>
      validatePageTemplateData({
        _status: 'draft',
        content: [
          {
            blockType: 'listing',
            contextRelation: 'unknownRelation',
            selectionMode: 'contextRelation',
          },
        ],
        renderingMode: 'legacy',
        templateKey: 'event-detail',
      }),
    ).toThrow('nie jest dostępna dla tego szablonu')
  })
})
