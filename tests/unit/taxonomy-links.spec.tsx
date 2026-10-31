import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { TaxonomyLinks } from '@/app/(frontend)/_components/TaxonomyLinks'
import type { Category, Tag } from '@/payload-types'
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
})
