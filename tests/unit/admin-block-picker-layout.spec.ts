import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const adminStyles = readFileSync('src/app/(payload)/custom.scss', 'utf8')

describe('admin block picker layout', () => {
  it('shows eight block tiles per row on wide screens', () => {
    expect(adminStyles).toMatch(
      /@media \(min-width: 1441px\)[\s\S]*?\.blocks-drawer__blocks[\s\S]*?grid-template-columns: repeat\(8, minmax\(0, 1fr\)\)/,
    )
  })
})
