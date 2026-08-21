export type RelationshipID = number | string

export type RelationshipReference<Identifier extends RelationshipID = RelationshipID> =
  Identifier | { id: Identifier } | null | undefined

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
