import { describe, expect, it } from 'vitest'

import { PageTemplates } from '@/collections/PageTemplates'
import {
  permissionResources,
  resourceSupportsCreateAndDelete,
} from '@/modules/membership/permission-resources'
import {
  getAllowedPageTemplateBlockSlugs,
  InformationPanelColumnsBlock,
} from '@/modules/page-templates/page-template-blocks'
import {
  getPageTemplateDefinition,
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
      requiresCurrentItemContent: true,
    })
    expect(
      pageTemplateRegistry
        .filter(({ routeKind }) => routeKind === 'collectionIndex')
        .every(({ heroImageRule }) => heroImageRule === 'configurable'),
    ).toBe(true)
  })

  it('supports layout blocks in the information panel', () => {
    expect(InformationPanelColumnsBlock.slug).toBe('infoColumns')
    expect(getAllowedPageTemplateBlockSlugs('event-detail', 'informationPanel')).toEqual(
      expect.arrayContaining(['currentItemField', 'infoColumns', 'infoGroup']),
    )
  })

  it('supports field rows and standalone icons in every template region', () => {
    for (const region of ['hero', 'informationPanel', 'content'] as const) {
      expect(getAllowedPageTemplateBlockSlugs('event-detail', region)).toEqual(
        expect.arrayContaining(['currentItemFieldRow', 'pageTemplateIcon']),
      )
    }
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

  it('prevents publishing through the template mode before its route renderer exists', () => {
    expect(() =>
      validatePageTemplateData({
        _status: 'published',
        renderingMode: 'template',
        templateKey: 'members-index',
      }),
    ).toThrow('Nowy renderer tej trasy nie został jeszcze wdrożony')
  })

  it('requires the accessible event title and its content when publishing the event template', () => {
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
    ).toThrow('wymaga w Hero pola „Tytuł” w wyglądzie „Nagłówek główny”')
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
