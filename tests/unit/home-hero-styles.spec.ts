import { readFileSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { HomepageHero } from '@/app/(frontend)/_components/HomepageHero'
import type { HomepageHero as HomepageHeroData } from '@/payload-types'
import { defaultHomepageHeroTitle } from '@/modules/content/homepage-rich-text'

describe('home hero styles', () => {
  it('does not render a static fallback image behind the CMS hero image', () => {
    const styles = readFileSync('src/app/(frontend)/styles.css', 'utf8')

    expect(styles).not.toContain("url('/assets/home/hero-wroclaw-fantasy.webp')")
  })

  it('renders title emphasis semantically and colors bold or emphasized fragments gold', () => {
    const markup = renderToStaticMarkup(
      HomepageHero({
        hero: { id: 1, title: defaultHomepageHeroTitle } satisfies HomepageHeroData,
      }),
    )
    const styles = readFileSync('src/app/(frontend)/styles.css', 'utf8')

    expect(markup).toContain('<em>wyobraźnią</em>')
    expect(markup).not.toContain('<span>wyobraźnią</span>')
    expect(styles).toContain('.heroTitle em,\n.heroTitle strong')
  })
})
