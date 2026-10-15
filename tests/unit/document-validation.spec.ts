import { describe, expect, it } from 'vitest'

import { validateDocumentNumber } from '@/modules/documents/document-validation'

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
