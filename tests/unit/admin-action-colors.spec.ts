import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const adminStyles = readFileSync('src/app/(payload)/custom.scss', 'utf8')

describe('admin action colors', () => {
  it.each([
    ['add', '#3465a4'],
    ['save', '#73d216'],
    ['select', '#75507b'],
    ['delete', '#ef2929'],
  ])('defines the %s action color as %s', (action, color) => {
    expect(adminStyles).toContain(`.wkf-action-${action}`)
    expect(adminStyles).toContain(color)
  })

  it('maps native Payload controls to semantic action colors', () => {
    expect(adminStyles).toContain('.array-field__add-row')
    expect(adminStyles).toContain('#action-save')
    expect(adminStyles).toContain('.upload__listToggler')
    expect(adminStyles).toContain('.array-actions__remove')
    expect(adminStyles).toMatch(
      /\.array-field__add-row[\s\S]*?color: #3465a4[\s\S]*?\.icon--plus \.stroke[\s\S]*?stroke: currentColor/,
    )
  })

  it('styles destructive account actions as red outlined buttons', () => {
    expect(adminStyles).toContain('#force-unlock')
    expect(adminStyles).toContain('.payload-settings > div:last-child > .btn')
    expect(adminStyles).toMatch(
      /#force-unlock,[\s\S]*?\.payload-settings > div:last-child > \.btn[\s\S]*?wkf-action-color\(#ef2929, #cc0000, #fff\)/,
    )
  })

  it('styles relationship field controls independently from the field border', () => {
    expect(adminStyles).toContain(':is(.multi-value-remove, .clear-indicator)')
    expect(adminStyles).toContain('.relationship--multi-value-label__drawer-toggler')
    expect(adminStyles).toContain('.relationship--single-value__drawer-toggler')
    expect(adminStyles).toMatch(
      /relationship--single-value__drawer-toggler[\s\S]*?color: var\(--wkf-related-link-color\)/,
    )
    expect(adminStyles).toMatch(/\.icon--edit \{\s+display: none/)
    expect(adminStyles).toContain('mask: url("data:image/svg+xml')
    expect(adminStyles).toMatch(
      /:is\(\.multi-value-remove, \.clear-indicator\)[\s\S]*?\.stroke \{\s+stroke-width: 2px/,
    )
    expect(adminStyles).toContain('.icon--plus .stroke')
    expect(adminStyles).toContain('stroke-width: 2px')
  })

  it('colors the date clear control and linked admin records', () => {
    expect(adminStyles).toMatch(
      /\.date-time-picker__clear-button[\s\S]*?color: #ef2929[\s\S]*?stroke-width: 2px/,
    )
    expect(adminStyles).toContain(':is(.wkf-hierarchy-path, .table)')
    expect(adminStyles).toContain('.default-cell__first-cell')
    expect(adminStyles).toContain("html[data-theme='light']")
    expect(adminStyles).toContain('--wkf-related-link-color: #3465a4')
    expect(adminStyles).toContain("html[data-theme='dark']")
    expect(adminStyles).toContain('--wkf-related-link-color: #729fcf')
  })

  it('marks project-owned create buttons as add actions', () => {
    for (const componentPath of [
      'src/components/admin/EventActions.tsx',
      'src/components/admin/EventCycleActions.tsx',
    ]) {
      const component = readFileSync(componentPath, 'utf8')

      expect(component).toContain('className="wkf-action-add"')
      expect(component).toContain('size="medium"')
    }
  })
})
