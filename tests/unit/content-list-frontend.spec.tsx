import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { ContentList } from '@/app/(frontend)/_components/ContentList'
import type { PublicContentListItem } from '@/modules/content/content-listing'
import type {
  Document,
  Event,
  EventCycle,
  Media,
  MemberProfile,
  Page,
  Partner,
  Post,
} from '@/payload-types'

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

function createDocumentItem(): Extract<PublicContentListItem, { kind: 'documents' }> {
  return {
    document: {
      category: null,
      documentDate: '2026-08-26T00:00:00.000Z',
      documentNumber: '4/2026',
      documentType: 'resolution',
      id: 5,
      slug: 'uchwala-testowa',
      summary: 'Opis dokumentu w Listingu.',
      tags: [],
      title: 'Uchwała testowa',
    } as unknown as Document,
    kind: 'documents',
    url: '/dokumenty/uchwala-testowa',
  }
}

function createPartnerItem(): Extract<PublicContentListItem, { kind: 'partners' }> {
  return {
    document: {
      excerpt: 'Partner strategiczny klubu.',
      heroImage: null,
      id: 6,
      name: 'Fundacja Fantastyczna',
      slug: 'fundacja-fantastyczna',
    } as unknown as Partner,
    kind: 'partners',
    url: '/partners/fundacja-fantastyczna',
  }
}

function createMemberProfileItem(
  contextLabel = 'Koordynatorka programu',
): Extract<PublicContentListItem, { kind: 'member-profiles' }> {
  return {
    contextLabel,
    document: {
      about: createLexicalDocument('Prowadzi spotkania i wspiera nowych klubowiczów.'),
      clubFunction: 'Członkini Zarządu',
      id: 7,
      interests: 'Gry fabularne i fantastyka naukowa',
      photo: null,
      publicName: 'Alicja Testowa',
      slug: 'alicja-testowa',
    } as unknown as MemberProfile,
    kind: 'member-profiles',
    url: '/members/alicja-testowa',
  }
}

describe('frontend content listing', () => {
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
    expect(gridMarkup).toContain('class="contentCardImageFallback"')
    expect(gridMarkup).toContain('aria-hidden="true"')
    expect(cardsMarkup).toContain('class="contentCardImageFallback"')
    expect(compactMarkup).not.toContain('contentCardImageFallback')
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

  it('renders documents in every Listing view, including the carousel', () => {
    const documentItem = createDocumentItem()

    for (const view of ['cards', 'carousel', 'compact', 'grid', 'tiles'] as const) {
      const markup = renderToStaticMarkup(
        createElement(ContentList, {
          items: [documentItem],
          view,
        }),
      )

      expect(markup).toContain('Uchwała testowa')
      expect(markup).toContain('href="/dokumenty/uchwala-testowa"')
      expect(markup).toContain('Uchwała')
      expect(markup).toContain('26 sierpnia 2026')
    }
  })

  it('renders partners and member profiles in every Listing view', () => {
    for (const view of ['cards', 'carousel', 'compact', 'grid', 'tiles'] as const) {
      const markup = renderToStaticMarkup(
        createElement(ContentList, {
          items: [createPartnerItem(), createMemberProfileItem()],
          view,
        }),
      )

      expect(markup).toContain('Fundacja Fantastyczna')
      expect(markup).toContain('href="/partners/fundacja-fantastyczna"')
      expect(markup).toContain('Alicja Testowa')
      expect(markup).toContain('href="/members/alicja-testowa"')
      expect(markup).toContain('Koordynatorka programu')
      expect(markup).not.toContain('Członkini Zarządu')
      expect(markup).not.toContain('<time')
    }
  })

  it('shows profile detail in cards and grids but keeps compact rows concise', () => {
    for (const view of ['cards', 'grid'] as const) {
      const markup = renderToStaticMarkup(
        createElement(ContentList, { items: [createMemberProfileItem()], view }),
      )

      expect(markup).toContain('Prowadzi spotkania i wspiera nowych klubowiczów.')
      expect(markup).toContain('Gry fabularne i fantastyka naukowa')
      expect(markup).toContain('/assets/member-profile-placeholder.webp')
    }

    const compactMarkup = renderToStaticMarkup(
      createElement(ContentList, { items: [createMemberProfileItem()], view: 'compact' }),
    )
    expect(compactMarkup).not.toContain('Prowadzi spotkania')
    expect(compactMarkup).not.toContain('Gry fabularne')
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

  it('renders the collection-specific grid data from full entities', () => {
    const event = createEventItem()
    const markup = renderToStaticMarkup(
      createElement(ContentList, {
        items: [createPageItem(), createPostItem(), event, createEventCycleItem()],
        view: 'grid',
      }),
    )

    expect(markup).toContain('class="contentCard contentCard--grid"')
    expect(markup).toContain('class="contentCardKind">Strona</span>')
    expect(markup).toContain('class="contentCardKind">Wpis</span>')
    expect(markup).toContain('class="contentCardKind">Wydarzenie</span>')
    expect(markup).toContain('class="contentCardKind">Cykl wydarzeń</span>')
    expect(markup).toContain(
      '<time dateTime="2026-10-13T16:00:00.000Z">13 października 2026, 18:00</time>',
    )
    expect(markup).not.toContain('/events/series/erpegowe-wtorki')
    expect(markup).not.toContain('22:00')
    expect(markup).toContain('href="https://example.com/miejsce"')
    expect(markup.indexOf(event.document.title)).toBeLessThan(
      markup.indexOf('Centrum kultury, Wrocław'),
    )
    expect(markup.indexOf('Centrum kultury, Wrocław')).toBeLessThan(
      markup.indexOf('Otwarte spotkanie dla graczy.'),
    )
  })

  it('renders compact rows with the event start time and no extra entity data', () => {
    const markup = renderToStaticMarkup(
      createElement(ContentList, {
        items: [createPageItem(), createPostItem(), createEventItem(), createEventCycleItem()],
        view: 'compact',
      }),
    )

    expect(markup).toContain('class="contentList contentList-compact"')
    expect(markup).toContain(
      '<time dateTime="2026-10-13T16:00:00.000Z">13 października 2026, 18:00</time>',
    )
    expect(markup).not.toContain('contentCardImage')
    expect(markup).not.toContain('taxonomyLinks')
    expect(markup).not.toContain('Otwarte spotkanie dla graczy.')
  })

  it('renders image tiles with the same information as compact rows', () => {
    const post = createPostItem()
    post.document.heroImage = {
      alt: 'Członkowie klubu przy stole',
      height: 900,
      id: 9,
      url: '/media/spotkanie.webp',
      width: 1600,
    } as Media
    const markup = renderToStaticMarkup(
      createElement(ContentList, {
        items: [createPageItem(), post, createEventItem(), createEventCycleItem()],
        view: 'tiles',
      }),
    )

    expect(markup).toContain('class="contentList contentList-tiles"')
    expect(markup.match(/class="contentTile"/g)).toHaveLength(4)
    expect(markup.match(/class="contentTileImageFallback"/g)).toHaveLength(3)
    expect(markup).toContain('class="contentTileImage"')
    expect(markup).toContain('src="/media/spotkanie.webp"')
    expect(markup).toContain('class="contentCardKind">Strona</span>')
    expect(markup).toContain('class="contentCardKind">Wpis</span>')
    expect(markup).toContain('class="contentCardKind">Wydarzenie</span>')
    expect(markup).toContain('class="contentCardKind">Cykl wydarzeń</span>')
    expect(markup).toContain(
      '<time dateTime="2026-10-13T16:00:00.000Z">13 października 2026, 18:00</time>',
    )
    expect(markup).not.toContain('taxonomyLinks')
    expect(markup).not.toContain('Otwarte spotkanie dla graczy.')
    expect(markup).not.toContain('Centrum kultury, Wrocław')
  })
})
