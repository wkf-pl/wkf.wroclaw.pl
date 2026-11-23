import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { TaxonomyLinks } from '@/app/(frontend)/_components/TaxonomyLinks'
import type { Topic, Tag } from '@/payload-types'
describe('taxonomy links', () => {
  it('distinguishes the filled topic pill from outlined tags', () => {
    const topic = { id: 1, name: 'Spotkania klubowe', slug: 'spotkania' } as Topic
    const tag = { id: 2, name: 'RPG', slug: 'rpg' } as Tag
    const markup = renderToStaticMarkup(
      createElement(TaxonomyLinks, { topics: [topic], tags: [tag] }),
    )

    expect(markup).toContain('class="taxonomyLink taxonomyLink--category" href="/topic/spotkania"')
    expect(markup).toContain('class="taxonomyLink taxonomyLink--tag" href="/tag/rpg"')
    expect(markup).toContain('>RPG</a>')
    expect(markup).not.toContain('#RPG')
  })
})
