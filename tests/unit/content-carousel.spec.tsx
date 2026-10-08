import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ContentCarousel } from '@/app/(frontend)/_components/ContentCarousel'
import type { PublicContentListItem } from '@/modules/content/content-listing'
import type { Page, Post } from '@/payload-types'

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
})
