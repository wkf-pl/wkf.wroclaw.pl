import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  getPageTemplateDefinition,
  pageTemplateRegistry,
} from '@/modules/page-templates/page-template-registry'
import {
  addCustomDestinationsToGroups,
  customAdminDestinations,
} from '@/modules/admin/custom-admin-destinations'

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

  it('makes the optional information panel available to every template', () => {
    expect(pageTemplateRegistry.every(({ regions }) => regions.includes('informationPanel'))).toBe(
      true,
    )
  })

  it('describes the event detail requirements', () => {
    expect(getPageTemplateDefinition('event-detail')).toMatchObject({
      currentItemLabel: 'Wydarzenie',
      heroImageRule: 'currentItem',
      requiresCurrentItemContent: true,
    })
    expect(
      getPageTemplateDefinition('event-detail')?.allowedBlocks.find(
        ({ blockType }) => blockType === 'listing',
      )?.variants,
    ).toEqual(['tiles', 'cards', 'carousel', 'compact', 'grid'])
  })

  it('keeps collection index Hero images configurable', () => {
    expect(
      pageTemplateRegistry
        .filter(({ routeKind }) => routeKind === 'collectionIndex')
        .every(({ heroImageRule }) => heroImageRule === 'configurable'),
    ).toBe(true)
  })

  it('registers an administrator-only custom view and navigation entry', () => {
    const payloadConfig = readFileSync('src/payload.config.ts', 'utf8')
    const navigation = readFileSync('src/components/admin/AdminNavClient.tsx', 'utf8')
    const serverNavigation = readFileSync('src/components/admin/AdminNav.tsx', 'utf8')
    const pageTemplateRegistryView = readFileSync(
      'src/components/admin/PageTemplatesRegistry.tsx',
      'utf8',
    )
    const pageTemplateView = readFileSync('src/components/admin/PageTemplatesView.tsx', 'utf8')
    const memberProfileView = readFileSync('src/components/admin/MemberProfileView.tsx', 'utf8')
    const sharedAdminViewTemplate = readFileSync(
      'src/components/admin/AdminViewTemplate.tsx',
      'utf8',
    )
    const dashboardCards = readFileSync('src/components/admin/AdminResourceCards.tsx', 'utf8')

    expect(payloadConfig).toContain("path: '/page-templates'")
    expect(payloadConfig).toContain('/components/admin/PageTemplatesView#PageTemplatesView')
    expect(payloadConfig).toContain('/components/admin/AdminResourceCards#AdminResourceCards')
    expect(navigation).toContain('customDestinations')
    expect(serverNavigation).toContain('getAccessibleCustomAdminDestinations')
    expect(dashboardCards).toContain('getAccessibleCustomAdminDestinations')
    expect(pageTemplateRegistryView).toContain('<SetStepNav nav={pageTemplateStepNav} />')
    expect(pageTemplateRegistryView).toContain('<Gutter>')
    expect(pageTemplateView).toContain('<AdminViewTemplate')
    expect(pageTemplateView).toContain('viewActions={viewActions}')
    expect(memberProfileView).toContain('<AdminViewTemplate')
    expect(sharedAdminViewTemplate).toContain('<DefaultTemplate')
    expect(sharedAdminViewTemplate).toContain('viewActions={viewActions}')
  })

  it('shares custom administration destinations between navigation and dashboard groups', () => {
    expect(customAdminDestinations).toEqual([
      expect.objectContaining({
        group: 'Administracja',
        id: 'page-templates',
        label: 'Szablony stron',
        path: '/page-templates',
        resource: 'page-templates',
      }),
    ])

    expect(
      addCustomDestinationsToGroups(
        [{ entities: [], label: 'Administracja' }],
        [...customAdminDestinations],
      ),
    ).toEqual([
      {
        entities: [expect.objectContaining({ id: 'page-templates' })],
        label: 'Administracja',
      },
    ])
  })

  it('extends the default collection cards widget without changing saved layout identifiers', async () => {
    const { default: configPromise } = await import('@/payload.config')
    const config = await configPromise
    const collectionCardsWidget = config.admin.dashboard?.widgets.find(
      ({ slug }) => slug === 'collections',
    )

    expect(collectionCardsWidget?.Component).toBe(
      '/components/admin/AdminResourceCards#AdminResourceCards',
    )
    expect(config.admin.dashboard?.defaultLayout).toEqual([
      { widgetSlug: 'collections', width: 'full' },
    ])
  })

  it('uses informational styling instead of warning styling', () => {
    const styles = readFileSync('src/components/admin/PageTemplatesRegistry.scss', 'utf8')

    expect(styles).toContain('--color-blue-')
    expect(styles).not.toContain('--theme-warning-')
  })
})
