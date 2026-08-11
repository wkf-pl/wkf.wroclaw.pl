import { describe, expect, it } from 'vitest'

import { formatSlug, validatePageSlug } from '@/modules/content/slug'

describe('content slugs', () => {
  it('normalizes Polish characters and punctuation', () => {
    expect(formatSlug('  Zażółć gęślą jaźń!  ')).toBe('zazolc-gesla-jazn')
  })

  it('collapses separators', () => {
    expect(formatSlug('News / Aktualności -- 2026')).toBe('news-aktualnosci-2026')
  })

  it('rejects application route names for pages', () => {
    expect(validatePageSlug('blog')).toBeTypeOf('string')
    expect(validatePageSlug('o-klubie')).toBe(true)
  })
})
