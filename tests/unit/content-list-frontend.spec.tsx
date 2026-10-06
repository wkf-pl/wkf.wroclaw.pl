import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { ContentList } from '@/app/(frontend)/_components/ContentList'
import type { PublicContentListItem } from '@/modules/content/content-listing'

import { readFrontendStyles } from '../helpers/frontend-styles'

function createListItem(kind: PublicContentListItem['kind'], date: string): PublicContentListItem {
  return {
    category: null,
    date,
    excerpt: null,
    id: 1,
    image: null,
    kind,
    tags: [],
    title: kind === 'pages' ? 'O klubie' : 'Aktualność klubowa',
    url: kind === 'pages' ? '/o-klubie' : '/blog/aktualnosc-klubowa',
  }
}

describe('frontend content listing', () => {
  it('renders card images in a widescreen frame', () => {
    const frontendStyles = readFrontendStyles()
    const cardImageRule = frontendStyles.match(/\.contentCardImage\s*\{(?<declarations>[^}]*)\}/)
    const cardImageDeclarations = cardImageRule?.groups?.declarations

    expect(cardImageDeclarations).toBeDefined()
    expect(cardImageDeclarations).toContain('display: block')
    expect(cardImageDeclarations).toContain('aspect-ratio: 16 / 9')
    expect(frontendStyles).not.toMatch(
      /[^{}]*\.contentCardImage[^{}]*\{[^}]*(?:min-height|max-height):/,
    )
  })

  it('does not render a publication date for pages', () => {
    const markup = renderToStaticMarkup(
      createElement(ContentList, {
        items: [createListItem('pages', '2026-09-07T18:00:00.000Z')],
        view: 'cards',
      }),
    )

    expect(markup).toContain('O klubie')
    expect(markup).not.toContain('<time')
  })

  it('does not render a publication date for event cycles', () => {
    for (const view of ['cards', 'compact', 'grid'] as const) {
      const markup = renderToStaticMarkup(
        createElement(ContentList, {
          items: [createListItem('event-cycles', '2026-09-07T18:00:00.000Z')],
          view,
        }),
      )

      expect(markup).toContain('Cykl wydarzeń')
      expect(markup).not.toContain('<time')
    }
  })

  it('keeps publication dates for other content collections', () => {
    const date = '2026-09-08T18:00:00.000Z'
    const markup = renderToStaticMarkup(
      createElement(ContentList, {
        items: [createListItem('posts', date)],
        view: 'cards',
      }),
    )

    expect(markup).toContain(`<time dateTime="${date}">`)
  })
})
