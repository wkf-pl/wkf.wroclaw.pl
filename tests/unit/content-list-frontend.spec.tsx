import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { ContentList } from '@/app/(frontend)/_components/ContentList'
import type { PublicContentListItem } from '@/modules/content/content-listing'
import type { Event, EventCycle, Page, Post } from '@/payload-types'

import { readFrontendStyles } from '../helpers/frontend-styles'
import { createLexicalDocument } from '../helpers/lexical-document'

function createPageItem(): Extract<PublicContentListItem, { kind: 'pages' }> {
  return {
    document: {
      category: null,
      heroImage: null,
      id: 1,
      listingExcerpt: 'Informacje o klubie.',
      slug: 'o-klubie',
      tags: [],
      title: 'O klubie',
    } as unknown as Page,
    kind: 'pages',
    url: '/o-klubie',
  }
}

function createPostItem(
  publishedAt = '2026-09-08T18:00:00.000Z',
): Extract<PublicContentListItem, { kind: 'posts' }> {
  return {
    document: {
      category: null,
      excerpt: 'Aktualności z życia klubu.',
      heroImage: null,
      id: 2,
      publishedAt,
      slug: 'aktualnosc-klubowa',
      tags: [],
      title: 'Aktualność klubowa',
    } as unknown as Post,
    kind: 'posts',
    url: '/blog/aktualnosc-klubowa',
  }
}

function createEventItem(): Extract<PublicContentListItem, { kind: 'events' }> {
  return {
    document: {
      category: null,
      cycle: {
        id: 7,
        slug: 'erpegowe-wtorki',
        title: 'Erpegowe Wtorki',
      } as unknown as EventCycle,
      endAt: '2026-10-13T20:00:00.000Z',
      excerpt: createLexicalDocument('Otwarte spotkanie dla graczy.'),
      heroImage: null,
      id: 3,
      location: {
        country: 'Polska',
        venueName: 'Centrum kultury, Wrocław',
        venueWebsite: 'https://example.com/miejsce',
      },
      slug: 'wieczor-z-grami',
      startAt: '2026-10-13T16:00:00.000Z',
      tags: [],
      timeMode: 'timed',
      title: 'Wieczór z grami fabularnymi',
    } as unknown as Event,
    kind: 'events',
    url: '/events/wieczor-z-grami',
  }
}

function createEventCycleItem(): Extract<PublicContentListItem, { kind: 'event-cycles' }> {
  return {
    document: {
      category: null,
      excerpt: createLexicalDocument('Regularny cykl spotkań.'),
      heroImage: null,
      id: 4,
      slug: 'spotkania-z-fantastyka',
      tags: [],
      title: 'Spotkania z fantastyką',
    } as unknown as EventCycle,
    kind: 'event-cycles',
    url: '/events/series/spotkania-z-fantastyka',
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
    const item = createEventItem()
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
      /:is\(\.contentList-grid, \.contentList-cards, \.documentList-cards\)[^{]*> \.contentCardImageFallback\s*\{[^}]*height: 100%;/,
    )
  })

  it('does not render a publication date for pages', () => {
    const markup = renderToStaticMarkup(
      createElement(ContentList, {
        items: [createPageItem()],
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
          items: [createEventCycleItem()],
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
        items: [createPostItem(date)],
        view: 'cards',
      }),
    )

    expect(markup).toContain(`<time dateTime="${date}">`)
  })

  it('renders event-specific card data from the full Event entity', () => {
    const markup = renderToStaticMarkup(
      createElement(ContentList, { items: [createEventItem()], view: 'cards' }),
    )

    expect(markup).toContain('class="contentCardKind">Wydarzenie</span>')
    expect(markup).toContain('class="contentCardMetaText">z cyklu</span>')
    expect(markup).toContain('href="/events/series/erpegowe-wtorki"')
    expect(markup).toContain('Erpegowe Wtorki')
    expect(markup).toContain('13 października 2026, 18:00 - 22:00')
    expect(markup).toContain('href="https://example.com/miejsce"')
    expect(markup).toContain('Centrum kultury, Wrocław')
    expect(markup).toContain('Otwarte spotkanie dla graczy.')
  })

  it('keeps the approved larger gap before taxonomy in every detailed card', () => {
    const frontendStyles = readFrontendStyles()

    expect(frontendStyles).toMatch(
      /:is\(\.contentList-cards, \.documentList-cards\) \.contentCardContent > \.taxonomyLinks \{[\s\S]*?margin: 1\.75rem 0 0;/,
    )
  })
})
