import type { Validate } from 'payload'

type DocumentSiblingData = {
  documentType?: unknown
}

export const validateDocumentNumber: Validate<unknown, unknown, DocumentSiblingData> = (
  value,
  { siblingData },
) =>
  siblingData.documentType !== 'resolution' || (typeof value === 'string' && value.trim())
    ? true
    : 'Numer jest wymagany dla uchwały.'
