import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const placeholderURL = '/assets/placeholder-nebula.webp'

describe('homepage card placeholders', () => {
  it('uses the nebula token when news and section cards have no configured image', () => {
    const styles = readFileSync('src/app/(frontend)/styles.css', 'utf8')
    const sharedFallbackRule = styles.match(
      /\.newsImageFallback,\n\.sectionCardImageFallback\s*\{(?<declarations>[^}]+)\}/,
    )?.groups?.declarations

    expect(sharedFallbackRule).toContain(`url('${placeholderURL}') center / cover no-repeat`)
    expect(existsSync(`public${placeholderURL}`)).toBe(true)
  })
})
