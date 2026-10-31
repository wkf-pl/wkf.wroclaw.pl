import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { CardBlockSection } from '@/app/(frontend)/_components/CardBlockSection'
import { CardBlock } from '@/blocks/Card'
import type { CardBlock as CardBlockData, Page } from '@/payload-types'

describe('card block', () => {
  it('uses a dedicated semantic block thumbnail', () => {
    expect(CardBlock.admin?.images?.thumbnail).toEqual({
      alt: 'Schematyczna ikona karty z obrazem i odnośnikami',
      url: '/assets/block-thumbnails/card.png',
    })
  })

  it('defines a title, optional linked page, raster image and configurable links', () => {
    expect(CardBlock.fields).toMatchObject([
      { label: 'Tytuł', name: 'title', required: true, type: 'text' },
      {
        label: 'Strona docelowa tytułu',
        name: 'destinationPage',
        relationTo: 'pages',
        type: 'relationship',
      },
      { label: 'Obraz', name: 'image', relationTo: 'media', type: 'upload' },
      { label: 'Odnośniki', name: 'links', type: 'array' },
    ])
  })

  it('renders a linked title, fallback image and an icon link', () => {
    const destinationPage = {
      _status: 'published',
      slug: 'sekcja-rpg',
    } as Page
    const block = {
      blockType: 'card',
      destinationPage,
      image: null,
      links: [
        {
          appearance: 'link',
          customAddress: 'spotkania',
          customScheme: 'path',
          iconName: 'dice',
          label: 'Spotkania RPG',
          targetType: 'custom',
        },
      ],
      title: 'Sekcja RPG',
    } as CardBlockData

    const markup = renderToStaticMarkup(createElement(CardBlockSection, { block }))

    expect(markup).toContain('class="cardBlockImage cardBlockImageFallback"')
    expect(markup).toContain('<a href="/sekcja-rpg">Sekcja RPG</a>')
    expect(markup).toContain('href="/spotkania"')
    expect(markup).toContain('data-icon-name="dice"')
  })
})
