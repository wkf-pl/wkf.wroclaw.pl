import { sql } from '@payloadcms/db-postgres'
import { getTransactionExecutor } from '@/modules/content/lock-content-author'
import { APIError, type Field, type PayloadRequest, type Where } from 'payload'

import { getFormRelationshipId } from '@/lib/relationships'

function locationIdentifiers(value: unknown): string[] {
  return (Array.isArray(value) ? value : [value]).flatMap((reference) => {
    const identifier = getFormRelationshipId(reference)
    return identifier === undefined ? [] : [String(identifier)]
  })
}

export async function findActiveLocationID(req: PayloadRequest, reference: unknown) {
  const id = getFormRelationshipId(reference)
  if (id === undefined) return undefined
  const result = await req.payload.find({
    collection: 'locations',
    depth: 0,
    draft: false,
    limit: 1,
    req,
    where: {
      id: { equals: id },
      isActive: { equals: true },
      _status: { equals: 'published' },
      deletedAt: { exists: false },
    },
  })
  return result.docs[0]?.id
}

export function createLocationRelationship(hasMany = false): Field {
  return {
    name: hasMany ? 'locations' : 'location',
    label: hasMany ? 'Miejsca' : 'Miejsce',
    type: 'relationship',
    relationTo: 'locations',
    hasMany,
    filterOptions: ({ siblingData }): Where => {
      const active: Where = { isActive: { equals: true }, _status: { equals: 'published' } }
      const field = hasMany ? 'locations' : 'location'
      const existing = locationIdentifiers(
        siblingData && typeof siblingData === 'object'
          ? (siblingData as Record<string, unknown>)[field]
          : undefined,
      )
      return existing.length ? { or: [active, { id: { in: existing } }] } : active
    },
    hooks: {
      beforeChange: [
        async ({ req, value, previousValue }) => {
          const previousIDs = locationIdentifiers(previousValue)
          for (const identifier of locationIdentifiers(value)) {
            if (previousIDs.includes(identifier)) continue
            const execute = await getTransactionExecutor(req)
            await execute(sql`SELECT id FROM locations WHERE id = ${identifier} FOR SHARE`)
            if (!(await findActiveLocationID(req, identifier))) {
              throw new APIError('Nowe powiązanie wymaga aktywnego, opublikowanego miejsca.', 400)
            }
          }
          return value
        },
      ],
    },
  }
}
