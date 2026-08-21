import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('home hero styles', () => {
  it('does not render a static fallback image behind the CMS hero image', () => {
    const styles = readFileSync('src/app/(frontend)/styles.css', 'utf8')

    expect(styles).not.toContain("url('/assets/home/hero-wroclaw-fantasy.webp')")
  })
})
