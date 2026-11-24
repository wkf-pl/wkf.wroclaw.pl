import { sql } from '@payloadcms/db-postgres'
import {
  APIError,
  type CollectionBeforeDeleteHook,
  type CollectionBeforeValidateHook,
  type Field,
  type PayloadRequest,
} from 'payload'

import {
  getFormRelationshipId,
  getRelationshipId,
  type RelationshipReference,
} from '@/lib/relationships'

import { getTransactionExecutor } from './lock-content-owners'

export const contentParentSources = ['pages', 'posts', 'events', 'event-cycles'] as const

async function lockContentHierarchy(req: PayloadRequest): Promise<void> {
  if ((await req.transactionID) == null) return
  const execute = await getTransactionExecutor(req)
  await execute(sql`SELECT pg_advisory_xact_lock(hashtext('wkf.content-hierarchy'))`)
}

export const lockContentHierarchyForWrite: CollectionBeforeValidateHook = async ({ data, req }) => {
  await lockContentHierarchy(req)
  return data
}

export function createContentParentField(event = false): Field {
  return {
    name: 'parent',
    type: 'relationship',
    relationTo: 'pages',
    index: true,
    label: 'Element nadrzędny',
    admin: {
      position: 'sidebar',
      placeholder: '<brak>',
      description: 'Gdzie w serwisie ma się znaleźć ta treść?',
      ...(event
        ? {
            condition: (_data, siblingData) =>
              getFormRelationshipId(siblingData.cycle) === undefined,
          }
        : {}),
    },
  }
}

export const eventCycleParentPathField: Field = {
  name: 'eventCycleParentPath',
  type: 'ui',
  label: 'Element nadrzędny',
  admin: {
    position: 'sidebar',
    condition: (_data, siblingData) => getFormRelationshipId(siblingData.cycle) !== undefined,
    components: { Field: '/components/admin/EventCycleParentPath#EventCycleParentPath' },
  },
}

export const clearCyclicEventParent: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (!data) return data
  const cycle = Object.hasOwn(data, 'cycle') ? data.cycle : originalDoc?.cycle
  if (getFormRelationshipId(cycle) !== undefined) data.parent = null
  return data
}

export const preventDeletingContentParent: CollectionBeforeDeleteHook = async ({
  collection,
  id,
  req,
}) => {
  await lockContentHierarchy(req)
  const children = collection.slug === 'event-cycles' ? (['events'] as const) : contentParentSources
  for (const child of children) {
    const field = collection.slug === 'event-cycles' ? 'cycle' : 'parent'
    const { totalDocs } = await req.payload.count({
      collection: child,
      overrideAccess: true,
      req,
      trash: true,
      where: { [field]: { equals: id } },
    })
    if (totalDocs) {
      throw new APIError(
        'Przed usunięciem elementu przenieś jego dzieci, również te znajdujące się w koszu.',
        400,
      )
    }
    const versions = await req.payload.countVersions({
      collection: child,
      overrideAccess: true,
      req,
      where: { and: [{ ['version.' + field]: { equals: id } }, { latest: { equals: true } }] },
    })
    if (versions.totalDocs) {
      throw new APIError(
        'Przed usunięciem elementu zmień przypisanie jego dzieci w wersjach roboczych.',
        400,
      )
    }
  }
}

export function getContentParent(document: {
  parent?: RelationshipReference
  cycle?: RelationshipReference
}) {
  const cycle = getRelationshipId(document.cycle)
  if (cycle !== undefined) return { relationTo: 'event-cycles' as const, value: cycle }
  const parent = getRelationshipId(document.parent)
  return parent === undefined ? undefined : { relationTo: 'pages' as const, value: parent }
}

export function contentParentKey(parent: { relationTo: string; value: number | string }): string {
  return `${parent.relationTo}:${parent.value}`
}
