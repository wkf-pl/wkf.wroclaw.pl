import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContentCarousel } from '@/app/(frontend)/_components/ContentCarousel'
import type { PublicContentListItem } from '@/modules/content/content-listing'

function contentItemFixture(
  id: number,
  overrides: Partial<PublicContentListItem> = {},
): PublicContentListItem {
  return {
    category: null,
    date: '2026-10-07T12:00:00.000Z',
    excerpt: `Streszczenie ${id}`,
    id,
    image: null,
    kind: 'posts',
    tags: [],
    title: `Treść ${id}`,
    url: `/aktualnosci/tresc-${id}`,
    ...overrides,
  }
}

describe('Content carousel', () => {
  it('renders all slides with lower-left controls inside the slide visual', () => {
    const markup = renderToStaticMarkup(
      <ContentCarousel items={[contentItemFixture(1), contentItemFixture(2, { kind: 'pages' })]} />,
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
      <ContentCarousel items={[contentItemFixture(1, { date: '2026-08-18T22:08:57.181Z' })]} />,
    )

    expect(markup).toContain('19 sierpnia 2026')
    expect(markup).not.toContain('18 sierpnia 2026')
  })
})
