import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ConfiguredContentList } from '@/app/(frontend)/_components/ConfiguredContentList'
import type { ContentListingPresentation } from '@/modules/content/content-listing-presentation'
import { resolveListingView } from '@/modules/content/listing-view'

const items: ContentListingPresentation[] = [
  { title: 'Pierwsze spotkanie', url: '/first', kindLabel: 'Wydarzenie', facts: [] },
  { title: 'Drugie spotkanie', url: '/second', kindLabel: 'Strona', facts: [] },
]

function renderPreset(preset: string) {
  return renderToStaticMarkup(
    <ConfiguredContentList items={items} view={resolveListingView({ preset }).view} />,
  )
}

describe('configured Listing uses the public presentation', () => {
  it('retains the branded carousel and slide navigation', () => {
    const markup = renderPreset('carousel')
    expect(markup).toContain('class="contentCarousel"')
    expect(markup).toContain('contentCarouselVisualLink')
    expect(markup).toContain('contentCarouselControls')
    expect(markup).toContain('aria-label="Pokaż: Drugie spotkanie"')
    expect(markup).not.toContain('Poprzedni')
  })

  it('retains tile imagery, overlays and metadata styling', () => {
    const markup = renderPreset('tiles')
    expect(markup).toContain('contentList-tiles')
    expect(markup).toContain('contentTileLink')
    expect(markup).toContain('contentTileImageFallback')
    expect(markup).toContain('contentTileOverlay')
    expect(markup).toContain('contentTileMeta')
  })

  it('groups compact rows in the public frame', () => {
    expect(renderPreset('compact')).toContain('contentList-compact')
  })

  it('uses branded card slides for multiple visible items', () => {
    const view = resolveListingView({ preset: 'featured' }).view
    const markup = renderToStaticMarkup(<ConfiguredContentList items={items} view={view} />)
    expect(markup).toContain('contentCarouselSlides--collection')
    expect(markup).toContain('contentCarouselControls--footer')
    expect(markup).toContain('contentCard--grid')
    expect(markup).not.toContain('Poprzedni')
  })

  it('keeps additional tile links outside the main title link', () => {
    const presentation = {
      ...items[0],
      metadataLink: { href: '/series', label: 'Cykl', prefix: 'z cyklu' },
      secondaryAction: { href: '/calendar.ics', label: 'Dodaj do kalendarza' },
    }
    const markup = renderToStaticMarkup(
      <ConfiguredContentList
        items={[presentation]}
        view={resolveListingView({ preset: 'tiles' }).view}
      />,
    )
    expect(markup).toContain('contentTileTitleLink')
    expect(markup).toMatch(/href="\/first">Pierwsze spotkanie<\/a><\/h2>/)
    expect(markup).toContain('href="/series"')
    expect(markup).toContain('href="/calendar.ics"')
  })

  it('honors disabled images and information without changing the card design', () => {
    const view = resolveListingView({
      preset: 'cards',
      overrides: { information: { image: false, kind: false } },
    }).view
    const markup = renderToStaticMarkup(
      <ConfiguredContentList items={[{ ...items[0], kindLabel: '' }]} view={view} />,
    )
    expect(markup).toContain('contentCardContent')
    expect(markup).not.toContain('contentCardImage')
    expect(markup).not.toContain('contentCardKind')
  })
})

describe('Listing appearance images', () => {
  const media = { surface: '/outer.webp', fill: '/inner.webp', fallback: '/fallback.webp' }

  it.each(['row', 'tile', 'horizontal', 'vertical'] as const)(
    'uses the same decoration for the %s format',
    (form) => {
      const view = resolveListingView({
        overrides: {
          form,
          decoration: {
            surface: 'image',
            fill: 'image',
            fillVerticalPosition: 'bottom',
            fallback: 'custom',
            frame: 'outline',
            itemBorder: 'outline',
            gap: 'none',
            padding: 'large',
          },
        },
      }).view
      const markup = renderToStaticMarkup(
        <ConfiguredContentList items={items} view={view} media={media} />,
      )
      expect(markup).toContain('listingPresentation--joined listingPresentation--outlinedItems')
      expect(markup).toContain('--listing-padding:1.5rem')
      expect(markup).toContain('src="/outer.webp"')
      expect(markup).toContain('src="/inner.webp"')
      expect(markup).toContain('object-position:center bottom')
      if (form === 'row') expect(markup).not.toContain('src="/fallback.webp"')
      else expect(markup).toContain('src="/fallback.webp"')
    },
  )

  it('drops the empty image space in cards but keeps real images', () => {
    const withImage: ContentListingPresentation = {
      ...items[1],
      image: { kind: 'profile', url: '/real.webp', alt: '' },
    }
    const view = resolveListingView({ overrides: { decoration: { fallback: 'none' } } }).view
    const markup = renderToStaticMarkup(
      <ConfiguredContentList items={[items[0], withImage]} view={view} />,
    )
    expect(markup).toContain('contentCard--withoutImage')
    expect(markup).toContain('src="/real.webp"')
    expect(markup).not.toContain('contentCardImageFallback')
  })
})
