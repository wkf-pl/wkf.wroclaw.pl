export const documentTypeOptions = [
  { label: 'Uchwała', value: 'resolution' },
  { label: 'Statut', value: 'statute' },
  { label: 'Regulamin', value: 'regulations' },
  { label: 'Protokół', value: 'minutes' },
  { label: 'Sprawozdanie', value: 'report' },
  { label: 'Umowa', value: 'agreement' },
  { label: 'Licencja', value: 'license' },
  { label: 'Inny', value: 'other' },
] as const

export type DocumentType = (typeof documentTypeOptions)[number]['value']

export function isDocumentType(value: unknown): value is DocumentType {
  return documentTypeOptions.some((option) => option.value === value)
}

export function getDocumentTypeLabel(value: string): string {
  return documentTypeOptions.find((option) => option.value === value)?.label ?? value
}

export function getDocumentDisplayLabel(
  documentType: string,
  documentNumber?: null | string,
): string {
  const typeLabel = getDocumentTypeLabel(documentType).toLocaleUpperCase('pl-PL')
  const normalizedDocumentNumber = documentNumber?.trim()

  return normalizedDocumentNumber ? `${typeLabel} nr ${normalizedDocumentNumber}` : typeLabel
}
