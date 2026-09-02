import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const payloadConfiguration = readFileSync('src/payload.config.ts', 'utf8')

describe('Polish admin language', () => {
  it('uses one concise fallback for missing list values', () => {
    expect(payloadConfiguration).toContain("noLabel: '<brak>'")
  })

  it('keeps the first searchable field in the list search placeholder', () => {
    expect(payloadConfiguration).toContain("searchBy: 'Szukaj według: {{label}}'")
  })
})
