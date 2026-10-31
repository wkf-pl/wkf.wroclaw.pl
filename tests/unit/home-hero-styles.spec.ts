import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { HomepageHero } from '@/app/(frontend)/_components/HomepageHero'
import type { HomepageHero as HomepageHeroData } from '@/payload-types'
import { defaultHomepageHeroTitle } from '@/modules/content/homepage-rich-text'
describe('home hero styles', () => {
  it('renders title emphasis semantically', () => {
    const markup = renderToStaticMarkup(
      HomepageHero({
        hero: { id: 1, title: defaultHomepageHeroTitle } satisfies HomepageHeroData,
      }),
    )

    expect(markup).toContain('<em>wyobraźnią</em>')
    expect(markup).not.toContain('<span>wyobraźnią</span>')
  })
})
