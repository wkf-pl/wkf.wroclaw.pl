import { describe, expect, it } from 'vitest'

import { readAdminStyles } from '../helpers/admin-styles'

const adminStyles = readAdminStyles()

describe('admin block picker layout', () => {
  it('shows eight block tiles per row on wide screens', () => {
    expect(adminStyles).toMatch(
      /@media \(min-width: 1441px\)[\s\S]*?\.blocks-drawer__blocks[\s\S]*?grid-template-columns: repeat\(8, minmax\(0, 1fr\)\)/,
    )
  })
})
