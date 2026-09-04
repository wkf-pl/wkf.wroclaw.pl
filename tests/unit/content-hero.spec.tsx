import { readFileSync } from 'node:fs'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import {
  ContentHero,
  ContentHeroCategory,
  ContentHeroMeta,
} from '@/app/(frontend)/_components/ContentHero'
import { TaxonomyLinks } from '@/app/(frontend)/_components/TaxonomyLinks'
import type { Category, Tag } from '@/payload-types'

describe('content hero', () => {
  it('renders the shared content heading, metadata and framed image', () => {
    const markup = renderToStaticMarkup(
      createElement(
        ContentHero,
        {
          breadcrumbs: [
            { label: 'Strona główna', url: '/' },
            { label: 'Wydarzenia', url: '/events' },
            { label: 'Wieści z klubu', url: null },
          ],
          eyebrow: 'Wydarzenie',
          image: {
            alt: 'Spotkanie klubowe',
            height: 900,
            src: '/media/spotkanie.webp',
            width: 1600,
          },
          title: 'Wieści z klubu',
        },
        createElement(ContentHeroMeta, {
          authorName: 'Zarząd WKF',
          date: {
            dateTime: '2026-09-07T18:00:00.000Z',
            label: '7 września 2026',
          },
        }),
      ),
    )

    expect(markup).toContain('class="contentHero"')
    expect(markup).toContain('class="contentHeroImage"')
    expect(markup).toContain('class="contentHeroMeta"')
    expect(markup.match(/Wieści z klubu/g)).toHaveLength(1)
    expect(markup).toContain('Wydarzenia')
    expect(markup).not.toContain('Strona główna')
    expect(markup).toContain('Autor: Zarząd WKF')
  })

  it('shows a linked category above the title and only tags below it', () => {
    const category = { id: 1, name: 'Spotkania klubowe', slug: 'spotkania' } as Category
    const tag = { id: 2, name: 'RPG', slug: 'rpg' } as Tag
    const markup = renderToStaticMarkup(
      createElement(
        ContentHero,
        {
          breadcrumbs: [
            { label: 'Strona główna', url: '/' },
            { label: 'Aktualności', url: '/blog' },
            { label: 'Erpegowe wtorki 1', url: null },
          ],
          eyebrow: createElement(ContentHeroCategory, { category }),
          title: 'Erpegowe wtorki 1',
        },
        createElement(TaxonomyLinks, { tags: [tag] }),
      ),
    )

    expect(markup).toContain('class="eyebrow contentHeroEyebrow"')
    expect(markup).toContain('href="/category/spotkania"')
    expect(markup).toContain('href="/tag/rpg"')
    expect(markup.match(/Erpegowe wtorki 1/g)).toHaveLength(1)
    expect(markup.match(/Spotkania klubowe/g)).toHaveLength(1)
  })

  it('reserves the category line when no category is assigned', () => {
    const markup = renderToStaticMarkup(
      createElement(ContentHero, {
        breadcrumbs: [
          { label: 'Strona główna', url: '/' },
          { label: 'Aktualności', url: '/blog' },
          { label: 'Wpis bez kategorii', url: null },
        ],
        eyebrow: createElement(ContentHeroCategory, { category: null }),
        title: 'Wpis bez kategorii',
      }),
    )

    expect(markup).toContain('class="eyebrow contentHeroEyebrow"')
    expect(markup).toContain('aria-hidden="true"')
  })

  it('uses a text-only layout when a content type has no hero image field', () => {
    const markup = renderToStaticMarkup(
      createElement(ContentHero, {
        breadcrumbs: [
          { label: 'Strona główna', url: '/' },
          { label: '#fantastyka', url: null },
        ],
        eyebrow: 'Tag',
        title: '#fantastyka',
      }),
    )

    expect(markup).toContain('contentHero--withoutImage')
    expect(markup).toContain('class="contentHeroBreadcrumbSlot"')
    expect(markup).not.toContain('Strona główna')
    expect(markup).not.toContain('contentHeroMedia')
  })

  it('shares the homepage separator and places the site header over the hero background', () => {
    const styles = readFileSync('src/app/(frontend)/styles.css', 'utf8')

    expect(styles).toContain("url('/assets/content-hero-night-sky.webp')")
    expect(styles).toContain('.homeHero::before,\n.contentHero::before')
    expect(styles).toContain('.homeHero::after,\n.contentHero::after')
    expect(styles).toContain('body:has(> .contentHeroPage) > .siteHeaderShell')
    expect(styles).toContain('.contentHeroCopy .hierarchyBreadcrumbs a,\n.contentHeroEyebrow a {')
    expect(styles).toContain('text-decoration: none')
    expect(styles).toContain('width: min(76rem, calc(100% - 3rem))')
    expect(styles).toContain('.contentHeroBreadcrumbSlot {')
    expect(styles).toContain('min-height: 1.2rem')
  })

  it('lets top-level content blocks use the full content body width', () => {
    const styles = readFileSync('src/app/(frontend)/styles.css', 'utf8')

    expect(styles).toMatch(
      /\.pageBlocks > \*,[\s\S]*?width: 100%;[\s\S]*?max-width: none;[\s\S]*?margin-inline: 0;/,
    )
    expect(styles).not.toContain('.pageBlocks > .richText,\n.memberProfilesBlock > h2')
  })

  it('routes all requested detail-page families through the shared hero', () => {
    const sharedDocument = readFileSync(
      'src/app/(frontend)/_components/CmsPageDocument.tsx',
      'utf8',
    )
    const taxonomyPage = readFileSync(
      'src/app/(frontend)/_components/TaxonomyContentPage.tsx',
      'utf8',
    )
    const documentPage = readFileSync('src/app/(frontend)/dokumenty/[slug]/page.tsx', 'utf8')
    const memberPage = readFileSync('src/app/(frontend)/members/[slug]/page.tsx', 'utf8')

    expect(sharedDocument).toContain('<ContentHero')
    expect(sharedDocument).toContain('<ContentHeroCategory category={category} />')
    expect(sharedDocument).toContain('<TaxonomyLinks tags={tags} />')
    expect(taxonomyPage).toContain('<ContentHero')
    expect(documentPage).toContain('<ContentHero')
    expect(documentPage).toContain('<ContentHeroCategory category={document.category} />')
    expect(documentPage).toContain('<TaxonomyLinks tags={document.tags} />')
    expect(memberPage).toContain('<ContentHero')
  })
})
