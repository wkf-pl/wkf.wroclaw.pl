export type RelationshipID = number | string

export type RelationshipReference<Identifier extends RelationshipID = RelationshipID> =
  Identifier | { id: Identifier } | null | undefined

export type FormRelationshipReference<Identifier extends RelationshipID = RelationshipID> =
  RelationshipReference<Identifier> | { value?: RelationshipReference<Identifier> }

export function getRelationshipId<Identifier extends RelationshipID>(
  value: RelationshipReference<Identifier>,
): Identifier | undefined
export function getRelationshipId(value: unknown): RelationshipID | undefined
export function getRelationshipId(value: unknown): RelationshipID | undefined {
  if (typeof value === 'number' || typeof value === 'string') {
    return value
  }

  if (value && typeof value === 'object' && 'id' in value) {
    const id = value.id
    return typeof id === 'number' || typeof id === 'string' ? id : undefined
  }

  return undefined
}

export function getFormRelationshipId<Identifier extends RelationshipID>(
  value: FormRelationshipReference<Identifier>,
): Identifier | undefined
export function getFormRelationshipId(value: unknown): RelationshipID | undefined
export function getFormRelationshipId(value: unknown): RelationshipID | undefined {
  const id = getRelationshipId(value)
  if (id !== undefined) {
    return id
  }

  return value && typeof value === 'object' && 'value' in value
    ? getFormRelationshipId(value.value)
    : undefined
}

export function getRelationshipIds(
  values: readonly unknown[] | null | undefined,
): RelationshipID[] {
  return (
    values?.flatMap((value) => {
      const id = getFormRelationshipId(value)
      return id === undefined ? [] : [id]
    }) ?? []
  )
}

export function getPopulatedRelationship<Document extends object>(
  value: Document | RelationshipID | null | undefined,
): Document | null {
  return value && typeof value === 'object' ? value : null
}

export function getPopulatedRelationships<Document extends object>(
  values: readonly (Document | RelationshipID)[] | null | undefined,
): Document[] {
  return values?.filter((value): value is Document => typeof value === 'object') ?? []
}
