import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { AdminNavIcon } from '@/components/admin/AdminNavIcon'

const visibleCollectionSlugs = [
  'categories',
  'club-sections',
  'documents',
  'event-cycles',
  'events',
  'media',
  'pages',
  'partners',
  'posts',
  'roles',
  'tags',
  'users',
]

const additionalNavigationIcons = [
  'site-settings',
  'navigation',
  'homepage-hero',
  'homepage-sections',
  'footer',
  'account',
  'profile',
]

describe('admin navigation icons', () => {
  it.each(visibleCollectionSlugs)('renders a decorative raster icon for %s', (slug) => {
    const markup = renderToStaticMarkup(<AdminNavIcon name={slug} />)

    expect(markup).toContain('nav__link-icon')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('data-icon-size="small"')
    expect(markup).toContain('/assets/icons/')
  })

  it.each(additionalNavigationIcons)('renders the %s navigation icon', (name) => {
    expect(renderToStaticMarkup(<AdminNavIcon name={name} />)).toContain('nav__link-icon')
  })

  it('renders a fallback icon for future collections', () => {
    expect(renderToStaticMarkup(<AdminNavIcon name="future-collection" />)).toContain(
      'data-icon-name="collection"',
    )
  })

  it('adds icons to entities, account and profile links', () => {
    const navigationSource = readFileSync('src/components/admin/AdminNavClient.tsx', 'utf8')

    expect(navigationSource).toContain('iconName={slug}')
    expect(navigationSource).toContain('iconName="account"')
    expect(navigationSource).toContain('iconName="profile"')
    expect(navigationSource).toContain('{iconName ? <AdminNavIcon name={iconName} /> : null}')
  })

  it('uses theme-specific icon colors', () => {
    const adminStyles = readFileSync('src/app/(payload)/custom.scss', 'utf8')

    expect(adminStyles).toMatch(/\.nav__link-icon[\s\S]*?color: var\(--wkf-related-link-color\)/)
    expect(adminStyles).toMatch(
      /\.nav a\.nav__link:hover \.nav__link-icon,[\s\S]*?color: var\(--wkf-related-link-hover-color\)/,
    )
    expect(adminStyles).toContain('--wkf-related-link-color: #3465a4')
    expect(adminStyles).toContain('--wkf-related-link-hover-color: #204a87')
    expect(adminStyles).toContain('--wkf-related-link-color: #729fcf')
  })
})
