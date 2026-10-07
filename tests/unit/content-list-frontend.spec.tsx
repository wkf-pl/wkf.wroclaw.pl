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
  it('limits widescreen card images to the grid view', () => {
    const frontendStyles = readFrontendStyles()
    const cardImageRule = frontendStyles.match(/\.contentCardImage\s*\{(?<declarations>[^}]*)\}/)
    const cardImageDeclarations = cardImageRule?.groups?.declarations
    const gridCardImageSelector = '.contentList-grid > article.contentCard > .contentCardImage'
    const gridCardImageRule = frontendStyles.match(
      /\.contentList-grid > article\.contentCard > \.contentCardImage\s*\{(?<declarations>[^}]*)\}/,
    )
    const gridCardImageDeclarations = gridCardImageRule?.groups?.declarations
    const contentCardImageAspectRatioSelectors = [
      ...frontendStyles.matchAll(
        /(?<selector>[^{}]*\.contentCardImage[^{}]*)\{(?<declarations>[^}]*)\}/g,
      ),
    ]
      .filter((match) => match.groups?.declarations.includes('aspect-ratio'))
      .map((match) => match.groups?.selector.trim())

    expect(cardImageDeclarations).toBeDefined()
    expect(cardImageDeclarations).toContain('min-height: 15rem')
    expect(cardImageDeclarations).not.toContain('aspect-ratio')
    expect(gridCardImageDeclarations).toContain('min-height: 0')
    expect(gridCardImageDeclarations).toContain('max-height: none')
    expect(gridCardImageDeclarations).toContain('aspect-ratio: 16 / 9')
    expect(contentCardImageAspectRatioSelectors).toEqual([gridCardImageSelector])
  })

  it('renders the shared image fallback for grid and card views without media', () => {
    const item = createListItem('events', '2026-09-07T18:00:00.000Z')
    const gridMarkup = renderToStaticMarkup(
      createElement(ContentList, { items: [item], view: 'grid' }),
    )
    const cardsMarkup = renderToStaticMarkup(
      createElement(ContentList, { items: [item], view: 'cards' }),
    )
    const compactMarkup = renderToStaticMarkup(
      createElement(ContentList, { items: [item], view: 'compact' }),
    )
    const frontendStyles = readFrontendStyles()

    expect(gridMarkup).toContain('class="contentCardImageFallback"')
    expect(gridMarkup).toContain('aria-hidden="true"')
    expect(cardsMarkup).toContain('class="contentCardImageFallback"')
    expect(compactMarkup).not.toContain('contentCardImageFallback')
    expect(frontendStyles).toMatch(
      /\.newsImageFallback,\s*\.cardBlockImageFallback,\s*\.contentCardImageFallback\s*\{[^}]*placeholder-nebula\.webp/,
    )
    expect(frontendStyles).toMatch(
      /:is\(\.contentList-grid, \.contentList-cards\)[^{]*> \.contentCardImageFallback\s*\{[^}]*height: 100%;/,
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
