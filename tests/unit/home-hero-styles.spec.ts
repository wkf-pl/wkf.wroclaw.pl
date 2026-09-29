import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { HomepageHero } from '@/app/(frontend)/_components/HomepageHero'
import type { HomepageHero as HomepageHeroData } from '@/payload-types'
import { defaultHomepageHeroTitle } from '@/modules/content/homepage-rich-text'
import { readFrontendStyles } from '../helpers/frontend-styles'

describe('home hero styles', () => {
  it('does not render a static fallback image behind the CMS hero image', () => {
    const styles = readFrontendStyles()

    expect(styles).not.toContain("url('/assets/home/hero-wroclaw-fantasy.webp')")
  })

  it('renders title emphasis semantically and colors bold or emphasized fragments gold', () => {
    const markup = renderToStaticMarkup(
      HomepageHero({
        hero: { id: 1, title: defaultHomepageHeroTitle } satisfies HomepageHeroData,
      }),
    )
    const styles = readFrontendStyles()

    expect(markup).toContain('<em>wyobraźnią</em>')
    expect(markup).not.toContain('<span>wyobraźnią</span>')
    expect(styles).toContain('.heroTitle em,\n.heroTitle strong')
  })
})
