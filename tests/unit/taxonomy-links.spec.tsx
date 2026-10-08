import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { TaxonomyLinks } from '@/app/(frontend)/_components/TaxonomyLinks'
import type { Category, Tag } from '@/payload-types'
import { readFrontendStyles } from '../helpers/frontend-styles'

describe('taxonomy links', () => {
  it('distinguishes the filled category pill from outlined tags', () => {
    const category = { id: 1, name: 'Spotkania klubowe', slug: 'spotkania' } as Category
    const tag = { id: 2, name: 'RPG', slug: 'rpg' } as Tag
    const markup = renderToStaticMarkup(createElement(TaxonomyLinks, { category, tags: [tag] }))

    expect(markup).toContain(
      'class="taxonomyLink taxonomyLink--category" href="/category/spotkania"',
    )
    expect(markup).toContain('class="taxonomyLink taxonomyLink--tag" href="/tag/rpg"')
    expect(markup).toContain('>RPG</a>')
    expect(markup).not.toContain('#RPG')
  })

  it('uses the approved rounded outline treatments across the frontend', () => {
    const styles = readFrontendStyles()

    expect(styles).toMatch(/\.taxonomyLinks a \{[\s\S]*?border-radius: 999px;/)
    expect(styles).toMatch(
      /\.taxonomyLinks \.taxonomyLink--category \{[\s\S]*?border-color: var\(--gold-light\);[\s\S]*?background: rgb\(0 13 23 \/ 36%\);[\s\S]*?color: var\(--gold-light\);/,
    )
    expect(styles).toMatch(
      /\.taxonomyLinks \.taxonomyLink--tag \{[\s\S]*?border-color: rgb\(111 168 235 \/ 78%\);[\s\S]*?color: #b9d5f5;/,
    )
    expect(styles).not.toContain('.contentHero .taxonomyLinks a:not(.taxonomyLink--category)')
  })
})
