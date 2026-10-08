import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContentCarousel } from '@/app/(frontend)/_components/ContentCarousel'
import type { PublicContentListItem } from '@/modules/content/content-listing'
import type { Category, Document, Event, EventCycle, Page, Post, Tag } from '@/payload-types'

import { readFrontendStyles } from '../helpers/frontend-styles'
import { createLexicalDocument } from '../helpers/lexical-document'

const category = {
  id: 4,
  name: 'Gry fabularne',
  slug: 'gry-fabularne',
} as Category

const tag = {
  id: 7,
  name: 'RPG',
  slug: 'rpg',
} as Tag

function postItemFixture(
  id: number,
  publishedAt = '2026-10-07T12:00:00.000Z',
): Extract<PublicContentListItem, { kind: 'posts' }> {
  return {
    document: {
      category: null,
      excerpt: `Streszczenie ${id}`,
      heroImage: null,
      id,
      publishedAt,
      slug: `tresc-${id}`,
      tags: [],
      title: `Treść ${id}`,
    } as unknown as Post,
    kind: 'posts',
    url: `/aktualnosci/tresc-${id}`,
  }
}

function pageItemFixture(id: number): Extract<PublicContentListItem, { kind: 'pages' }> {
  return {
    document: {
      category: null,
      heroImage: null,
      id,
      listingExcerpt: `Streszczenie ${id}`,
      slug: `tresc-${id}`,
      tags: [],
      title: `Treść ${id}`,
    } as unknown as Page,
    kind: 'pages',
    url: `/tresc-${id}`,
  }
}

function eventItemFixture(): Extract<PublicContentListItem, { kind: 'events' }> {
  return {
    document: {
      category,
      endAt: '2026-10-07T20:00:00.000Z',
      excerpt: createLexicalDocument('Spotkanie dla osób, które chcą zagrać w RPG.'),
      heroImage: null,
      id: 3,
      location: {
        country: 'Polska',
        venueName: 'Wiking Axe Throwing Club Wrocław',
        venueWebsite: 'https://example.com/wiking',
      },
      slug: 'erpegowy-wtorek-v',
      startAt: '2026-10-07T16:00:00.000Z',
      tags: [tag],
      timeMode: 'timed',
      title: 'Erpegowy Wtorek V',
    } as unknown as Event,
    kind: 'events',
    url: '/events/erpegowy-wtorek-v',
  }
}

function eventCycleItemFixture(): Extract<PublicContentListItem, { kind: 'event-cycles' }> {
  return {
    document: {
      category,
      excerpt: createLexicalDocument('Regularny cykl otwartych spotkań.'),
      heroImage: null,
      id: 4,
      slug: 'erpegowe-wtorki',
      tags: [tag],
      title: 'Erpegowe Wtorki',
    } as unknown as EventCycle,
    kind: 'event-cycles',
    url: '/events/series/erpegowe-wtorki',
  }
}

function documentItemFixture() {
  return {
    document: {
      category,
      documentDate: '2026-03-12T00:00:00.000Z',
      documentNumber: '1/2026',
      documentType: 'statute',
      id: 5,
      slug: 'statut-wkf',
      summary: 'Statut określa cele, zasady działania oraz organizację klubu.',
      tags: [tag],
      title: 'Statut WKF',
    } as unknown as Document,
    kind: 'documents' as const,
    url: '/dokumenty/statut-wkf',
  }
}

describe('Content carousel', () => {
  it('renders all slides with lower-left controls inside the slide visual', () => {
    const markup = renderToStaticMarkup(
      <ContentCarousel items={[postItemFixture(1), pageItemFixture(2)]} />,
    )

    expect(markup.match(/<article[^>]+class="contentCarouselSlide/g)).toHaveLength(2)
    expect(markup).toContain('Treść 1')
    expect(markup).toContain('Treść 2')
    expect(markup).toContain('aria-hidden="true"')
    expect(markup).toContain('aria-label="Wybór slajdu"')
    expect(markup.indexOf('class="contentCarouselControls"')).toBeGreaterThan(
      markup.indexOf('class="contentCarouselVisual"'),
    )
    expect(markup.indexOf('class="contentCarouselControls"')).toBeLessThan(
      markup.indexOf('class="contentCarouselContent"'),
    )
    expect(markup).not.toContain('contentPagination')
  })

  it('renders the configured empty-state message without controls', () => {
    const markup = renderToStaticMarkup(<ContentCarousel emptyMessage="Brak slajdów." items={[]} />)

    expect(markup).toContain('Brak slajdów.')
    expect(markup).not.toContain('contentCarouselControls')
  })

  it('formats dates near midnight in the Warsaw time zone', () => {
    const markup = renderToStaticMarkup(
      <ContentCarousel items={[postItemFixture(1, '2026-08-18T22:08:57.181Z')]} />,
    )

    expect(markup).toContain('19 sierpnia 2026')
    expect(markup).not.toContain('18 sierpnia 2026')
  })

  it('renders entity-specific metadata, event facts, taxonomy and actions', () => {
    const markup = renderToStaticMarkup(
      <ContentCarousel
        items={[
          pageItemFixture(1),
          postItemFixture(2),
          eventItemFixture(),
          eventCycleItemFixture(),
          documentItemFixture(),
        ]}
      />,
    )

    expect(markup).toContain('<span class="contentCarouselKind">Strona</span>')
    expect(markup).toContain('<span class="contentCarouselKind">Wpis</span>')
    expect(markup).toContain('<span class="contentCarouselKind">Wydarzenie</span>')
    expect(markup).toContain('<span class="contentCarouselKind">Cykl wydarzeń</span>')
    expect(markup).toContain('<span class="contentCarouselKind">Statut</span>')
    expect(markup).toContain('nr 1/2026 z dnia')
    expect(markup).toContain('12 marca 2026')
    expect(markup).toContain('7 października 2026, 18:00 - 22:00')
    expect(markup).toContain('href="https://example.com/wiking"')
    expect(markup).toContain('Wiking Axe Throwing Club Wrocław')
    expect(markup).toContain('href="/category/gry-fabularne"')
    expect(markup).toContain('href="/tag/rpg"')
    expect(markup).toContain('href="/events/erpegowy-wtorek-v/calendar.ics"')
    expect(markup.indexOf('Dodaj do kalendarza')).toBeLessThan(
      markup.indexOf('<span>Zobacz</span>', markup.indexOf('Dodaj do kalendarza')),
    )
    expect(markup.match(/<span>Zobacz<\/span>/g)).toHaveLength(5)
    expect(markup).not.toContain('Zobacz treść')
    expect(markup).not.toContain('Zobacz wydarzenie')
  })

  it('keeps generous space before and after taxonomy and aligns actions to the right', () => {
    const frontendStyles = readFrontendStyles()
    const taxonomyRule = frontendStyles.match(
      /\.contentCarouselContent \.taxonomyLinks\s*\{(?<declarations>[^}]*)\}/,
    )
    const actionsRule = frontendStyles.match(
      /\.contentCarouselActions\s*\{(?<declarations>[^}]*)\}/,
    )
    const secondaryActionRule = frontendStyles.match(
      /\.contentCarouselSecondaryAction\s*\{(?<declarations>[^}]*)\}/,
    )

    expect(taxonomyRule?.groups?.declarations).toContain('margin: 1.5rem 0')
    expect(actionsRule?.groups?.declarations).toContain('justify-content: flex-end')
    expect(secondaryActionRule?.groups?.declarations).toContain('background: transparent')
    expect(secondaryActionRule?.groups?.declarations).toContain('border: 0')
  })
})
