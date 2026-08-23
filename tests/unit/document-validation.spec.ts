import { describe, expect, it } from 'vitest'

import { validateDocumentNumber } from '@/modules/documents/document-validation'
import { parseDocumentListFilters } from '@/modules/documents/public-documents'

describe('document validation', () => {
  it('requires a number for resolutions only', () => {
    expect(
      validateDocumentNumber('', { siblingData: { documentType: 'resolution' } } as never),
    ).toBe('Numer jest wymagany dla uchwały.')
    expect(
      validateDocumentNumber('', { siblingData: { documentType: 'agreement' } } as never),
    ).toBe(true)
  })
})

describe('document route inputs', () => {
  it('normalizes list filters', () => {
    expect(parseDocumentListFilters({ rok: '2026', strona: '2', typ: 'resolution' })).toEqual({
      page: 2,
      type: 'resolution',
      year: 2026,
    })
    expect(parseDocumentListFilters({ rok: 'abc', strona: '-3' })).toEqual({
      page: 1,
      type: undefined,
      year: undefined,
    })
  })
})
